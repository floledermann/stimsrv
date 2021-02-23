
const socketio = require("socket.io-client");

const timing = require("./browser/timing.js");

function clientFactory(options) {
  
  options = Object.assign({
    // device
    // role
    root: document.body
  }, options);
  
  let screenConfig = null;
        
  for (let ui of options.role.interfaces) {
    let el = document.createElement("section");
    el.id = "interface-" + ui;
    options.root.appendChild(el);
    options.root.classList.add("has-ui-" + ui);
  }

  let eventSubscribers = {};
  let broadcastSubscribers = {};

  function handleIncomingEvent(eventType, data) {
    console.log("Received message: " + eventType);
    console.log(data);
    if (eventSubscribers[eventType]) {
      for (let cb of eventSubscribers[eventType]) {
        cb(data);
      }
    }
  }
  
  let experiment = null;
  let experimentIndex = null;
  
  function prepareExperiment(experiment) {
    
    for (ui of options.role.interfaces) {
      
      // clear ui
      let wrapper = document.getElementById("interface-" + ui);
      wrapper.innerHTML = "";
    
      // setup new ui
      if (experiment.interfaces[ui]) {
        experiment.interfaces[ui]?.initialize?.(client, wrapper, document);
      }
    }
  }
  
  function showCondition(experiment, condition) {
    for (ui of options.role.interfaces) {
      if (experiment.interfaces[ui]) {
        experiment.interfaces[ui]?.render?.(condition);
      }
    }
  }
  
  let socket = null;
  let clientTimestampAdjust = null;
  let clientAverageDelay = null;
  
  let client = {
    connect: function() {
    
      socket = socketio.connect();
      
      socket.onAny(handleIncomingEvent);

      timing(socket).calibrate({
        updateCallback: (durations, averageDelay) => {
          console.log("Testing delay to server, average: " + averageDelay.toFixed(2) + "ms...");
          clientAverageDelay = averageDelay;
        }
      }).then(timestampAdjust => {
        console.log("Negotiated timestamp adjustment: " + timestampAdjust + "ms.");
        clientTimestampAdjust = timestampAdjust;
      });

      this.subscribeEvent("broadcast", data => {
        
        let broadcastType = data.type;
        let broadcastData = data.data;
        
        if (broadcastSubscribers[broadcastType]) {
          for (let cb of broadcastSubscribers[broadcastType]) {
            cb(broadcastData);
          }
        }
      });
    },

    event: function(eventType, data) {
      socket?.emit(eventType, Object.assign({}, data,{
        clientTimestamp: Date.now(),
        clientTimestampAdjust: clientTimestampAdjust,
        clientAverageDelay: clientAverageDelay
      }));
    },

    // should this even be public, or force to use broadcast events only?
    subscribeEvent: function(eventType, callback) {
      if (!eventSubscribers[eventType]) {
        eventSubscribers[eventType] = [];
      }
      eventSubscribers[eventType].push(callback);
    },
    
    subscribeBroadcast: function(eventType, callback) {
      if (!broadcastSubscribers[eventType]) {
        broadcastSubscribers[eventType] = [];
      }
      broadcastSubscribers[eventType].push(callback);
    },
    
    broadcastEvent: function(eventType, data) {
      this.event("broadcast", {
        type: eventType,
        data: data
      });
    },
    
    response: function(data) {
      let msg = {
        experimentIndex: experimentIndex,
        clientTimestamp: Date.now(),
        clientTimestampAdjust: clientTimestampAdjust,
        response: data
      }
      this.event("response", msg);
    },

    nextExperiment: function() {
      if (experimentIndex === null) {
        experimentIndex = 0;
      }
      else {
        experimentIndex++;
      }
      showExperiment(experiment.experiments[experimentIndex]);
    },
    
    warn: function(message, data) {
      console.warn(message);
      this.event("warning", {
        message: message,
        data: data
      });
    },

    error: function(message, data) {
      console.error(message);
      this.event("error", {
        message: message,
        data: data
      });
    },
    
    getPixelDensity: function() {
      
      // lazy init
      if (!screenConfig) {
        screenConfig = options.device.screens?.[0] || options.device;
        if (options.role.screen) {
          if (options.device.screens?.length) {
            let candidates = options.device.screens.filter(d => d.id == options.role.screen);
            if (candidates.length >= 1) {
              if (candidates.length > 1) {
                this.warn("Multiple screens with same id '" + options.role.screen + "' found - using first match.");
              }
              screenConfig = candidates[0];
            }
            else {
              this.warn("No screen with id '" + options.role.screen + "' found - using first screen.");
              screenConfig = options.device.screens[0];
            }
          }
          else {
            this.warn("Screen id '" + options.role.screen + "' is configured, but no screen definitions found for device '" + options.device.name + "'.");
          }
        }
        else {
          if (options.device.screens?.length > 1) {
            this.warn("More than one screen defined for device '" + options.device.id + "' but screen is not specified for role '" + options.role.role + "' - using first screen.");
          }
        }
      }

      if (screenConfig.pixeldensity) {
        return screenConfig.pixeldensity;
      }
      
      this.warn("Pixel density not defined for screen, using default of 96.");
      return 96;

    },

    run: function(_experiment) {
      
      experiment = _experiment;
      experimentIndex = null;
      
      this.subscribeEvent("condition", data => {
        let trial = experiment.experiments[experimentIndex];
        if (data.experimentIndex !== experimentIndex) {
          this.error("Mismatching experiment index received for condition", data);
          experimentIndex = data.experimentIndex;
          prepareExperiment(trial);
        }
        showCondition(trial, data.condition);
      });
      
      this.subscribeEvent("experiment start", data => {
        console.log("Start experiment: " + data.experimentIndex);
        console.log(data.condition);
        let trial = experiment.experiments[data.experimentIndex];
        if (data.experimentIndex !== experimentIndex) {
          experimentIndex = data.experimentIndex;
          prepareExperiment(trial);
        }
        showCondition(trial, data.condition);
      });
    }
  }
  

  return client;
}

module.exports = clientFactory