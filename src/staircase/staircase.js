
const Dimension = require("another-dimension");

module.exports = function(options) {
  
  options = Object.assign({
    //startValue:
    stepSize: 4,
    stepType: "db", // "linear", "log", "db", "multiply"
    //minReversals:
    minTrials: 0,
    numIncorrectReverse: 1,
    numCorrectReverse: 3,
    initialSingleReverse: true,
    //minValue: 
    //maxValue:,
    minReversals: 3,
    minTrials: 0
  }, options);
  
  if (!options.startValue) {
    throw "Staircase controller: startValue must be specified";
  }
  
  if (typeof options.startValue == "string") {
    options.startValue = Dimension(options.startValue);
  }
  
  let direction = "down";
  let correctCounter = 0;
  
  let reversalPoints = [];
  let reversalIntensities = [];
  
  let nextIntensity = options.startValue;
  if (nextIntensity instanceof Dimension) {
    // clone
    nextIntensity = Dimension(nextIntensity);
  }
  
  function moveUp(currentIntensity) {
    switch (options.stepType) {
      case "db": return currentIntensity * 10.0**(options.stepSize/20.0); 
      case "log": return currentIntensity * 10.0**options.stepSize; 
      case "multiply": return currentIntensity * options.stepSize; 
      case "linear": return currentIntensity + options.stepSize; 
    }
  }
  
  function moveDown(currentIntensity) {
    switch (options.stepType) {
      case "db": return currentIntensity / 10.0**(options.stepSize/20.0); 
      case "log": return currentIntensity / 10.0**options.stepSize; 
      case "multiply": return currentIntensity / options.stepSize; 
      case "linear": return currentIntensity - options.stepSize; 
    }
  }
  
  return {
    // return next condition, or null for end of experiment
    next: function(lastCondition=null, lastResponse=null, conditions=[], responses=[]) {
      
      let currentIntensity = nextIntensity;
      
      let reversal = false;
      
      // initial condition
      if (!lastResponse) {
        return { value: currentIntensity, done: false }
      }
          
      if (lastResponse.correct) {
        correctCounter++;
      }
      else {
        correctCounter--;
      }
      
      reversal = false;
      
      if (reversalIntensities.lengt == 0 && options.initialSingleReverse) {
        
        if (lastResponse.correct) {
          if (direction == "up") {
            reversal = true;
          }
          direction = "down";
        }
        else {
          if (direction == "down") {
            reversal = true;
          }
          direction = "up";
        }
      }
      else if (correctCounter >= options.numCorrectReverse) {
        if (direction == "up") {
          reversal = true;
        }
        direction = "down";
      }
      else if (correctCounter <= -options.numIncorrectReverse) {
        if (direction == "down") {
          reversal = true;
        }
        direction = "up";
      }
      
      if (reversal) {
        reversalPoints.push(responses.length);
        reversalIntensities.push(lastCondition);
      }
      
      if (reversalIntensities.length >= options.minReversals &&
          responses.length >= options.minTrials) {
        // finished
        return { done: true };
      }
      
      
      if (correctCounter >= options.numCorrectReverse) {
        nextIntensity = moveDown(currentIntensity);
        correctCounter = 0;
      }
      else if (correctCounter <= -options.numIncorrectReverse) {
        nextIntensity = moveUp(currentIntensity);
        correctCounter = 0;
      }
           
      if (currentIntensity instanceof Dimension) {
        nextIntensity = Dimension(nextIntensity, currentIntensity.unit);
      }
      
      return { value: currentIntensity, done: false }
    }
  }
}