
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
  
  condition.size = Dimension(condition.size, "px").toNumber("px");
  condition.length = Dimension(condition.length, "px").toNumber("px");
    
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
    fillColor: "rgb(155, 155, 155)",  // 1/3 intensity at 2.2 gamma
    pixelAlign: true
  }, parameters);

  options = Object.assign({
  }, options);
  
  
  let renderer = canvasRenderer(renderCenterline, options);
  
  return {
    name: "centerline",
    description: "Cased line with (optional) centerline", 
    interfaces: {
      display: renderer,
      response: htmlButtons([
        {label: "Centerline present", response: {centerLine: true}},
        {label: "Centerline NOT present", response: {centerLine: false}}
      ]),
      monitor: renderer,
      control: null,
    },
    controller: parameterController(parameters, options)
  }


}