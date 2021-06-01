

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
  
  Object.freeze(config.parameters);

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
    let parameterIterators = Object.assign({}, config.parameters);
    
    //console.log(parameterIterators);
    
    for (let key of Object.keys(parameterIterators)) {
      // if its already an iterator, we don't have to do anything
      if (!(parameterIterators[key].next && typeof parameterIterators[key].next == "function")) {
        // function -> initialize with context
        if (typeof parameterIterators[key] == "function") {
          parameterIterators[key] = parameterIterators[key](context);
        }
        // primitive values -> copy to output
        if (!(parameterIterators[key].next && typeof parameterIterators[key].next == "function")) {
          parameterIterators[key] = yieldForever(parameterIterators[key]);
        }
      }
    }
    
    let conditionsIterator = null;
    
    if (config.conditions) {
      conditionsIterator = config.conditions(context);
    }

    // return next condition, or null for end of experiment
    return {
      nextCondition: function(lastCondition=null, lastResponse=null, trials=[]) {
        
        let condition = {};
        
        // if any parameter is exhausted, we are done
        let done = false;
        
        // special case: no parameters nor conditions
        if (Object.keys(parameterIterators).length == 0 && !conditionsIterator) {
          done = true;
        }
        
        for (key of Object.keys(parameterIterators)) {
          let param = parameterIterators[key].next(lastCondition, lastResponse, trials);
          if (param.done) {
            done = true;
          }
          condition[key] = param.value;
        }
        
        if (conditionsIterator) {
          let cond = conditionsIterator.next(lastCondition, lastResponse, trials);
        
          Object.assign(condition, cond.value);
        }
        
        if (!done) {
          return condition;
        }
            
        return null; // end of experiment
      },
      
      constantParameters: function() {
        
        let p = {};
        
        for (key of Object.keys(config.parameters)) {
          if (isConstantParameter(config.parameters[key])) {
            p[key] = config.parameters[key];
          }
        }
        
        return p;
        
      },
      
      nextContext: config.nextContext
    }
  }
}