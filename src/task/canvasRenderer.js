
const Dimension = require("another-dimension");
const d3 = require("d3-interpolate");

function clamp(value, min=0, max=1) {
  if (value < min) {
    client.warn("Clamping intensity value " + value.toFixed(3) + " to 1.");
    return min;
  }
  if (value > max) {
    client.warn("Clamping intensity value " + value.toFixed(3) + " to 1.");
    return max;
  }
  return value;
}
      
function getColorValueForIntensity(intensity, options) {
  
  let colorInterpolator = d3.interpolateRgb.gamma(options.gamma || 1.0)(options.minimumIntensityColor || "#000000", options.maximumIntensityColor || "#ffffff");
  
  let realIntensity = options.lowIntensity + intensity * (options.highIntensity - options.lowIntensity); 
  
  realIntensity = clamp(realIntensity);
  
  let colorValue = colorInterpolator(realIntensity);
  
  console.log("FG: " + realIntensity.toFixed(3) + " -> " + colorValue);
  
  return colorValue;
}
    
function canvasRenderer(renderFunc, options) {
  
  options = Object.assign({
    width: null,  // width in layout pixels, default: use parent width
    height: null,  // height in layout pixels, default: use parent height
    minimumIntensityColor: "#000000",
    maximumIntensityColor: "#ffffff",
    ambientIntensity: 1/100,  // TODO: should this go into "viewing conditions" setting? Or combination of viewing conditions and display (reflectance) properties?
    dimensions: []
  }, options);
  
  let ctx = null;
  let width = null;
  let height = null;
  
  let client = null;
  
  let colorInterpolator = null;
  
  let lastCondition = null;
  
  return {
    initialize: function(_client, parent) {
      
      client = _client;
      
      let document = parent.ownerDocument;
      
      let canvas = document.createElement("canvas");
      let dppx = document.defaultView.devicePixelRatio || 1; // defaultView = window
      
      let pixelDensity = client.getPixelDensity();
      Dimension.configure({
        pixelDensity: pixelDensity,
        viewingDistance: client.getViewingDistance()
      });
      
      let gamma = client.getGamma();
      colorInterpolator = d3.interpolateRgb.gamma(gamma)(options.minimumIntensityColor, options.maximumIntensityColor);
      
      function resize(widthpx, heightpx) {
        
        // make dimensions even, so that half transform is full pixel
        
        widthpx = Math.round(widthpx/2 + 0.5) * 2;
        heightpx = Math.round(heightpx/2 + 0.5) * 2;
        
        width = widthpx * dppx;
        height = heightpx * dppx;
        
        canvas.width = width;      
        canvas.height = height;
        
        canvas.style.width = widthpx + "px";
        canvas.style.height = heightpx + "px";
      }
      
      resize(options.width || parent.clientWidth, options.height || parent.clientHeight);
      
      parent.appendChild(canvas);
      
      ctx = canvas.getContext('2d');
      
      // TODO: dynmaically resize if parent resizes, but how to re-render?
      let observer = new ResizeObserver((entries) => {
        //let entry = entries.find((entry) => entry.target === parent);
        resize(options.width || parent.clientWidth, options.height || parent.clientHeight)
        if (lastCondition) {
          this.render(lastCondition);
        }
      });
      observer.observe(parent);
    },
    
    // contract: if render() returns a string or element, then replace the parent content
    render: function(condition) {
      
      lastCondition = condition;
      
      condition = Object.assign({
        lowIntensity: 0,
        // highIntensity: 1.0,
        // contrastRatio: 2.0,           // maximum contrast based on minimumIntensityColor, maximumIntensityColor
        foregroundIntensity: 1.0,  // high intensity (bright) stimulus on low intensity background.
        backgroundIntensity: 0.0,
        rotate: 0
      }, condition);
      
      // convert dimensions into pixels
      for (let key of options.dimensions) {
        let cond = condition[key];
        if (Array.isArray(cond)) {
          condition[key] = cond.map(c => Dimension(c, "px").toNumber("px"));
        }
        else {
          condition[key] = Dimension(cond, "px").toNumber("px");  
        }
      }
      
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
      if (!condition.foregroundColor) {
        condition.foregroundColor = getColorValueForIntensity(condition.foregroundIntensity, condition);
      }

      if (!condition.backgroundColor) {
        condition.backgroundColor = getColorValueForIntensity(condition.backgroundIntensity, condition);
      }
      
      ctx.resetTransform();
      
      ctx.fillStyle = condition.backgroundColor;
      ctx.fillRect(0,0,width,height);
      
      ctx.fillStyle = condition.foregroundColor;
      ctx.strokeStyle = condition.foregroundColor;
      
      // move origin to center
      ctx.translate(Math.round(width / 2), Math.round(height / 2));
      
      // affine transform
      if (condition.rotate) {
        ctx.rotate(condition.rotate/180*Math.PI);
      }
      if (condition.translate) {
        let trans = condition.translate;
        if (!Array.isArray(condition.translate)) {
          trans = [trans, trans];
        }
        ctx.translate(trans[0], trans[1]);
      }
      
      renderFunc(ctx, condition);   

    }
  }
}

canvasRenderer.getColorValueForIntensity = getColorValueForIntensity;

module.exports = canvasRenderer;