
const parameterController = require("stimsrv/controller/parameterController");

const toArray = require("stimsrv/util/toArray");

function taskManager(config) {
  
  config = Object.assign({
    defaults: {},
    controllerConfig: [],
    transformCondition: [],
    // do we need this? may simply throw an error if it does not resolve to a static value
    staticOptions: []
  }, config);
  
  config.controllerConfig = [config.defaults, ...toArray(config.controllerConfig)];
  config.transformCondition = toArray(config.transformCondition);
  
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
    return toArray(resolve(name, context, defaultValue));
  }
  
  function resolveConfig(context) {
    return config.controllerConfig.reduce((config, current) => {
      if (typeof current == "function") {
        current = current(context);
      }
      current = Object.fromEntries(Object.entries(current).map(([key, spec]) => [key, typeof spec == "function" ? spec(context) : spec]));
      Object.assign(config, current);
      return config;
    }, {});
  }
  
  return {
    resolve: resolve,
    resolveArray: resolveArray,
    resolveResources: function(spec, context) {
      let arr = [];
      if (typeof spec == "function") {
        arr = toArray(spec(resolveConfig(context)));
      }
      else {
        // string -> get parameter by name
        arr = resolveArray(spec, context);
      }
      return arr.map(res => res.resource ? res.resource : res).filter(r => r);
    },
    resolveConfig: resolveConfig,
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
      
      let config = resolveConfig(context);
      
      Object.keys(spec).forEach(key => {
        resolveArray(key + "Interface", context, key).forEach(ui => {
          interfaces[ui] = spec[key](config);
        })
      });
      
      return interfaces;
      
    }
    
  }
}

module.exports = taskManager;
