
const mainExperimentController = require("../src/controller/mainExperimentController.js");

function mockStorage() {
  return {
    lastParticipantData: null,
    getNextParticipantId: function() {
      return new Promise((resolve, reject) => resolve(1));
    },
    storeParticipantData: function(userIdPromise, data) {
      this.lastParticipantData = data;
    }
  }
}

function controllerTask(taskOrControllerOrInitialContextFunc) {
  if (typeof taskOrControllerOrInitialContextFunc == "function") {
    return { controller: { initialContext: taskOrControllerOrInitialContextFunc }};
  }
  if (taskOrControllerOrInitialContextFunc?.controller) {
    // this is a full-fledged task - return unchanged
    return taskOrControllerOrInitialContextFunc;
  }
  return { controller: taskOrControllerOrInitialContextFunc };
}

function controllerTasks(controllers) {
  return controllers.map(controllerTask);
}

function tasksExperiment(initialContext, tasks) {
  return mainExperimentController({
    storage: mockStorage(),
    context: initialContext,
    tasks: tasks
  })
}

function controllersExperiment(initialContext, controllers) {
  return tasksExperiment(initialContext, controllerTasks(controllers));
}

module.exports = {
  mockStorage: mockStorage,
  controllerTask: controllerTask,
  controllerTasks: controllerTasks,
  tasksExperiment: tasksExperiment,
  controllersExperiment: controllersExperiment
}