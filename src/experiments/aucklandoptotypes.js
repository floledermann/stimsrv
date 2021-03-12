
const htmlButtons = require("../ui/htmlButtons.js");
const parameterController = require("../controller/parameterController.js");
const random = require("../staircase/random.js");

const canvasRenderer = require("./canvasRenderer.js");
const tao = require("./renderAucklandOptotypes.js");

function renderTAO(ctx, condition) {
  tao.fill(ctx, condition.shape, condition.size);
}

module.exports = function(parameters, options) {
  
  parameters = Object.assign({
    shape: random.pick(tao.shapeNames),
    size: "10mm",
  }, parameters);

  options = Object.assign({
    dimensions: ["size"]
  }, options);
    
  let renderer = canvasRenderer(renderTAO, options);
  
  let buttonCanvas = htmlButtons.buttonCanvas(renderTAO, {size: "27arcmin"}, options);

  function firstCap(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return {
    name: "tao",
    description: "Auckland Optotypes visual acuity test", 
    interfaces: {
      display: renderer,
      response: htmlButtons(tao.shapeNames.map(name => ({
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