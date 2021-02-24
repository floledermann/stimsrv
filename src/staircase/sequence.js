let sequence = function*(choices, options) {
  
  options = Object.assign({
    stepCount: 1,
    loop: false,
    loopCount: undefined
  }, options);
  
  let i=0;
  let index=0;
  let loopCounter = 0;
  
  while (true) {
    yield choices[index];
    i++;
    if (i == options.stepCount) {
      i=0;
      index++;
    }
    if (index == choices.length) {
      loopCounter++;
      if (!options.loop || (options.loopCount && loopCounter == options.loopCount)) {
        break;
      }
      index=0;    
    }
  }
  
}

sequence.loop = function*(choices, options) {

  options = Object.assign({
    loop: true
  }, options);
  
  yield* sequence(choices, options);
}

module.exports = sequence;