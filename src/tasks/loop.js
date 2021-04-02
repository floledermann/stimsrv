
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
    
    // mix defaults with config.context and passed in context
    context = Object.assign({taskIndex: 0}, valOrFunc(config.context, context), context);
    
    if (context.taskIndex < config.tasks.length && typeof config.tasks[context.taskIndex] == "function") {
      let subContext = Object.assign({}, context, context.context)
      currentTask = config.tasks[context.taskIndex](subContext);
    }
    else {
      config.error("No task found for taskIndex " + context.taskIndex + ".");
      currentTask = null;
    }
    
    return {
      name: currentTask.name,
      interfaces: currentTask.interfaces,
      context: context,
      controller: {
        nextCondition: currentTask.controller.nextCondition,
        nextContext: trials => {
                  
          let c = currentTask.controller.nextContext?.(trials);
          let newContext = Object.assign({}, context, {context: c || context.context || {}});
          
          // should the current sub-task be continued?
          if (c?.continue) {
            return {
              'continue': true,
              context: newContext
            }
          }
          
          // otherwise, advance loop counter, or loop at end
          newContext.taskIndex++;
          
          if (newContext.taskIndex >= config.tasks.length) {
            newContext.taskIndex = 0;
          }
          
          context = newContext;
          
          return {
            'continue': true,
            context: newContext
          }
        }
      }
    }
  }

}