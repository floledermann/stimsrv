
function simpleTask(config) {
  config = Object.assign({
    name: "Unnamed Task",
    description: "",
    defaults: {},
    interfaces: {},
    transformCondition: null,
    nextContext: null,
    resources: //?
    css: //?
  }, config);
  
  let task = function(controllerConfig, transformCondition) {
    
    let interfaceOptions = Object.keys(config.interfaces).map(i => i + "Interface");
    let staticOptions = interfaceOptions.concat(["css"]);
    
    let interfaceOptions = Object.fromEntries(Object.entries(config.interfaces).map().
    
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
      resources: config.resources.map(res => {
        if (typeof res == "string") {
          return manager.resolveResources(res);
        }
        return res;
      }
    }
  }
  
  task.defaults = function(_defaults) {
    config.defaults = Object.assign({}, config.defaults, _defaults);
  }
  
  return task;
}

module.exports = simpleTask;