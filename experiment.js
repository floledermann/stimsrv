
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

let lab = import("./setup-lab.js");

// this is a complete configuration
{
  devices: lab.devices,
  
  roles: lab.roles,
  
  // participant management etc.
  
  experiments: [
    sloan({
      size: ";10arcmin-2arcmin:*0.8",
      letter: random(5),
      exit: results => { if !results return true; }
    }),
    landolt({
      size: ";10arcmin-2arcmin:*0.8"
      orientation: random("0,90,180,270", 6)
    }),
    auckland({
      duration: 500,
      size: staircase.quest({ ... })
    },
    auckland({
      duration: 500,
      stroke: "none",
      fill: "#000000",
      size: staircase.quest({ ... })
    },
    auckland({
      duration: 500,
      vanishing: true,
      size: staircase.quest({ ... })
    },
    vernier({
      orientation:
      size:
    })
  ]
  
}