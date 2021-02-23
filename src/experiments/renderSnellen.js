
const Dimension = require("another-dimension");

module.exports = function(ctx, condition, options) {
  
  condition = Object.assign({
    angle: 0,
    size: 10,
    middleBar: true,
    pixelAlign: true
    // foregroundColor/backgroundColor are handled by caller!
  }, condition);
  
  condition.size = Dimension(condition.size, "px").toNumber("px");
    
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