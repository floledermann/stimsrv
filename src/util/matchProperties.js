// Return true iff each entry in template has a matching entry in obj
function matchProperties(obj, template) {
  return Object.entries(template).every(([key, value]) => obj[key] == value);
}

matchProperties.strict = function(obj, template) {
  return Object.entries(template).every(([key, value]) => obj[key] === value);
}

module.exports = matchProperties;