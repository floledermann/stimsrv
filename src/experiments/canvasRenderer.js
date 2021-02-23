
const Dimension = require("another-dimension");
module.exports = function(renderFunc, options) {
  
  options = Object.assign({
    width: null,  // width in layout pixels, default: use parent width
    height: null  // height in layout pixels, default: use parent height
  });
  
  let ctx = null;
  let width = null;
  let height = null;
  
  return {
    initialize: function(client, parent, document) {
      
      let canvas = document.createElement("canvas");
      let dppx = document.defaultView.devicePixelRatio || 1; // defaultView = window
      
      let pixelDensity = client.getPixelDensity();
      Dimension.configure({
        pixelDensity: pixelDensity
      });
      
      let widthpx = options.width || parent.clientWidth;
      let heightpx = options.height || parent.clientHeight;
      
      width = widthpx * dppx;
      height = heightpx * dppx;
      
      canvas.width = width;
      canvas.height = height;
      
      canvas.style.width = widthpx + "px";
      canvas.style.height = heightpx + "px";
      
      parent.appendChild(canvas);
      
      ctx = canvas.getContext('2d');
    },
    
    // contract: if render() returns a string or element, then replace the parent content
    render: function(condition) {
      condition = Object.assign({
        backgroundColor: "#000000",
        foregroundColor: "#ffffff",
      }, condition);
      
      ctx.resetTransform();
      ctx.fillStyle = condition.backgroundColor;
      ctx.fillRect(0,0,width,height);
      
      ctx.fillStyle = condition.foregroundColor;
      ctx.strokeStyle = condition.foregroundColor;
      
      ctx.translate(Math.round(width / 2), Math.round(height / 2));
      
      renderFunc(ctx, condition);   

    }
  }
}