
function pickProperties(obj, keys) {
  let result = {};
  for (let key of keys) {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

pickProperties.without = function(obj, omitKeys) {
  let result = {};
  for (let key of Object.keys(obj)) {
    if (!omitKeys.includes(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

module.exports = pickProperties;