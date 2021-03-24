function warnDefaults(warningFunction, object, defaults) {
  
  for (let key of Object.keys(defaults)) {
    if (! key in object) {
      warningFunction("No value for " + key + " provided, using default of " + defaults[key] + "!");
    }
    object[key] = defaults[key];
  }
  
  return object;
}

module.exports = warnDefaults;