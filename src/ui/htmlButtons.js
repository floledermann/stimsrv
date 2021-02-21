
const valOrFunc = require("../util/valOrFunc.js");

module.exports = function(buttonDefs, options) {
  
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
        
        let evt = options.buttonEvent;
        
        if (!Array.isArray(evt)) {
          evt = [evt];
        }
        
        evt.forEach(eventType => {
          el.addEventListener(eventType, function(e) {
            
            // to prevent touchstart from also triggering mousedown
            // should we make this ocnfigruable?
            e.preventDefault();
            
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