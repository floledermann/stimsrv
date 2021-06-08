
const Dimension = require("another-dimension");

const matchProperties = require("../util/matchProperties.js");
const valOrFunc = require("../util/valOrFunc.js");

// see https://github.com/psychopy/psychopy/blob/release/psychopy/data/staircase.py
module.exports = function(_options) {
  
  _options = Object.assign({
    startValue: 1,
    stepSize: 2,
    stepSizeFine: 1,
    stepType: "db", // "linear", "log", "db", "multiply"
    minReversals: 3,
    minTrials: 0,
    numUp: 1,
    numDown: 3,
    numReversalsFine: Infinity, // switch to stepSizeFine after this many reversals
    initialSingleReverse: true,
    minValue: -Infinity,
    maxValue: Infinity,
    isResponseCorrect: () => matchProperties
  }, _options);
    
  return function(context) {
    
    let direction = "down";
    let correctCounter = 0;
    
    let reversalPoints = [];
    let reversalIntensities = [];
    
    let options = valOrFunc.allProperties(_options, context);
    
    if (typeof options.startValue == "string") {
      options.startValue = Dimension(options.startValue);
    }

    if (!options.startValue) {
      throw "Staircase controller: startValue must be specified";
    }  
  
    let currentIntensity = options.startValue;
    if (currentIntensity instanceof Dimension) {
      // clone
      currentIntensity = Dimension(currentIntensity);
    }

    function moveUp(currentIntensity, reversal) {
      //console.log("Moving UP");
      let numReversals = reversalIntensities.length + (reversal ? 1 : 0);
      let stepSize = numReversals < options.numReversalsFine ? options.stepSize : options.stepSizeFine;
      //console.log("Reversals: " + numReversals);
      //console.log("Step Size: " + (numReversals < options.numReversalsFine ? "NORMAL" : "FINE"));
      switch (options.stepType) {
        case "db": return currentIntensity * 10.0**(stepSize/20.0); 
        case "log": return currentIntensity * 10.0**stepSize; 
        case "multiply": return currentIntensity * stepSize; 
        case "linear": return currentIntensity + stepSize; 
      }
    }
    
    function moveDown(currentIntensity) {
      //console.log("Moving DOWN");
      let stepSize = reversalIntensities.length < options.numReversalsFine ? options.stepSize : options.stepSizeFine;
      //console.log("Reversals: " + reversalIntensities.length);
      //console.log("Step Size: " + (reversalIntensities.length < options.numReversalsFine ? "NORMAL" : "FINE"));
      switch (options.stepType) {
        case "db": return currentIntensity / 10.0**(stepSize/20.0); 
        case "log": return currentIntensity / 10.0**stepSize; 
        case "multiply": return currentIntensity / stepSize; 
        case "linear": return currentIntensity - stepSize; 
      }
    }
    
    return {
      // Generator interface
      // If there is a next intensity, return { value: nextIntensity, done: false }
      // When finished, return { done: true }
      next: function(lastCondition=null, lastResponse=null, trials=[]) {
        
        // initial condition
        if (!lastResponse) {
          return { value: currentIntensity, done: false }
        }
        
        let correct = options.isResponseCorrect(lastCondition, lastResponse);
        
        if (correct) {
          console.log("Response CORRECT");
          correctCounter = Math.max(correctCounter, 0);
          correctCounter++;
        }
        else {
          console.log("Response INCORRECT");
          correctCounter = Math.min(correctCounter, 0);
          correctCounter--;
        }
        
        //let currentIntensity = nextIntensity;
        
        let reversal = false;
        
        // initial response(s)
        if (reversalIntensities.length == 0 && options.initialSingleReverse) {         
          if (correct) {
            direction = "down";
            currentIntensity = moveDown(currentIntensity);
            correctCounter = 0;
          }
          else {
            reversal = true;
            direction = "up";
            currentIntensity = moveUp(currentIntensity, true);
            correctCounter = 0;
          }
        }
        else if (correctCounter >= options.numDown) {
          if (direction == "up") {
            reversal = true;
            //correctCounter = 0;
          }
          direction = "down";
        }
        else if (correctCounter <= -options.numUp) {
          if (direction == "down") {
            reversal = true;
            //correctCounter = 0;
          }
          direction = "up";
        }
        
        if (reversal) {
          //console.log("REVERSAL @ " + currentIntensity);
          //console.log(lastCondition);
          reversalPoints.push(trials.length);
          reversalIntensities.push(lastCondition);
        }
        
        if (reversalIntensities.length >= options.minReversals &&
            trials.length >= options.minTrials) {
          // finished
          return { done: true };
        }
        
        
        if (correctCounter >= options.numDown) {
          currentIntensity = moveDown(currentIntensity);
          correctCounter = 0;
        }
        else if (correctCounter <= -options.numUp) {
          currentIntensity = moveUp(currentIntensity);
          correctCounter = 0;
        }
        
        currentIntensity = Math.max(options.minValue, Math.min(options.maxValue, currentIntensity));
             
        if (options.startValue instanceof Dimension) {
          currentIntensity = Dimension(currentIntensity, options.startValue.unit);
        }
        
        return { value: currentIntensity, done: false }
      }
    }
  }
}