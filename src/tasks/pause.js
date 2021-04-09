
const valOrFunc = require("../util/valOrFunc.js");
const htmlContent = require("../ui/htmlContent.js");
const htmlButtons = require("../ui/htmlButtons.js");
const nextOnResponse = require("../controller/nextOnResponse.js");

module.exports = function(config) {
  
  config = Object.assign({
    message: {
      display: "The experiment is paused." + (config.buttondisplay == "control" ? "" : " Press button to continue."),
      "*": "Experiment paused" + (config.buttondisplay == "control" ? ". Press button to continue." : ", waiting for user.")
    },
    buttondisplay: "response",
    button: "Continue",
    store: false  // do not store by default
  }, config);
  
  return {
    name: "pause",
    store: config.store,
    ui: function(context) {
    
      // construct interfaces from config info
      
      let interfaces = {
      }
      
      
      // message UIs: all by default, or specified by individual keys
      let message = valOrFunc(config.message, context);
      
      if (typeof message == "string") {
        message = {"*": message}
      }
      
      for (let key of Object.keys(message)) {
        let [role, ui] = key.split(".");
        if (!ui) {
          ui = role;
          role = "*";
        }
        if (role == "*" || role == context.role) {
          interfaces[ui] = htmlContent(valOrFunc(message[ui], context));
        }
      }
      
      // buttons: as specified by config.buttondisplay (single UI key or Array)
      if (!Array.isArray(config.buttondisplay)) {
        config.buttondisplay = [config.buttondisplay];
      }
      
      for (let key of config.buttondisplay) {
        let button = valOrFunc(config.button, context);
        if (typeof button == "string") {
          button = htmlButtons(button);
        }
        interfaces[key] = button;
      }
    
      return {
        interfaces: interfaces
      }
    },
    controller: nextOnResponse()
  }

}