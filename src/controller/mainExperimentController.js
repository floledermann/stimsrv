const { performance } = require("perf_hooks");

const stimsrvVersion = require("../../package.json").version;

const nextOnResponse = require("./nextOnResponse.js");

function MainExperimentController(experiment, options) {
  
  options = Object.assign({
    defaultController: nextOnResponse(),
  }, options);
  
  experiment.settings = Object.assign({
    relativeTimestamps: true,  // should this be a setting for storage?
    loop: true
  }, experiment.settings);
  
  let storage = experiment.storage;
  
  let clients = [];
  
  // state
  let experimentTimeOffset = null;
  
  let context = experiment.context || {};
  
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
  
  function nextTask() {
    
    // store results of previous experiment
    if (currentTask && currentTask?.store !== false) {
      // separate constant parameters form changing parameters
      let constantParameters = currentController.constantParameters?.();
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
    
    let nextContext = currentController?.nextContext?.(trials);
    
    if (!nextContext?.continue) {
      taskIndex++;
    }

    context = nextContext?.context || context;
      
    if (taskIndex < experiment.tasks.length) {
      if (!nextContext?.continue) {
        currentTask = experiment.tasks[taskIndex](context);
        // we can't store the (modified) context, since the factory is also called on client and storing
        // its return value may introduce inconsistencies.
        // if ex-ante context modification is needed, consider calling nextContext() beofre the task, not after?
        //context = currentTask.context || context;      
        currentController = currentTask.controller || options.defaultController(context);
      }
      //console.log("Next Experiment: " + taskIndex);
      
      currentTaskTimeOffset = relativeTime(experimentTimeOffset);
      
      broadcast("experiment start", {
        taskIndex: taskIndex,
        context: context
      });
      
      newTrial(currentController.nextCondition(null,null,trials));
      
    }
    else {
      // end of experiment
      broadcast("experiment end");
      endExperiment().then(() => {
        if (experiment.settings.loop) {
          resetExperiment();
          startExperiment();
        }
      });
    }
  }
  
  function reload() {
    // reload experiment in case of server restart
    broadcast("stimsrv reload");
  }
  
  function startExperiment() {
    if (taskIndex = -1) {
      userIdPromise = storage.getNextParticipantId();
      experimentTimeOffset = relativeTime();
      nextTask();
    }
  }
  
  async function endExperiment() {
    
    resetTask();
        
    userIdPromise.then(userId => {
      let data = {
        _description: "Experiments results data for participant #" + userId + " -- generated by stimsrv v" + stimsrvVersion,
        _type: "ExperimentResultsSingle",
        experimentName: experiment.name,
        experimentTimeOrigin: experiment.settings.relativeTimestamps ? Math.round(performance.timeOrigin) : 0, 
        experimentStartTime: new Date(experimentTimeOffset + experiment.settings.relativeTimestamps ? performance.timeOrigin : 0).toLocaleString({dateStyle:"full"}), 
        errors: errors,
        warnings: warnings,
        results: results
      };
            
      storage.storeParticipantData(userIdPromise, data);

      resetResults();
    });
    
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
      context: context,
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