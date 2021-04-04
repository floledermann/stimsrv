
const valOrFunc = require("../util/valOrFunc.js");

module.exports = function(config) {
  
  config = Object.assign({
    context: {},
    tasks: [],
    warn: console.warn,
    error: console.error,
    loop: true
  }, config);
  
  let currentTask = null;
  
  // this is called on server and on client - it cannot return a (changed) context, but only set up internal configuration
  return function(context) {
    
    // mix defaults with passed in context and locally defined context
    // TODO: locally, we don't want to use config.context at all, but just use the passed in values
    context = Object.assign({taskIndex: 0}, context, valOrFunc(config.context, context));
    
    if (context.taskIndex < config.tasks.length && typeof config.tasks[context.taskIndex] == "function") {
      // pass merged context to subtask, excluding taskIndex if not defined in sub-context
      let subContext = Object.assign({}, context);
      delete subContext.taskIndex;
      Object.assign(subContext, context.context);
      currentTask = config.tasks[context.taskIndex](subContext);
      context.context = currentTask.context;
    }
    else {
      config.error("No task found for taskIndex " + context.taskIndex + ".");
      currentTask = null;
    }
    
    return {
      get name() {
        return currentTask.name;
      },
      get interfaces() {
        return currentTask.interfaces;
      },
      context: context,
      controller: {
        nextCondition: function(lastCondition, lastResponse, conditions, responses) {
          return currentTask.controller.nextCondition(lastCondition, lastResponse, conditions, responses);
        },
        nextContext: trials => {
                  
          let c = currentTask.controller.nextContext?.(trials);
          
          context.context = c?.context || context.context || {};
          
          // should the current sub-task be continued?
          if (c?.continue) {
            return {
              'continue': true,
              context: context
            }
          }
          
          // sub-task has ended, so copy context properties into own context, but allow precedence for local values
          // TODO: should copying of values from child context to parent context be done implicitly
          // like so, or should there be an explicit way?
          context = Object.assign({}, context.context, context);
          delete context.context;
          
          // otherwise, advance loop counter, or loop at end
          context.taskIndex++;
          
          if (context.taskIndex >= config.tasks.length) {
            // stop loop?
            if (!valOrFunc(config.loop, context)) {
              delete context.taskIndex;
              return {
                'continue': false, 
                context: context
              }
            }
            // loop goes on, reset index
            context.taskIndex = 0;
          }

          if (typeof config.tasks[context.taskIndex] == "function") {
            // pass merged context to subtask, excluding taskIndex from current context
            let subContext = Object.assign({}, context);
            delete subContext.taskIndex;
            Object.assign(subContext, context.context);
            currentTask = config.tasks[context.taskIndex](subContext);
            context.context = currentTask.context;
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