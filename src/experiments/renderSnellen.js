
module.exports = function(ctx, condition, options) {
  
  condition = Object.assign({
    angle: 0,
    size: 10,
    middleBar: true
    // foregroundColor/backgroundColor are handled by caller!
  }, condition);
    
  ctx.rotate(condition.angle / 180 * Math.PI);
    
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