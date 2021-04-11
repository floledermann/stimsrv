
const Dimension = require("another-dimension");

const htmlButtons = require("../ui/htmlButtons.js");
const parameterController = require("../controller/parameterController.js");
const random = require("../controller/random.js");

const canvasRenderer = require("../stimulus/canvas/canvasRenderer.js");
const sloan = require("../stimulus/canvas/sloan.js");

function renderSloan(ctx, condition) {
  sloan.fill(ctx, condition.letter, condition.size);
}

function sloanTask(config) {
  
  config = Object.assign({
    letter: random.pick(config?.shapes || sloan.letters),
    letters: sloan.letters,
    size: "10mm"
  }, config);
  
  let nextContext = config.nextContext;
  
  delete config.nextContext;
  
  let options = {
    dimensions: ["size"]
  };
    
  let renderer = canvasRenderer(renderSloan, options);
  
  let buttonOverrides = {size: "27arcmin"};
  
  return {
    name: "sloan",
    description: "Sloan letters visual acuity test", 
    ui: function(context) {
      return {
        interfaces: {
          display: renderer,
          response: htmlButtons(c => c.letters.map(l => ({
            label: l,
            response: {letter: l}
          }))),
          monitor: renderer,
          control: null
        }
      }
    },
    controller: parameterController({
      parameters: config, 
      nextContext: (context, trials) => {
        return nextContext ? {
          context: Object.assign(context, nextContext(trials))
        } : null;
      }
    })
  }
}

sloanTask.logMAR = function(trials, viewingdistance, pixeldensity) {
  let maxIncorrectSize = 0;
  let minCorrectSize = Infinity;
  for (let trial of trials) {
    // incorrect response
    if (trial.condition.letter != trial.response.letter) {
      let size = Dimension(trial.condition.size);
      if (size > maxIncorrectSize) {
        maxIncorrectSize = size;
      }
    }
  }
  
  for (let trial of trials) {
    // correct response
    if (trial.condition.letter == trial.response.letter) {
      let size = Dimension(trial.condition.size);
      if (size > maxIncorrectSize && size < minCorrectSize) {
        minCorrectSize = size;
      }
    }
  }
  
  if (minCorrectSize < Infinity) {
    if (!["arcmin","arcsec","deg"].includes(minCorrectSize.unit)) {
      if (minCorrectSize.unit == "px" && !pixeldensity) {
        console.warn("logMAR: Stimulus size is specified in pixels but pixel density not specified!");
      }
      else {
        Dimension.configure({
          pixelDensity: pixeldensity
        });
      }
      if (!viewingdistance) {
        console.warn("logMAR: Stimulus size is specified in " + minCorrectSize.unit + " but viewing distance not specified - use angular units (arcmin, arcsec) to specifiy stimulus size or specify viewing distance for logMAR calculation.");
      }
      else {
        Dimension.configure({
          viewingDistance: viewingdistance
        });
      }
    }
    let detail = Dimension(minCorrectSize / 5, minCorrectSize.unit).toDimension("arcmin");
    return Math.log10(detail).toFixed(2);
  }
  
  return null;
}

module.exports = sloanTask;