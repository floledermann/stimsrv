module.exports = {
  
  screen: require("./devices/screen.js"),

  random: x => x,
  
  pause: require("./experiments/pause.js"),

  sloan: require("./experiments/sloan.js"),
  landolt: require("./experiments/landolt.js"),
  vernier: require("./experiments/vernier.js"),
  auckland: require("./experiments/auckland.js"),

  staircase: {
    quest: require("./staircase/quest.js")
  }
}