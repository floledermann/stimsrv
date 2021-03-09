
//const parameterPermutator = require("./parameterPermutator.js");

module.exports = function(_parameters, options) {
  
  Object.freeze(_parameters);
  
  options = Object.assign({
    
  }, options);
  
  //permutator = parameterPermutator(parameters, options);
  
  
  // all parameters should be generators, so convert primitive values into infinite generators
  function* yieldOnce(val) {
    yield val;
  }
  
  function* yieldForever(val) {
    while (true) {
      yield val;
    }
  }
  
  return function() {
    
    // make a copy of the parameters
    let parameters = Object.assign({}, _parameters);
    
    for (key of Object.keys(parameters)) {
      // primitive values -> copy to output
      if (typeof parameters[key] == "number" ||
          typeof parameters[key] == "string" || 
          typeof parameters[key] == "boolean" ||
          Array.isArray(parameters[key])) {
        parameters[key] = yieldForever(parameters[key]);
      }
      else if (typeof parameters[key] == "function") {
        parameters[key] = parameters[key]();
        if (!typeof parameters[key].next == "function") {
          throw "Parameter " + key + " factory must return a generator.";
        }
      }
      else {
        throw "Parameter " + key + " must be a primitive value or a factory function.";
      }
    }

    // return next condition, or null for end of experiment
    return {
      nextCondition: function(lastCondition=null, lastResponse=null, trials=[]) {
        
        let condition = {};
        
        let done = false;
        
        for (key of Object.keys(parameters)) {
          let param = parameters[key].next(lastCondition, lastResponse, trials);
          if (param.done) {
            done = true;
          }
          condition[key] = param.value;
        }
        
        if (!done) {
          return condition;
        }
            
        return null; // end of experiment
      }
    }
  }
}