
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

const {landolt, pause} = require("./src/index.js");

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
    }
  ],  
  // participant management etc.
  
  experiments: [
    pause({
      controller: "control",
      controlmessage: "Press Start or hit any key to start the experiment.",
      displaymessage: "Waiting for the experiment to start...",
      buttonlabel: "Start"
    }),
    landolt({
      size: ";10arcmin-2arcmin:*0.8",
      orientation: "0,90,180,270"
    })
  ]
  
}