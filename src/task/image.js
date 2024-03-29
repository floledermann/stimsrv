
const valOrFunc = require("stimsrv/util/valOrFunc");
const pick = require("stimsrv/util/pickProperties");

const htmlButtons = require("stimsrv/ui/htmlButtons");
const imageStimulus = require("stimsrv/stimulus/image");

const parameterController = require("stimsrv/controller/parameterController");

module.exports = function(config) {
  
  config = Object.assign({
    image: null, // needs to be specified
    baseURL: null, //needs to be specified
    imageUIs: ["display","monitor"],
    responseUIs: ["response"],
    responseUI: null, // default defined below 
    resources: null // if you want to provide images locally, this needs to be provided
  }, config);
  
  if (!config.responseUI) {
    config.responseUI = htmlButtons([{label: "Next", response: {}}]);
  }
  
  return {
    name: "image",
    description: "Image stimulus",
    frontend: context => {
      let uis = {};
      for (let ui of config.imageUIs) {
        uis[ui] = imageStimulus({baseURL: valOrFunc(config.baseURL, context)});
      }
      for (let ui of config.responseUIs) {
        uis[ui] = valOrFunc(config.responseUI, context);
      }
      
      return {
        interfaces: uis
      }
    },
    controller: parameterController({
      parameters: pick.without(config, ["imageUIs","responseUIs","responseUI","resources","css","transformCondition"]),
      generateCondition: config.transformCondition
    }),
    resources: config.resources
  }
}
