
function propOrFunc(prop, ...args) {
  if (typeof prop == "function") {
    return prop.apply(null, args);
  }
  return args[0][prop];
}

propOrFunc.ignoreCase = function(prop, ..args) {
  if (typeof prop == "function") {
    return prop.apply(null, args);
  }
  for (let key in Object.keys(args[0]) {
    if (key.equalsIgnoreCase(prop)) {
      return args[0][key];
    }
  }
}

module.exports = propOrFunc;