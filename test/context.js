"use strict";

const assert = require("assert");

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

function contextExperiment(initialContext, controllers) {
  return mainExperimentController({
    storage: mockStorage(),
    context: {
      param1: "value1"
    },
    tasks: controllers.map(exp => {
      if (typeof exp == "function") {
        return { controller: { initialContext: exp }};
      }
      return { controller: exp };
    })
  })
}

describe("Context", () => {

  describe("Handing context between tasks", () => {

    it("Initial context gets passed to first task", () => {
      let currentContext = null;
      let controller = contextExperiment(
        { param1: "value1" },
        [
          context => {
            currentContext = context;
            return context;
          }
        ]
      );
      controller.startExperiment();
      assert.equal(currentContext.param1, "value1");    
    });
    
    it("Context gets passed to next task unchanged", () => {
      
      let currentContext = null;
      
      let controller = contextExperiment(
        { param1: "value1" },
        [
          context => context,
          context => {
            currentContext = context;
            return context;
          }
        ]
      );
      
      controller.startExperiment();
      controller.response({});
      
      assert.equal(currentContext.param1, "value1");  
      assert(!currentContext.hasOwnProperty("param2"));   
    });
    
    it("Task can change context in initialContext()", () => {
      
      let currentContext = null;
      
      let controller = contextExperiment(
        { param1: "value1" },
        [
          context => ({ param2: "value2" }),
          context => {
            currentContext = context;
            return context;
          }
        ]
      );
      
      controller.startExperiment();
      controller.response({});
      
      assert(!currentContext.hasOwnProperty("param1"));   
      assert.equal(currentContext.param2, "value2");  
    });

    it("Task can change context in nextContext()", () => {
      
      let currentContext = null;
      
      let controller = contextExperiment(
        { param1: "value1" },
        [
          { nextContext: context => ({context: {param2: "value2" }}) },
          context => {
            currentContext = context;
            return context;
          }
        ]
      );
      
      controller.startExperiment();
      controller.response({});
      
      assert(!currentContext.hasOwnProperty("param1"));   
      assert.equal(currentContext.param2, "value2");  
    });

    it("Same task continues if requested by nextContext()", () => {
      
      let currentContext = null;
      
      let counter = 0;
      
      let controller = contextExperiment(
        { param1: "value1" },
        [
          {
            initialContext: context => {
              currentContext = context;
            },
            nextContext: context => {
              let nextContext = {param1: "value1." + (++counter) };
              currentContext = nextContext;
              return {'continue': counter < 3, context: nextContext}
            }
          },
          context => {
            context.param2 = "task2";
            currentContext = context;
            return context;
          }
        ]
      );
      
      controller.startExperiment();   // at task 1
      assert.strictEqual(currentContext.param1, "value1");  
      controller.response({});        // at task 1, counter == 1
      assert.equal(currentContext.param1, "value1.1");  
      controller.response({});        // at task 1, counter == 2
      assert.equal(currentContext.param1, "value1.2");  
      controller.response({});        // at task 2, counter == 3, continue == false
      assert.equal(currentContext.param1, "value1.3");  
      assert.equal(currentContext.param2, "task2");  
      // restarting experiment is done asynchronous (due to storage), so below code does not work in immediate mode
      //controller.response({});        // experiment restarts, initial context
      //assert.equal(currentContext.param1, "value1");  
    });

  });
 
  
});

