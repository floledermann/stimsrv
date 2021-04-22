
const valOrFunc = require("stimsrv/util/valOrFunc");

module.exports = function(config) {
  
  config = Object.assign({
    image: (condition, context) => condition.image,
    baseURL: "",
    style: {
      maxWidth: "100%",
      maxHeight: "100%",
    },
    fullscreen: false
  }, config);
  
  let imgEl = null;
  let context = null;
  
  return {
    initialize: function(parent, stimsrv, _context) {
      context = _context;
      imgEl = parent.ownerDocument.createElement("img");
      parent.appendChild(imgEl);
      
      if (config.fullscreen) {
        let fsButton = parent.ownerDocument.createElement("button");
        fsButton.textContent = "Fullscreen";
        Object.assign(fsButton.style, {
          position: "absolute",
          top: "0.3em",
          right: "0.3em"
        });
        fsButton.addEventListener("click", function() {
          imgEl.requestFullscreen({
            navigationUI: "hide"
          });
        });
        parent.appendChild(fsButton);
      }
    },
    render: function(condition) {
      Object.assign(imgEl.style, valOrFunc(config.style, condition, context));
      imgEl.src = valOrFunc(config.baseURL, condition, context) + valOrFunc(config.image, condition, context);
    }
  }
}
