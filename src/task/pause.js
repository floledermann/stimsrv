
const valOrFunc = require("../util/valOrFunc.js");
const htmlContent = require("../ui/htmlContent.js");
const htmlButtons = require("../ui/htmlButtons.js");
const nextOnResponse = require("../controller/nextOnResponse.js");

let defaults = {
  background: "#000000",
  textcolor: "#ffffff",
  buttondisplay: "response",
  button: "Continue",
  store: false,  // do not store by default
  messageStyle: {
    padding: "2em"
  },
}

function pause(config) {
  
  config = Object.assign({
    // dynamic default message, must be created here
    message: {
      display: "The experiment is paused." + (config.buttondisplay == "control" ? "" : " Press button to continue."),
      "*": "Experiment paused" + (config.buttondisplay == "control" ? ". Press button to continue." : ", waiting for user.")
    }
  },
  defaults, config);
  
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
      
      let parentStyle = "";
      if (config.background) parentStyle += "background: " + valOrFunc(config.background, context) + ";";
      if (config.textcolor) parentStyle += "color: " + valOrFunc(config.textcolor, context) + ";";
      
      // make sure "*" is applied last, to make "role.*" work as override regardless of order
      let fallback = message["*"];
            
      for (let key of Object.keys(message)) {
        // fallback is handled explicitly (see above)
        if (key == "*") continue;
        
        let [role, ui] = key.split(".");
        if (!ui) {
          ui = role;
          role = "*";
        }
        if (role == "*" || role == context.role) {
          interfaces[ui] = htmlContent(valOrFunc(message[key], context), { parentStyle: parentStyle, style: config.messageStyle });
        }
      }
      
      if (!interfaces["*"] && fallback) {
        interfaces["*"] = htmlContent(valOrFunc(fallback, context), { parentStyle: parentStyle, style: config.messageStyle });
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

pause.defaults = function(_defaults) {
  Object.assign(defaults, _defaults);
}

module.exports = pause;