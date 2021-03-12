const nextOnResponse = require("./nextOnResponse.js");

function MainExperimentController(experiment, options) {
  
  options = Object.assign({
    defaultController: nextOnResponse
  }, options);
  
  let storage = experiment.storage;
  
  let experimentTimestamp = Date.now();
  
  let experimentIndex = -1;
  let currentExperiment = null;
  let currentController = null;
  
  let currentTrial = null;
  
  let trials = [];
  
  let experimentResults = [];
  
  let clients = [];
  
  let userId = null;
  
  function nextExperiment() {
    
    // store results of previous experiment
    if (currentExperiment && currentExperiment?.store !== false) {
      // separate constant parameters form changing parameters
      let constantParameters = currentController?.constantParameters();
      experimentResults.push({
        name: currentExperiment?.name,
        description: currentExperiment?.description,
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
    
    experimentIndex++;
    
    if (experimentIndex < experiment.experiments.length) {
      
      //console.log("Next Experiment: " + experimentIndex);
      
      currentExperiment = experiment.experiments[experimentIndex];
      currentController = currentExperiment.controller() || options.defaultController();
           
      currentTrial = {
        condition: currentController.nextCondition(null,null,trials)  // no response yet
      };
      trials.push(currentTrial);
      broadcast("experiment start", {
        experimentIndex: experimentIndex
      });
      broadcast("condition", {
        experimentIndex: experimentIndex,
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
    if (experimentIndex = -1) {
      userId = storage.getNextParticipantId();
      nextExperiment();
    }
  }
  
  function endExperiment() {
    experimentIndex = -1;
    currentExperiment = null;
    currentController = null;   
    currentTrial = null;
    
    storage.storeParticipantData(userId, experimentResults);
    
    experimentResults = [];
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
        experimentIndex: experimentIndex,
        condition: currentTrial.condition,
      });
    }
    // conditions exhausted - show next experiment
    else {
      nextExperiment();
    }
  }
  
  function addClient(client) {
    clients.push(client);
    client.message("experiment start", {
      experimentIndex: experimentIndex,
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