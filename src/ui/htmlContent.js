
module.exports = function(htmlString, options) {
  
  options = Object.assign({
    wrapperTag: "div",
    wrapperClass: "content",
    style: null
  }, options);
  
  let parent = null;
  let document = null;
  
  return {
    initialize: function(_parent) {
      parent = _parent;
      document = parent.ownerDocument;
    },
    
    // contract: if render() returns a string or element, then replace the parent content
    render: function(condition) {
      
      let wrapper = document.createElement(options.wrapperTag || "div");
      
      if (options.wrapperClass) wrapper.className = options.wrapperClass;
      if (options.style) parent.style.cssText = options.style;
      
      wrapper.innerHTML = htmlString;
      
      parent.innerHTML = "";
      parent.appendChild(wrapper);
    }
  }
}