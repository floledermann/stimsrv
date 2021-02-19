module.exports = function*(choices, options) {
  
  while (true) {
    yield choices[Math.floor(choices.length * Math.random())];
  }
  
}