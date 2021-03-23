const { performance } = require("perf_hooks");

const nextOnResponse = require("./nextOnResponse.js");

function MainExperimentController(experiment, options) {
  
  options = Object.assign({
    defaultController: nextOnResponse,
    relativeTimestamps: true
  }, options);
  
  let storage = experiment.storage;
  
  let experimentTimeOffset = null;
  
  let taskIndex = -1;
  let currentTask = null;
  let currentController = null;
  let currentTaskTimeOffset = null;
  
  let currentTrial = null;
  
  let trials = [];
  
  let results = [];
  
  let clients = [];
  
  let userId = null;
  
  function relativeTime(referenceTime = 0) {
    if (options.relativeTimestamps) {
      return Math.round(performance.now()) - referenceTime;
    }
    else {
      return Math.round(performance.timeOrigin + performance.now());
    }
  }
  
  function nextTask() {
    
    // store results of previous experiment
    if (currentTask && currentTask?.store !== false) {
      // separate constant parameters form changing parameters
      let constantParameters = currentController?.constantParameters();
      results.push({
        name: currentTask?.name,
        description: currentTask?.description,
        parameters: constantParameters,
        taskTimeOffset: currentTaskTimeOffset,
        trials: trials.map(t => Object.assign(t, {
          // include only parameters which are not constant
          condition: Object.fromEntries(
            Object.entries(t.condition).filter(([key, value]) => !(key in constantParameters))
          )
        }))
      });
    }
    
    trials = [];
    currentTaskTimeOffset = null;
    
    taskIndex++;
    
    if (taskIndex < experiment.tasks.length) {
      
      //console.log("Next Experiment: " + taskIndex);
      
      currentTask = experiment.tasks[taskIndex];
      currentController = currentTask.controller() || options.defaultController();
      currentTaskTimeOffset = relativeTime(experimentTimeOffset);
      
      broadcast("experiment start", {
        taskIndex: taskIndex
      });
      
      newTrial(currentController.nextCondition(null,null,trials));
      
    }
    else {
      // end of experiment
      broadcast("experiment end");
      endExperiment();
      // TODO: control looping behaviour, store data etc.
    }
  }
  
  function reload() {
    // reload experiment in case of server restart
    broadcast("stimsrv reload");
  }
  
  function startExperiment() {
    if (taskIndex = -1) {
      userId = storage.getNextParticipantId();
      experimentTimeOffset = relativeTime();
      nextTask();
    }
  }
  
  function endExperiment() {
    taskIndex = -1;
    currentTask = null;
    currentController = null;   
    currentTrial = null;
    experimentTimeOffset = null;
    
    storage.storeParticipantData(userId, results);
    
    results = [];
    trials = [];
  }
  
  function newTrial(condition) {
    currentTrial = {
      trialTimeOffset: relativeTime(experimentTimeOffset + currentTaskTimeOffset),
      condition: condition  // no response yet
    };
    trials.push(currentTrial);
    broadcast("condition", {
      taskIndex: taskIndex,
      condition: currentTrial.condition
    });
  }
  
  function response(_response) {
    
    if (!currentTrial) {
      console.warn("Response received, but no trial active!");
      console.warn(_response);
      return;
    }
    
    currentTrial.response = _response;
    
    let nextCondition = currentController.nextCondition(
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
    client.message("experiment start", {
      taskIndex: taskIndex,
      condition: currentTrial?.condition
    });
  }
  
  function removeClient(client) {
    clients = clients.filter(c => c !== client);
  }
  
  function broadcast(message, data) {
    clients.forEach(c => c.message(message, data));
    //io.sockets.emit(message, data);
  }
  
  // public API
  return {
    response: response,
    startExperiment: startExperiment,
    addClient: addClient,
    removeClient: removeClient,
    reload: reload
  }
  
}

module.exports = MainExperimentController;