
const htmlButtons = require("../ui/htmlButtons.js");
const nextOnResponse = require("../controller/nextOnResponse.js");

const canvasRenderer = require("./canvasRenderer.js");
const renderSnellen = require("./renderSnellen.js");

module.exports = function(options) {
  
  options = Object.assign({
    
  }, options);
  
  let renderer = canvasRenderer(renderSnellen);
  
  return {
    name: "snellen",
    description: "Snellen-E visual acuity test", 
    interfaces: {
      display: renderer,
      response: htmlButtons(["Left","Up","Down","Right"]),
      monitor: renderer,
      control: null,
    },
    controller: nextOnResponse({
      // never advance for now
      filterResponse: l => false,
      nextCondition: () => ({angle: Math.floor(Math.random() * 4) * 90})
    })
  }


}