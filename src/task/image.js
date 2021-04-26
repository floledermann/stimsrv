
const valOrFunc = require("stimsrv/util/valOrFunc");
const pick = require("stimsrv/util/pickProperties");

module.exports = function(config) {
  
  config = Object.assign({
    image: null, // needs to be specified
    baseURL: null, //needs to be specified
    imageUIs: ["display","monitor"],
    responseUIs: ["response"],
    responseUI: htmlButtons([{label: "Next", response: {}}]),
    resources: null // if you want to provide images locally, this needs to be provided
  }, config);
  
  return {
    name: "image",
    description: "Image stimulus",
    ui: context => {
      let uis = {};
      for (let ui of config.imageUIs) {
        uis[ui] = imageStimulus({baseURL: valOrFunc(config.baseURL, context)}));
      }
      for (let ui of config.responseUIs) {
        uis[ui] = valOrFunc(config.responseUI, context);
      }
      
      return {
        interfaces: uis
      }
    },
    controller: parameterController({
      parameters: pick(config, ["image","baseURL"])
    }),
    resources: config.resources
  }
}
