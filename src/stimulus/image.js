
const valOrFunc = require("stimsrv/util/valOrFunc");

module.exports = function(config) {
  
  config = Object.assign({
    image: condition => condition.image,
    baseURL: "",
    style: {
      maxWidth: "100%",
      maxHeight: "100%",
    },
    fullscreen: false
  }, config);
  
  let imgEl = null;
  let context = null;
  let parent = null;
  
  return {
    initialize: function(_parent, stimsrv, _context) {
      context = _context;
      parent = _parent;
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
      
      let baseURL = condition.baseURL || valOrFunc(config.baseURL, condition);
      if (!(baseURL.endsWith("/"))) baseURL += "/";
      
      Object.assign(imgEl.style, (condition.style || valOrFunc(config.style, condition)));
      
      imgEl.src = baseURL + (condition.image || valOrFunc(config.image, condition));
      
      parent.style.backgroundColor = condition.background || "#000000";
                  
    }
  }
}
