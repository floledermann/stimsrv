const htmlContent = require("../ui/htmlContent.js");
const htmlButtons = require("../ui/htmlButtons.js");

module.exports = function(options) {
  
  options = Object.assign({
    displaymessage: "The experiment is paused." + (options.controller == "control" ? "" : " Press button to continue."),
    monitormessage: "Experiment paused" + (options.controller == "control" ? ". Press button to continue." : ", waiting for user."),
    controller: "response",
    buttonlabel: "Continue"
  }, options);
  
  return {
    name: "pause",
    display: htmlContent(options.displaymessage),
    response: options.controller == "response" ? htmlButtons(options.buttonlabel) : null,
    monitor: htmlContent(options.monitormessage),
    control: options.controller == "response" ? htmlButtons(options.buttonlabel) : null,
  }


}