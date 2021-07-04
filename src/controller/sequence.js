let sequence = function(items, options) {
  
  options = Object.assign({
    stepCount: 1,         // repeat each item stepCount times
    loop: false,          // loop after sequence is exhausted
    loopCount: undefined, // stop after loopCount loops
  }, options);
  
  return function(context) {
    
    // initialize any dynamic values
    items = items.map(c => {
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
        
        let val = items[index];
        i++;
        if (i == options.stepCount) {
          i=0;
          index++;
        }
        if (index == items.length) {
          loopCounter++;
          if (!options.loop || (options.loopCount && loopCounter == options.loopCount)) {
            done = true;
          }
          index=0;    
        }
        return {value: val};
      },
      items: items
    }
  }

}

sequence.loop = function(items, options) {

  options = Object.assign({
    loop: true
  }, options);
  
  return sequence(items, options);
}

module.exports = sequence;