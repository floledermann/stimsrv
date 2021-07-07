
const parameterController = require("stimsrv/controller/parameterController");


function array(val) {
  if (val === undefined || val === null) return [];
  if (!Array.isArray(val)) return [val];
  return val;
}


function taskManager(config) {
  
  config = Object.assign({
    defaults: {},
    controllerConfig: [],
    transformCondition: [],
    // do we need this? may simply throw an error if it does not resolve to a static value
    staticOptions: []
  }, config);
  
  config.controllerConfig = [config.defaults, ...array(config.controllerConfig)];
  config.transformCondition = array(config.transformCondition);
  
  let params = parameterController({
    parameters: config.controllerConfig, //Array.prototype.map.call(arguments, p => pickProperties.without(p, staticOptions))
    // first use config.nextContext, then user-supplied nextContext() (both optional)
    nextContext: context => (context = config.nextContext?.(context) || context, resolve("nextContext", context, context))
  });
  
  function resolve(name, context, defaultValue) {
    let val = config.controllerConfig.reduce((val, current) => {
      if (typeof current == "function") current = current(context);
      let entry = current[name];
      if (typeof entry == "function") entry = entry(context);
      if (entry !== undefined) val = entry;
      return val;
    }, null);
    
    if ((val === null || val === undefined) && defaultValue !== undefined) return defaultValue;
    
    return val;
  }
  
  function resolveArray(name, context, defaultValue) {
    return array(resolve(name, context, defaultValue));
  };
  
  return {
    resolve: resolve,
    resolveArray: resolveArray,
    resolveResources: function(name, context) {
      return resolveArray(name, context).map(res => res.resource ? res.resource : res).filter(r => r);
    },
    transformCondition: context => condition => {
      return config.frontendTransformCondition.reduce((condition, transform) => {
        if (typeof transform == "function") {
          transform = transform(context);
        }
        if (typeof transform == "function") {
          transform = transform(condition);
        }
        Object.assign(condition, transform);
        return condition;
      }, condition);
    },
    
    controller: function(context) {
      return params(context);
    },
    
    interfaces: function(spec, context) {
      
      let interfaces = {};
      
      Object.keys(spec).forEach(key => {
        resolveArray(key + "Interface", context, key).forEach(ui => {
          interfaces[ui] = spec[key];
        })
      });
      
      return interfaces;
      
    }
    
  }
}

module.exports = taskManager;
