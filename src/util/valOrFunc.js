
function valOrFunc(arg) {
  if (typeof arg == "function") {
    return arg(Array.prototype.slice.call(arguments, 1));
  }
  return arg;
}

valOrFunc.array = function(arg) {
  let res = valOrFunc.call(arg, ...arguments);
  if (!Array.isArray(res)) return [res];
  return res;
}

module.exports = valOrFunc;