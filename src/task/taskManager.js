
const parameterController = require("stimsrv/controller/parameterController");

const toArray = require("stimsrv/util/toArray");

/**
taskManager

Helper for managing the dynamic aspects of a task configuration and translate them into
actual (static) values given a specific context.

The main functionality is resolving entries against a controllerConfig specification
(passed to the parameterController, see documentation there). Such specification can be an Array
of individual specifications, including callbacks, iterators for objects or individual fields.

The provided methods resolve, resolveArray, resolveResources, resolveConfig allow to resolve
parameters to actual values, given a specific context.
*/

function taskManager(config) {
  
  config = Object.assign({
    defaults: {},
    controllerConfig: [],
    generateCondition: null,
    transformConditionOnClient: [],
    // do we need this? may simply throw an error if it does not resolve to a static value
    staticOptions: []
  }, config);
  
  config.controllerConfig = [config.defaults, ...toArray(config.controllerConfig)];
  config.transformConditionOnClient = toArray(config.transformConditionOnClient);
  
  let params = parameterController({
    parameters: config.controllerConfig,
    generateCondition: config.generateCondition,
    // first apply config.nextContext, then user-supplied nextContext() (both optional)
    nextContext: context => (context = config.nextContext?.(context) || context, resolve("nextContext", context, context))
  });
  
  /*
  Resolve the parameter named name, given the context.
  */
  function resolve(name, context, defaultValue) {
    let val = config.controllerConfig.reduce((val, current) => {
      if (context && typeof current == "function") current = current(context);
      let entry = current[name];
      if (context && typeof entry == "function") entry = entry(context);
      if (entry !== undefined) val = entry;
      return val;
    }, null);
    
    if ((val === null || val === undefined) && defaultValue !== undefined) return defaultValue;
    
    return val;
  }
  
  /*
  Resolve and cast to Array.
  */
  function resolveArray(name, context, defaultValue) {
    return toArray(resolve(name, context, defaultValue));
  }
  
  /*
  Resolve the complete set of parameters.
  */
  function resolveConfig(context) {
    if (!context) throw new Error("No context provided to taskManager.resolveConfig() - use resolveStaticConfig to resolve pre-context!");
    return config.controllerConfig.reduce((config, spec) => {
      // resolve function with context
      if (context && typeof spec == "function") {
        spec = spec(context);
      }
      // for each entry in spec object, resolve with context if it is a function
      spec = Object.fromEntries(
        Object.entries(spec).map(
          ([key, spec]) => [key, typeof spec == "function" ? spec(context) : spec]
        )
      );
      // add to overall result
      Object.assign(config, spec);
      return config;
    }, {});
  }
  
  function resolveStaticConfig() {
    // if we need to access config before we have a context, simply copy together the specs
    return config.controllerConfig.reduce((config, spec) => {
      Object.assign(config, spec);
      return config;
    }, {});
  }
  
  return {
    resolve: resolve,
    resolveArray: resolveArray,
    resolveResources: function(spec, context) {
       // if spec is a function, resolve with (static) config object
       // this will usually happen before we have a context, so dynamic behaviour is not supported
      if (typeof spec == "function") {
        spec = toArray(spec(resolveStaticConfig()));
      }
      // otherwise resolve property name as array of resources
      else {
        spec = resolveArray(spec, context);
      }        
      // each item may have a .resource entry, or it is already a resource
      // (this is nedded to support resources that have other information attached to them, e.g. fonts)
      return spec.map(res => res.resource ? res.resource : res).filter(r => r);
    },
    resolveConfig: resolveConfig,
    resolveStaticConfig: resolveStaticConfig,
    transformConditionOnClient: context => condition => {
      return config.transformConditionOnClient.reduce((condition, transform) => {
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
    
    controller: context => params(context),
    
    // spec defines the standard interfaces for this task
    interfaces: function(context) {
      
      let interfaces = {};
      
      let resolvedConfig = resolveConfig(context);
      
      // add/overrule dynamically defined interfaces over standard interfaces
      let spec = Object.assign({}, config.interfaces, resolvedConfig.interfaces);
      
      Object.keys(spec).forEach(key => {
        resolveArray(key + "Interface", context, key).forEach(ui => {
          interfaces[ui] = typeof spec[key] == "function" ? spec[key](resolvedConfig) : spec[key];
        })
      });
      
      return interfaces;
      
    }
    
  }
}

module.exports = taskManager;
