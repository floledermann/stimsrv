
function* propertiesGenerator(parameters) {
  
  parameters = parameters || {};
  
  // include only properties which are generators
  let iterableParameters = {};
  let constantParameters = {};
  
  for (let key of Object.keys(parameters)) {
    if (parameters[key].next && typeof parameters[key].next == "function") {
      iterableParameters[key] = parameters[key];
    }
    else {
      constantParameters[key] = parameters[key];
    }
  }
    
  let allDone = false;
  let result = {};
  
  while (!allDone) {
    // reset to check whether any iterator is still active
    allDone = true;
    
    // constant parameters should be present, but don't cause the iterator to continue
    Object.assign(result, constantParameters);
    
    for (key of Object.keys(iterableParameters)) {
      let param = iterableParameters[key].next();
      if (!param.done) {
        result[key] = param.value;
        allDone = false;
      }
      else {
        // exhausted properties get their final value, or will be removed from the result
        if (param.value === undefined || param.value === null) {
          delete result[key];
        }
        else {
          result[key] = param.value;
        }
      }
    }
    
    if (!allDone) {
      yield result;
    }
  }
  
  return result;
}

module.exports = propertiesGenerator;