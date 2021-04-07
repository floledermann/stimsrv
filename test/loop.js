"use strict";

const assert = require("assert");

const {controllerTask, controllerTasks, tasksExperiment} = require("./_util.js");

const loop = require("../src/tasks/loop.js");
const sequence = require("../src/controller/sequence.js");



describe("Loop", () => {

  describe("Basic loop operation", () => {

    it("Tasks in loop are called, looping at end", () => {
      let currentContext = null;
      let controller = tasksExperiment({param1: "value1"}, [
        loop({
          tasks: controllerTasks([
            context => (currentContext = {param1: "value2"}),
            context => (currentContext = {param1: "value3"}),            
          ])
        }),
        // this is never reached
        controllerTask( context => (currentContext = {param1: "value4"}) )
      ]);
      
      controller.startExperiment();
      assert.equal(currentContext.param1, "value2");    
      controller.response({});
      assert.equal(currentContext.param1, "value3");    
      controller.response({});
      assert.equal(currentContext.param1, "value2");    
      controller.response({});
      assert.equal(currentContext.param1, "value3");    
      controller.response({});
      assert.equal(currentContext.param1, "value2");    
    });

    it("Tasks in loop are called, as long as loop is true", () => {
      let currentContext = null;
      let controller = tasksExperiment({param1: 1}, [
        loop({
          loop: context => (context.param1 < 4),
          tasks: controllerTasks([
            context => (currentContext = {param1: ++context.param1}),
            context => (currentContext = {param1: ++context.param1}),            
          ])
        }),
        // this is reached after 1 loop
        controllerTask( context => (currentContext = {param1: "end"}) )
      ]);
      
      controller.startExperiment();
      assert.equal(currentContext.param1, 2);    
      controller.response({});
      assert.equal(currentContext.param1, 3);    
      controller.response({});
      // loop
      assert.equal(currentContext.param1, 4);    
      controller.response({});
      assert.equal(currentContext.param1, 5);    
      controller.response({});
      // loop == false
      assert.equal(currentContext.param1, "end");    
    });

    it("Nested loop uses local context variables", () => {
      let currentContext = null;
      let controller = tasksExperiment({param1: 1}, [
        loop({
          loop: context => (context.param1 < 4),
          tasks: controllerTasks([           
            context => (currentContext = {param1: ++context.param1}),      // <- start
            loop({
              context: {param1: 98},
              loop: context => (context.param1 < 100),
              tasks: controllerTasks([
                context => (currentContext = {param1: ++context.param1}),
              ])
            }),
            context => (currentContext = {param1: ++context.param1}),            
          ])
        }),
        // this is reached after 1 loop
        controllerTask( context => (currentContext = {param1: "end"}) )
      ]);
      
      controller.startExperiment();
      // first task of outer loop
      assert.equal(currentContext.param1, 2);    
      controller.response({});
      // first task of inner loop
      assert.equal(currentContext.param1, 99);    
      controller.response({});
      // loop inner loop
      assert.equal(currentContext.param1, 100);    
      controller.response({});
      // stop inner loop, continue outer loop with outer parameter value
      assert.equal(currentContext.param1, 3);    
      controller.response({});
      // loop outer loop
      // first task of outer loop
      assert.equal(currentContext.param1, 4);    
      controller.response({});
      // first task of inner loop
      assert.equal(currentContext.param1, 99);    
      controller.response({});
      // loop inner loop
      assert.equal(currentContext.param1, 100);    
      controller.response({});
      // stop inner loop, continue outer loop with outer parameter value
      assert.equal(currentContext.param1, 5);    
      controller.response({});
      // end outer loop
      assert.equal(currentContext.param1, "end");    
    });

  });
  
  
  describe("Context iterator", () => {

    it("Iterator for individual parameter", () => {
      let currentContext = null;
      let controller = tasksExperiment({param1: "value1"}, [
        loop({
          context: { param1: sequence.loop(["value2","value3"]) },
          tasks: controllerTasks([
            context => (currentContext = context),
            context => (currentContext = context),            
          ])
        }),
        // this is never reached
        controllerTask( context => (currentContext = {param1: "value4"}) )
      ]);
      
      controller.startExperiment();
      assert.equal(currentContext.param1, "value2");    
      controller.response({});
      assert.equal(currentContext.param1, "value2");    
      controller.response({});
      assert.equal(currentContext.param1, "value3");    
      controller.response({});
      assert.equal(currentContext.param1, "value3");    
      controller.response({});
      assert.equal(currentContext.param1, "value2");    
    });
    
    it("Iterator for context object", () => {
      let currentContext = null;
      let controller = tasksExperiment({param1: "value1"}, [
        loop({
          context: sequence.loop([{param1: "value2"}, {param1: "value3"}]),
          tasks: controllerTasks([
            context => (currentContext = context),
            context => (currentContext = context),            
          ])
        }),
        // this is never reached
        controllerTask( context => (currentContext = {param1: "value4"}) )
      ]);
      
      controller.startExperiment();
      assert.equal(currentContext.param1, "value2");    
      controller.response({});
      assert.equal(currentContext.param1, "value2");    
      controller.response({});
      assert.equal(currentContext.param1, "value3");    
      controller.response({});
      assert.equal(currentContext.param1, "value3");    
      controller.response({});
      assert.equal(currentContext.param1, "value2");    
    });
    
    it("Non-iterator properties get set only once", () => {
      let currentContext = null;
      let controller = tasksExperiment({param1: "value1"}, [
        loop({
          context: {
            param1: 10,
            param2: sequence.loop([10,20])
          },
          tasks: controllerTasks([
            context => (context.param1++, context.param2++, currentContext = context),
            context => (context.param1++, context.param2++, currentContext = context),            
          ])
        }),
        // this is never reached
        controllerTask( context => (currentContext = {param1: "value4"}) )
      ]);
      
      controller.startExperiment();
      assert.equal(currentContext.param1, 11);    
      assert.equal(currentContext.param2, 11);    
      controller.response({});
      assert.equal(currentContext.param1, 12);    
      assert.equal(currentContext.param2, 12);    
      controller.response({});
      assert.equal(currentContext.param1, 13);    
      assert.equal(currentContext.param2, 21);    
      controller.response({});
      assert.equal(currentContext.param1, 14);    
      assert.equal(currentContext.param2, 22);    
      controller.response({});
      assert.equal(currentContext.param1, 15);    
      assert.equal(currentContext.param2, 11);    
    });
    
    it("Exhausted iterators stop updating parameters", () => {
      let currentContext = null;
      let controller = tasksExperiment({param1: "value1"}, [
        loop({
          context: {
            param1: sequence([10,20]),
            param2: sequence.loop([10,20])
          },
          tasks: controllerTasks([
            context => (context.param1++, context.param2++, currentContext = context),
            context => (context.param1++, context.param2++, currentContext = context),            
          ])
        }),
        // this is never reached
        controllerTask( context => (currentContext = {param1: "value4"}) )
      ]);
      
      controller.startExperiment();
      assert.equal(currentContext.param1, 11);    
      assert.equal(currentContext.param2, 11);    
      controller.response({});
      assert.equal(currentContext.param1, 12);    
      assert.equal(currentContext.param2, 12);    
      controller.response({});
      assert.equal(currentContext.param1, 21);    
      assert.equal(currentContext.param2, 21);    
      controller.response({});
      assert.equal(currentContext.param1, 22);    
      assert.equal(currentContext.param2, 22);    
      controller.response({});
      assert.equal(currentContext.param1, 23);    
      assert.equal(currentContext.param2, 11);    
    });
    
  });
  
});

