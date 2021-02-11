
const htmlButtons = require("../ui/htmlButtons.js");
const permutateParameters = require("../controller/permutateParameters.js");

const canvasRenderer = require("./canvasRenderer.js");
const renderSnellen = require("./renderSnellen.js");

module.exports = function(parameters, options) {
  
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
    controller: permutateParameters(parameters, options)
  }


}