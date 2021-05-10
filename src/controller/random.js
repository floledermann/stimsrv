const deepEqual = require("fast-deep-equal");

function randomPick(choices, options) {
  return function*() {
    while (true) {
      yield choices[Math.floor(choices.length * Math.random())];
    }
  }
}

function randomRange(from, to, options) {
  
  options = Object.assign({
    round: false    // 100, 10, 1/true, 0.1, 0.01, ...
  }, options);
  
  return function*() {
    while (true) {
      let num = from + Math.random() * (to-from);
      if (options.round) {
        let round = +options.round;
        num = Math.round(num / round) * round;
      }
      yield num;
    }
  }
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
    console.log(result);
    return result;
  }
  
  if (options.multiple > 1) {
    let multipledChoices = [];
    for (let i=0; i<options.multiple; i++) {
      multipledChoices = multipledChoices.concat(choices);
    }
    choices = multipledChoices;
  }
    
  return function*() {
    
    let shuffledChoices = shuffled(choices);
    let index = 0;
    
    while (true) {
      
      yield shuffledChoices[index];
      index++;
      
      if (index == shuffledChoices.length) {
        if (!options.loop) return;
        let lastItem = choices[choices.length-1];
        shuffledChoices = shuffled(choices);
        if (options.preventContinuation) {
          while (deepEqual(shuffledChoices[0], lastItem)) {
            shuffledChoices = shuffled(choices);
          }
        }
        index = 0;
      }
    }
  }
}

randomPick.pick = randomPick;
randomPick.range = randomRange;
randomPick.shuffle = randomShuffle;
randomPick.sequence = randomShuffle;

module.exports = randomPick;