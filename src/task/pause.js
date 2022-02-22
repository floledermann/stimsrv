
const Dimension = require("another-dimension");

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
  skip: false, // hack until this is based on simpleTask
  messageStyle: {
    padding: "2em"
  },
  name: "pause",
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
    name: config.name,
    store: config.store,
    frontend: function(context) {
    
      // construct interfaces from config info
      
      let interfaces = {
      }
           
      // message UIs: all by default, or specified by individual keys
      let message = valOrFunc(config.message, context);
      
      if (typeof message == "string") {
        message = {"*": message}
      }
      
      let parentStyle = "";
      let bgColor = null;
      let fgColor = null;
      if (config.background) {
        bgColor = valOrFunc(config.background, context);
        parentStyle += "background: " + bgColor + ";";
      }
      if (config.textcolor) {
        fgColor = valOrFunc(config.textcolor, context);
        parentStyle += "color: " + fgColor + ";";
      }
      
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
          let msg = valOrFunc(message[key], context);
          interfaces[ui] = htmlContent(msg, { parentStyle: parentStyle, style: config.messageStyle });
          // the following is needed for browser-simple - integrate
          interfaces[ui].renderToCanvas = canvasMessage(msg, bgColor, fgColor);
          interfaces[ui].backgroundColor = bgColor;
          interfaces[ui].foregroundColor = fgColor;
        }
      }
      
      if (!interfaces["*"] && fallback) {
        let msg = valOrFunc(fallback, context);
        interfaces["*"] = htmlContent(msg, { parentStyle: parentStyle, style: config.messageStyle, css: config.css });
        // the following is needed for browser-simple - integrate
        interfaces["*"].renderToCanvas = canvasMessage(msg, bgColor, fgColor);
        interfaces["*"].backgroundColor = bgColor;
        interfaces["*"].foregroundColor = fgColor;
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
    controller: context => {
      if (valOrFunc(config.skip, context)) {
        // dummy controller to skip this task
        // this is obsolete once this is based on simpleTask
        return {
          nextCondition: () => null
        }
      }
      return nextOnResponse()(context);
    }
  }

}

function canvasMessage(msg, bgColor, fgColor) {
  
  let top = "0mm";
  let left = "23mm";
  let fontSize = "3mm";
  
  return function(ctx, condition, uiOptions) {
    
    //console.log("###########");
    //console.log(uiOptions);
      
    let width = ctx.canvas.width;
    let height = ctx.canvas.height;
    
    ctx.resetTransform();
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0,0,width,height);
    
    ctx.fillStyle = fgColor;
    ctx.strokeStyle = fgColor;
    
    // strange race condition produces unexpected results for unit conversion -- investigate
    //Dimension.configure(uiOptions);
    
    function mmToPx(v) {
      return v * uiOptions.pixeldensity / 25.4;
    }
    
    ctx.translate(Math.round(width / 2) - mmToPx(Dimension(left).value), Math.round(height / 2) - mmToPx(Dimension(top).value));
    
    ctx.textAlign = "left";
    ctx.textBaseline = "top"
    
    let fontSizePx = mmToPx(Dimension(fontSize).value);
    ctx.font = fontSizePx + "px sans-serif";
    
    //console.log("Font size in px: " + fontSizePx);
    
    let lines = msg.split("\n");
    let maxWidth = 300 * uiOptions.devicePixelRatio;
  
    for (let i=0; i<lines.length; i++) {
      let line = lines[i];
      let nextLine = "";
      let measure = ctx.measureText(line);
      while (measure.width > maxWidth && line.includes(" ")) {
        let splitPoint = line.lastIndexOf(" ");
        nextLine = line.substring(splitPoint+1) + " " + nextLine;
        line = line.substring(0,splitPoint);
        lines[i] = line;
        measure = ctx.measureText(line);
      }
      if (nextLine != "") {
        lines.splice(i+1, 0, nextLine);
      }
    }
    
    ctx.translate(0,-lines.length * fontSizePx * 1.5 / 2);
    
    for (let line of lines) {
      ctx.fillText(line, 0, 0);
      ctx.translate(0, fontSizePx * 1.5);
    }

  }
}

pause.defaults = function(_defaults) {
  Object.assign(defaults, _defaults);
}

module.exports = pause;