
const valOrFunc = require("../util/valOrFunc.js");
const htmlButtons = require("../ui/htmlButtons.js");
const parameterController = require("../controller/parameterController.js");
const random = require("../controller/random.js");
const pick = require("../util/pickProperties.js");

const canvasRenderer = require("../stimulus/canvas/canvasRenderer.js");
const tao = require("../stimulus/canvas/aucklandoptotypes.js");

function renderTAO(ctx, condition) {
  if (condition.vanishing) {
    // fill with medium intensity color
    ctx.fillStyle = canvasRenderer.getColorValueForIntensity((condition.lowIntensity + condition.highIntensity) / 2, condition);
    ctx.fillRect(-ctx.canvas.width/2-1,-ctx.canvas.height/2-1,ctx.canvas.width+2,ctx.canvas.height+2);
    if (condition.vanishing == "BWB") {
      tao.strokeVanishing(condition.backgroundIntensity, condition.foregroundIntensity)(ctx, condition.shape, condition.size);
    }
    else {
      tao.strokeVanishing(condition.foregroundIntensity, condition.backgroundIntensity)(ctx, condition.shape, condition.size);
    }
  }
  else {
    tao.fill(ctx, condition.shape, condition.size);
  }
}

module.exports = function(config) {
  
  config = Object.assign({
    
    shape: random.pick(config?.shapes || tao.shapeNames),
    shapes: tao.shapeNames,
    size: "10mm",
    vanishing: false,
    
    stimulusDisplay: "display", // TODO: these three should be a common pattern handled by a helper class
    responseDisplay: "response",
    monitorDisplay: "monitor",

  }, config);

  let options = {
    dimensions: ["size"]
  };
  
  let parameters = pick.without(config, ["stimulusDisplay","responseDisplay","monitorDisplay"]);
    
  let renderer = canvasRenderer(renderTAO, options);
  
  let buttonOverrides = {size: "27arcmin", vanishing: false};
  if (parameters.vanishing) {
    Object.assign(buttonOverrides, {
      backgroundIntensity: 1,
      foregroundIntensity: 0
    });
    
  }
  let buttonCanvas = htmlButtons.buttonCanvas(renderTAO, buttonOverrides, options);

  function firstCap(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  let responseButtons = htmlButtons(parameters.shapes.map(name => ({
      label: firstCap(name),
      canvas: buttonCanvas,
      response: {shape: name}
  })));

  return {
    name: "tao",
    description: "Auckland Optotypes visual acuity test", 
    ui: function(context) {

      let interfaces = {};
      
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
      };
    
    },
    controller: parameterController({ parameters: parameters })
  }
}