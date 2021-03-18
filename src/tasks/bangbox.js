
const htmlContent = require("../ui/htmlContent.js");
const htmlButtons = require("../ui/htmlButtons.js");
const nextOnResponse = require("../controller/nextOnResponse.js");

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
      
      let el = document.createElement("div");
      el.className = "bangbox";
      el.style.cssText = options.boxstyle;
      parent.appendChild(el);
      
      client.subscribeBroadcast("bang", function(data) {
        el.style.backgroundColor = options.bangcolor;
        setTimeout(function() {
          el.style.backgroundColor = "transparent";
        }, 100);
      });      
    }
  };
  
  let buttons = htmlButtons([options.banglabel, options.nextlabel], {
    broadcastEvents: ["bang"]
  });
  
  return {
    name: "bangbox",
    clients: ["browser"],
    controller: nextOnResponse({
      filterResponse: response => response.label == options.nextlabel
    }),
    interfaces: {
      display: display,
      response: buttons,
      monitor: display,
      control: buttons
    }
  }


}
