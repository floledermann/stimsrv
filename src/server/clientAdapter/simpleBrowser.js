module.exports = function(experiment) {
  
  return {
    render: function(req, res) {
      res.render("experiment-simplebrowser.html", {
        experiment: experiment,
        role: req.clientRole,
        device: req.clientDevice
      });
    }
  }

}