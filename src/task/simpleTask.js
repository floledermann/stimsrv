
const taskManager = require("stimsrv/task/taskManager");
const toArray = require("stimsrv/util/toArray");

function simpleTask(config) {
  config = Object.assign({
    name: "Unnamed Task",
    description: "",
    defaults: {},
    interfaces: {},
    transformCondition: null,
    nextContext: null,
    //resources: null, //?
    //css: null //?
  }, config);
  
  let task = function(controllerConfig, transformCondition) {
    
    let interfaceOptions = Object.keys(config.interfaces).map(i => i + "Interface");
    let staticOptions = interfaceOptions.concat(["css"]);
    
    //let interfaceConstructors = Object.fromEntries(Object.entries(config.interfaces).map([key, spec] => [key, spec(config)]));
    
    let manager = taskManager({
      defaults: config.defaults,
      controllerConfig: controllerConfig,
      transformCondition: transformCondition,
      nextContext: config.nextContext,
      // do we need this? may simply throw an error if it does not resolve to a static value
      staticOptions: staticOptions
    });
    
    return {
      name: config.name,
      description: config.description,
      frontend: context => {
        return {
          interfaces: manager.interfaces(config.interfaces, context),
          transformCondition: manager.transformCondition(context)
        };
      },
      controller: manager.controller,
      resources: toArray(config.resources).map(res => {
        if (typeof res == "string" || typeof res == "function") {
          return manager.resolveResources(res);
        }
        return res;
      })
    }
  }
  
  task.defaults = function(_defaults) {
    config.defaults = Object.assign({}, config.defaults, _defaults);
  }
  
  return task;
}

module.exports = simpleTask;