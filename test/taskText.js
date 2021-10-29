"use strict";

const assert = require("assert");

const text = require("../src/task/text.js");
const sequence = require("../src/controller/sequence.js");


describe("Text Task", () => {

  describe("Initialization", () => {

    it("Basic initialization", () => {
      
      let task = text();
      
      assert.equal(task.name, "text");
      
      assert(task.description);
      assert(task.frontend);
      assert(task.controller);
      assert(task.resources);
      
      let controller = task.controller({});
      
      assert(controller.nextCondition);
      assert(controller.constantParameters);
      
      let cond = controller.nextCondition();
      
      assert(cond.text);
      
    });


    it("Custom defaults", () => {
      
      text.defaults({
        text: "foo",
        size: "8mm"
      });

      let task = text();    
            
      let controller = task.controller({});
      let cond = controller.nextCondition();
      
      assert.equal(cond.text, "foo");
      assert.equal(cond.size, "8mm");
      
    });
    
    it("Parameter sets", () => {
      // TODO: move this to a more generic test section
      let task = text(
        [
          // static
          {
            angle: sequence.loop([1,-1]),
          },
          // dynamic: select word from hierarchical collection
          context => {           
            // hierarchical set of generators
            let sets = sequence.loop([
              sequence.loop(["AA","AB","AC"]),
              sequence.loop(["BA","BB","BC"]),
            ])(context);           
            return condition => {
              // get the next category, and from that the next set
              let set = sets.next().value;
              return {
                text: set.next().value,
                choices: set.items
              }
            }
          }
        ]
      );

      let controller = task.controller({});
      
      let cond = controller.nextCondition();     
      assert.equal(cond.angle, 1);
      assert.equal(cond.text, "AA");
      assert.deepEqual(cond.choices, ["AA","AB","AC"]);
      
      cond = controller.nextCondition();     
      assert.equal(cond.angle, -1);
      assert.equal(cond.text, "BA");
      assert.deepEqual(cond.choices, ["BA","BB","BC"]);
      
      cond = controller.nextCondition();     
      assert.equal(cond.angle, 1);
      assert.equal(cond.text, "AB");
      assert.deepEqual(cond.choices, ["AA","AB","AC"]);
      
      cond = controller.nextCondition();     
      assert.equal(cond.angle, -1);
      assert.equal(cond.text, "BB");
      assert.deepEqual(cond.choices, ["BA","BB","BC"]);
      
      cond = controller.nextCondition();     
      assert.equal(cond.text, "AC");
      assert.deepEqual(cond.choices, ["AA","AB","AC"]);
      
      cond = controller.nextCondition();     
      assert.equal(cond.text, "BC");
      assert.deepEqual(cond.choices, ["BA","BB","BC"]);
      
      cond = controller.nextCondition();     
      assert.equal(cond.text, "AA");
      assert.deepEqual(cond.choices, ["AA","AB","AC"]);
      
      cond = controller.nextCondition();     
      assert.equal(cond.text, "BA");
      assert.deepEqual(cond.choices, ["BA","BB","BC"]);
      
    });


  });

});

