const Dimension = require("another-dimension");

const valOrFunc = require("../util/valOrFunc.js");

function htmlButtons(buttonDefs, options) {
  
  options = Object.assign({
    wrapperTag: "div",
    wrapperClass: "buttons",
    buttonTag: "button",
    buttonEvent: ["touchstart","mousedown"], // String or Array of Strings
    broadcastEvents: null
  }, options);
  
  // single string -> convert to array
  if (typeof buttonDefs != 'function' && !Array.isArray(buttonDefs)) {
    buttonDefs = [buttonDefs];
  }
  
  let client = null;
  let document = null;
  let wrapper = null;
  
  return {
    initialize: function(_client, _parent, _document) {
      
      client = _client;
      document = _document;
      
      wrapper = document.createElement(options.wrapperTag);
      if (options.wrapperClass) {
        wrapper.className = options.wrapperClass;
      }
      _parent.appendChild(wrapper);
    },
    
    render: function(condition) {
      
      let _buttonDefs = valOrFunc.array(buttonDefs, condition);
      
      //TODO: check if change/rerender is needed
      wrapper.innerHTML = "";
      for (let [index, buttonDef] of _buttonDefs.entries()) {
        
        let el = document.createElement(options.buttonTag);
        el.innerHTML = valOrFunc(buttonDef.label || buttonDef, condition);
        
        if (buttonDef.canvas) {
          
          // TODO: reuse canvasRenderer - this requires some refactoring there
          // to get rid of fixed binding to specific canvas
          
          let canvas = document.createElement("canvas");
          
          canvas.width = Math.round(60 * (devicePixelRatio || 1));
          canvas.height = Math.round(40 * (devicePixelRatio || 1));
          
          canvas.style.width = "60px";
          canvas.style.height = "40px";
          
          el.appendChild(canvas);
          
          let buttonCondition = Object.assign({}, condition, buttonDef.response);
          
          let ctx = canvas.getContext("2d");
          
          let fgColor = "#ffffff";
          let bgColor = "#000000";
          
          if (!buttonCondition.foregroundIntensityHigh) {
            fgColor = "#000000";
            bgColor = "#ffffff";
          }
          ctx.fillStyle = bgColor;
          ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
          ctx.fillStyle = fgColor;
          ctx.strokeStyle = fgColor;
          ctx.translate(ctx.canvas.width/2, ctx.canvas.height/2);
          
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
            
            client.response(buttonDef.response || {label: buttonDef.label});
            
            if (options.broadcastEvents) {
              if (Array.isArray(options.broadcastEvents)) {
                let evt = options.broadcastEvents[index];
                if (evt) {
                  broadcastVal(client, valOrFunc(evt,condition,buttonDef,index));
                }
              }
              else {
                broadcastVal(client, valOrFunc(options.broadcastEvents,condition,buttonDef,index));
              }
            }
          });
        });
        wrapper.appendChild(el);
      }
    }
  }
}

htmlButtons.buttonCanvas = function(renderFunc, conditionOverride, options) {

  options = Object.assign({
    dimensions: []
  }, options);
  
  return function(ctx, buttonCondition) {   
  
    condition = Object.assign({}, buttonCondition, conditionOverride);
    
    // convert dimensions into pixels
    for (let key of options?.dimensions) {
      let cond = condition[key];
      if (Array.isArray(cond)) {
        condition[key] = cond.map(c => Dimension(c, "px").toNumber("px"));
      }
      else {
        condition[key] = Dimension(cond, "px").toNumber("px");  
      }
    }
    
    renderFunc(ctx, condition);
  }
}
  

function broadcastVal(client, evt) {
  let type = null;
  let data = {};
  if (typeof evt == 'string') {
    type = evt;
  }
  else {
    type = evt.type;
    data = evt.data;
  }
  client.broadcastEvent(type, data);
}

module.exports = htmlButtons;