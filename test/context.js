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

describe("Context", () => {

  describe("Handing context between tasks", () => {
    
      
    let currentContext = null;
    
    let experiment = {
      storage: mockStorage(),
      context: {
        param1: "value1"
      },
      tasks: [
        context => {
          currentContext = context;
          return {}
        },
        context => {
          currentContext = context;
          return {
            controller: {
              nextCondition: () => null, // always continue
              nextContext: () => ({context: {param2: "value2"}})
            }
          }
        },     
        context => {
          currentContext = context;
          return {
            controller: {
              nextCondition: () => null, // always continue
              nextContext: () => ({context:{param1: "value1.2"}})
            }
          }
        },     
        context => {
          currentContext = context;
          return {}
        }     
      ]
    };
    
    let controller = mainExperimentController(experiment);
      
    it("Initial context gets passed to first task", () => {
      controller.startExperiment();
      assert.equal(currentContext.param1, "value1");    
    });
    
    it("Context gets passed to next task unchanged", () => {
      controller.response({});
      assert.equal(currentContext.param1, "value1");  
      assert(!currentContext.hasOwnProperty("param2"));   
    });
    
    it("Task can add context parameter in nextContext()", () => {
      controller.response({});
      //assert.equal(currentContext.param1, "value1");  
      assert(!currentContext.hasOwnProperty("param1"));   
      assert.equal(currentContext.param2, "value2");  
    });
    
    it("Task can overwrite context parameter in nextContext()", () => {
      controller.response({});
      assert.equal(currentContext.param1, "value1.2");  
      assert(!currentContext.hasOwnProperty("param2"));   
    });
    
  });
 
  
});

