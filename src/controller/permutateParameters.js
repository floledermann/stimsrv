
const parameterPermutator = require("./parameterPermutator.js");

module.exports = function(parameters, options) {
  
  options = Object.assign({
    
  }, options);
  
  permutator = parameterPermutator(parameters, options);
  
  // return next condition, or null for end of experiment
  return {
    nextCondition: function(lastCondition, lastResponse, conditions, responses) {
      
      let nextval = permutator.next();
      
      if (!nextval.done) {
        return nextval.value;
      }
          
      return null; // end of experiment
    }
  }
}