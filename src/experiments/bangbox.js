const htmlContent = require("../ui/htmlContent.js");
const htmlButtons = require("../ui/htmlButtons.js");

module.exports = function(options) {
  
  options = Object.assign({
    controller: ["response", "control"],
    banglabel: "Bang!",
    nextlabel: "Next",
    bangcolor: "#ff0000",
    boxstyle: "width: 100px; height: 100px; border: 1px solid #000;"
  }, options);
  
  let display = {
    initialize: function(client, parent, document) {
      
      let el = _document.createElement("div");
      el.className = "bangbox";
      el.style.cssText = options.boxstyle;
      
      client.subscribeEvent("bang", function(data) {
        if (data.label == options.banglabel) {
          el.style.backgroundColor = options.bangcolor;
          setTimeout(function() {
            el.style.backgroundColor = "transparent";
          }, 100);
        }
      });  
      
    }
  };
  
  let buttons = htmlButtons([options.banglabel, options.nextlabel])
  
  return {
    name: "bangbox",
    clients: ["browser"],
    interfaces: {
      display: display,
      response: buttons,
      monitor: display,
      control: buttons
    }
  }


}
