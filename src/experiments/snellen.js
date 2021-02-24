
const htmlButtons = require("../ui/htmlButtons.js");
const parameterController = require("../controller/parameterController.js");

const canvasRenderer = require("./canvasRenderer.js");
const renderSnellen = require("./renderSnellen.js");

module.exports = function(parameters, options) {
  
  parameters = Object.assign({
    angle: 0,
    size: "10mm",
    middleBar: true,
    pixelAlign: true
  }, parameters);

  options = Object.assign({
  }, options);
  
  
  let renderer = canvasRenderer(renderSnellen, options);
  
  return {
    name: "snellen",
    description: "Snellen-E visual acuity test", 
    interfaces: {
      display: renderer,
      response: htmlButtons([
        {label: "Left", response: {angle: 180}},
        {label: "Up", response: {angle: 270}},
        {label: "Down", response: {angle: 90}},
        {label: "Right", response: {angle: 0}}
      ]),
      monitor: renderer,
      control: null,
    },
    controller: parameterController(parameters, options)
  }


}