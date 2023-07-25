"use strict";

const assert = require("assert");

const sequence = require("../src/controller/sequence.js");
const random = require("../src/controller/random.js");
const count = require("../src/controller/count.js");

describe("Iterators", () => {

  describe("sequence", () => {

    it("Iterates over provided items once", () => {
      
      let iter = sequence([1,2,3])();
      
      let next = iter.next();
      assert.equal(next.value, 1);
      assert(!next.done);
      
      next = iter.next();
      assert.equal(next.value, 2);
      assert(!next.done);

      next = iter.next();
      assert.equal(next.value, 3);
      assert(!next.done);

      next = iter.next();
      assert(next.done);
      assert.strictEqual(next.value, undefined);   

      next = iter.next();
      assert(next.done);
      assert.strictEqual(next.value, undefined);   
      
    });


    it("Exposes items", () => {
      
      let iter = sequence([1,2,3])();
      
      assert.deepEqual(iter.items, [1,2,3]);
      
    });


    it("Repeat each item options.stepCount times", () => {
      
      let iter = sequence([1,2,3],{stepCount: 2})();
      
      let next = iter.next();
      assert.equal(next.value, 1);
      assert(!next.done);
      
      next = iter.next();
      assert.equal(next.value, 1);
      assert(!next.done);
      
      next = iter.next();
      assert.equal(next.value, 2);
      assert(!next.done);

      next = iter.next();
      assert.equal(next.value, 2);
      assert(!next.done);

      next = iter.next();
      assert.equal(next.value, 3);
      assert(!next.done);

      next = iter.next();
      assert.equal(next.value, 3);
      assert(!next.done);

      next = iter.next();
      assert(next.done);
      assert.strictEqual(next.value, undefined);   
      
    });


    it("Loop endlessly if options.loop is set, or sequence.loop", () => {
      
      function checkLoop(iter) {
        let next = iter.next();
        assert.equal(next.value, 1);
        assert(!next.done);
        
        next = iter.next();
        assert.equal(next.value, 2);
        assert(!next.done);
        
        next = iter.next();
        assert.equal(next.value, 1);
        assert(!next.done);

        next = iter.next();
        assert.equal(next.value, 2);
        assert(!next.done);

        next = iter.next();
        assert.equal(next.value, 1);
        assert(!next.done);

        next = iter.next();
        assert.equal(next.value, 2);
        assert(!next.done);
      }
      
      checkLoop(sequence([1,2],{loop:true})());
      checkLoop(sequence.loop([1,2])());

    });


    it("Loop options.loopCount times if set", () => {
      
      let iter = sequence([1,2],{loop:true, loopCount: 2})();
      
      let next = iter.next();
      assert.equal(next.value, 1);
      assert(!next.done);
      
      next = iter.next();
      assert.equal(next.value, 2);
      assert(!next.done);
      
      next = iter.next();
      assert.equal(next.value, 1);
      assert(!next.done);

      next = iter.next();
      assert.equal(next.value, 2);
      assert(!next.done);

      next = iter.next();
      assert(next.done);
      assert.strictEqual(next.value, undefined);   
      
    });
    
    it("Function items are initialized with context object once at start", () => {
      
      let iter = sequence([c => c.val1, c => c.val2, c => Math.random()],{loop:true})({
        val1: "a",
        val2: "b"
      });
      
      let next = iter.next();
      assert.equal(next.value, "a");
      assert(!next.done);
      
      next = iter.next();
      assert.equal(next.value, "b");
      assert(!next.done);
      
      next = iter.next();
      let rnd = next.value;
      assert.equal(typeof next.value, "number");
      assert(!next.done);

      next = iter.next();
      assert.equal(next.value, "a");
      assert(!next.done);

      next = iter.next();
      assert.equal(next.value, "b");
      assert(!next.done);
      
      // thrid item must return same (random) value as on first call
      next = iter.next();
      assert.equal(next.value, rnd);
      assert(!next.done);
      
      next = iter.next();
      assert.equal(next.value, "a");
      assert(!next.done);

      // ...

    });  

    it("Modifying result object doesn't modify generator items", () => {
      
      let iter = sequence([{ val: 1 }, { val: 2 }],{loop:true})();
      
      let next = iter.next().value;
      assert.equal(next.val, 1);
      next.val = 99;
      assert.equal(next.val, 99);
      
      next = iter.next().value;
      assert.equal(next.val, 2);
      next.val = 99;
      assert.equal(next.val, 99);
      
      next = iter.next().value;
      assert.equal(next.val, 1);

      next = iter.next().value;
      assert.equal(next.val, 2);


    });  
    
    it("Iterator items are processed recursively", () => {
      
      let iter = sequence([sequence([1,2]), sequence([3,4])], {loop:true})();
      
      let next = iter.next().value;
      assert.equal(next, 1);
      
      next = iter.next().value;
      assert.equal(next, 2);
      
      next = iter.next().value;
      assert.equal(next, 3);

      next = iter.next().value;
      assert.equal(next, 4);
      
      next = iter.next().value;
      assert.equal(next, 1);
      
      next = iter.next().value;
      assert.equal(next, 2);
      
    });


  });


  describe("random.pick", () => {

    it("returns items from set", () => {
      
      let values = [1,2,3];

      let iter = random.pick(values)();
         
      let next = iter.next();
      assert(values.includes(next.value));
      assert(!next.done);
      
      next = iter.next();
      assert(values.includes(next.value));
      assert(!next.done);
      
      next = iter.next();
      assert(values.includes(next.value));
      assert(!next.done);
          
      next = iter.next();
      assert(values.includes(next.value));
      assert(!next.done);
          
      next = iter.next();
      assert(values.includes(next.value));
      assert(!next.done);
          
    });
    
    it("returns itemsCount items", () => {
      
      let values = [1,2,3];

      let iter = random.pick(values, {itemCount: 5})();
      
      
      let next = iter.next();
      assert(values.includes(next.value));
      assert(!next.done);
      
      next = iter.next();
      assert(values.includes(next.value));
      assert(!next.done);
      
      next = iter.next();
      assert(values.includes(next.value));
      assert(!next.done);
          
      next = iter.next();
      assert(values.includes(next.value));
      assert(!next.done);
          
      next = iter.next();
      assert(values.includes(next.value));
      assert(!next.done);
          
      next = iter.next();
       assert(next.done);
       
    });

  });

  describe("random.shuffle", () => {

    it("shuffles items", () => {
      let iter = random.shuffle([1,2,3])();
      
      let values = [1,2,3];
      
      let next = iter.next();
      assert(values.includes(next.value));
      assert(!next.done);
      values = values.filter(v => v != next.value); 
      
      next = iter.next();
      assert(values.includes(next.value));
      assert(!next.done);
      values = values.filter(v => v != next.value); 
      
      next = iter.next();
      assert(values.includes(next.value));
      assert(!next.done);
      values = values.filter(v => v != next.value); 

      assert.equal(values.length, 0);

      next = iter.next();
      assert(next.done);
      assert.strictEqual(next.value, undefined);   
          
    });
    
    it("each item's position has roughly equal probability", () => {
      
      let order = {
        a: [0,0,0,0],
        b: [0,0,0,0],
        c: [0,0,0,0],
        d: [0,0,0,0]
      }
      
      for (let i=0; i<1000; i++) {
        let iter = random.shuffle(["a","b","c","d"])();
        for (let pos=0; pos<4; pos++) {
          let next = iter.next();
          order[next.value][pos]++;
        }
      }
      
      for (let item of ["a","b","c","d"]) {
        for (let pos=0; pos<4; pos++) { 
          assert(order[item][pos] > 200);
          assert(order[item][pos] < 300);
        }          
      }
    });

  });

});

