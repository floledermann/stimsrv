

// outer factory is called at experiment initialization time
module.exports = function(_parameters, conditions, context) {
  
  Object.freeze(_parameters);  
  
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
  let parameters = Object.assign({}, _parameters);
  
  for (let key of Object.keys(parameters)) {
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
  
  let conditionsIterator = null;
  
  if (conditions) {
    conditionsIterator = conditions();
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
      
      for (key of Object.keys(_parameters)) {
        if (typeof _parameters[key] == "number" ||
            typeof _parameters[key] == "string" || 
            typeof _parameters[key] == "boolean" ||
            Array.isArray(_parameters[key])) {
          p[key] = _parameters[key];
        }
      }
      
      return p;
      
    }
  }
}