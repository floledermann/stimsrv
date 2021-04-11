function warnDefaults(warningFunction, object, defaults) {
  
  for (let key of Object.keys(defaults)) {
    if (! (key in object)) {
      //warningFunction("No value for " + key + " provided, using default of " + defaults[key] + "!");
      //object[key] = defaults[key];
      let val = defaults[key];
      Object.defineProperty(object, key, { get: function() {
        warningFunction("No value for " + key + " provided, using default of " + defaults[key] + ".");
        return val;
      } });
    }
  }
  
  return object;
}

// treat this with caution - this will not work for boolean operations on falsy (false, 0, etc.) values!
// (since the object is always truthy)

warnDefaults.value = function(warningFunction, name, defaultValue) {
  let warned = false;
  return {
    valueOf: function() {
      if (!warned) {
        warningFunction("No value for " + name + " provided, using default of " + defaultValue + ".");
        warned = true;
      }
      return defaultValue;
    }
  }
}

module.exports = warnDefaults;