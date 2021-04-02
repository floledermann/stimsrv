
const valOrFunc = require("../util/valOrFunc.js");

module.exports = function(config) {
  
  config = Object.assign({
    context: {},
    tasks: [],
    warn: console.warn,
    error: console.error
  }, config);
  
  let currentTask = null;
  
  return function(context) {
    
    // mix passed-in context with config.context and add taskIndex override
    context = Object.assign({}, valOrFunc(config.context, context), context, {taskIndex: 0});
    
    if (context.taskIndex < config.tasks.length && typeof config.tasks[context.taskIndex] == "function") {
      let subContext = Object.assign({},context,context.context)
      currentTask = config.tasks[context.taskIndex](subContext);
    }
    else {
      config.error("No task found for taskIndex " + context.taskIndex + ".");
      currentTask = null;
    }
    
    return {
      name: currentTask.name,
      interfaces: currentTask.interfaces,
      controller: {
        nextCondition: currentTask.controller.nextCondition,
        nextContext: (conditions, responses) => {
          let c = currentTask.nextContext?.(conditions, responses);
          let newContext = Object.assign({}, context, {context: c || context.context || {}});
          
          // should the current sub-task be continued?
          if (c?.continue) {
            return {
              'continue': true,
              context: newContext
            }
          }
          
          newContext.taskIndex++;
          
          if (newContext.taskIndex >= config.tasks.length) {
            newContext.taskIndex = 0;
          }
          
          return {
            'continue': true,
            context: newContext
          }
        }
      }
    }
  }

}