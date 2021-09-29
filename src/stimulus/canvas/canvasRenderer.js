
const resource = require("stimsrv/util/resource");
const valOrFunc = require("stimsrv/util/valOrFunc");

const displayConfig = require("stimsrv/stimulus/displayConfig");

function canvasRenderer(renderFunc, options) {
  
  options = Object.assign({
    width: null,  // width in layout pixels, default: use parent width
    height: null,  // height in layout pixels, default: use parent height
    dimensions: [],   // "translate" is added by default (see below)
    defaultDimensions: ["translate"],
    intensities: [],  // "foregroundIntensity", "backgroundIntensity" are added by default (see below)
    defaultIntensities: ["foregroundIntensity","backgroundIntensity"],
    
    overrideContext: null,
    overrideCondition: null,

    fonts: [],
  }, options);
  
  options.intensities = options.intensities.concat(options.defaultIntensities);
  options.dimensions = options.dimensions.concat(options.defaultDimensions);
  
  let renderer = function(context) {
    
    context = Object.assign({}, context, options.overrideContext);
    
    let display = displayConfig(Object.assign({}, options, {
      warnDefaults: options.warn
    }))(context);
    
    let ctx2d = null;
    
    let stimsrvAPI = null;
    
    let lastCondition = null;
    
    let dppx = 1;
    let width = 0, height = 0;
    
    let resourcesPromise = Promise.resolve(true);
    
    return {
      initialize: function(parentOrCanvas, _stimsrvAPI) {
        
        stimsrvAPI = _stimsrvAPI;
        lastCondition = null;

        let document = parentOrCanvas.ownerDocument;
              
        let parent = parentOrCanvas;
        let canvas = parentOrCanvas;
        let manageSize = false;
        
        if (parentOrCanvas.tagName == "CANVAS") {
          // canvas is passed in, retrieve parent element
          parent = canvas.parentElement;
          // we assume that client code takes care of sizing
          manageSize = false;
        }
        else {
          // parent is passed in -> create canvas, append to parent and manage size
          canvas = document.createElement("canvas");
          parent.appendChild(canvas);
        
          manageSize = true;
        }
        
        dppx = document.defaultView.devicePixelRatio || 1; // defaultView = window
        
        //console.log("INIT", parent.clientWidth, parent.clientHeight);
           
        if (options.fonts) {
          resourcesPromise = Promise.all(options.fonts.map(font => {
            let fontFace = new FontFace(font.family, "url(" + resource.url(font.resource) + ")");
            return fontFace.load().then(() => {
              document.fonts.add(fontFace);
            });
          }));
        }
        
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
              
        if (manageSize) {
           
          resize(options.width || parent.clientWidth, options.height || parent.clientHeight);

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
        }  

        ctx2d = canvas.getContext('2d');
        
      },
      
      // contract: if render() returns a string or element, then replace the parent content
      render: function(condition) {
        
        condition = Object.assign({}, condition, options.overrideCondition);
        
        // remember for redrawing on resize
        lastCondition = condition;
        
        // wait for resources to be loaded
        resourcesPromise.then(() => {
          
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
              stimsrvAPI.warn("Both highIntensity and contrastRatio specified - omitting contrastRatio.");
            }
            else {
              let realLowIntensity = condition.lowIntensity + context.ambientIntensity * (1-condition.lowIntensity);
              let realHighIntensity = realLowIntensity * condition.contrastRatio;
              condition.highIntensity = (realHighIntensity - context.ambientIntensity) / (1 - context.ambientIntensity);
            }
          }
          /*
          if (condition.contrastRatio / 2 > condition.centerIntensity) {
            stimsrvAPI.warn("Contrast ratio " + condition.contrastRatio + " exceeds valid range for center intensity " + condition.centerIntensity + " - clipping will occur!");
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
          
          renderFunc(ctx2d, condition, context, stimsrvAPI);
          
        });

      },
      
    }
  };

  renderer.fonts = options.fonts;
  renderer.resources = options.fonts?.map(f => f.resource);
  
  return renderer;
}

module.exports = canvasRenderer;