
const htmlButtons = require("../ui/htmlButtons.js");
const parameterController = require("../controller/parameterController.js");
const random = require("../controller/random.js");

const canvasRenderer = require("../stimulus/canvas/canvasRenderer.js");

const valOrFunc = require("../util/valOrFunc.js");
const pick = require("../util/pickProperties.js");

function renderTumblingE(ctx, condition) {
  
  condition = Object.assign({
    angle: 0,
    size: 10,
    middleBar: true,
    pixelAlign: true
    // foregroundColor/backgroundColor are handled by caller!
  }, condition);
  
/*
https://de.wikipedia.org/wiki/Snellen-Haken

  |------ size ------|
  
  +------------------+   -      -    
  |##################|   |    size/5 
  |###+--------------+   |      -    
  |###|                  |    size/5       
  |###+--------------+   |      -    
  |######## X #######|  size         
  |###+--------------+   |           
  |###|                  |           
  |###+--------------+   |           
  |##################|   |           
  +------------------+   -           
  
  |---|
  size/5
 
X ... Origin
*/
  
  let s = condition.size;
  let s2 = s/2;
  
  // If s/2 (upper-left corner) lands on a fractional pixel,
  // align with pixel grid if requested.
  // Do this before rotation to avoid a visible offset between the different angles.
  if (condition.pixelAlign && s2 != Math.floor(s2)) {
    let remainder = s2-Math.floor(s2);
    ctx.translate(remainder, remainder);
  }
  
  ctx.rotate(condition.angle / 180 * Math.PI);
    
  ctx.beginPath();
  ctx.moveTo(-s2,-s2);
  ctx.lineTo(s2,-s2);
  ctx.lineTo(s2,-s2+s/5);
  ctx.lineTo(-s2+s/5,-s2+s/5);
  
  if (condition.middleBar) {
    ctx.lineTo(-s2+s/5,-s/10);
    ctx.lineTo(s2,-s/10);
    ctx.lineTo(s2,s/10);
    ctx.lineTo(-s2+s/5,s/10);
  }
  
  ctx.lineTo(-s2+s/5,s2-s/5);
  ctx.lineTo(s2,s2-s/5);
  ctx.lineTo(s2,s2);
  ctx.lineTo(-s2,s2);
  ctx.closePath();
  
  ctx.fill();
 
}

const task = function(config) {
  
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
    
  let renderer = canvasRenderer(renderTumblingE, config);
  
  let buttonCanvas = canvasRenderer(renderTumblingE, {
    dimensions: ["size"],
    width: 60,
    height: 40,
    overrideCondition: config.responseCondition
  });

  return {
    
    name: "snellen",
    
    description: "Snellen-E visual acuity test", 
    
    frontend: function(context) {
      
      let interfaces = {};
      
      let responseButtons = htmlButtons([
        {label: "Left", subUI: buttonCanvas, className: "compass-w", response: {angle: 180}},
        {label: "Up", subUI: buttonCanvas, className: "compass-n", response: {angle: 270}},
        {label: "Down", subUI: buttonCanvas, className: "compass-s", response: {angle: 90}},
        {label: "Right", subUI: buttonCanvas, className: "compass-e", response: {angle: 0}}
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

task.render = renderTumblingE;

module.exports = task;