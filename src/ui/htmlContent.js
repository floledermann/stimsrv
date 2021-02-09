
module.exports = function(htmlString, options) {
  
  options = Object.assign({
    wrapperTag: "div",
    wrapperClass: null
  });
      
  return {
    initialize: function(_client, _parent, _document) {
    },
    
    // contract: if render() returns a string or element, then replace the parent content
    render: function(condition) {
      let start="", end="";
      if (options.wrapperTag) {
        start = "<" + options.wrapperTag + (options.wrapperClass ? ' class="' + options.wrapperClass + '"' : "") + ">";
        end = "</" + options.wrapperTag + ">";
      }
      return start + htmlString + end;
    }
  }
}