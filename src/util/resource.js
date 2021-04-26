

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

module.exports = resource;