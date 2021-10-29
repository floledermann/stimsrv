
const taskManager = require("stimsrv/task/taskManager");
const toArray = require("stimsrv/util/toArray");

/**
simpleTask

Helper to implement tasks with the following features:
- Sequence of conditions can be specified for each instance including callbacks and iterators (by way of stimsrv/util/parameterController - see documentation there for how to specify parameters)
- Task parameters are split into static (constant for context) and dynamic (changing with every trial) parameters
- Default values can be specified and changed globally with the .defaults() method
- Interfaces can be remapped using "<interfaceName>Interface" properties, e.g.: displayInterface: "specialDisplay"
- TODO: additional interfaces can be added for each instance
- nextContext and transformCondition can be specified for task instance
- resources and css can be specified (static or TODO dynamic)
*/

function simpleTask(taskSpec) {
  
  taskSpec = Object.assign({
    name: "Unnamed Task",
    description: "",
    defaults: {},
    interfaces: {},
    transformCondition: null,
    nextContext: null,
    //resources: null, //?
    //css: null //?
  }, taskSpec);
  
  // not sure if transformCondition should be a parameter, but by having it as a second parameter
  // the client & controller code stays more clearly separated
  let task = function(controllerConfig, transformCondition) {
    
    let interfaceOptions = Object.keys(taskSpec.interfaces).map(i => i + "Interface");
    let staticOptions = interfaceOptions.concat(["css"]);
    
    //let interfaceConstructors = Object.fromEntries(Object.entries(taskSpec.interfaces).map([key, spec] => [key, spec(taskSpec)]));
    
    let manager = taskManager({
      defaults: taskSpec.defaults,
      controllerConfig: controllerConfig,
      transformCondition: transformCondition,
      nextContext: taskSpec.nextContext,
      // do we need this? may simply throw an error if it does not resolve to a static value
      staticOptions: staticOptions
    });
    
    let config = manager.resolveConfig();
    
    return {
      name: config.name,
      description: config.description,
      frontend: context => {
        return {
          interfaces: manager.interfaces(taskSpec.interfaces, context),
          transformCondition: manager.transformCondition(context),
          css: manager.resolve("css", context)
        };
      },
      controller: manager.controller,
      resources: toArray(taskSpec.resources).map(res => {
        if (typeof res == "string" || typeof res == "function") {
          return manager.resolveResources(res);
        }
        return res;
      })
    }
  }
  
  task.defaults = function(_defaults) {
    taskSpec.defaults = Object.assign({}, taskSpec.defaults, _defaults);
  }
  
  return task;
}

module.exports = simpleTask;