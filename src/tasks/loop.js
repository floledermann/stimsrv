
const valOrFunc = require("../util/valOrFunc.js");
const propertiesGenerator = require("../util/propertiesGenerator.js");

module.exports = function(config) {
  
  config = Object.assign({
    context: {},
    tasks: [],
    warn: console.warn,
    error: console.error,
    loop: true,
    modifyContext: true
  }, config);
  
  let currentTask = null;
  let outerContext = null;
  let contextGenerator = null;
  
  return {
    get name() {
      return currentTask?.name;
    },
    get store() {
      return currentTask?.store;
    },
    // this is called on client - it cannot return a (changed) context, but only set up internal configuration
    ui: function(context) {   
    
      if (context.taskIndex < config.tasks.length && typeof config.tasks[context.taskIndex]?.ui) {
        // pass merged context to subtask, excluding taskIndex if not defined in sub-context
        let subContext = Object.assign({}, context);
        delete subContext.taskIndex;
        Object.assign(subContext, context.context);
        currentTask = config.tasks[context.taskIndex]?.ui(subContext);
      }
      else {
        config.error("No task found for taskIndex " + context.taskIndex + ".");
        currentTask = null;
      }
      
      return {
        get interfaces() {
          return currentTask.interfaces;
        }
      }
    },
    // these are only called by server
    controller: {
      nextCondition: function(lastCondition, lastResponse, conditions, responses) {
        return currentTask.controller.nextCondition?.(lastCondition, lastResponse, conditions, responses);
      },
      constantParamters: function() {
        return currentTask.controller.constantParamters();
      },
      initialContext: context => {
        // mix defaults with passed in context and locally defined context

        // store for later return if config.modifyContext is false
        outerContext = context || {};
        
        contextGenerator = null;
        let localContext = config.context;
        
        if (typeof localContext == "function") {
          localContext = localContext(context);
        }
        
        if (localContext.next && typeof localContext.next == "function") {
          // context is a generator in itself
          contextGenerator = localContext;
          localContext = {};
        }
        else {
          localContext = valOrFunc.allProperties(localContext, context);
          contextGenerator = propertiesGenerator(localContext);
        }
        
        if (contextGenerator) {
          let genContext = contextGenerator.next();
          if (!genContext.done) {
            Object.assign(localContext, genContext.value);
          }
        }
        
        context = Object.assign({}, context, localContext, {taskIndex: 0});
        
        if (context.taskIndex < config.tasks.length && config.tasks[context.taskIndex]?.controller) {
          // pass merged context to subtask, excluding taskIndex if not defined in sub-context
          let subContext = Object.assign({}, context);
          delete subContext.taskIndex;
          Object.assign(subContext, context.context);
          currentTask = config.tasks[context.taskIndex];          
          context.context = currentTask.controller.initialContext?.(subContext);
        }
        else {
          config.error("No task found for taskIndex " + context.taskIndex + ".");
          currentTask = null;
        }
        
        return context;
      },
      nextContext: (context, trials) => {
                
        let c = currentTask.controller.nextContext?.(context.context, trials);
        
        context.context = c?.context || context.context || {};
        
        // should the current sub-task be continued?
        if (c?.continue) {
          return {
            'continue': true,
            context: context
          }
        }
        
        // otherwise, advance loop counter, or loop at end

        // sub-task has ended, so copy context properties into own context
        // TODO: should copying of values from child context to parent context be done implicitly
        // like so, or should there be an explicit way?
        context = Object.assign({}, context, context.context);
        delete context.context;
        
        context.taskIndex++;
        
        if (context.taskIndex >= config.tasks.length) {
          // stop loop?
          if (!valOrFunc(config.loop, context)) {
            delete context.taskIndex;
            // override with outer context for "local" context parameters
            // (this is needed e.g. for nested loop counters)
            Object.assign(context, outerContext);
            return {
              'continue': false, 
              context: config.modifyContext ? context : outerContext
            }
          }
          // loop goes on, reset index and generate new context if applicable
          context.taskIndex = 0;
          
          if (contextGenerator) {
            let genContext = contextGenerator.next();
            if (!genContext.done) {
              Object.assign(context, genContext.value);
            }
          }

        }

        if (config.tasks[context.taskIndex]?.controller) {
          // pass merged context to subtask, excluding taskIndex from current context
          let subContext = Object.assign({}, context);
          delete subContext.taskIndex;
          Object.assign(subContext, context.context);
          currentTask = config.tasks[context.taskIndex];
          context.context = currentTask.controller.initialContext?.(subContext);
        }
        else {
          config.error("No task found for taskIndex " + context.taskIndex + ".");
          currentTask = null;
        }    
        
        return {
          'continue': true, 
          context: context
        }
      }
    }
  }

}