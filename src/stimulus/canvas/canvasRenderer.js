
const Dimension = require("another-dimension");
const d3 = require("d3-interpolate");

const resource = require("../../util/resource.js");

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
    
function canvasRenderer(renderFunc, options) {
  
  options = Object.assign({
    width: null,  // width in layout pixels, default: use parent width
    height: null,  // height in layout pixels, default: use parent height
    minimumIntensityColor: "#000000",
    maximumIntensityColor: "#ffffff",
    dimensions: [],
    intensities: [],  // "foregroundIntensity", "backgroundIntensity" are always added (see below)
    fonts: [],
    useGamma: false,
  }, options);
  
  options.intensities = options.intensities.concat(["foregroundIntensity","backgroundIntensity"]);
  
  let ctx = null;
  
  let runtime = null;
  
  let lastCondition = null;
  
  let dppx = 1;
  let width = 0, height = 0;
  
  let resourcesPromise = null;
  
  return {
    initialize: function(parent, _runtime) {
      
      runtime = _runtime;
      lastCondition = null;
      
      let document = parent.ownerDocument;
      
      let canvas = document.createElement("canvas");
      dppx = document.defaultView.devicePixelRatio || 1; // defaultView = window
      
      Dimension.configure({
        pixelDensity: runtime.pixeldensity,
        viewingDistance: runtime.viewingdistance
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
      
      ctx = canvas.getContext('2d');
      
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
    
    renderToCanvas: function(ctx, condition, uiOptions) {
      
      let width = ctx.canvas.width;
      let height = ctx.canvas.height;
        
      condition = Object.assign({
        lowIntensity: 0,
        // highIntensity: 1.0,
        // contrastRatio: 2.0,           // maximum contrast based on minimumIntensityColor, maximumIntensityColor
        foregroundIntensity: 1.0,  // high intensity (bright) stimulus on low intensity background.
        backgroundIntensity: 0.0,
        rotate: 0
      }, condition);
      
      if (uiOptions) {
        //console.log(uiOptions.pixeldensity);
        //console.log(uiOptions.viewingdistance);
        Dimension.configure({
          pixelDensity: uiOptions.pixeldensity,
          viewingDistance: uiOptions.viewingdistance
        });
      }
      
      // convert dimensions to pixels
      for (let key of options.dimensions) {
        let cond = condition[key];
        if (Array.isArray(cond)) {
          condition[key] = cond.map(c => Dimension(c, "px").toNumber("px"));
        }
        else {
          condition[key] = Dimension(cond, "px").toNumber("px");  
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
        let cond = condition[key];
        if (cond !== undefined) {
          if (typeof cond == "number") {
            //console.log("Intensity " + key + ": " + condition[key] + " => " + getColorValueForIntensity(condition[key], condition));
            condition[key] = getColorValueForIntensity(condition[key], Object.assign({}, {gamma: runtime?.gamma || uiOptions?.gamma, useGamma: options.useGamma}, condition));
          }
          else {
            runtime.warn("Intensity value " + key + " not specified as number. Using specified value " + condition[key] + " unchanged.");
          }
        }
      }
      
      ctx.resetTransform();
      
      if (condition.backgroundIntensity) {
        ctx.fillStyle = condition.backgroundIntensity;
        ctx.fillRect(0,0,width,height);
        if (!this.backgroundColor) this.backgroundColor = condition.backgroundIntensity; // HACK for browser-simple, refactor
      }
      
      if (condition.foregroundIntensity) {
        ctx.fillStyle = condition.foregroundIntensity;
        ctx.strokeStyle = condition.foregroundIntensity;
        if (!this.foregroundColor) this.foregroundColor = condition.foregroundIntensity; // HACK for browser-simple, refactor
      }
      
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
      
      // wait for resources to be loaded
      if (resourcesPromise) {
        resourcesPromise.then(() => {
          renderFunc(ctx, condition);
        });
      }
      else {
        renderFunc(ctx, condition);
      }
    },
    
    // contract: if render() returns a string or element, then replace the parent content
    render: function(condition) {
      
      // remember for redrawing on resize
      lastCondition = condition;
      
      this.renderToCanvas(ctx, condition);
      
    },
    
    fonts: options.fonts,
    resources: options.fonts.map(f => f.resource),
  }
}

canvasRenderer.getColorValueForIntensity = getColorValueForIntensity;

module.exports = canvasRenderer;