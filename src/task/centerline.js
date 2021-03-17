
const Dimension = require("another-dimension");

const htmlButtons = require("../ui/htmlButtons.js");
const parameterController = require("../controller/parameterController.js");

const canvasRenderer = require("./canvasRenderer.js");

function renderCenterline(ctx, condition) {
{
  
  condition = Object.assign({
    angle: 0,
    size: 10,
    length: 100,
    centerLine: true,
    fillGapIfNoLine: true, // fill gap with 1/3 intensity if no center line is present
    fillColor: "rgb(155, 155, 155)",  // 1/3 intensity at 2.2 gamma
    pixelAlign: true
    // foregroundColor/backgroundColor are handled by caller!
  }, condition);
  
/*
  
  +--------------------------+   -      -    
  |##########################|   |    size/5 
  +--------------------------+   |      -    
                                 |    size/5       
  +--------------------------+   |      -    
  |############ X ###########|  size  size/5  (if centerLine == true)     
  +--------------------------+   |      -
                                 |           
  +--------------------------+   |
  |##########################|   |           
  +--------------------------+   -           
  
  |--------------------------|
              length
 
X ... Origin
*/
  
  let s = condition.size;
  let l = condition.length;
  let s2 = s/2;
  let l2 = l/2;
  
  // If s/2 (upper-left corner) lands on a fractional pixel,
  // align with pixel grid if requested.
  // Do this before rotation to avoid a visible offset between the different angles.
  if (condition.pixelAlign && s2 != Math.floor(s2)) {
    let remainder = s2-Math.floor(s2);
    ctx.translate(remainder, remainder);
  }
  
  ctx.rotate(condition.angle / 180 * Math.PI);
  
  if (!condition.centerLine && condition.fillGapIfNoLine) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-l2,-3*s/10);
    ctx.lineTo(l2,-3*s/10);
    ctx.lineTo(l2,3*s/10);
    ctx.lineTo(-l2,3*s/10);
    ctx.closePath();
    ctx.fillStyle = condition.fillColor;
    ctx.fill();
    ctx.restore();
  }
    
  ctx.beginPath();
  ctx.moveTo(-l2,-s2);
  ctx.lineTo(l2,-s2);
  ctx.lineTo(l2,-s2+s/5);
  ctx.lineTo(-l2,-s2+s/5);
  ctx.closePath();
  ctx.fill();
  
  if (condition.centerLine) {
    ctx.beginPath();
    ctx.moveTo(-l2,-s/10);
    ctx.lineTo(l2,-s/10);
    ctx.lineTo(l2,s/10);
    ctx.lineTo(-l2,s/10);
    ctx.closePath();
    ctx.fill();
  }
  
  ctx.beginPath();
  ctx.moveTo(-l2,s2-s/5);
  ctx.lineTo(l2,s2-s/5);
  ctx.lineTo(l2,s2);
  ctx.lineTo(-l2,s2);
  ctx.closePath();
  
  ctx.fill();
 
}}

module.exports = function(parameters, options) {
  
  parameters = Object.assign({
    angle: 0,
    size: "5mm",
    length: "30mm",
    centerLine: true,
    fillGapIfNoLine: true, // fill gap with 1/3 intensity if no center line is present
    fillColor: "rgb(127, 127, 127)",  // gaussian blur on actual image, also midpoint @ 1.0gamma
    //fillColor: "rgb(127, 127, 127)",  // gaussian blur on actual image, also midpoint @ 1.0gamma
    //fillColor: "rgb(85, 85, 85)",  // 1/3 intensity at 1.0 gamma
    //fillColor: "rgb(155, 155, 155)",  // 1/3 intensity at 2.2 gamma
    //fillColor: "rgb(212, 212, 212)", // 2/3 @ 2.2gamma
    //fillColor: "rgb(202, 202, 202)", // 3/5 @ 2.2gamma
    //fillColor: "rgb(168, 168, 168)", // 2/5 @ 2.2gamma
    pixelAlign: true,
    foregroundIntensityHigh: true
  }, parameters);

  options = Object.assign({
    dimensions: ["size","length"]
  }, options);
  
  let buttonParameters = {size: "25arcmin", angle: 0, length: "75arcmin"};
  let buttonCanvas = htmlButtons.buttonCanvas(renderCenterline, buttonParameters, options);

  let renderer = canvasRenderer(renderCenterline, options);
  
  return {
    name: "centerline",
    description: "Cased line with (optional) centerline", 
    interfaces: {
      display: renderer,
      response: htmlButtons([
        {label: "Centerline", canvas: buttonCanvas, response: {centerLine: true}},
        {label: "No&nbsp;Centerline", canvas: buttonCanvas, response: {centerLine: false}}
      ]),
      monitor: renderer,
      control: null,
    },
    controller: parameterController(parameters, options)
  }
}