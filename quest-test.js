
let quest = require("./src/staircase/quest.js");

quest.demo({
  actualThreshold: 1.0,
  estimatedThreshold: 2.2,
  estimateSd: 2.0,
  thresholdCriterion: 0.75,
  numTrials: 100
});