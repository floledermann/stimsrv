
const valOrFunc = require("../util/valOrFunc.js");

module.exports = function(options) {
  
  options = Object.assign({
    filterResponse: null,
    nextCondition: {}
  }, options);
  
  // return next condition, or null for end of experiment
  return function() {
    return {
      nextCondition: function(lastCondition, lastResponse, conditions, responses) {
        
        // end experiment if a response has been given and it matches the filter criteria
        if (lastResponse && (!options.filterResponse || options.filterResponse(lastResponse, lastCondition, responses, conditions))) {
          return null; // end of experiment
        }
        
        // else return next condition
        return valOrFunc(options.nextCondition, lastCondition, lastResponse, conditions, responses);
      }
    }
  }
}