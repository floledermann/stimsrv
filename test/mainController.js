"use strict";

const assert = require("assert");

const sequence = require("../src/controller/sequence.js");

const {controllerTask, controllerTasks, controllersExperiment} = require("./_util.js");


describe("MainController", () => {

  describe("stores results after experiment", () => {

    it("Controller stores results when restarting experiment", (done) => {
      
      let counter = 1;
      
      let controller = controllersExperiment(
        [
          {
            nextCondition: () => (counter < 3 ? { } : null)
          }
        ]
      );
      controller.startExperiment();
      // first condition
      
      controller.response({});
      // second condition
      
      controller.response({});
      // at end -> loop experiment
      
      controller.getLastParticipantData().then(done);
      
    });

    it("Stored results contents match experiment", (done) => {
      
      debugger;
      
      let currentCondition = null;
      let counter = 1;
      
      let controller = controllersExperiment(
        [
          {
            nextCondition: () => {
              // loop after 2 trials
              if (counter >= 3) {
                counter = 1;
                return null;
              }
              currentCondition = { param1: counter++ };
              return currentCondition;
            }
          }
        ]
      );
      controller.startExperiment();
      // first condition
      assert.equal(currentCondition.param1, 1);
      
      controller.response({param2: 1});
      // second condition
      assert.equal(currentCondition.param1, 2);
      
      controller.response({param2: 2});
      // at end -> loop experiment
      assert.equal(currentCondition.param1, 1);
      
      let resultsP = controller.getLastParticipantData();
      
      resultsP.then((results) => {
      
        assert.equal(results._type, "stimsrv.ExperimentResultsSingleParticipant");
        
        assert.strictEqual(results.errors?.length, 0);
        assert.strictEqual(results.warnings?.length, 0);
        
        // single task
        assert.strictEqual(results.results?.length, 1);
        // two trials
        assert.strictEqual(results.results[0]?.trials?.length, 2);
        
        assert.deepEqual(results.results[0].trials[0].condition, { param1: 1 });
        assert.deepEqual(results.results[0].trials[0].response, { param2: 1 });
        
        assert.deepEqual(results.results[0].trials[1].condition, { param1: 2 });
        assert.deepEqual(results.results[0].trials[1].response, { param2: 2 });
        
        done();
      });
      
    });

  });

});

