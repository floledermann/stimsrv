
const taskManager = require("stimsrv/task/taskManager");
const toArray = require("stimsrv/util/toArray");
const pickProperties = require("stimsrv/util/pickProperties");

/**
simpleTask

Helper to implement tasks with the following features:
- Sequence of conditions can be specified using callbacks and iterators (by way of `stimsrv/util/parameterController` - see documentation there for how to specify parameters).
- Default values can be specified and changed globally with the `.defaults()` method.
- Interfaces can be remapped to named interfaces using `<interfaceName>Interface` properties, e.g.: `displayInterface: "specialDisplay"`.
- Additional interfaces can be added for each instance using the `interfaces` property.
- `resources` and `css` can be specified (static or TODO dynamic).
- `generateCondition`, `transformConditionOnClient` and `nextContext` can be specified for task instance.
- Task parameters are split into static (constant for context) and dynamic (changing with every trial) parameters.
*/

function simpleTask(taskSpec) {
  
  taskSpec = Object.assign({
    name: "Unnamed Task",
    description: "",
    defaults: {},
    interfaces: {},
    nextContext: null,
    //resources: null, //?
    //css: null //?
  }, taskSpec);
  
  // userConfig needs to be an object containing the entries for each property of the condition
  let task = function(userConfig) {
    
    let interfaceOptions = Object.keys(taskSpec.interfaces).map(i => i + "Interface");
    let staticOptions = interfaceOptions.concat(["css","generateCondition","transformConditionOnClient"]);
    
    //let interfaceConstructors = Object.fromEntries(Object.entries(taskSpec.interfaces).map([key, spec] => [key, spec(taskSpec)]));
    
    let manager = taskManager({
      defaults: taskSpec.defaults,
      controllerConfig: pickProperties.without(userConfig, ["generateCondition","transformConditionOnClient"]),
      generateCondition: userConfig.generateCondition,
      transformConditionOnClient: userConfig.transformConditionOnClient,
      nextContext: taskSpec.nextContext,
      interfaces: taskSpec.interfaces,
      // do we need this? may simply throw an error if it does not resolve to a static value
      staticOptions: staticOptions
    });
    
    // resolve without context for name and description
    let config = manager.resolveConfig();
    
    return {
      name: config.name,
      description: config.description,
      frontend: context => {
        return {
          interfaces: manager.interfaces(context),
          transformConditionOnClient: manager.transformConditionOnClient(context),
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