const { performance } = require("perf_hooks");

const stimsrvVersion = require("../../package.json").version;

const valOrFunc = require("../util/valOrFunc.js");
const propertiesGenerator = require("../util/propertiesGenerator.js");

const filestorage = require("../storage/filestorage.js");

const nextOnResponse = require("../controller/nextOnResponse.js");

function MainExperimentController(experiment, options) {
  
  options = Object.assign({
    defaultController: nextOnResponse,
  }, options);
  
  experiment.settings = Object.assign({
    relativeTimestamps: true,  // should this be a setting for storage?
    loop: true
  }, experiment.settings);
  
  let storage = experiment.storage || filestorage({
    destination: "./data",
    format: "json"
  });
  
  let clients = [];
  
  // state
  let experimentTimeOffset = null;
  
  let context = experiment.context || {}; 
  let contextGenerator = null;
  
  if (typeof context == "function") {
    context = context({});
  }
  
  if (context.next && typeof context.next == "function") {
    // context is a generator in itself
    contextGenerator = context;
    context = {};
  }
  else {
    context = valOrFunc.allProperties(experiment.context || {}, {});
    contextGenerator = propertiesGenerator(context);
  }
  
  let taskIndex = -1;
  let currentTask = null;
  let currentController = null;
  let currentTaskTimeOffset = null;
  
  let currentTrial = null;
  
  let trials = [];
  let results = [];
  
  let errors = [];
  let warnings = [];
  
  let userIdPromise = null;
  
  function resetExperiment() {
    
    //console.log("reset experiment");
    
    resetTask();
    
    resetResults();
    
    userIdPromise = null;
  }
  
  function resetTask() {
    taskIndex = -1;
    currentTask = null;
    currentController = null;
    currentTrial = null;
    currentTaskTimeOffset = null;   
  }
  
  function resetResults() {
    experimentTimeOffset = null;
    
    if (typeof experiment.context == "function" || (experiment.context?.next && typeof experiment.context.next == "function")) {
      context = {};
    }
    else {
      context = experiment.context || {};
    }
    //contextGenerator = propertiesGenerator(context);
    
    trials = [];
    results = [];
    
    errors = [];
    warnings = [];
    
  }
  
  function relativeTime(referenceTime = 0) {
    if (experiment.settings.relativeTimestamps) {
      return Math.round(performance.now()) - referenceTime;
    }
    else {
      return Math.round(performance.timeOrigin + performance.now());
    }
  }
  
  function storeCurrentTaskResults() {
    if (currentTask && valOrFunc(currentTask?.store, context) !== false) {
      
      // separate constant parameters from changing parameters
      // constant parameters are stored once for the task, changing parameters are stored for each trial
      let constantParameters = currentController.constantParameters?.() || {};
      
      results.push({
        name: currentTask?.name,
        description: currentTask?.description,
        context: Object.assign({}, context),
        parameters: constantParameters,
        taskTimeOffset: currentTaskTimeOffset,
        trials: trials.map(t => Object.assign(t, {
          // include only parameters which are not constant
          condition: Object.fromEntries(
            Object.entries(t.condition || {}).filter(([key, value]) => !(key in constantParameters) || (constantParameters[key] !== value))
          )
        }))
      });
    }
  }
  
  function nextTask() {
    
    storeCurrentTaskResults();
    
    currentTaskTimeOffset = null;
    
    let nextContext = currentController?.nextContext?.(context, trials);
    
    trials = [];
    
    context = nextContext?.context || context;
    
    if (!nextContext?.continue) {
      taskIndex++;
    }

    if (taskIndex < experiment.tasks.length) {
      if (!nextContext?.continue) {
        //console.log("starting task " + taskIndex);
        //console.log(context);
        currentTask = experiment.tasks[taskIndex];
        if (typeof currentTask == "function") currentTask = currentTask(context);
        currentController = currentTask.controller?.(context) || options.defaultController(context);
        //console.log(currentController.initialContext);
        context = currentController.initialContext?.(context) || context;      
      }
      else {
        //console.log("continuing task " + taskIndex);
      }
      //console.log("Next Experiment: " + taskIndex);
      
      currentTaskTimeOffset = relativeTime(experimentTimeOffset);
      
      broadcast("task init", {
        taskIndex: taskIndex,
        context: context
      });
      
      newTrial(currentController.nextCondition?.(null,null,trials));
      
    }
    else {
      // end of experiment
      //console.log("experiment end.");
      broadcast("experiment end");
      
      endExperiment();
      
      if (experiment.settings.loop) {
        resetExperiment();
        startExperiment();
      }
    }
  }
  
  function reload() {
    // reload experiment in case of server restart
    broadcast("stimsrv reload");
  }
  
  function startExperiment() {
    
    let nextContext = contextGenerator.next();
    
    //console.log(nextContext);
    
    if (!nextContext.done) {
      Object.assign(context, nextContext.value);
    }
    
    if (taskIndex = -1) {
      userIdPromise = storage.getNextParticipantId();
      experimentTimeOffset = relativeTime();
      nextTask();
    }
  }
  
  async function endExperiment() {
    
    resetTask();
    
    // copy all data - writing will be performed asynchronous after the experiment is reset
    let data = {
      description: "",    // will be filled out below after resolving userIdPromise
      _type: "stimsrv.ExperimentResultsSingleParticipant",
      _version: stimsrvVersion,
      participantId: null, // will be filled out below after resolving userIdPromise
      experimentName: experiment.name,
      experimentTimeOrigin: experiment.settings.relativeTimestamps ? Math.round(performance.timeOrigin) : 0, 
      experimentStartTime: new Date(experimentTimeOffset + experiment.settings.relativeTimestamps ? performance.timeOrigin : 0).toLocaleString({dateStyle:"full"}), 
      errors: errors,
      warnings: warnings,
      results: results
    }
    
    // copy over, since we return immediately and next id will be assigned
    let idP = userIdPromise;
        
    idP.then(userId => {  
      data.description = "Experiments results data for participant #" + userId + " -- generated by stimsrv v" + stimsrvVersion;
      data.participantId = userId;
      storage.storeParticipantData(idP, data);
    });
    
    resetResults();
    
  }
  
  function newTrial(condition) {
    currentTrial = {
      trialTimeOffset: relativeTime(experimentTimeOffset + currentTaskTimeOffset),
      //warnings: [],  // layzily add these to not spam output with empty arrays
      //errors: [],
      //events: [],
      condition: condition  // no response yet
    };
    trials.push(currentTrial);
    broadcast("condition", {
      taskIndex: taskIndex,
      context: context,
      condition: currentTrial.condition
    });
    // TODO: this output is interesting to watch what the server is doing, 
    // but should not be hardcoded here
    //console.log("-------------------------------------------");
    //console.log("Condition:");
    //console.log(JSON.stringify(currentTrial.condition, null, 2));
  }
  
  function response(_response) {
    
    if (!currentTrial) {
      console.warn("Response received, but no trial active!");
      console.warn(_response);
      return;
    }
    
    currentTrial.response = _response;
    
    let nextCondition = currentController.nextCondition?.(
      currentTrial.condition,
      currentTrial.response,
      trials
    );
    
    // next condition within current experiment
    if (nextCondition) {
      newTrial(nextCondition);
    }
    // conditions exhausted - show next experiment
    else {
      nextTask();
    }
  }
  
  function addClient(client) {
    clients.push(client);
    if (taskIndex > -1) {
      client.message("task init", {
        taskIndex: taskIndex,
        context: context,
        condition: currentTrial?.condition
      });
    }
    // initialize task before sending join message, so that new client get to process it with task already active
    clients.forEach((c, i) => c.message("client join", {numClients: clients.length, clientNum: i+1}));
  }
  
  function removeClient(client) {
    clients = clients.filter(c => c !== client);
    clients.forEach((c, i) => c.message("client leave", {numClients: clients.length, clientNum: i+1}));
  }
  
  function broadcast(message, data) {
    clients.forEach(c => c.message(message, data));
    //io.sockets.emit(message, data);
  }
  
  // override console warn & error for logging
  let _warn = console.warn;
  let _error = console.error;
  
  console.warn = warn;
  console.error = error;
  
  function warn(message, data) {
    let obj = {
      message: message,
      timeOffset: relativeTime(experimentTimeOffset)
    };
    if (data) {
      obj.data = data;
    }
    if (currentTrial) {
      if (!Array.isArray(currentTrial.warnings)) {
        currentTrial.warnings = [];
      }
      currentTrial.warnings.push(Object.assign({}, obj, {timeOffset: relativeTime(currentTrial.trialTimeOffset)}));
    }
    warnings.push(obj);
    
    if (_warn) {
      _warn("Warning: " + message);
      if (data) _warn(data);
    }
  }
  
  function error(message, data) {
    let obj = {
      message: message,
      timeOffset: relativeTime(experimentTimeOffset)
    };
    if (data) {
      obj.data = data;
    }
    if (currentTrial) {
      if (!Array.isArray(currentTrial.errors)) {
        currentTrial.errors = [];
      }
      currentTrial.errors.push(Object.assign({}, obj, {timeOffset: relativeTime(currentTrial.trialTimeOffset)}));
    }
    errors.push(obj);

    if (_error) {
      _error("Error: " + message);
      if (data) _error(data);
    }
  }
  
  // public API
  return {
    response: response,
    startExperiment: startExperiment,
    addClient: addClient,
    removeClient: removeClient,
    reload: reload,
    warn: warn,
    error: error
  }
  
}

module.exports = MainExperimentController;