const deepEqual = require("fast-deep-equal");

function randomPick(choices, options) {
  let g = function*(context) {
    
    // initialize any dynamic values
    choices = choices.map(c => {
      if (typeof c == "function") {
        c = c(context);
      }
      return c;
    });
  
    while (true) {
      yield choices[Math.floor(choices.length * Math.random())];
    }
  }
  
  g.choices = choices;
  
  return g;
}

function randomRange(from, to, options) {
  
  options = Object.assign({
    round: false    // 100, 10, 1/true, 0.1, 0.01, ...
  }, options);
  
  let g = function*(context) {
    while (true) {
      let num = from + Math.random() * (to-from);
      if (options.round) {
        let round = +options.round;
        num = Math.round(num / round) * round;
      }
      yield num;
    }
  }
  
  g.from = from;
  g.to = to;
  
  return g;
}

function randomShuffle(choices, options) {
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
    let multipledChoices = [];
    for (let i=0; i<options.multiple; i++) {
      multipledChoices = multipledChoices.concat(choices);
    }
    choices = multipledChoices;
  }
    
  let g = function*(context) {
    
    // initialize any dynamic values
    let _choices = choices.map(c => {
      if (typeof c == "function") {
        c = c(context);
      }
      return c;
    });
 
    let shuffledChoices = shuffled(_choices);
    
    let index = 0;
    
    while (true) {
      
      yield shuffledChoices[index];
      index++;
      
      if (index == shuffledChoices.length) {
        if (!options.loop) return;
        let lastItem = _choices[_choices.length-1];
        shuffledChoices = shuffled(_choices);
        if (options.preventContinuation && _choices.length > 1) {
          while (deepEqual(shuffledChoices[0], lastItem)) {
            shuffledChoices = shuffled(_choices);
          }
        }
        index = 0;
      }
    }
  }
  
  g.choices = choices;
  
  return g;
}

function randomLoop(choices, options) {
  
  options = Object.assign({
    loop: true
  }, options);
  
  return randomShuffle(choices, options);
}

randomPick.pick = randomPick;
randomPick.range = randomRange;
randomPick.shuffle = randomShuffle;
randomPick.sequence = randomShuffle;
randomPick.loop = randomLoop;

module.exports = randomPick;