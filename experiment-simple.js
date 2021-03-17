
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

const snellen = require("./src/task/snellen.js");
const centerline = require("./src/task/centerline.js");
const bangbox = require("./src/task/bangbox.js");
const tao = require("./src/task/aucklandoptotypes.js");
const pause = require("./src/task/pause.js");

const filestorage = require("./src/storage/filestorage.js");

const staircase = require("./src/controller/staircase.js");
const random = require("./src/controller/random.js");
const sequence = require("./src/controller/sequence.js");

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
          pixeldensity: 86,
          viewingdistance: 600,
          gamma: 2.2
        },{
          id: "right",
          description: "Right external monitor",
          resolution: "hd",
          pixeldensity: 86,
          viewingdistance: 600,
          gamma: 2.2
        },{
          id: "main",
          description: "Laptop internal monitor",
          resolution: "hd",
          pixeldensity: 157,
          viewingdistance: 500,
          gamma: 2.2
      }],
      mouse: true,
      keyboard: true
    },
    {
      name: "Google Pixel 2",
      id: "pixel2",
      resolution: "hd",
      pixeldensity: 440,
      viewingdistance: 350,
      gamma: 1.6,
      touch: true
    },
    {
      name: "Sony Xperia Z5-P",
      id: "xperia",
      resolution: "uhd",
      pixeldensity: 801,
      viewingdistance: 350,
      gamma: 2.2,
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
  
  storage: filestorage({
    destination: "./data",
    format: "json"
  }),
  
  experiments: [
    tao({
      vanishing: true,
      size: //sequence(["5mm","3mm","1mm"]), 
        staircase({
          startValue: "5mm",
          stepSize: 1.2,
          stepType: "multiply",
          minReversals: 5,
          minTrials: 2
          //minValue: 
          //maxValue:
        })
    }),
  /*
    pause({
      buttondisplay: "control",
      displaymessage: "Waiting for the experiment to start...",
      monitormessage: "Press Start or hit any key to start the experiment.",
      buttonlabel: "Start"
    }),*/
    //bangbox(),
    /*
    centerline({
      centerLine: random.pick([true,false]),
      angle: random.range(0,360, {round: 1}),
      foregroundIntensityHigh: false,
      size: staircase({
        startValue: "2mm",
        stepSize: 1.2,
        stepType: "multiply",
        minReversals: 0, //5,
        minTrials: 2
        //minValue: 
        //maxValue:
      })
    }),*/
    snellen(
    {
      //rotate: random([-2,+2]), // add random rotation to prevent aliasing
      pixelAlign: false,
      lowIntensity: 0, //sequence.loop([0,0.25,0.5,0.75,0.9,0.95]),
      //highIntensity: 1.0,
      //contrastRatio: 1.05,
      foregroundIntensity: 0,
      backgroundIntensity: 1,
      //size: "3px",
      size: //sequence(["5mm","3mm","1mm"]), 
      staircase({
        startValue: "5mm",
        stepSize: 1.2,
        stepType: "multiply",
        minReversals: 0, //5,
        minTrials: 2
        //minValue: 
        //maxValue:
      })
    },
    {
      ambientIntensity: 0, //1/40,
    }),
    pause({
      buttondisplay: "control",
      displaymessage: "The experiment was completed successfully.\nThank you for your participation!",
      monitormessage: "Experiment ended.",
      buttonlabel: "Restart"
    })
    
  ]
  
}