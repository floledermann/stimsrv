
const Dimension = require("another-dimension");
const d3 = require("d3-interpolate");

module.exports = function(renderFunc, options) {
  
  options = Object.assign({
    width: null,  // width in layout pixels, default: use parent width
    height: null,  // height in layout pixels, default: use parent height
    minimumIntensityColor: "#000000",
    maximumIntensityColor: "#ffffff",
    ambientIntensity: 1/100  // TODO: should this go into "viewing conditions" setting? Or combination of viewing conditions and display (reflectance) properties?
  }, options);
  
  let ctx = null;
  let width = null;
  let height = null;
  
  let client = null;
  
  let colorInterpolator = null;
  
  return {
    initialize: function(_client, parent, document) {
      
      client = _client;
      
      let canvas = document.createElement("canvas");
      let dppx = document.defaultView.devicePixelRatio || 1; // defaultView = window
      
      let pixelDensity = client.getPixelDensity();
      Dimension.configure({
        pixelDensity: pixelDensity
      });
      
      colorInterpolator = d3.interpolateRgb.gamma(client.getGamma())(options.minimumIntensityColor, options.maximumIntensityColor);
      
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
        lowIntensity: 0,
        // highIntensity: 1.0,
        // contrastRatio: 2.0,           // maximum contrast based on minimumIntensityColor, maximumIntensityColor
        foregroundIntensityHigh: true,  // high intensity (bright) stimulus on low intensity background.
        rotate: 0
      }, condition);
            
      let foregroundIntensity;
      let backgroundIntensity;
      
     // default case, use maximum intensity as high intensity
      if ((!condition.highIntensity) && (!condition.contrastRatio)) {
        condition.highIntensity = 1.0;
      }
      
      if (condition.contrastRatio) {
        if (condition.highIntensity) {
          client.warn("Both highIntensity and contrastRatio specified - omitting contrastRatio.");
        }
        else {
          let realLowIntensity = condition.lowIntensity + options.ambientIntensity * (1-condition.lowIntensity);
          let realHighIntensity = realLowIntensity * condition.contrastRatio;
          condition.highIntensity = (realHighIntensity - options.ambientIntensity) / (1 - options.ambientIntensity);
        }
      }
      /*
      if (condition.contrastRatio / 2 > condition.centerIntensity) {
        client.warn("Contrast ratio " + condition.contrastRatio + " exceeds valid range for center intensity " + condition.centerIntensity + " - clipping will occur!");
      }
      */
      if (condition.foregroundIntensityHigh) {
        foregroundIntensity = condition.highIntensity; //condition.contrastRatio / 2 + condition.centerIntensity - 0.5;
        backgroundIntensity = condition.lowIntensity; //(1 - condition.contrastRatio) / 2 + condition.centerIntensity - 0.5;
      }
      else {
        foregroundIntensity = condition.lowIntensity; //(1 - condition.contrastRatio) / 2 + condition.centerIntensity - 0.5;
        backgroundIntensity = condition.highIntensity; //condition.contrastRatio / 2 + condition.centerIntensity - 0.5;
      }
      
      function clamp(value) {
        if (value < 0) {
          client.warn("Clamping intensity value " + value.toFixed(3) + " to 0.");
          return 0;
        }
        if (value > 1) {
          client.warn("Clamping intensity value " + value.toFixed(3) + " to 1.");
          return 1;
        }
        return value;
      }
      
      foregroundIntensity = clamp(foregroundIntensity);
      backgroundIntensity = clamp(backgroundIntensity);
      
      let foregroundColor = colorInterpolator(foregroundIntensity);
      let backgroundColor = colorInterpolator(backgroundIntensity);

      console.log("FG: " + foregroundIntensity.toFixed(3) + " -> " + foregroundColor);
      console.log("BG: " + backgroundIntensity.toFixed(3) + " -> " + backgroundColor);
           
      ctx.resetTransform();
      
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