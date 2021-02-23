
/*

terms:
- environment
- configuration
- condition: level of an independent variable / "step" in an experiment
- stimulus: actual stimulus
- experiment
- trial
- participant

use cases:
- mobile phone display
- paper printout
- Kindle PDF Output
*/

const snellen = require("./src/experiments/snellen.js");
const bangbox = require("./src/experiments/bangbox.js");
const pause = require("./src/experiments/pause.js");

const staircase = require("./src/staircase/staircase.js");
const random = require("./src/staircase/random.js");

// this is a complete configuration
module.exports = {
  
  name: "Simple Test Experiment",
    
  devices: [
    {
      name: "Main PC",
      id: "main",
      ip: ".",
      platform: "browser", // browser-old, browser-nojs, pdf, png
      screens: [{
          id: "left",
          description: "Left external monitor",
          resolution: "hd",
          pixeldensity: 80
        },{
          id: "right",
          description: "Right external monitor",
          resolution: "hd",
          pixeldensity: 80
        },{
          id: "main",
          description: "Laptop internal monitor",
          resolution: "hd",
          pixeldensity: 120
      }],
      mouse: true,
      keyboard: true
    },
    {
      name: "Google Pixel 2",
      id: "pixel2",
      resolution: "hd",
      pixeldensity: 440,
      touch: true
    },
    {
      name: "Sony Xperia Z5-P",
      id: "xperia",
      resolution: "uhd",
      pixeldensity: 801,
      touch: false  // viewing only
    }
  ],
  
  roles: [
    {
      device: "main",
      role: "supervisor",
      interfaces: ["monitor", "control"],
      description: "Supervisor screen and experiment control"
    },
    {
      device: "main",
      screen: "left",
      role: "experiment",
      interfaces: ["display","response"],
      description: "Experiment screen for stimulus display and participant response"
    },
    {
      device: "main",
      screen: "left",
      role: "experiment-debug",
      interfaces: ["display","response","debug"],
      description: "Experiment screen with debugging output"
    },
    {
      device: "pixel2",
      role: "experiment",
      interfaces: ["display","response"],
      description: "Experiment screen for stimulus display and participant response"
    },
    {
      device: "xperia",
      role: "experiment-display",
      interfaces: ["display"],
      description: "Experiment screen for stimulus display."
    },
  ],  
  // participant management etc.
  
  experiments: [
    pause({
      buttondisplay: "control",
      displaymessage: "Waiting for the experiment to start...",
      monitormessage: "Press Start or hit any key to start the experiment.",
      buttonlabel: "Start"
    }),
    //bangbox(),
    snellen({
      angle: random([0,90,180,270]),
      pixelAlign: true,
      size: staircase({
        startValue: "5mm",
        stepSize: 1.2,
        stepType: "multiply",
        minReversals: 3,
        //minValue: 
        //maxValue:
      })
    }),
    pause({
      buttondisplay: "control",
      displaymessage: "The experiment was completed successfully.\nThank you for your participation!",
      monitormessage: "Experiment ended.",
      buttonlabel: "Restart"
    })
    
  ]
  
}