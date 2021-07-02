"use strict";

const assert = require("assert");

const sequence = require("../src/controller/sequence.js");

const parameterController = require("../src/controller/parameterController.js");

describe("ParameterController", () => {

  it("Initializing empty", () => {
    
    let c = parameterController({
      // config
    })({/* context */});
    
    // we got a working controller
    assert.equal(typeof c.nextCondition, "function");
    assert.equal(typeof c.constantParameters, "function");
    assert.strictEqual(c.nextContext, null);
    
    // empty controller has no condition
    assert.strictEqual(c.nextCondition(), null);
  });
  
  it("Static parameters yield forever", () => {
    
    let c = parameterController({
      parameters: {
        param1: "value1"
      }
    })({/* context */});
    
    let p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "value1");
    
    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "value1");
    
    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "value1");
    
  });
  
  it("Function parameters get called with context", () => {
    
    let c = parameterController({
      parameters: {
        param1: c => c.context1
      }
    })({
      // context
      context1: "value1"
    });
    
    let p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "value1");
    
    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "value1");
    
    // ...
        
  });
  
  it("Generators for individual parameters yield for subsequent conditions and terminate when exhausted", () => {
    
    let c = parameterController({
      parameters: {
        param1: sequence(["value1","value2"])
      }
    })({/* context */});
    
    let p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "value1");
    
    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "value2");

    p = c.nextCondition();
    assert.strictEqual(p, null);
        
  });

  it("Generator for overall object yields for subsequent conditions and terminates when exhausted", () => {
    
    let c = parameterController({
      parameters: sequence([{param1:"value1"},{param1:"value2"}])
    })({/* context */});
    
    let p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "value1");
    
    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "value2");

    p = c.nextCondition();
    assert.strictEqual(p, null);
        
  });
  
  it("Array of specifications gets assigned in array order", () => {
    
    let c = parameterController({
      parameters: [
        {
          param1: "value1",
          param2: "value1"
        },
        {
          param2: "value2",
          param3: "value2"
        }
      ]
    })({/* context */});
    
    let p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "value1");
    assert.equal(p.param2, "value2");
    assert.equal(p.param3, "value2");
    
    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "value1");
    assert.equal(p.param2, "value2");
    assert.equal(p.param3, "value2");

    // ...
        
  });
  
  it("Functions in Array specification get called with context and previous paramters", () => {
    
    let c = parameterController({
      parameters: [
        {
          param1: "value1",
          param2: "value1"
        },
        context => condition => ({
          param3: condition.param1,
          param4: context.context1
        })
      ]
    })({
      // context
      context1: "value2"
    });
    
    let p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "value1");
    assert.equal(p.param2, "value1");
    assert.equal(p.param3, "value1");
    assert.equal(p.param4, "value2");
    
    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "value1");
    assert.equal(p.param2, "value1");
    assert.equal(p.param3, "value1");
    assert.equal(p.param4, "value2");

    // ...
        
  });
  
  
});



