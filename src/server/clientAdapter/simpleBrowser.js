module.exports = function(experiment) {
  
  return function(client) {
    
    let lastMessage = null;
    let lastMessageData = null;
    
    return {
      message: function(type, data) {
        lastMessage = type;
        lastMessageData = data;
      },
      render: function(req, res) {
        res.render("experiment-simplebrowser.html", {
          message: lastMessage,
          data: lastMessageData
        });
      }
    }
  }

}