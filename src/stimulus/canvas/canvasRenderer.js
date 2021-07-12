
const Dimension = require("another-dimension");
const d3 = require("d3-interpolate");

const resource = require("stimsrv/util/resource");
const valOrFunc = require("stimsrv/util/valOrFunc");

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
  
  let colorInterpolator = d3.interpolateRgb;
  
  // don't use gamma for extremes (to avoid unneccessary warnings)
  if (intensity > 0 && intensity < 1) {
    let gamma = options.useGamma ? options.gamma || 1.0 : 1.0;
    colorInterpolator = colorInterpolator.gamma(gamma);
  }
  
  colorInterpolator = colorInterpolator(options.minimumIntensityColor || "#000000", options.maximumIntensityColor || "#ffffff");
  
  let realIntensity = options.lowIntensity + intensity * (options.highIntensity - options.lowIntensity); 
  
  realIntensity = clamp(realIntensity);
  
  let colorValue = colorInterpolator(realIntensity);
  
  //console.log("FG: " + realIntensity.toFixed(3) + " -> " + colorValue);
  
  return colorValue;
}
    
function canvasRenderer(renderFunc, options, context) {
  
  options = Object.assign({
    width: null,  // width in layout pixels, default: use parent width
    height: null,  // height in layout pixels, default: use parent height
    dimensions: [],   // "translate" is always added
    defaultDimensions: ["translate"],
    intensities: [],  // "foregroundIntensity", "backgroundIntensity" are always added (see below)
    defaultIntensities: ["foregroundIntensity","backgroundIntensity"],

    fonts: [],
  }, options);
  
  display = displayConfig(Object.assign({}, options, {
    warnDefaults: options.warn
  })(context);
  
  options.intensities = options.intensities.concat(options.defaultIntensities);
  options.dimensions = options.dimensions.concat(options.defaultDimensions);
  
  let ctx2d = null;
  
  let runtime = null;
  
  let lastCondition = null;
  
  let dppx = 1;
  let width = 0, height = 0;
  
  let resourcesPromise = null;
  
  return {
    initialize: function(parent, _runtime, context) {
      
      runtime = _runtime;
      lastCondition = null;
      
      let document = parent.ownerDocument;
      
      let canvas = document.createElement("canvas");
      dppx = document.defaultView.devicePixelRatio || 1; // defaultView = window
      
      Dimension.configure({
        pixelDensity: propOrFunc.ignoreCase(config.pixelDensity, context),
        viewingDistance: propOrFunc.ignoreCase(config.viewingDistance, context)
      });
            
      function resize(widthpx, heightpx) {
        
        width = widthpx;
        height = heightpx;
                
        // make dimensions even, so that half transform is full pixel
        
        widthpx = Math.floor(widthpx/2 + 0.5) * 2;
        heightpx = Math.floor(heightpx/2 + 0.5) * 2;
        
        canvas.width = widthpx * dppx;      
        canvas.height = heightpx * dppx;
        
        canvas.style.width = widthpx + "px";
        canvas.style.height = heightpx + "px";

      }
      
      resize(options.width || parent.clientWidth, options.height || parent.clientHeight);
      
      //console.log("INIT", parent.clientWidth, parent.clientHeight);
         
      if (options.fonts) {
        resourcesPromise = Promise.all(options.fonts.map(font => {
          let fontFace = new FontFace(font.family, "url(" + resource.url(font.resource) + ")");
          return fontFace.load().then(() => {
            document.fonts.add(fontFace);
          });
        }));
      }
      
      parent.appendChild(canvas);
      
      ctx2d = canvas.getContext('2d');
      
      let observer = new ResizeObserver((entries) => {
        //let entry = entries.find((entry) => entry.target === parent);
        //console.log("RESIZE", parent.clientWidth, parent.clientHeight);
        // check if parent was actually resized to avoid this triggering on initialization
        if (parent.clientWidth != width || parent.clientHeight != height) {
          resize(options.width || parent.clientWidth, options.height || parent.clientHeight)
          if (lastCondition) {
            this.render(lastCondition);
          }
        }
      });
      observer.observe(parent);
    },
    
    // contract: if render() returns a string or element, then replace the parent content
    render: function(condition) {
      
      // remember for redrawing on resize
      lastCondition = condition;
      
      let width = ctx2d.canvas.width;
      let height = ctx2d.canvas.height;
        
      condition = Object.assign({
        lowIntensity: 0,
        // highIntensity: 1.0,
        // contrastRatio: 2.0,           // maximum contrast based on minimumIntensityColor, maximumIntensityColor
        foregroundIntensity: 1.0,  // high intensity (bright) stimulus on low intensity background.
        backgroundIntensity: 0.0,
        rotate: 0
      }, condition);
      
      // convert dimensions to pixels
      for (let key of options.dimensions) {
        let cond = condition[key];
        if (Array.isArray(cond)) {
          condition[key] = cond.map(c => display.dimensionToScreenPixels(c, condition));
        }
        else {
          condition[key] = display.dimensionToScreenPixels(cond, condition)  
          //console.log("Converting " + cond + " to " + condition[key]);
        }
      }
      
     // default case, use maximum intensity as high intensity
      if ((!condition.highIntensity) && (!condition.contrastRatio)) {
        condition.highIntensity = 1.0;
      }
      
      if (condition.contrastRatio) {
        if (condition.highIntensity) {
          runtime.warn("Both highIntensity and contrastRatio specified - omitting contrastRatio.");
        }
        else {
          let realLowIntensity = condition.lowIntensity + runtime.ambientIntensity * (1-condition.lowIntensity);
          let realHighIntensity = realLowIntensity * condition.contrastRatio;
          condition.highIntensity = (realHighIntensity - runtime.ambientIntensity) / (1 - runtime.ambientIntensity);
        }
      }
      /*
      if (condition.contrastRatio / 2 > condition.centerIntensity) {
        runtime.warn("Contrast ratio " + condition.contrastRatio + " exceeds valid range for center intensity " + condition.centerIntensity + " - clipping will occur!");
      }
      */

      // convert intensities to color values
      for (let key of options.intensities) {
        condition[key] = display.intensityToColorValue(condition[key], condition);
      }
      
      ctx2d.resetTransform();
      
      if (condition.backgroundIntensity) {
        ctx2d.fillStyle = condition.backgroundIntensity;
        ctx2d.fillRect(0,0,width,height);
        if (!this.backgroundColor) this.backgroundColor = condition.backgroundIntensity; // HACK for browser-simple, refactor
      }
      
      if (condition.foregroundIntensity) {
        ctx2d.fillStyle = condition.foregroundIntensity;
        ctx2d.strokeStyle = condition.foregroundIntensity;
        if (!this.foregroundColor) this.foregroundColor = condition.foregroundIntensity; // HACK for browser-simple, refactor
      }
      
      // move origin to center
      ctx2d.translate(Math.round(width / 2), Math.round(height / 2));
      
      // affine transform
      if (condition.translate) {
        let trans = condition.translate;
        if (!Array.isArray(condition.translate)) {
          trans = [trans, trans];
        }
        ctx2d.translate(trans[0], trans[1]);
      }  
      if (condition.rotate) {
        ctx2d.rotate(condition.rotate/180*Math.PI);
      }
      
      // wait for resources to be loaded
      if (resourcesPromise) {
        resourcesPromise.then(() => {
          renderFunc(ctx2d, condition);
        });
      }
      else {
        renderFunc(ctx2d, condition);
      }
    },
    
    fonts: options.fonts,
    resources: options.fonts?.map(f => f.resource),
  }
}

module.exports = canvasRenderer;