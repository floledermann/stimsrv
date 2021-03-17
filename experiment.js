
/*

terms:
- environment
- configuration
- condition: level of an independent variable
- stimulus: actual stimulus
- experiment
- task
- trial
- participant

use cases:
- mobile phone display
- paper printout
- Kindle PDF Output
*/

const lab = require("./setup-lab.js");

const {sloan, landolt, auckland, vernier, random, staircase, pause} = require("./src/index.js");

// this is a complete configuration
module.exports = {
  
  name: "HR Display Experiment 1",
  
  devices: lab.devices,
  
  roles: lab.roles,
  
  // participant management etc.
  
  experiments: [
    pause({
      controller: "control",
      controlmessage: "Press Start or hit any key to start the experiment.",
      displaymessage: "Waiting for the experiment to start...",
      buttonlabel: "Start"
    }),
    sloan({
      size: ";10arcmin-2arcmin:*0.8",
      letter: random(5),
      exit: results => { if (!results) return true; }
    }),
    landolt({
      size: ";10arcmin-2arcmin:*0.8",
      orientation: random("0,90,180,270", 6)
    }),
    auckland({
      duration: 500,
      size: staircase.quest({})
    }),
    auckland({
      duration: 500,
      stroke: "none",
      fill: "#000000",
      size: staircase.quest({})
    }),
    auckland({
      duration: 500,
      vanishing: true,
      size: staircase.quest({})
    }),
    vernier({
      size: 0,
      gap: 0
    })
  ]
  
}