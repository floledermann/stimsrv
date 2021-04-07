
function* propertiesGenerator(parameters) {
  
  parameters = parameters || {};
  
  // include only properties which are generators
  let iterableParameters = {};
  
  for (let key of Object.keys(parameters)) {
    if (parameters[key].next && typeof parameters[key].next == "function") {
      iterableParameters[key] = parameters[key];
    }
  }
    
  let allDone = false;
  let result = {};
  
  while (!allDone) {
    // reset to check whether any iterator is still active
    allDone = true;
    
    for (key of Object.keys(iterableParameters)) {
      let param = iterableParameters[key].next();
      if (!param.done) {
        result[key] = param.value;
        allDone = false;
      }
      else {
        delete result[key];
      }
    }
    
    if (!allDone) {
      yield result;
    }
  }
  
  return result;
}

module.exports = propertiesGenerator;