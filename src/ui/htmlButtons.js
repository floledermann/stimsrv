
const Dimension = require("another-dimension");
const deepEqual = require("fast-deep-equal");

const valOrFunc = require("../util/valOrFunc.js");

const getColorValueForIntensity = require("../stimulus/canvas/canvasRenderer.js").getColorValueForIntensity;

let defaults = {
    wrapperTag: "div",
    wrapperClass: "buttons",
    buttonTag: "button",
    buttonEvent: ["touchstart","mousedown"], // String or Array of Strings
    broadcastEvents: null,
    alwaysRerender: false,
    delay: 500,
    clickSound: false,
    hideAfterResponse: true
};

function htmlButtons(buttonDefs, config) {
  
  config = Object.assign({}, defaults, config);
  
  // single string -> convert to array
  if (typeof buttonDefs != 'function' && !Array.isArray(buttonDefs)) {
    buttonDefs = [buttonDefs];
  }
  
  let runtime = null;
  let document = null;
  let wrapper = null;
  
  let lastButtonDefs = null;
  
  let respondedToCurrentCondition = false;
  
  let clickSound = null;
  
  return {
    initialize: function(parent, _runtime) {
      
      runtime = _runtime;
      document = parent.ownerDocument;
      lastButtonDefs = null;
      
      wrapper = document.createElement(config.wrapperTag);
      if (config.wrapperClass) {
        wrapper.className = config.wrapperClass;
      }
      parent.appendChild(wrapper);
      
      if (config.clickSound) {
        clickSound = new Audio(config.clickSound);
      }
      
    },
    
    render: function(condition) {
      
      respondedToCurrentCondition = false;
      
      let _buttonDefs = valOrFunc.array(buttonDefs, condition);
      
      // check if change/rerender is needed
      if (config.alwaysRerender || !deepEqual(_buttonDefs, lastButtonDefs)) {
        
        lastButtonDefs = _buttonDefs;
      
        wrapper.innerHTML = "";
        for (let [index, buttonDef] of _buttonDefs.entries()) {
          
          if (typeof buttonDef == "string") {
            buttonDef = {
              label: buttonDef
            }
          }
          
          let buttonCondition = Object.assign({}, condition, buttonDef.response);
          
          let el = document.createElement(config.buttonTag);
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
          
          let evt = config.buttonEvent;
          
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
              
              if (!respondedToCurrentCondition) {         
                runtime.response(buttonDef.response || {label: buttonDef.label});     
              }
              
              respondedToCurrentCondition = true;
              
              if (clickSound) {
                clickSound.play();
              }
              
              if (config.hideAfterResponse) {
                wrapper.style.display = "none";
              }
              
              if (config.broadcastEvents) {
                if (Array.isArray(config.broadcastEvents)) {
                  let evt = config.broadcastEvents[index];
                  if (evt) {
                    broadcastVal(runtime, valOrFunc(evt,condition,buttonDef,index));
                  }
                }
                else {
                  broadcastVal(runtime, valOrFunc(config.broadcastEvents,condition,buttonDef,index));
                }
              }
            });
          });
          
          // remove focus after clicking
          el.addEventListener("mouseup", function() { this.blur(); });
          
          wrapper.appendChild(el);
        }
        
      }
      
      if (config.delay) {
        wrapper.style.display = "none";
        setTimeout(function() {
          wrapper.style.display = "";
        }, config.delay);
      }
      else {
        wrapper.style.display = "";
      }
    }
  }
}

htmlButtons.buttonCanvas = function(renderFunc, conditionOverride, config) {

  config = Object.assign({
    dimensions: [],
    intensities: []
  }, config);
  
  config.intensities = config.intensities.concat(["foregroundIntensity","backgroundIntensity"]);  
  
  return function(ctx, buttonCondition) {   
  
    let condition = Object.assign({
      lowIntensity: 0,
      highIntensity: 1.0,
      foregroundIntensity: 1.0,  // high intensity (bright) stimulus on low intensity background.
      backgroundIntensity: 0.0,
      rotate: 0
   }, buttonCondition, conditionOverride);
    
    // convert dimensions to pixels
    for (let key of config?.dimensions) {
      let cond = condition[key];
      if (Array.isArray(cond)) {
        condition[key] = cond.map(c => Dimension(c, "px").toNumber("px"));
      }
      else {
        condition[key] = Dimension(cond, "px").toNumber("px");  
      }
    }
    
    // convert intensities to color values
    for (let key of config.intensities) {
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

htmlButtons.defaults = function(_defaults) {
  Object.assign(defaults, _defaults);
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