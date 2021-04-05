
const valOrFunc = require("../util/valOrFunc.js");

module.exports = function(config) {
  
  config = Object.assign({
    filterResponse: null,
    nextCondition: {}
  }, config);
  
  // return next condition, or null for end of experiment
  return {
    nextCondition: function(lastCondition, lastResponse, conditions, responses) {
      
      // end experiment if a response has been given and it matches the filter criteria
      if (lastResponse && (!config.filterResponse || config.filterResponse(lastResponse, lastCondition, responses, conditions))) {
        return null; // end of experiment
      }
      
      // else return next condition
      return valOrFunc(config.nextCondition, lastCondition, lastResponse, conditions, responses);
    },
    nextContext: function(conditions, responses) {
      return null;
    }
  }
}