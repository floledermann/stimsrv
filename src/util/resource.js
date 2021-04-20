

function resource(id, path, context) {
  return {
    id: id,
    path: path,
    context: context,
  }
}

module.exports = resource;