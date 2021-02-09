
const valOrFunc = require("../util/valOrFunc.js");

module.exports = function(labels, options) {
  
  options = Object.assign({
    wrapperTag: "div",
    wrapperClass: null,
    buttonTag: "button",
    buttonEvent: "mousedown",
    response: function() {client.next();}
  });
  
  // single string -> convert to array
  if (typeof labels != 'function' && !Array.isArray(labels)) {
    labels = [labels];
  }
  
  let client = null;
  let document = null;
  
  return {
    initialize: function(_client, _parent, _document) {
      client = _client;
      document = _document;
    },
    
    render: function(condition) {
      
      let _labels = valOrFunc.array(labels, condition);
      
      let wrapper = document.createElement(options.wrapperTag);
      wrapper.className = options.wrapperClass;
      
      for (let label of _labels) {
        let el = document.createElement(options.buttonTag);
        el.innerHTML = label;
        
        let _label = label;
        el.addEventListener(options.buttonEvent, function(e) {
          client.event("response button", {label: _label});
        });
        wrapper.appendChild(el);
      }
      
      return wrapper;
    }
  }
}