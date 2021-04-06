"use strict";

const assert = require("assert");

const {controllerTask, controllerTasks, controllersExperiment} = require("./util.js");

describe("Context", () => {

  describe("Handing context between tasks", () => {

    it("Initial context gets passed to first task", () => {
      let currentContext = null;
      let controller = controllersExperiment(
        { param1: "value1" },
        [
          context => (currentContext = context)
        ]
      );
      controller.startExperiment();
      assert.equal(currentContext.param1, "value1");    
    });
    
    it("Context gets passed to next task unchanged", () => {
      
      let currentContext = null;
      
      let controller = controllersExperiment(
        { param1: "value1" },
        [
          context => context,
          context => (currentContext = context)
        ]
      );
      
      controller.startExperiment();
      controller.response({});
      
      assert.equal(currentContext.param1, "value1");  
      assert(!currentContext.hasOwnProperty("param2"));   
    });
    
    it("Task can change context in initialContext()", () => {
      
      let currentContext = null;
      
      let controller = controllersExperiment(
        { param1: "value1" },
        [
          context => ({ param2: "value2" }),
          context => (currentContext = context)
        ]
      );
      
      controller.startExperiment();
      controller.response({});
      
      assert(!currentContext.hasOwnProperty("param1"));   
      assert.equal(currentContext.param2, "value2");  
    });

    it("Task can change context in nextContext()", () => {
      
      let currentContext = null;
      
      let controller = controllersExperiment(
        { param1: "value1" },
        [
          { nextContext: context => ({context: {param2: "value2" }}) },
          context => (currentContext = context)
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
      
      let controller = controllersExperiment(
        { param1: "value1" },
        [
          {
            initialContext: context => {
              currentContext = context;
            },
            nextContext: context => {
              currentContext = {param1: "value1." + (++counter) };
              return {'continue': counter < 3, context: currentContext}
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

