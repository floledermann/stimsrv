"use strict";

const assert = require("assert");

const sequence = require("../src/controller/sequence.js");

const parameterController = require("../src/controller/parameterController.js");

describe("ParameterController", () => {

  it("Initializing empty", () => {
    
    let c = parameterController({
      // config
    })({
      // context
    });
    
    // we got a working controller
    assert.equal(typeof c.nextCondition, "function");
    assert.equal(typeof c.constantParameters, "function");
    assert.strictEqual(c.nextContext, null);
    
    // empty controller yields empty condition forever
    assert.deepEqual(c.nextCondition(), {});
    assert.deepEqual(c.nextCondition(), {});
    assert.deepEqual(c.nextCondition(), {});
    
    // ...
  });
  
  it("Static parameters yield forever", () => {
    
    let c = parameterController({
      parameters: {
        param1: "value1"
      }
    })({
      // context
    });
    
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
  
  it("Function parameters get called with condition", () => {
    
    let c = parameterController({
      parameters: [
        {
          param1: c => c.context1
        },
        {
          param2: ctx => con => con.param1
        }
      ]
    })({
      // context
      context1: "value1"
    });
    
    let p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "value1");
    assert.equal(p.param2, "value1");
    
    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "value1");
    assert.equal(p.param2, "value1");
    
    // ...
        
  });
  
  it("Generators for individual parameters yield for subsequent conditions and terminate when exhausted", () => {
    
    let c = parameterController({
      parameters: {
        param1: sequence(["value1","value2"])
      }
    })({
      // context
    });
    
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
    })({
      // context
    });
    
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
  
  // Automated expansion of recursive generators gives too little control, so is omitted for now
  /*
  it("Nested generators", () => {
    
    let c = parameterController({
      parameters: [
        {
          param1: sequence.loop([
            sequence.loop(["a","b"]),
            sequence.loop(["c","d"])
          ])
        }
      ]
    })({
      // context
    });
    
    let p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "a");
    
    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "c");

    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "b");

    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "d");

    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "a");

    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "c");

    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "b");

    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "d");

    // ...
        
  });
  
  it("Nested generators - 3 levels", () => {
    
    let c = parameterController({
      parameters: [
        {
          param1: sequence.loop([
            sequence.loop([
              sequence.loop(["a","b"]),
              sequence.loop(["c","d"])
            ]),
            sequence.loop([
              sequence.loop(["e","f"]),
              sequence.loop(["g","h"])
            ])
          ])
        }
      ]
    })({
      // context
    });
    
    let p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "a");
    
    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "e");

    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "c");

    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "g");

    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "b");

    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "f");

    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "d");

    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "h");

    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "a");

    p = c.nextCondition();
    assert(p);
    assert.equal(p.param1, "e");

    // ...
        
  });
  */
  
  it(".constantParameters() returns parameters constant for given context", () => {
    
    let c = parameterController({
      parameters: [
        {
          param1: "value1",               // static
          param2: "value2",               // static (overridden below)
          param3: "value3",               // static
          param4: ctx => ctx.context1,    // static
          param5: ctx => cnd => "value5", // dynamic
          param6: sequence(["a","b"])     // dynamic
        },
        ctx => ({                 // static
          param2: "value2.1",     // static
          param7: "value7"        // static
        }),
      ]
    })({
      // context
      context1: "context1",
      context2: "context2"
    });
    
    let p = c.nextCondition();
    assert(p);
    
    let cps = c.constantParameters();
    
    assert.deepEqual(Object.keys(cps), ["param1","param2","param3","param4","param7"]);
    assert.equal(cps.param1, "value1");
    assert.equal(cps.param2, "value2.1");
    assert.equal(cps.param3, "value3");
    assert.equal(cps.param4, "context1");
    assert.equal(cps.param7, "value7");

    // ...
        
  });
  
  it(".constantParameters() also contains parameters which are potentially overriden dynamically", () => {
    
    let c = parameterController({
      parameters: [
        {
          param1: "value1",               // static
          param2: "value2",               // static (overridden below)
          param3: "value3",               // dynamic (overridden below)
          param4: ctx => ctx.context1,    // static
          param5: ctx => cnd => "value5", // dynamic
          param6: sequence(["a","b"])     // dynamic
        },
        ctx => ({                 // static
          param2: "value2.1",     // static
          param7: "value7"        // static
        }),
        // this function invalidates all previous static parameters, as it may return any parameters dynamically!
        ctx => cnd => ({          // dynamic
          param3: "value3.1",     // dynamic
          param8: "value8"        // dynamic
        }),
        // same with an object-level generator
        sequence([{param9: "value9"},{param9: "value9.1"}]), // dynamic
        // these are the only static parameters remaining
        {
          param1: "value1.2",       // static
          param2: "value2.2",       // static 
          param5: "value5.2",       // static
        }
      ]
    })({
      // context
      context1: "context1",
      context2: "context2"
    });
    
    let p = c.nextCondition();
    assert(p);
    
    let cps = c.constantParameters();
    
    assert.deepEqual(Object.keys(cps).sort(), ["param1","param2","param3","param4","param5","param7"]);
    assert.equal(cps.param1, "value1.2");
    assert.equal(cps.param2, "value2.2");
    assert.equal(cps.param3, "value3");
    assert.equal(cps.param4, "context1");
    assert.equal(cps.param5, "value5.2");
    assert.equal(cps.param7, "value7");

    // ...
        
  });
  
  
});



