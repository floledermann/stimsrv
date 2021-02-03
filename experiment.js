
/*

terms:
- environment
- configuration
- condition: level of an independent variable
- stimulus: actual stimulus
- experiment
- trial
- participant

use cases:
- mobile phone display
- paper printout
- Kindle PDF Output
*/

import lab from "./setup-lab.js";

import {sloan, landolt, auckland, vernier, random, quest} from "./src/index.js";

// this is a complete configuration
export default {
  
  name: "HR Display Experiment 1",
  
  devices: lab.devices,
  
  roles: lab.roles,
  
  // participant management etc.
  
  experiments: [
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
      size: quest({})
    }),
    auckland({
      duration: 500,
      stroke: "none",
      fill: "#000000",
      size: quest({})
    }),
    auckland({
      duration: 500,
      vanishing: true,
      size: quest({})
    }),
    vernier({
      size: 0,
      gap: 0
    })
  ]
  
}