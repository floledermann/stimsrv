
const htmlButtons = require("../ui/htmlButtons.js");
const parameterController = require("../controller/parameterController.js");

const canvasRenderer = require("./canvasRenderer.js");
const renderSnellen = require("./renderSnellen.js");

module.exports = function(parameters, options) {
  
  parameters = Object.assign({
    backgroundColor: "#000000",
    foregroundColor: "#ffffff",
    angle: 0,
    size: "10mm",
    middleBar: true
  }, parameters);

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
    controller: parameterController(parameters, options)
  }


}