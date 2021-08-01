
/*
parameterController(config)

A helper to dynamically generate parameter objects, which are simple key-value pairs.

This can be used to generate the parameters of a task from a parameter specification which may include dynamic elements such as iterators and callback functions, which will be resolved into actual static parameters for subsequent trials by this helper.

Parameters:

config: Object { parameters, nextContext } containing the configuration of the parameterController.

config.parameters is the specification for how to generate parameter objects. Must be a single Spec or an Array of Specs.
If it is an Array, each entry in the array is reduce'd with previous result to produce the overall result.
Each Spec may be an Object, an Iterator or a Function.
Functions are intitialized with the context and return the actual spec: an Object, an Iterator or a Function(condition, lastCondition, lastResponse, trials). These define the actual key-value entries of the generated parameters.
Each key of the object derived in this way may again be a Function(context), an Iterator or a primitive value. Primitive values are copied to the output, Generators and Functions are invoked to produce an output value.
controller.nextCondition(lastCondition, lastResponse, trials) collects all such generated values as an Object. It generates new value objects as long as none of the generators are exhausted or functions return null.
controller.constantParameters() collects all parameters which are (potentially!) static values - may still be overridden by generators or functions

config.nextContext is simply passed through to the returned controller object.

Returns:

context => controller { nextCondition(), constantParameters(), nextContext() }

See \test\parameterController.js for example usage.

Attempt at formal TypeScript specification:

parameterController(ParameterControllerConfig) => Context => ControllerObject { nextCondition(), constantParameters(), nextContext() }

ParameterControllerConfig {
  parameters: Array<Spec> | Spec,
  nextContext?: (Context, TrialsResults) => Context
}

Spec: (context => InitializedSpec) | Iterator<SpecObject> | SpecObject
InitializedSpec: ((condition, lastCondition, lastResponse, trials) => Iterator<SpecObject> | SpecObject) | Iterator<SpecObject> | SpecObject
SpecObject { [key: string]: ValueSpec }
ValueSpec: ((condition, lastCondition, lastResponse, trials) => Iterator<ParameterValue> | ParameterValue) | Iterator<ParameterValue> | ParameterValue

*/

module.exports = function(config) {
  
  config = Object.assign({
    parameters: {},
    nextContext: null
  }, config);
  
  if (!Array.isArray(config.parameters)) {
    config.parameters = [config.parameters];
  }
  
  return function(context) {
    
    // all parameters should be generators, so convert primitive values into infinite generators
    function* yieldOnce(val) {
      yield val;
    }
    
    function* yieldForever(val) {
      while (true) {
        yield val;
      }
    }
    
    // make a copy of the parameters
    let parameterIterators = config.parameters.map(p => {
      
      if (typeof p == "function") {
        // function case -> initialize with context
        p = p(context);
      }
      
      if (!(typeof p == "function" || (p.next && typeof p.next == "function"))) {
        // object case
        // make copy     
        p = Object.assign({}, p);
        
        // initialize property iterators / callbacks
        for (let key of Object.keys(p)) {
          // if its already an iterator, we don't have to do anything
          if (!(p[key]?.next && typeof p[key].next == "function")) {
            // function -> initialize with context
            if (typeof p[key] == "function") {
              p[key] = p[key](context);
            }
          }
        }
      }
      
      return p;
    });
    
    
    return {
      // return next condition, or null for end of experiment
      nextCondition: function(lastCondition=null, lastResponse=null, trials=[]) {
        
        let condition = {};
        
        // if any parameter is exhausted, we are done
        let done = false;
        
        function handleParameter(condition, key, spec) {
          
          if (spec === undefined) return;
          
          if (typeof spec == "function") {
            // property is function
            spec = spec(condition, lastCondition, lastResponse, trials);
            if (spec === null) {
              done = true;
              return condition;
            }
            // recurse dynamic spec
            //return handleParameter(condition, key, spec);
          }
          if (spec?.next && typeof spec.next == "function") {
            // property is generator
            spec = spec.next(lastCondition, lastResponse, trials);
            if (spec.done) {
              done = true;
              return condition;
            }
            spec = spec.value;
            // recurse dynamic spec
            //return handleParameter(condition, key, spec);
          }
          
          // primitive value - copy to output
          condition[key] = spec;
          return condition;
        }
        
        function handleParameters(condition, spec) {
          if (typeof spec == "function") {
            // overall function
            let cond = spec(condition, lastCondition, lastResponse, trials);
            if (cond === null) {
              done = true;
              return condition;
            }
            return handleParameters(condition, cond);
          }
          if (spec.next && typeof spec.next == "function") {
            // overall generator
            let cond = spec.next(lastCondition, lastResponse, trials);
            if (cond.done) {
              done = true;
              return condition;
            }
            return handleParameters(condition, cond.value); 
          }
          
          // object with individual properties
          for (key of Object.keys(spec)) {
            handleParameter(condition, key, spec[key]);
          }
          
          return condition;
        }
                
        condition = parameterIterators.reduce(handleParameters, {});
                
        if (!done) {
          return condition;
        }
            
        return null; // end of experiment
      },
      
      constantParameters: function() {
        
        function isConstantParameter(param) {
          return !(typeof param == "function" || (param?.next && typeof param.next == "function"))
        }

        let parameters = parameterIterators.reduce((parametersAccumulator, spec) => {
          // can be applied only to parameter objects
          if (isConstantParameter(spec)) {
            for (key of Object.keys(spec)) {
              if (isConstantParameter(spec[key])) {
                parametersAccumulator[key] = spec[key];
              }
              else {
                // potentially static param is overwritten by dynamic param
                delete parametersAccumulator[key];
              }
            }  
          }
          
          return parametersAccumulator;
        }, {});
        
        
        return parameters;
        
      },
      
      nextContext: config.nextContext
    }
  }
}