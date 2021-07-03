let sequence = function(choices, options) {
  
  options = Object.assign({
    stepCount: 1,         // repeat each item stepCount times
    loop: false,          // loop after sequence is exhausted
    loopCount: undefined, // stop after loopCount loops
  }, options);
  
  return function(context) {
    
    // initialize any dynamic values
    choices = choices.map(c => {
      if (typeof c == "function") {
        c = c(context);
      }
      return c;
    });
  
    let i=0;
    let index=0;
    let loopCounter = 0;
    let done = false;
    
    return {
      next: function() {
        
        if (done) return {done: true};
        
        let val = choices[index];
        i++;
        if (i == options.stepCount) {
          i=0;
          index++;
        }
        if (index == choices.length) {
          loopCounter++;
          if (!options.loop || (options.loopCount && loopCounter == options.loopCount)) {
            done = true;
          }
          index=0;    
        }
        return {value: val};
      },
      choices: choices
    }
  }

}

sequence.loop = function(choices, options) {

  options = Object.assign({
    loop: true
  }, options);
  
  return sequence(choices, options);
}

module.exports = sequence;