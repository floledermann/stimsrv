
// create (shallow) clones of returned objects to avoid complications when result is modified
function clone(val) {
  if (Array.isArray(val)) return val.map(v => v);
  if (typeof val == "object") return Object.assign({}, val);
  return val;
}

let sequence = function(items, options) {
  
  options = Object.assign({
    stepCount: 1,         // repeat each item stepCount times
    loop: undefined,      // loop after sequence is exhausted
    loopCount: undefined, // stop after loopCount loops
  }, options);
  
  // loop by default if loopCount is specified
  if (options.loopCount && options.loop === undefined) {
    options.loop = true;
  }
  
  return function create(context) {
    
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
        return {value: clone(val)};
      },
      items: items,
      // iterable protocol - return new iterator
      [Symbol.iterator]: function() { return create(context); }
    }
  }

}

sequence.loop = function(items, options) {

  options = Object.assign({
    loop: true
  }, options);
  
  return sequence(items, options);
}

/**
Iterator, converting an Array of iterators into a sequence of Arrays of those iterators' values.
*/
sequence.array = function(items, options) {
  
  return function create(context) {
  
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
        return {value: clone(val)};
      },
      items: items,
      // iterable protocol - return new iterator
      [Symbol.iterator]: function() { return create(context); }
    }
  
  }
}

module.exports = sequence;