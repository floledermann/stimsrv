let puppeteer = null;
try {
  puppeteer = require("puppeteer");
}
catch(e) {
  throw new Error("puppeteer must be installed manually to use this browser adapter!");
}

const stream = require("stream");

module.exports = function(experiment, controller) {
  
  return function(client, role) {
    
    let imageWidth = 200;
    let imageHeight = 200;
    
    if (client.imageSize) {
      let [w,h] = client.imageSize.split("x").map(n => +n);
      imageWidth = w || imageWidth;
      imageHeight = h || imageHeight;
    }
    //console.log(imageWidth);
    
    // we need these to keep track of the background color - this should be simplified
    let taskIndex = -1;
    let currentTaskUI = null;
    let currentDisplay = null;
    let currentContext = null;
    let currentCondition = null;
    let localContext = {
      clientid: client.id,
      device: client,
      role: role.role, // TODO: this should be the whole role object, but check/test this
    };
    
    let browserP = puppeteer.launch({
      defaultViewport: {
        width: imageWidth,
        height: imageHeight
      },
      headless: false
    });
    let pageP = null;
    let navP = null;

    browserP.then(browser => {
      pageP = browser.newPage();
      navP = pageP;
      navP.then(page => {
        navP = page.goto("http://localhost:8080/?clientId=" + client.id + "&role=" + role.role + "&client=browser");
      })
    });
    
    navP = browserP;
    
    //await browser.close();

    function warn(message, data) {
      controller.warn(message, data);
    }
    
    function showCondition(condition) {
      
      currentCondition = condition;
      
      update();
      
    }    
    
    function renderCurrentImage(response) {
      navP.then(() => pageP.then(page => {    
        page.screenshot({
        }).then(buffer => {
          console.log("Rendering image...");
          response.write(buffer, 'binary');
          response.end(null, 'binary');
        });
      }));
    }
    
    let updateResponse = null;
    let updated = false;
    
    function update() {
      if (updateResponse) {
        updateResponse.send("reload");
      }
      updateResponse = null;
    }
    
    return {
      message: function(type, data) {
        
        lastMessage = type;
        lastMessageData = data;
        
        if (type == "condition") {        
          showCondition(data.condition);
        }
        
        if (type == "task init") {
          
          taskIndex = data.taskIndex;
          currentContext = data.context;
          let fullContext = Object.assign({}, currentContext, localContext);
          
          currentTaskUI = experiment.tasks[data.taskIndex].ui(fullContext);
          currentDisplay = currentTaskUI.interfaces[role.role + ".display"] || currentTaskUI.interfaces["display"] || currentTaskUI.interfaces["*"];

          if (data.condition) {
            showCondition(data.condition);
          }
        }
      },
      
      render: function(req, res) {
        
        console.log("Request: " + req.path);
        
        if (req.path == "/image/") {
          renderCurrentImage(res); 
        }
        else if (req.path == "/update/") {
          if (updateResponse) {
            // abort old update
            updateResponse.send("");
          }
          updateResponse = res;
          if (!updated) {
            update();
          }
        }
        else {
          updated = true;
          res.render("experiment-simplebrowser.html", {
            message: lastMessage,
            data: lastMessageData,
            role: req.clientRole,
            imageSize: [imageWidth/(client.devicePixelRatio || 1), imageHeight/(client.devicePixelRatio || 1)],
            delay: experiment.settings.simpleBrowserRefresh || 5,
            backgroundColor: currentDisplay?.backgroundColor || "#000000",
            foregroundColor: currentDisplay?.foregroundColor || "#ffffff"
          });
        }
      }
      
    }
  }

}