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

module.exports = warnDefaults;