
const Dimension = require("another-dimension");
const deepEqual = require("fast-deep-equal");

const valOrFunc = require("../util/valOrFunc.js");

const displayConfig = require("stimsrv/stimulus/displayConfig");

let defaults = {
    buttons: ["Default Button"],
    wrapperTag: "div",
    wrapperClass: "buttons",
    buttonTag: "button",
    labelTag: "span",
    labelClass: "label",
    subUiTag: "span",
    subUiClass: "sub-ui",
    headerTag: "header",
    footerTag: "footer",
    buttonEvent: ["touchstart","mousedown"], // String or Array of Strings
    broadcastEvents: null,
    alwaysRerender: false,
    delay: 500,
    clickSound: false,
    hideAfterResponse: true,
    css: null
};

function htmlButtons(config) {
  
  if (typeof config == "function" || typeof config == "string" || Array.isArray(config)) {
    // old, deprectated call with (buttonDefs, config) => convert
    console.warn("Deprecation warning: htmlButtons(buttonDefs, options) is deprecated, use htmlButtons(config) with config.buttons entry instead!");
    let _config = arguments[1];
    if (!_config) _config = {};
    _config.buttons = config;
    config = _config;
  }
  
  config = Object.assign({}, defaults, config);
  
  // single string -> convert to array
  if (typeof config.buttons != 'function' && !Array.isArray(config.buttons)) {
    config.buttons = [config.buttons];
  }
  
  let runtime = null;
  let document = null;
  let wrapper = null;
  let headerEl = null;
  let footerEl = null;
  
  let lastButtonDefs = null;
  
  let respondedToCurrentCondition = false;
  
  let clickSound = null;
  
  return context => ({
    initialize: function(parent, _runtime) {
      
      runtime = _runtime;
      document = parent.ownerDocument;
      lastButtonDefs = null;
      
      if (config.css) {
        let styleEl = document.createElement("style");
        styleEl.textContent = config.css;
        parent.appendChild(styleEl);
      }
      
      if (config.header) {
        headerEl = document.createElement(config.headerTag);
        parent.appendChild(headerEl);
      }
      
      wrapper = document.createElement(config.wrapperTag);
      if (config.wrapperClass) {
        wrapper.className = config.wrapperClass;
      }
      parent.appendChild(wrapper);
      
      if (config.footer) {
        headerEl = document.createElement(config.footerTag);
        parent.appendChild(footer);
      }

      if (config.clickSound) {
        clickSound = new Audio(config.clickSound);
        // attempt at better preloading for mobile - does not work
        //clickSound.volume = 0.0;
        //clickSound.play();
      }
      
    },
    
    render: function(condition) {
      
      respondedToCurrentCondition = false;
      
      if (config.header) {
        headerEl.innerHTML = valOrFunc(config.header, condition);
      }
      
      if (config.footer) {
        footerEl.innerHTML = valOrFunc(config.footer, condition);
      }
      
      let _buttonDefs = valOrFunc.array(config.buttons, condition);
      
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
          
          let labelDef = buttonDef.label;
          if (labelDef === undefined) labelDef = buttonDef;
          let labelStr = valOrFunc(labelDef, buttonCondition);
          
          debugger;
          
          if (labelStr !== null && labelStr !== undefined) {
            let labelWrapper = el;      
            if (config.labelTag) {
              labelWrapper = document.createElement(config.labelTag);
              labelWrapper.className = config.labelClass;
              el.appendChild(labelWrapper);
            }
        
            labelWrapper.innerHTML = labelStr;
          }
          
          if (buttonDef.className) {
            el.className = buttonDef.className;
          }
          
          // can this be deprecated? This can be accompished by assigning a style to the task
          if (buttonDef.style) {
            el.style.cssText = buttonDef.style;
          }
                    
          let subUI = buttonDef.subUI;
          if (subUI) {
            let subUiWrapper = el;
            if (config.subUiTag) {
              subUiWrapper = document.createElement(config.subUiTag);
              subUiWrapper.className = config.subUiClass;
              
              // act as offset parent for content
              subUiWrapper.style.position = "relative";

              el.appendChild(subUiWrapper);
            }
            if (typeof subUI == "function") subUI = subUI(context);
            subUI.initialize(subUiWrapper, runtime);
            subUI.render(buttonCondition);
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
                wrapper.style.visibility = "hidden";
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
        wrapper.style.visibility = "hidden";
        setTimeout(function() {
          wrapper.style.visibility = "visible";
        }, config.delay);
      }
      else {
        wrapper.style.visibility = "visible";
      }
    }
  });
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