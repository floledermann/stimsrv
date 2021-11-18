
const socketio = require("socket.io-client");
const deepEqual = require("fast-deep-equal");

const warnDefaults = require("../../util/warnDefaults.js");
const pickProperties = require("../../util/pickProperties.js");

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
    el.className = "interface";
    el.id = "interface-" + ui;
    options.root.appendChild(el);
    options.root.classList.add("has-ui-" + ui);
  }

  let eventSubscribers = {};
  let broadcastSubscribers = {};

  function handleIncomingEvent(eventType, data) {
    //console.log("Received message: " + eventType, data);
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
  let currentTaskFrontend = null;
  
  let taskStyleEl = null;
  
  let taskIndex = null;
  let context = {};

  let localContext = Object.assign(
    {},
    pickProperties.without(options.role, ["devices"]),
    pickProperties.without(options.device, ["id"]),
    {
      clientid: options.clientid
    }
  );
 
  function prepareCurrentTask(context) {
    
    let stimsrvClientAPI = {
      warn: warn,
      event: event,
      response: response,
      getResourceURL: getResourceURL
    };
    
    for (let uiName of options.role.interfaces) {
      
      // clear ui
      let wrapper = document.getElementById("interface-" + uiName);
      wrapper.innerHTML = "";
      wrapper.style.cssText = ""; // this may be set by tasks
      
      // setup new ui
      let ui = getUI(uiName, context);
      
      if (ui) {
        ui.initialize?.(wrapper, stimsrvClientAPI, context);
      }
    }
    
    taskStyleEl.textContent = currentTaskFrontend.css;
    
    document.body.classList.add("current-task-" + currentTaskFrontend.name);

  }
  
  function endTask(task) {
    document.body.classList.remove("current-task-" + task.name);
  }
  
  function showCondition(condition) {
    console.log("Condition: ", condition);
    if (currentTaskFrontend.transformConditionOnClient && typeof currentTaskFrontend.transformConditionOnClient == "function") {
      Object.assign(condition, currentTaskFrontend.transformConditionOnClient(condition));
      // remove undefined properties
      Object.keys(condition).forEach(key => {
        if (condition[key] === undefined) {
          delete condition[key];
        }
      });
      console.log("Transformed condition: ", condition);
    }
    eachUI(ui => ui.render?.(condition));
  }
  
  function getUI(uiName, context) {
    
    // test available UIs in decreasing specificity
    let fullName = options.role.role + "." + uiName;
    if (!currentTaskFrontend.interfaces[fullName]) fullName = uiName;
    if (!currentTaskFrontend.interfaces[fullName]) fullName = options.role.role + ".*";
    if (!currentTaskFrontend.interfaces[fullName]) fullName = "*";
    
    let ui = currentTaskFrontend.interfaces[fullName];
    
    // ui may be object of function(context) - in latter case, initialize
    if (ui) {
      if (typeof ui == "function") {
        ui = ui(context);
        currentTaskFrontend.interfaces[fullName] = ui;
      }
    }
    
    return ui;

  }
  
  function eachUI(callback) {
    if (currentTaskFrontend) {
      for (let ui of options.role.interfaces) {       
        ui = getUI(ui);
             
        if (ui) {
          callback(ui);
        }
      }
    }
  }

  
  function getResourceURL(id, path) {
    return "/static/resources/" + id + (path ? "/" + path : "");
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
        
        if (currentTaskFrontend === null || data.taskIndex != taskIndex || !deepEqual(context, data.context)) {
          
          this.error("Task specification changed without initialization.", data);
          
          // TODO: throw exception and remove following code if we are sure this never happens
          taskIndex = data.taskIndex;
          context = data.context;
          let fullContext = Object.assign({}, context, localContext);
          
          if (currentTaskFrontend) {
            endTask(currentTaskFrontend);
          }
        
          let currentTask = experiment.tasks[taskIndex];
          if (typeof currentTask == "function") currentTask = currentTask(context);
          currentTaskFrontend = currentTask.frontend(fullContext);
          currentTaskFrontend.name = currentTask.name;
          prepareCurrentTask(fullContext);
        }
        
        showCondition(data.condition);
      });
      
      this.subscribeEvent("task init", data => {
        
        taskIndex = data.taskIndex;
        context = data.context;
        let fullContext = Object.assign({}, context, localContext);
        
        if (currentTaskFrontend) {
          endTask(currentTaskFrontend);
        }
        
        let currentTask = experiment.tasks[taskIndex];
        if (typeof currentTask == "function") currentTask = currentTask(context);
        currentTaskFrontend = currentTask.frontend(fullContext);
        // hack: add name to ui part of task
        if (!currentTaskFrontend.name) {
          currentTaskFrontend.name = currentTask.name;
        }
        prepareCurrentTask(fullContext);

        if (data.condition) {
          showCondition(data.condition);
        }
      });
      
      this.subscribeEvent("client join", data => {
        eachUI(ui => ui?.event?.("client join", data));
      });
      
      this.subscribeEvent("client leave", data => {
        eachUI(ui => ui?.event?.("client leave", data));
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
      
      // add styles for device and role
      if (options.role.css) {
        let styleEl = document.createElement("style");
        styleEl.innerHTML = options.role.css;
        document.head.appendChild(styleEl);
      }
      
      if (options.device.css) {
        let styleEl = document.createElement("style");
        styleEl.innerHTML = options.device.css;
        document.head.appendChild(styleEl);
      }
      
      taskStyleEl = document.createElement("style");
      document.head.appendChild(taskStyleEl);
      
    },
    
    
  }
  

  return client;
}

module.exports = clientFactory