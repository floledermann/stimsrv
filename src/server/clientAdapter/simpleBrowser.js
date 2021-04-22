
const deepEqual = require("fast-deep-equal");

const warnDefaults = require("../../util/warnDefaults.js");

module.exports = function(experiment, controller) {
  
  return function(client, role) {
    
    let lastMessage = null;
    let lastMessageData = null;
    
    let taskIndex = -1;
    let currentTaskUI = null;
    let currentContext = null;
    let currentCondition = null;
    
    let localContext = {
      clientid: client.id,
      device: client,
      role: role, 
    };

    function getResourceURL(id, path) {
      return "/static/resources/" + id + "/" + path;
    }
    
    function warn(message, data) {
      controller.warn(message, data);
    }
    
    function showCondition(task, condition) {
      
      currentCondition = condition;
      
      let uiOptions = Object.assign({
        pixeldensity: warnDefaults.value(warn, "pixeldensity", 96),
        gamma: warnDefaults.value(warn, "gamma", 2.2),
        viewingdistance: warnDefaults.value(warn, "viewingdistance", 600),
        ambientIntensity: warnDefaults.value(warn, "ambientIntensity", 1/100)
      }, client);
        
      // set callback functions
      Object.assign(uiOptions, {
        warn: warn,
        event: function(event){ warn("Events are not supported in browser-simple client"); },
        response: function(response){ warn("Responses generated by UI are not supported in browser-simple client"); },
        getResourceURL: getResourceURL
      })
            
      for (let ui of role.interfaces) {     
        // setup new ui
        ui = task.interfaces[role.role + "." + ui]
             || task.interfaces[ui]
             || task.interfaces[role.role + ".*"]
             || task.interfaces["*"];
             
        if (ui) {
          if (!ui.renderToCanvas) {
            warn("Task is missing renderToCanvas() method required for rendering for browser-simple.")
          }
          else {
            ui.renderToCanvas(ctx, currentCondition, currentContext, uiOptions);
          }
        }
      }      
      
    }    
    
    return {
      message: function(type, data) {
        lastMessage = type;
        lastMessageData = data;
        
        if (type == "condition") {        
          if (currentTaskUI === null || data.taskIndex != taskIndex || !deepEqual(currentContext, data.context)) {          
            throw new Error("Task condition without initialization", data);           
          }
          showCondition(currentTaskUI, data.condition);
        }
        
        if (type == "task init") {
          
          taskIndex = data.taskIndex;
          currentContext = data.context;
          let fullContext = Object.assign({}, currentContext, localContext);
          
          currentTaskUI = experiment.tasks[data.taskIndex].ui(fullContext);

          if (data.condition) {
            showCondition(currentTaskUI, data.condition);
          }
        }
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