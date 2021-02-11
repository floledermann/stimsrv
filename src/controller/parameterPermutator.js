module.exports = function(spec, options) {
  /*
  Create an iterator, generating permutations of parameter objects.
  spec is an object with one entry for each key the generated objects should have.
  Entries can be:
  - individual non-iterable or string values will be present in each output object
  - an iterable (e.g. Array) with a list of values which will be used to permutate the output objects
  - an Array of iterables [<iterator>,<iterator>,...] which defines several "levels" of iteration. 
  */
  
  options = Object.assign({
    permutateKeys: Object.keys(spec).sort(),
    levelCallback: null
  },options);
  
  // we need to process in reverse order for intuitive results
  let keyOrder = options.permutateKeys.slice().reverse();
  
  let maxLevel = 1;
  for (let key of options.permutateKeys) {
    // convert single spec objects to Array
    if (!Array.isArray(spec[key])) {
      spec[key] = [spec[key]];
    }
    // probe first element
    // if it's not an iterator, then assume spec is an array of values
    // instead of iterables and wrap in another Array
    if (spec[key].length > 0 && (typeof spec[key][0] == 'string' || !(typeof spec[key][0][Symbol.iterator] == 'function'))) {
      spec[key] = [spec[key]];
    }
    if (spec[key].length > maxLevel) {
      maxLevel =spec[key].length;
    }
  }
  
  function* recurseRangedParameters(level, parIdx, parameterValues) {
    
    if (parIdx >= keyOrder.length) {
      // go to next "level"
      if (level > 1) {
        if (options.levelCallback) {
          options.levelCallback(level-1);
        }
        yield* recurseRangedParameters(level-1, 0, parameterValues);
      }
      else {
        // at end of parameter list - yield result
        
        let result = Object.assign({}, spec, parameterValues);
        
        if (true || options.debug) {
          console.log("Yielding parameters:");
          console.log(result);
        }
        
        // merge static parameters with current parameter values
        yield result;
      }
    }
    else {
      // process current level
      let parameterName = keyOrder[parIdx];
      // this contains the list of values at current "level"
      if (parameterName && spec[parameterName].length <= level) {
        
        let currentIterator = spec[parameterName][level-1];
        
        for (let val of currentIterator) {
          parameterValues[parameterName] = val;
          yield* recurseRangedParameters(level, parIdx+1, parameterValues);
        }
      }
      else {
        // pass-thru to next parameter
        yield* recurseRangedParameters(level, parIdx+1, parameterValues);
      } 
    }
  }
  
  return recurseRangedParameters(maxLevel, 0, {});
  
}

