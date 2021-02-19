module.exports = function(options) {
  
  options = Object.assign({
    //startValue:
    stepSize: 4,
    stepType: "db", // "lin", "log", "db", "mul"
    //minReversals:
    minTrials: 0,
    numIncorrectReverse: 1,
    numCorrectReverse: 3,
    initialSingleReverse: true,
    //minValue: 
    //maxValue:
  }, options);
  
  if (!options.startValue) {
    throw "Staircase controller: startValue must be specified";
  }
  
  return {
    // return next condition, or null for end of experiment
    next: function(lastCondition=null, lastResponse=null, conditions=[], responses=[]) {
      if (conditions.length < 5) {
        return { value: options.startValue, done: false }
      }
      return { done: true };
    }
  }
}