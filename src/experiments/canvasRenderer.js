
const Dimension = require("another-dimension");
const d3 = require("d3-interpolate");

module.exports = function(renderFunc, options) {
  
  options = Object.assign({
    width: null,  // width in layout pixels, default: use parent width
    height: null,  // height in layout pixels, default: use parent height
    minimumIntensityColor: "#000000",
    maximumIntensityColor: "#ffffff",
    gamma: 2.2
  });
  
  let ctx = null;
  let width = null;
  let height = null;
  
  let colorInterpolator = d3.interpolateRgb.gamma(options.gamma)(options.minimumIntensityColor, options.maximumIntensityColor);
  
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
        contrastRatio: 1.0,           // maximum contrast based on minimumIntensityColor, maximumIntensityColor
        stimulusIntensityHigh: true,  // high intensity (bright) stimulus on low intensity background.
        rotate: 0
      }, condition);
      
      ctx.resetTransform();
      
      let foregroundColor;
      let backgroundColor;
      
      if (condition.stimulusIntensityHigh) {
        foregroundColor = colorInterpolator((condition.contrastRatio + 1) / 2);
        backgroundColor = colorInterpolator((1 - condition.contrastRatio) / 2);
      }
      else {
        foregroundColor = colorInterpolator((1 - condition.contrastRatio) / 2);
        backgroundColor = colorInterpolator((condition.contrastRatio + 1) / 2);
      }
      
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0,0,width,height);
      
      ctx.fillStyle = foregroundColor;
      ctx.strokeStyle = foregroundColor;
      
      ctx.translate(Math.round(width / 2), Math.round(height / 2));
      
      // introduce rotation to avoid aliasing
      if (condition.rotate) {
        ctx.rotate(condition.rotate/180*Math.PI);
      }
      
      renderFunc(ctx, condition);   

    }
  }
}