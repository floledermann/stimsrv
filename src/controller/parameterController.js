

function isConstantParameter(param) {
  return !(typeof param == "function" || (param?.next && typeof param.next == "function"))
}

// outer factory is called at experiment initialization time
module.exports = function(config) {
  
  config = Object.assign({
    parameters: {},
    conditions: null,
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
        p = p(context);
      }
      
      if (!(typeof p == "function" || (p.next && typeof p.next == "function"))) {
        // object case
        // make copy     
        p = Object.assign({}, p);
        
        // initialize property iterators / callbacks
        for (let key of Object.keys(p)) {
          // if its already an iterator, we don't have to do anything
          if (!(p[key].next && typeof p[key].next == "function")) {
            // function -> initialize with context
            if (typeof p[key] == "function") {
              p[key] = p[key](context);
            }
            // primitive values -> copy to output
            // this is not needed anymore, since primitive values are handled by handleParameter() below
            /*
            if ( (!(p[key].next && typeof p[key].next == "function")) && !(typeof p[key] == "function")) {
              p[key] = yieldForever(p[key]);
            }
            */
          }
        }
      }
      
      return p;
    });
    
    // return next condition, or null for end of experiment
    return {
      nextCondition: function(lastCondition=null, lastResponse=null, trials=[]) {
        
        let condition = {};
        
        // if any parameter is exhausted, we are done
        let done = false;
        
        // special case: no parameters in any spec
        /*
        if (parameterIterators.every(p => (! typeof p == "function") && Object.keys(p).length == 0)) {
          done = true;
        }
        */
        
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
          if (spec.next && typeof spec.next == "function") {
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
        
        let parameters = parameterIterators.reduce((parametersAccumulator, spec) => {
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
          else {
            // if the overall parameters object is dynamic, we have to be conservative
            // as it may override any parameter!
            // so discard any constant parameters colleted to this point!
            return {};
          }
          
          return parametersAccumulator;
        }, {});
        
        
        return parameters;
        
      },
      
      nextContext: config.nextContext
    }
  }
}