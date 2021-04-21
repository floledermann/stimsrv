module.exports = function(experiment) {
  
  return function(client) {
    
    return {
      
      message: function(type, data) {
      },
      
      render: function(req, res) {
        res.render("experiment.html", {
          experiment: experiment,
          role: req.clientRole,
          device: req.clientDevice
        });
      }
      
    }
    
  }
  
}