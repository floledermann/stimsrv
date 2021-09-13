
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
  let currentController = null;
  
  let outerContext = null;
  let contextGenerator = null;
  
  let taskResources = [];
  for (let t of config.tasks) {
    taskResources = taskResources.concat(t.resources || []);
  }
  
  return {
    get name() {
      return currentTask?.name || "loop";
    },
    get store() {
      return currentTask?.store;
    },
    resources: taskResources,
    // this is called on client - it cannot return a (changed) context, but only set up internal configuration
    frontend: function(context) {   
    
      if (context.taskIndex < config.tasks.length && typeof config.tasks[context.taskIndex]?.frontend) {
        // pass merged context to subtask, excluding taskIndex if not defined in sub-context
        let subContext = Object.assign({}, context);
        delete subContext.taskIndex;
        Object.assign(subContext, context.context);
        currentTask = config.tasks[context.taskIndex]?.frontend(subContext);
      }
      else {
        config.error("No task found for taskIndex " + context.taskIndex + ".");
        currentTask = null;
      }
      
      return {
        get interfaces() {
          return currentTask.interfaces;
        },
        get name() {
          return currentTask?.name || config.tasks[context.taskIndex]?.name || "loop";
        },
        get css() {
          return currentTask.css;
        },
        get transformCondition() {
          return currentTask.transformCondition;
        }
      }
    },
    // these are only called by server
    controller: function(context) {
      
      //console.log("Loop controller constructor called");
      //console.log(context);
      
      return {
        nextCondition: function(lastCondition, lastResponse, conditions, responses) {
          return currentController.nextCondition?.(lastCondition, lastResponse, conditions, responses);
        },
        constantParameters: function() {
          return currentController.constantParameters?.() || {};
        },
        initialContext: context => {

          //console.log("Loop.initialContext() called");
          
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
            currentController = currentTask.controller?.(subContext);
            context.context = currentController.initialContext?.(subContext);
          }
          else {
            config.error("No task found for taskIndex " + context.taskIndex + ".");
            currentTask = null;
          }
          
          return context;
        },
        nextContext: (context, trials) => {
                  
          //console.log("Loop.nextContext() called");
          
          let c = currentController.nextContext?.(context.context, trials);
          
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
            let shouldContinue = valOrFunc(config.loop, context);
            
            if (shouldContinue && contextGenerator) {
              
              let genContext = contextGenerator.next();
              
              // even if exhausted, assign final value
              Object.assign(context, genContext.value);
              
              if (genContext.done) {
                // if iterator is exhausted and loop is not a function,
                // the context will nexer change, so break the loop
                if (!(typeof config.loop == "function")) {
                  shouldContinue = false;
                }
              }
            }
            
            if (!shouldContinue) {
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
            
          }

          if (config.tasks[context.taskIndex]?.controller) {
            // pass merged context to subtask, excluding taskIndex from current context
            let subContext = Object.assign({}, context);
            delete subContext.taskIndex;
            Object.assign(subContext, context.context);
            currentTask = config.tasks[context.taskIndex];
            currentController = currentTask.controller?.(subContext);
            context.context = currentController.initialContext?.(subContext);
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

}