
module.exports = function(htmlString, options) {
  
  options = Object.assign({
    wrapperTag: "div",
    wrapperClass: null
  });
  
  let parent = null;
  
  return {
    initialize: function(_client, _parent, _document) {
      parent = _parent;
    },
    
    // contract: if render() returns a string or element, then replace the parent content
    render: function(condition) {
      let start="", end="";
      if (options.wrapperTag) {
        start = "<" + options.wrapperTag + (options.wrapperClass ? ' class="' + options.wrapperClass + '"' : "") + ">";
        end = "</" + options.wrapperTag + ">";
      }
      parent.innerHTML = start + htmlString + end;
    }
  }
}