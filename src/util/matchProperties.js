// Return true iff each entry in template has a matching entry in obj
function matchProperties(obj, template) {
  return Object.entries(template).every(([key, value]) => {
    // recurs arrays and objects
    if (Array.isArray(obj[key])) {
      return Array.isArray(value) && matchProperties(obj[key], value);
    }
    if (typeof obj[key] == "object") {
      return (typeof value == "object") && matchProperties(obj[key], value);
    }
    return obj[key] == value
  });
}

matchProperties.strict = function(obj, template) {
  return Object.entries(template).every(([key, value]) => obj[key] === value);
}

module.exports = matchProperties;