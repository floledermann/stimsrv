const nextOnResponse = require("./nextOnResponse.js");

function MainExperimentController(experiment, options) {
  
  options = Object.assign({
    defaultController: nextOnResponse
  }, options);
  
  let storage = experiment.storage;
  
  let experimentTimestamp = Date.now();
  
  let taskIndex = -1;
  let currentTask = null;
  let currentController = null;
  
  let currentTrial = null;
  
  let trials = [];
  
  let results = [];
  
  let clients = [];
  
  let userId = null;
  
  function nextTask() {
    
    // store results of previous experiment
    if (currentTask && currentTask?.store !== false) {
      // separate constant parameters form changing parameters
      let constantParameters = currentController?.constantParameters();
      results.push({
        name: currentTask?.name,
        description: currentTask?.description,
        parameters: constantParameters,
        trials: trials.map(t => ({
          // include only parameters which are not constant
          condition: Object.fromEntries(
            Object.entries(t.condition).filter(([key, value]) => !(key in constantParameters))
          ),
          response: t.response
        }))
      });
    }
    
    trials = [];
    
    taskIndex++;
    
    if (taskIndex < experiment.tasks.length) {
      
      //console.log("Next Experiment: " + taskIndex);
      
      currentTask = experiment.tasks[taskIndex];
      currentController = currentTask.controller() || options.defaultController();
           
      currentTrial = {
        condition: currentController.nextCondition(null,null,trials)  // no response yet
      };
      trials.push(currentTrial);
      broadcast("experiment start", {
        taskIndex: taskIndex
      });
      broadcast("condition", {
        taskIndex: taskIndex,
        condition: currentTrial.condition
      });
    }
    else {
      // end of experiment
      broadcast("experiment end");
      endExperiment();
      // TODO: control looping behaviour, store data etc.
    }
  }
  
  function startExperiment() {
    if (taskIndex = -1) {
      userId = storage.getNextParticipantId();
      nextTask();
    }
  }
  
  function endExperiment() {
    taskIndex = -1;
    currentTask = null;
    currentController = null;   
    currentTrial = null;
    
    storage.storeParticipantData(userId, results);
    
    results = [];
    trials = [];
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
      currentTrial = { condition: nextCondition };
      trials.push(currentTrial);
      broadcast("condition", {
        taskIndex: taskIndex,
        condition: currentTrial.condition,
      });
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
    removeClient: removeClient
  }
  
}

module.exports = MainExperimentController;