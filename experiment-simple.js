
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

// this is a complete configuration
module.exports = {
  
  name: "Simple Test Experiment",
  
  devices: [
    {
      name: "Main PC",
      id: "main",
      ip: ".",
      platform: "browser", // browser-old, browser-nojs, pdf, png
      outputs: [
        "screen1",
        "screen2",
        "screen3",
        "audio"
      ],
      inputs: [
        "mouse",
        "keyboard"
      ]
    },
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
      role: "experiment",
      interfaces: ["display","response"],
      description: "Experiment screen for stimulus display and participant response"
    },
    {
      device: "main",
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
      angle: [0,90,180,270],
      size: [20,18,16,14,12,10]
    })
  ]
  
}