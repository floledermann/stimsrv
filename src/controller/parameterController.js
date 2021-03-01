
//const parameterPermutator = require("./parameterPermutator.js");

module.exports = function(parameters, options) {
  
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
  
  for (key of Object.keys(parameters)) {
    // primitive values -> copy to output
    if (typeof parameters[key] == "number" ||
        typeof parameters[key] == "string" || 
        typeof parameters[key] == "boolean" ||
        Array.isArray(parameters[key])) {
      parameters[key] = yieldForever(parameters[key]);
    }
    if (!typeof parameters[key]?.next == "function") {
      throw "Parameter " + key + " must be a primitive value or a generator";
    }
  }

  // return next condition, or null for end of experiment
  return {
    nextCondition: function(lastCondition=null, lastResponse=null, conditions=[], responses=[]) {
      
      let condition = {};
      
      let done = false;
      
      for (key of Object.keys(parameters)) {
        let param = parameters[key].next(lastCondition, lastResponse, conditions, responses);
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