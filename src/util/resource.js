

function resource(id, path, context) {
  return {
    id: id,
    path: path,
    context: context,
  }
}

resource.url = function(spec) {
  return "/static/resource/" + (spec.id || spec);
}

resource.path = function(spec) {
  return (spec.path || spec);
}

module.exports = resource;