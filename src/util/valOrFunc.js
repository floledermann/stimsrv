
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

module.exports = valOrFunc;