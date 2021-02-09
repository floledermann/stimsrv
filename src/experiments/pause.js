const htmlContent = require("../ui/htmlContent.js");
const htmlButtons = require("../ui/htmlButtons.js");
const nextOnResponse = require("../controller/nextOnResponse.js");

module.exports = function(options) {
  
  options = Object.assign({
    displaymessage: "The experiment is paused." + (options.controller == "control" ? "" : " Press button to continue."),
    monitormessage: "Experiment paused" + (options.controller == "control" ? ". Press button to continue." : ", waiting for user."),
    buttondisplay: "response",
    buttonlabel: "Continue"
  }, options);
  
  return {
    name: "pause",
    interfaces: {
      display: htmlContent(options.displaymessage),
      response: options.buttondisplay == "response" ? htmlButtons(options.buttonlabel) : null,
      monitor: htmlContent(options.monitormessage),
      control: options.buttondisplay == "control" ? htmlButtons(options.buttonlabel) : null,
    },
    controller: nextOnResponse()
  }


}