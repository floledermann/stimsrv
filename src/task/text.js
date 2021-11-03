
const simpleTask = require("stimsrv/task/simpleTask");
const htmlButtons = require("stimsrv/ui/htmlButtons");
const canvasRenderer = require("stimsrv/stimulus/canvas/canvasRenderer");


const RENDER_DEFAULTS = {
  
  text: "<no text defined>",
  fontFamily: "Arial",
  fontStyle: "normal",
  fontVariant: "normal",
  fontWeight: "normal",
  fontSize: 12,
  // not supported by node-canvas
  // fontStretch: "normal",
  // lineHeight: 1.5,
  angle: 0,
  outline: false,
  outlineWidth: 0.25, // relative to fontSize
  outline2: false,
  outline2Width: 0.02, // relative to fontSize
  
  // provided by canvasRenderer:
  // rotate
  // translate
  
};

const DEFAULTS = { 

  ...RENDER_DEFAULTS, 
  
  name: "text",
  description: "Generic Text Task",
    
  // condition
  choices: ["Continue"],
  fontSize: "4mm",
  backgroundIntensity: 1.0,
  foregroundIntensity: 0.0,
  outlineIntensity: 0.5,
  outline2Intensity: 0.0,
  
  // interfaces
  // fonts
  // css
  
};

  
function renderText(ctx, condition) {
  
  condition = Object.assign({}, RENDER_DEFAULTS, condition);
  
  console.log("Rendering: ", condition);
  //console.trace();
  
  ctx.rotate(condition.angle / 180 * Math.PI);
   
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  let c = condition;
  
  // use only properties supported by node-canvas
  // see https://github.com/Automattic/node-canvas/wiki/Compatibility-Status#text-styles
  // (currently, line-height and font-stretch are omitted)
  //ctx.font = `${c.fontStyle} ${c.fontVariant} ${c.fontWeight} ${c.fontSize}px/${c.lineHeight} ${c.fontStretch} ${c.fontFamily}`;
  ctx.font = `${c.fontStyle} ${c.fontVariant} ${c.fontWeight} ${c.fontSize}px ${c.fontFamily}`;
  //console.log("Font: " + ctx.font);
  
  if (condition.outline && condition.outlineWidth > 0) {
    //console.log(condition.outlineWidth * condition.fontSize);
    //console.log(condition.outlineIntensity);
    ctx.save();
    ctx.strokeStyle = condition.outlineIntensity;
    ctx.lineWidth = condition.outlineWidth * condition.fontSize;
    ctx.lineJoin = "round";
    ctx.strokeText(c.text, 0, 0);
    ctx.restore();
  }
  
  if (condition.outline2 && condition.outline2Width > 0) {
    //console.log(condition.outline2Width * condition.fontSize);
    //console.log(condition.outline2Intensity);
    ctx.save();
    ctx.strokeStyle = condition.outline2Intensity;
    ctx.lineWidth = condition.outline2Width * condition.fontSize;
    ctx.lineJoin = "round";
    ctx.strokeText(c.text, 0, 0);
    ctx.restore();
  }
  
  ctx.fillText(c.text, 0, 0);
 
}

let defaults = DEFAULTS;

let renderer = config => canvasRenderer(renderText, {
  dimensions: ["fontSize"],
  intensities: ["outlineIntensity","outline2Intensity"],
  fonts: config.fonts         // fonts to load - can be specified with the "fonts" property upon task initialization
});

let buttons = config => htmlButtons({
  buttons: condition => condition.choices.map(
    choice => ({
      label: choice,
      response: {text: choice} 
    })
  ),
  // CSS can be passed to the buttons with the "css" property upon task initialization
  // TODO: "css" should be a first-level member of the task frontend object, not added to individual UIs like now.
  css: config.css
});

/*
The actual task definition, using the simpleTask helper to tie everything together.
*/
let task = simpleTask({
  defaults: DEFAULTS,
  // The interfaces the task provides.
  // These can be remapped by the user with the "<interfaceName>Interface" configuration properties.
  interfaces: {
    display: renderer,
    monitor: renderer,
    response: buttons,
  },
  // Resources to load
  resources: config => config.fonts
});


task.render = renderText;


module.exports = task;
