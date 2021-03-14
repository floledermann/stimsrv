
const htmlButtons = require("../ui/htmlButtons.js");
const parameterController = require("../controller/parameterController.js");
const random = require("../staircase/random.js");

const canvasRenderer = require("./canvasRenderer.js");
const tao = require("./renderAucklandOptotypes.js");

function renderTAO(ctx, condition) {
  if (condition.vanishing) {
    // fill with medium intensity color
    ctx.fillStyle = canvasRenderer.getColorValueForIntensity((condition.lowIntensity + condition.highIntensity) / 2, condition);
    ctx.fillRect(-ctx.canvas.width/2-1,-ctx.canvas.height/2-1,ctx.canvas.width+2,ctx.canvas.height+2);
    if (condition.vanishing == "BWB") {
      tao.strokeVanishing(condition.backgroundColor, condition.foregroundColor)(ctx, condition.shape, condition.size);
    }
    else {
      tao.strokeVanishing(condition.foregroundColor, condition.backgroundColor)(ctx, condition.shape, condition.size);
    }
  }
  else {
    tao.fill(ctx, condition.shape, condition.size);
  }
}

module.exports = function(parameters) {
  
  parameters = Object.assign({
    shape: random.pick(parameters?.shapes || tao.shapeNames),
    shapes: tao.shapeNames,
    size: "10mm",
    vanishing: false
  }, parameters);

  let options = {
    dimensions: ["size"]
  };
    
  let renderer = canvasRenderer(renderTAO, options);
  
  let buttonCanvas = htmlButtons.buttonCanvas(renderTAO, {size: "27arcmin", vanishing: false}, options);

  function firstCap(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return {
    name: "tao",
    description: "Auckland Optotypes visual acuity test", 
    interfaces: {
      display: renderer,
      response: htmlButtons(parameters.shapes.map(name => ({
        label: firstCap(name),
        canvas: buttonCanvas,
        response: {shape: name}
      }))),
      monitor: renderer,
      control: null,
    },
    controller: parameterController(parameters, options)
  }
}