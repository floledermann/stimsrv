
const htmlButtons = require("../ui/htmlButtons.js");
const parameterController = require("../controller/parameterController.js");
const random = require("../controller/random.js");

const canvasRenderer = require("../stimulus/canvas/canvasRenderer.js");
const renderSnellen = require("../stimulus/canvas/snellen.js");

const valOrFunc = require("../util/valOrFunc.js");
const pick = require("../util/pickProperties.js");

module.exports = function(config) {
  
  config = Object.assign({
    angle: random.pick([0,90,180,270]),
    size: "10mm",
    middleBar: true,
    pixelAlign: true,
    stimulusDisplay: "display", // TODO: these three should be a common pattern handled by a helper class
    responseDisplay: "response",
    monitorDisplay: "monitor",
    dimensions: ["size"],
    responseCondition: {size: "27arcmin"}
  }, config);

  let parameters = pick.without(config, ["stimulusDisplay","responseDisplay","monitorDisplay","dimensions","responseCondition"]);
    
  let renderer = canvasRenderer(renderSnellen, config);
  
  let buttonCanvas = htmlButtons.buttonCanvas(renderSnellen, config.responseCondition, config);

  return {
    
    name: "snellen",
    
    description: "Snellen-E visual acuity test", 
    
    frontend: function(context) {
      
      let interfaces = {};
      
      let responseButtons = htmlButtons([
        {label: "Left", canvas: buttonCanvas, className: "compass-w", response: {angle: 180}},
        {label: "Up", canvas: buttonCanvas, className: "compass-n", response: {angle: 270}},
        {label: "Down", canvas: buttonCanvas, className: "compass-s", response: {angle: 90}},
        {label: "Right", canvas: buttonCanvas, className: "compass-e", response: {angle: 0}}
      ],{
        wrapperClass: "buttons compass"
      });
      
      for (let ui of valOrFunc.array(config.stimulusDisplay, context)) {
        interfaces[ui] = renderer;
      }
      
      for (let ui of valOrFunc.array(config.responseDisplay, context)) {
        interfaces[ui] = responseButtons;
      }
      
      for (let ui of valOrFunc.array(config.monitorDisplay, context)) {
        interfaces[ui] = renderer;
      }
      
      return {
        interfaces: interfaces
      }
    },
    controller: parameterController({parameters: parameters})
  }
}