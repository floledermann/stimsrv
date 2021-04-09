
const htmlButtons = require("../ui/htmlButtons.js");
const parameterController = require("../controller/parameterController.js");
const random = require("../controller/random.js");

const canvasRenderer = require("../stimulus/canvas/canvasRenderer.js");
const renderSnellen = require("../stimulus/canvas/snellen.js");

module.exports = function(parameters, options) {
  
  parameters = Object.assign({
    angle: random.pick([0,90,180,270]),
    size: "10mm",
    middleBar: true,
    pixelAlign: true
  }, parameters);

  options = Object.assign({
    dimensions: ["size"]
  }, options);
    
  let renderer = canvasRenderer(renderSnellen, options);
  
  let buttonCanvas = htmlButtons.buttonCanvas(renderSnellen, {size: "27arcmin"}, options);

  return {
    name: "snellen",
    description: "Snellen-E visual acuity test", 
    ui: function(context) {
      return {
        interfaces: {
          display: renderer,
          response: htmlButtons([
            {label: "Left", canvas: buttonCanvas, response: {angle: 180}},
            {label: "Up", canvas: buttonCanvas, response: {angle: 270}},
            {label: "Down", canvas: buttonCanvas, response: {angle: 90}},
            {label: "Right", canvas: buttonCanvas, response: {angle: 0}}
          ]),
          monitor: renderer,
          control: null
        }
      }
    },
    controller: parameterController(parameters, null)
  }
}