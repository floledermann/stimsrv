
const socketio = require("socket.io-client");

const timing = require("./browser/timing.js");

function clientFactory(options) {
  
  options = Object.assign({
    interfaces: [],
    root: document.body
  }, options);
  
  for (let ui of options.interfaces) {
    let el = document.createElement("section");
    el.id = "interface-" + ui;
    options.root.appendChild(el);
    options.root.classList.add("has-ui-" + ui);
  }

  let eventSubscribers = {};

  function handleIncomingEvent(eventType, data) {
    if (eventSubscribers[eventType]) {
      for (let cb of eventSubscribers[eventType]) {
        cb(data);
      }
    }
  }
  
  let experiment = null;
  let experimentIndex = null;
  
  function prepareExperiment(experiment) {
    for (ui of options.interfaces) {
      if (experiment.interfaces[ui]) {
        experiment.interfaces[ui]?.initialize(client, document.getElementById("interface-" + ui), document);
      }
    }
  }
  
  function showCondition(experiment, condition) {
    for (ui of options.interfaces) {
      if (experiment.interfaces[ui]) {
        experiment.interfaces[ui]?.render(condition);
      }
    }
  }
  
  let socket = null;
  let clientTimestampAdjust = null;

  let client = {
    connect: function() {
    
      socket = socketio.connect();
      
      socket.onAny(handleIncomingEvent);

      timing(socket).calibrate({
        updateCallback: (durations, average) => console.log("Testing delay to server, average: " + average.toFixed(2) + "ms...")
      }).then(timestampAdjust => {
        console.log("Negotiated timestamp adjustment: " + timestampAdjust + "ms.");
        clientTimestampAdjust = timestampAdjust;
      });      
    },

    event: function(eventType, data) {
      socket?.emit(eventType, data);
    },

    subscribeEvent: function(eventType, callback) {
      if (!eventSubscribers[eventType]) {
        eventSubscribers[eventType] = [];
      }
      eventSubscribers[eventType].push(callback);
    },
    
    response: function(data) {
      data.experimentIndex = experimentIndex;
      data.clientTimestamp = Date.now();
      data.clientTimestampAdjust = clientTimestampAdjust;
      this.event("response", data);
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

    run: function(_experiment) {
      
      experiment = _experiment;
      experimentIndex = null;
      
      this.subscribeEvent("show condition", data => {
        let experiment = experiment.experiments[data.experimentIndex];
        if (data.experimentIndex != experimentIndex) {
          experimentIndex = data.experimentIndex;
          prepareExperiment(experiment);
        }
        showCondition(experiment, data.condition);
      });
    }
  }
  
  return client;
}

module.exports = clientFactory