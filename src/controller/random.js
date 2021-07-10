const deepEqual = require("fast-deep-equal");

function randomPick(items, options) {
  
  return function(context) {
    
    // initialize any dynamic values
    items = items.map(c => {
      if (typeof c == "function") {
        c = c(context);
      }
      return c;
    });
    
    return {
      next: () => items[Math.floor(items.length * Math.random())],
      items: items
    }
  
  }
 
}

function randomRange(from, to, options) {
  
  options = Object.assign({
    round: false,    // 100, 10, 1/true, 0.1, 0.01, ...
    suffix: null,
  }, options);
  
  // force suffix to be a string
  if (options.suffix) options.suffix = options.suffix + "";
  
  let g = function*(context) {
    while (true) {
      let num = from + Math.random() * (to-from);
      if (options.round) {
        let round = +options.round;
        num = Math.round(num / round) * round;
      }
      yield num + (options.suffix || 0);
    }
  }
  
  g.from = from;
  g.to = to;
  
  return g;
}

function randomShuffle(items, options) {
  options = Object.assign({
    loop: false,
    multiple: 1,
    preventContinuation: true
  }, options);
    
  function shuffled(arr) {
    const result = arr.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const rand = Math.floor(Math.random() * (i + 1));
      [result[i], result[rand]] = [result[rand], result[i]];
    }
    return result;
  }
  
  if (options.multiple > 1) {
    let multipledItems = [];
    for (let i=0; i<options.multiple; i++) {
      multipledItems = multipledItems.concat(items);
    }
    items = multipledItems;
  }
    
  return function(context) {
    
    // initialize any dynamic values
    items = items.map(c => {
      if (typeof c == "function") {
        c = c(context);
      }
      return c;
    });
 
    let shuffledItems = shuffled(items);
    
    let index = 0;
    let done = false;
    
    return {
      next: () => {
        
        if (done) return {done: true};
        
        let val = shuffledItems[index];
        index++;
        
        if (index == shuffledItems.length) {
          if (!options.loop) done = true;
          else {
            let lastItem = shuffledItems[shuffledItems.length-1];
            shuffledItems = shuffled(items);
            if (options.preventContinuation && items.length > 1) {
              while (deepEqual(shuffledItems[0], lastItem)) {
                shuffledItems = shuffled(items);
              }
            }
            index = 0;
          }
        }       
          
        return {value: val};
        
      },
      items: items
    }
    
  }
}

function randomLoop(items, options) {
  
  options = Object.assign({
    loop: true
  }, options);
  
  return randomShuffle(items, options);
}

randomPick.pick = randomPick;
randomPick.range = randomRange;
randomPick.shuffle = randomShuffle;
randomPick.sequence = randomShuffle;
randomPick.loop = randomLoop;

module.exports = randomPick;