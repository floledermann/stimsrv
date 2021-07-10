let sequence = function(items, options) {
  
  options = Object.assign({
    stepCount: 1,         // repeat each item stepCount times
    loop: false,          // loop after sequence is exhausted
    loopCount: undefined, // stop after loopCount loops
  }, options);
  
  return function(context) {
    
    // initialize any dynamic values
    items = items.map(item => typeof item == "function" ? item(context) : item);
  
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

sequence.array = function(items, options) {
  
  return function(context) {
  
    items = items.map(item => typeof item == "function" ? item(context) : item);
    
    return {
      next: function() {
        let done = false;
        let val = [];
        for (let item of items) {
          let next = item;
          if (item.next && typeof item.next == "function") {
            next = item.next();
            if (item.done) return {done: true};
            next = next.value;
          }
          val.push(next);
        }
        return {value: val};
      },
      items: items
    }
  
  }
}

module.exports = sequence;