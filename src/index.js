module.exports = {
  
  screen: require("./devices/screen.js"),

  random: x => x,
  pause: x => x,

  sloan: require("./experiments/sloan.js"),
  landolt: require("./experiments/landolt.js"),
  vernier: require("./experiments/vernier.js"),
  auckland: require("./experiments/auckland.js"),

  quest: require("./staircase/quest.js"),

}