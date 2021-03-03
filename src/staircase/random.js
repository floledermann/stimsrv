function randomPick(choices, options) {
  return function*() {
    while (true) {
      yield choices[Math.floor(choices.length * Math.random())];
    }
  }
}

function randomRange(from, to, options) {
  return function*() {
    while (true) {
      yield from + Math.random() * (to-from);
    }
  }
}

function randomShuffle(choices, options) {
  options = Object.assign({
    loop: true
  }, options);
  
  function shuffled(arr) {
    const result = arr.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const rand = Math.floor(Math.random() * (i + 1));
      [result[i], result[rand]] = [result[rand], result[i]];
    }
    return result;
  }
  
  shuffledChoices = shuffled(choices);
  let index = 0;
  
  return function*() {
    
    while (true) {
      
      yield shuffledChoices[index];
      index++;
      
      if (index == shuffledChoices.length) {
        if (!options.loop) return;
        shuffledChoices = shuffled(choices);
        index = 0;
      }
    }
  }
}

randomPick.pick = randomPick;
randomPick.range = randomRange;
randomPick.shuffle = randomShuffle;

module.exports = randomPick;