
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
    //console.log("Received message: " + eventType);
    //console.log(data);
    if (eventSubscribers[eventType]) {
      for (let cb of eventSubscribers[eventType]) {
        cb(data);
      }
    }
  }

  function emitEvent(eventType, data) {
    
    //console.log("emitting " + eventType);
    //console.log(data);
    
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
    console.warn("Warning: " + message);
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
    role: options.role.role, // TODO: this should be the whole role object, but check/test this
  };
 
  function prepareCurrentTask(context) {
    
    let uiOptions = getRendererOptions();
    
    for (let ui of options.role.interfaces) {
      
      // clear ui
      let wrapper = document.getElementById("interface-" + ui);
      wrapper.innerHTML = "";
      wrapper.style.cssText = ""; // this may be set by tasks
    
      // setup new ui
      ui = getUI(ui);
           
      if (ui) {
        ui.initialize?.(wrapper, uiOptions, context);
      }
    }
    
    document.body.classList.add("current-task-" + currentTask.name);

  }
  
  function endTask(task) {
    document.body.classList.remove("current-task-" + task.name);
  }
  
  function showCondition(condition) {
    eachUI(ui => ui.render?.(condition));
  }
  
  function getUI(uiName) {
    return currentTask.interfaces[options.role.role + "." + uiName]
           || currentTask.interfaces[uiName]
           || currentTask.interfaces[options.role.role + ".*"]
           || currentTask.interfaces["*"];
  }
  
  function eachUI(callback) {
    if (currentTask) {
      for (let ui of options.role.interfaces) {       
        ui = getUI(ui);
             
        if (ui) {
          callback(ui);
        }
      }
    }
  }

  
  function getResourceURL(id, path) {
    return "/static/resources/" + id + "/" + path;
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
    
    // provide defaults, but warn when used
    let config = Object.assign({
      pixeldensity: warnDefaults.value(warn, "pixeldensity", 96),
      gamma: warnDefaults.value(warn, "gamma", 2.2),
      viewingdistance: warnDefaults.value(warn, "viewingdistance", 600),
      ambientIntensity: warnDefaults.value(warn, "ambientIntensity", 1/100)
    }, options.device, screenConfig);
    
    config.id = options.device.id;
    
    if (screenConfig) {
      config.screenId = screenConfig.id;
    }
    delete config.screens;
    
    // set callback functions
    Object.assign(config, {
      warn: warn,
      error: error,
      event: event,
      response: response,
      getResourceURL: getResourceURL
    })
    
    return config;
    
  }
    
  let socket = null;
  let clientTimestampAdjust = null;
  let clientAverageDelay = null;
  
  let client = {
    connect: function() {
    
      socket = socketio(); //{ transports: ["websocket"] }); //.connect();
      
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
        
        // forward directly to UIs
        eachUI(ui => ui.event?.(broadcastType, broadcastData))
         
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
          
          this.error("Task specification changed without initialization.", data);
          
          // TODO: throw exception and remove following code if we are sure this never happens
          taskIndex = data.taskIndex;
          context = data.context;
          let fullContext = Object.assign({}, context, localContext);
          
          if (currentTask) {
            endTask(currentTask);
          }
        
          currentTask = experiment.tasks[taskIndex].ui(fullContext);
          currentTask.name = experiment.tasks[data.taskIndex].name;
          prepareCurrentTask(currentTask, fullContext);
        }
        
        showCondition(data.condition);
      });
      
      this.subscribeEvent("task init", data => {
        
        taskIndex = data.taskIndex;
        context = data.context;
        let fullContext = Object.assign({}, context, localContext);
        
        if (currentTask) {
          endTask(currentTask);
        }
        
        currentTask = experiment.tasks[data.taskIndex].ui(fullContext);
        // hack: add name to ui part of task
        if (!currentTask.name) {
          currentTask.name = experiment.tasks[data.taskIndex].name;
        }
        prepareCurrentTask(currentTask, fullContext);

        if (data.condition) {
          showCondition(data.condition);
        }
      });
      
      this.subscribeEvent("stimsrv reload", data => {
        console.log("Server restarted - reloading experiment");
        window.location.reload();
      });
      
      if (options.role.fullscreenButton) {
        let fsButton = document.createElement("button");
        fsButton.className = "requestFullscreen";
        fsButton.addEventListener("click", function() {
          document.body.requestFullscreen({ navigationUI: "hide"}).then(() => {
            document.body.classList.add("fullscreen");
          });
        });
        document.addEventListener("fullscreenchange", function() {
          if (!document.fullscreenElement) {
            document.body.classList.remove("fullscreen");
          }
        });
        document.body.appendChild(fsButton);
      }
      
    },
    
    
  }
  

  return client;
}

module.exports = clientFactory