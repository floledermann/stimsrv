module.exports = function(options) {


  return function(previousConditions, previousResponses) {
    // dummy implementation - return last condition
    return previousConditions.pop();
  }
}