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

}

randomPick.pick = randomPick;
randomPick.range = randomRange;

module.exports = randomPick;