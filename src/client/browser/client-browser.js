
const socketio = require("socket.io-client");
const deepEqual = require("fast-deep-equal");

const warnDefaults = require("../../util/warnDefaults.js");

const timing = require("./timing.js");

function clientFactory(options) {
  
  options = Object.assign({
    // these need to be passed in:
    // clientid
    // device
    // role
    root: document.body,
    clientTimestamps: false
  }, options);
          
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

  function emitEvent(eventType, data) {
    let timingInfo = {};
    
    if (options.clientTimestamps) {
      timingInfo = {
        clientTimestamp: Math.round(performance.now() + performance.timeOrigin),
        clientTimestampAdjust: clientTimestampAdjust,
        clientAverageDelay: clientAverageDelay
      }
    }

    socket?.emit(eventType, Object.assign({}, data, timingInfo));
  }
    
  function event(eventType, data) {
    emitEvent("broadcast", {
      type: eventType,
      data: data
    });
  }
    
  function response(data) {
    let msg = {
      taskIndex: taskIndex,
      response: data
    }
    if (options.clientTimestamps) {
      msg.clientTimestamp = Math.round(performance.now() + performance.timeOrigin);
      msg.clientTimestampAdjust = clientTimestampAdjust;
    }
    emitEvent("response", msg);
  }

  function warn(message, data) {
    console.warn(message);
    emitEvent("warning", {
      message: message,
      data: data
    });
  }

  function error(message, data) {
    console.error("Error: " + message);
    emitEvent("clientError", {
      message: message,
      data: data
    });
  }
  
  let experiment = null;  
  let currentTask = null;
  
  let taskIndex = null;
  let context = {};

  let localContext = {
    clientid: options.clientid,
    device: options.device,
    role: options.role.role,
  };
 
  function prepareTask(task) {
    
    let uiOptions = getRendererOptions();
      
    for (let ui of options.role.interfaces) {
      
      // clear ui
      let wrapper = document.getElementById("interface-" + ui);
      wrapper.innerHTML = "";
    
      // setup new ui
      if (task.interfaces[ui]) {
        task.interfaces[ui].initialize?.(wrapper, uiOptions);
      }
      else {
        task.interfaces["*"]?.initialize?.(wrapper, uiOptions);
      }
    }
  }
  
  function showCondition(task, condition) {
    for (let ui of options.role.interfaces) {
      if (task.interfaces[ui]) {
        task.interfaces[ui].render?.(condition);
      }
      else {
        task.interfaces["*"]?.render?.(condition);
      }
    }
  }

  function getRendererOptions() {
    
    let screenConfig = options.device.screens?.[0];
    
    if (options.role.screen) {
      if (options.device.screens?.length) {
        let candidates = options.device.screens.filter(d => d.id == options.role.screen);
        if (candidates.length >= 1) {
          if (candidates.length > 1) {
            warn("Multiple screens with same id '" + options.role.screen + "' found - using first match.");
          }
          screenConfig = candidates[0];
        }
        else {
          warn("No screen with id '" + options.role.screen + "' found - using first screen.");
          screenConfig = options.device.screens[0];
        }
      }
      else {
        warn("Screen id '" + options.role.screen + "' is configured for role '" + options.role.role + "', but no screen definitions found for device '" + options.device.name + "'.");
      }
    }
    else {
      if (options.device.screens?.length > 1) {
        warn("Screen is not specified for role '" + options.role.role + "', but more than one screen is defined for device '" + options.device.id + "' - using first screen.");
      }
    }    
    
    let config = Object.assign({}, options.device, screenConfig);
    config.id = options.device.id;
    if (screenConfig) {
      config.screenId = screenConfig.id;
    }
    delete config.screens;
    
    warnDefaults(warn, config, {
      pixeldensity: 96,
      gamma: 2.2,
      viewingdistance: 600,
      ambientIntensity: 1/100
    });
    
    // set callback functions
    Object.assign(config, {
      warn: warn,
      error: error,
      event: event,
      response: response
    })
    
    return config;
    
  }
    
  let socket = null;
  let clientTimestampAdjust = null;
  let clientAverageDelay = null;
  
  let client = {
    connect: function() {
    
      socket = socketio.connect();
      
      socket.onAny(handleIncomingEvent);
        
      if (options.clientTimestamps) {
        timing(socket).calibrate({
          updateCallback: (durations, averageDelay) => {
            console.log("Testing delay to server, average: " + averageDelay.toFixed(2) + "ms...");
            clientAverageDelay = averageDelay;
          }
        }).then(timestampAdjust => {
          console.log("Negotiated timestamp adjustment: " + timestampAdjust + "ms.");
          clientTimestampAdjust = timestampAdjust;
        });
      }
      
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
    
    warn: warn,
    
    error: error,
    
    event: event,
    
    response: response,
    
    run: function(_experiment) {
      
      experiment = _experiment;
      taskIndex = null;
      context = {};
      
      this.subscribeEvent("condition", data => {
        
        if (currentTask === null || data.taskIndex != taskIndex || !deepEqual(context, data.context)) {
          
          this.error("Task data changed without initialization.", data);
          
          taskIndex = data.taskIndex;
          context = data.context;
          let fullContext = Object.assign({}, context, localContext);
          
          currentTask = experiment.tasks[taskIndex].ui(fullContext);
          prepareTask(currentTask);
        }
        
        showCondition(currentTask, data.condition);
      });
      
      this.subscribeEvent("task init", data => {
        
        taskIndex = data.taskIndex;
        context = data.context;
        let fullContext = Object.assign({}, context, localContext);
        
        currentTask = experiment.tasks[data.taskIndex].ui(fullContext);
        prepareTask(currentTask);

        if (data.condition) {
          showCondition(currentTask, data.condition);
        }
      });
      
      this.subscribeEvent("stimsrv reload", data => {
        console.log("Server restarted - reloading experiment");
        window.location.reload();
      });
    }
  }
  

  return client;
}

module.exports = clientFactory