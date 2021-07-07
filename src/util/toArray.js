
function toArray(val) {
  if (val === undefined || val === null) return [];
  if (!Array.isArray(val)) return [val];
  return val;
}

module.exports = toArray;