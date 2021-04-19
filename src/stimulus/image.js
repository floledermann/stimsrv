
const valOrFunc = require("stimsrv/util/valOrFunc");

module.exports = function(config) {
  
  config = Object.assign({
    image: (condition, context) => condition.image,
    baseURL: "",
    style: {
      maxWidth: "100%",
      maxHeight: "100%",
    }
  }, config);
  
  let imgEl = null;
  let context = null;
  
  return {
    initialize: function(parent, stimsrv, _context) {
      context = _context;
      imgEl = parent.ownerDocument.createElement("img");
      parent.appendChild(imgEl);
    },
    render: function(condition) {
      Object.assign(imgEl.style, valOrFunc(config.style, condition, context));
      imgEl.src = valOrFunc(config.baseURL, condition, context) + valOrFunc(config.image, condition, context);
    }
  }
}
