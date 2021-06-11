
function valOrFunc(arg, ...args) {
  if (typeof arg == "function") {
    return arg.apply(null, args);
  }
  return arg;
}

// auto-wrap single item as an array
valOrFunc.array = function(arg) {
  let res = valOrFunc.apply(null, arguments);
  if (!Array.isArray(res)) return [res];
  return res;
}

// apply valOrFunc to all properties of an object
valOrFunc.allProperties = function(arg, ...args) {
  let result = {};
  for (let key of Object.keys(arg)) {
    result[key] = valOrFunc.call(null, arg[key], ...args);
  }
  return result;
}

// apply valOrFunc to some properties of an object, others are copied as value
valOrFunc.properties = function(arg, propertyNames, ...args) {
  let result = {};
  for (let key of Object.keys(arg)) {
    if (propertyNames.includes(key)) {
      result[key] = valOrFunc.call(null, arg[key], ...args);
    }
    else {
      result[key] = arg[key];
    }
  }
  return result;
}

module.exports = valOrFunc;