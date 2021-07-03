
function pickProperties(obj, keys) {
  
  if (! (typeof obj == "object")) {
    return obj;
  }
  
  let result = {};
  for (let key of keys) {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

pickProperties.without = function(obj, omitKeys) {
  
  if (! (typeof obj == "object")) {
    return obj;
  }
  
  let result = {};
  for (let key of Object.keys(obj)) {
    if (!omitKeys.includes(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

module.exports = pickProperties;