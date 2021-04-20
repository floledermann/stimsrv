
const mainExperimentController = require("../src/server/mainExperimentController.js");

function mockStorage() {
  
  let participantIdPromise = null;
  let lastParticipantData = null;
  
  return {
    getLastParticipantData: function() {
      if (participantIdPromise) {
        return new Promise((resolve, reject) => participantIdPromise.then(() => resolve(lastParticipantData)));
      }
      return null;
    },
    getNextParticipantId: function() {
      participantIdPromise = new Promise((resolve, reject) => resolve(1));
      return participantIdPromise;
    },
    storeParticipantData: function(_userIdPromise, data) {
      lastParticipantData = data;
    }
  }
}

function controllerTask(taskOrControllerOrInitialContextFunc) {
  if (typeof taskOrControllerOrInitialContextFunc == "function") {
    return { controller: context => ({ initialContext: taskOrControllerOrInitialContextFunc })};
  }
  if (taskOrControllerOrInitialContextFunc?.controller) {
    // this is a full-fledged task - return unchanged
    return taskOrControllerOrInitialContextFunc;
  }
  return { controller: context => taskOrControllerOrInitialContextFunc };
}

function controllerTasks(controllers) {
  return controllers.map(controllerTask);
}

function tasksExperiment(initialContext, tasks) {
  
  let storage = mockStorage();
  
  let controller = mainExperimentController({
    storage: storage,
    context: initialContext,
    tasks: tasks,
  });
  
  controller.getLastParticipantData = function() {
    return storage.getLastParticipantData();
  }
  
  return controller;
}

function controllersExperiment(initialContext, controllers) {
  // first arg is optional
  if (!controllers) {
    controllers = initialContext;
    initialContext = undefined;
  }
  return tasksExperiment(initialContext, controllerTasks(controllers));
}

module.exports = {
  mockStorage: mockStorage,
  controllerTask: controllerTask,
  controllerTasks: controllerTasks,
  tasksExperiment: tasksExperiment,
  controllersExperiment: controllersExperiment
}