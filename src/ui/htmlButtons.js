
const Dimension = require("another-dimension");
const deepEqual = require("fast-deep-equal");

const valOrFunc = require("../util/valOrFunc.js");

const getColorValueForIntensity = require("../stimulus/canvas/canvasRenderer.js").getColorValueForIntensity;

function htmlButtons(buttonDefs, options) {
  
  options = Object.assign({
    wrapperTag: "div",
    wrapperClass: "buttons",
    buttonTag: "button",
    buttonEvent: ["touchstart","mousedown"], // String or Array of Strings
    broadcastEvents: null,
    alwaysRerender: false
  }, options);
  
  // single string -> convert to array
  if (typeof buttonDefs != 'function' && !Array.isArray(buttonDefs)) {
    buttonDefs = [buttonDefs];
  }
  
  let runtime = null;
  let document = null;
  let wrapper = null;
  
  let lastButtonDefs = null;
  
  return {
    initialize: function(parent, _runtime) {
      
      runtime = _runtime;
      document = parent.ownerDocument;
      lastButtonDefs = null;
      
      wrapper = document.createElement(options.wrapperTag);
      if (options.wrapperClass) {
        wrapper.className = options.wrapperClass;
      }
      parent.appendChild(wrapper);
    },
    
    render: function(condition) {
      
      let _buttonDefs = valOrFunc.array(buttonDefs, condition);
      
      // check if change/rerender is needed
      if (options.alwaysRerender || !deepEqual(_buttonDefs, lastButtonDefs)) {
        
        lastButtonDefs = _buttonDefs;
      
        wrapper.innerHTML = "";
        for (let [index, buttonDef] of _buttonDefs.entries()) {
          
          if (typeof buttonDef == "string") {
            buttonDef = {
              label: buttonDef
            }
          }
          
          let buttonCondition = Object.assign({}, condition, buttonDef.response);
          
          let el = document.createElement(options.buttonTag);
          el.innerHTML = valOrFunc(buttonDef.label || buttonDef, buttonCondition);
          
          if (buttonDef.className) {
            el.className = buttonDef.className;
          }
          
          if (buttonDef.style) {
            el.style.cssText = buttonDef.style;
          }
          
          if (buttonDef.canvas) {
            
            // TODO: reuse canvasRenderer - this requires some refactoring there
            // to get rid of fixed binding to specific canvas
            
            let canvas = document.createElement("canvas");
            
            canvas.width = Math.round(60 * (devicePixelRatio || 1));
            canvas.height = Math.round(40 * (devicePixelRatio || 1));
            
            canvas.style.width = "60px";
            canvas.style.height = "40px";
            
            Dimension.configure({
              pixelDensity: runtime.pixeldensity,
              viewingDistance: runtime.viewingdistance
            });
            
            el.appendChild(canvas);
                      
            let ctx = canvas.getContext("2d");
            
            buttonDef.canvas(ctx, buttonCondition);
          }
          
          let evt = options.buttonEvent;
          
          if (!Array.isArray(evt)) {
            evt = [evt];
          }
          
          evt.forEach(eventType => {
            el.addEventListener(eventType, function(e) {
              
              // to prevent touchstart from also triggering mousedown
              // but we want to keep mousedown for visual feedback
              // should we make this configurable?
              if (e.type == "touchstart") {
                e.preventDefault();
              }
              
              runtime.response(buttonDef.response || {label: buttonDef.label});
              
              if (options.broadcastEvents) {
                if (Array.isArray(options.broadcastEvents)) {
                  let evt = options.broadcastEvents[index];
                  if (evt) {
                    broadcastVal(runtime, valOrFunc(evt,condition,buttonDef,index));
                  }
                }
                else {
                  broadcastVal(runtime, valOrFunc(options.broadcastEvents,condition,buttonDef,index));
                }
              }
            });
          });
          
          // remove focus after clicking
          el.addEventListener("mouseup", function() { this.blur(); });
          
          wrapper.appendChild(el);
        }
      }
    }
  }
}

htmlButtons.buttonCanvas = function(renderFunc, conditionOverride, options) {

  options = Object.assign({
    dimensions: [],
    intensities: []
  }, options);
  
  options.intensities = options.intensities.concat(["foregroundIntensity","backgroundIntensity"]);  
  
  return function(ctx, buttonCondition) {   
  
    let condition = Object.assign({
      lowIntensity: 0,
      highIntensity: 1.0,
      foregroundIntensity: 1.0,  // high intensity (bright) stimulus on low intensity background.
      backgroundIntensity: 0.0,
      rotate: 0
   }, buttonCondition, conditionOverride);
    
    // convert dimensions to pixels
    for (let key of options?.dimensions) {
      let cond = condition[key];
      if (Array.isArray(cond)) {
        condition[key] = cond.map(c => Dimension(c, "px").toNumber("px"));
      }
      else {
        condition[key] = Dimension(cond, "px").toNumber("px");  
      }
    }
    
    // convert intensities to color values
    for (let key of options.intensities) {
      let cond = condition[key];
      if (typeof cond == "number") {
        //console.log("Intensity " + key + ": " + condition[key] + " => " + getColorValueForIntensity(condition[key], condition));
        condition[key] = getColorValueForIntensity(condition[key], condition);
      }
    }

    ctx.resetTransform();
    
    if (condition.backgroundIntensity) {
      ctx.fillStyle = condition.backgroundIntensity;
      ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
    }
    
    if (condition.foregroundIntensity) {
      ctx.fillStyle = condition.foregroundIntensity;
      ctx.strokeStyle = condition.foregroundIntensity;
    }
    
    // move origin to center
    ctx.translate(Math.round(ctx.canvas.width / 2), Math.round(ctx.canvas.height / 2));
    
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
  

function broadcastVal(runtime, evt) {
  let type = null;
  let data = {};
  if (typeof evt == 'string') {
    type = evt;
  }
  else {
    type = evt.type;
    data = evt.data;
  }
  runtime.broadcastEvent(type, data);
}

module.exports = htmlButtons;