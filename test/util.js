"use strict";

const assert = require("assert");

const propertiesGenerator = require("../src/util/propertiesGenerator.js");
const valOrFunc = require("../src/util/valOrFunc.js");

describe("Utilities", () => {

  describe("propertiesGenerator", () => {

    it("Immediately completes when no iterable properties are found", () => {
      
      let gen = propertiesGenerator({ prop1: 1, prop2: "a", prop3: ["a","b"] });
      
      let result = gen.next();
      
      assert(result.done);   
      
    });

    it("Returns values for constants and iterators", () => {
      
      let gen = propertiesGenerator({ prop1: 1, prop2: "a", prop3: ["a","b"][Symbol.iterator]() });
      
      let result = gen.next();
      
      assert(!result.done);  
      assert(typeof result.value == "object");
      assert(Object.keys(result.value).length == 3);
      assert.equal(result.value.prop3, "a");     
      
    });

    it("Iterates over iterator properties, then completes", () => {
      
      let gen = propertiesGenerator({ prop1: 1, prop2: "a", prop3: ["a","b"][Symbol.iterator]() });
      
      let result = gen.next();     
      assert(!result.done);  
      assert.equal(result.value.prop3, "a");     
      
      result = gen.next();     
      assert(!result.done);  
      assert.equal(result.value.prop3, "b");     
      
      result = gen.next();     
      assert(result.done);     
      
    });

    it("Exhausted iterators are set to final value", () => {
      
      let iterator = function*() {
        yield "a";
        yield "b";
        return "end";
      };
      
      let gen = propertiesGenerator({ prop1: 1, prop2: "a", prop3: iterator() });
      
      let result = gen.next();     
      result = gen.next();     
      result = gen.next(); 
      
      assert(result.done); 
      assert.equal(result.value.prop1, 1);
      assert.equal(result.value.prop2, "a");
      assert.equal(result.value.prop3, "end");
      
    });

    it("Exhausted iterators are removed if final value is not present", () => {
      
      let gen = propertiesGenerator({ prop1: 1, prop2: "a", prop3: ["a","b"][Symbol.iterator]() });
      
      let result = gen.next();          
      result = gen.next();          
      result = gen.next();     
      
      assert(result.done); 
      assert.equal(result.value.prop1, 1);
      assert.equal(result.value.prop2, "a");
      assert.strictEqual(result.value.prop3, undefined);
      
    });


  });
  
  describe("valOrFunc", () => {

    it("Passes primitive value unchanged", () => {
       assert.equal(valOrFunc("a", {}), "a");   
       assert.equal(valOrFunc(1, {}), 1);   
       assert.deepEqual(valOrFunc([1,2], {}), [1,2]);   
    });

    it("Returns value for functions", () => {
       assert.equal(valOrFunc(() => "a"), "a");   
       assert.equal(valOrFunc(x => "a", "b"), "a");   
       assert.equal(valOrFunc(x => x, "b"), "b");   
       assert.equal(valOrFunc(x => x.prop1, {prop1: "a"}), "a");   
    });

    it("valOrFunc.allProperties", () => {
      let input = {
        a: "a",
        b: () => "b",
        c: x => x.prop1
      }
      
      let context = { prop1: "c" };
      
      assert.deepEqual(valOrFunc.allProperties(input, context), {"a":"a","b":"b","c":"c"});
      
    });


  });
  
});

