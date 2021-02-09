
const valOrFunc = require("../util/valOrFunc.js");

module.exports = function(options) {
  
  options = Object.assign({
    filterResponse: null,
    nextCondition: {}
  }, options);
  
  // return next condition, or null for end of experiment
  return function(lastCondition, lastResponse, conditions, responses) {
    
    if (!options.filterResponse || options.filterResponse(lastResponse, lastCondition, responses, conditions)) {
      return null; // end of experiment
    }
    return valOrFunc(options.nextCondition, lastCondition, lastResponse, conditions, responses);
  }
}