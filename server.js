const path = require("path");
const { networkInterfaces } = require('os');

const mri = require("mri");
const express = require("express");
const nunjucks = require("nunjucks");
const socketio = require("socket.io");
const session = require("express-session");

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const clients = require("./src/clients/index.js");
const clientRoleMiddleware = require("./src/server/clientRoleMiddleware.js");
const nextOnResponse = require("./src/controller/nextOnResponse.js");

let options = mri(process.argv.slice(2));

let experimentFileName = options._[0];
if (!experimentFileName) {
  console.error("No experiment file specified - exiting!");
  process.exit(1);
}

function requireUncached(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
}

const experiment = requireUncached(experimentFileName);

experiment.storage.getNextParticipantId();

const app = express();

app.locals.experimentTimestamp = Date.now();
app.locals.clients = {};
app.locals.roles = {};
app.locals.experiment = experiment;
app.locals.experimentIndex = 0;
app.locals.currentExperiment = experiment.experiments[0];
app.locals.currentController = app.locals.currentExperiment.controller();
app.locals.currentCondition = app.locals.currentController.nextCondition();
app.locals.currentResponse = null;
app.locals.conditions = [];
app.locals.responses = [];

app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  secret: 'stimsrv',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // store for one week - session invalidation is done by server logic
  }
}));

nunjucks.configure('views', {
  express: app,
  autoescape: true
});

app.use('/static', express.static(path.join(__dirname, "static")));

app.use(clientRoleMiddleware(experiment.roles, experiment.devices));

let port = 8080;

let server = app.listen(port, () => {
  
  const networks = networkInterfaces();
  const ips = [];

  for (const name of Object.keys(networks)) {
    for (const net of networks[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }  
    
  //console.log("\x1b[32m%s\x1b[0m", "Green");
  // https://stackoverflow.com/a/41407246/ for colors reference
  console.log("\x1b[32m\x1b[1m");  // output color to green
  console.log("******************************************************");
  //console.log("**                                                  **");
  console.log("** stimsrv server running on:                       **");
  ips.forEach(ip => {
    let adrStr = "http://" + ip + ":" + port + "/";
    let padSize = 47 - adrStr.length;
    let pad = "                                       ".substring(0, padSize);
    console.log("**   " + adrStr + pad + "**"); 
  });
  //console.log("**                                                  **");
  console.log("******************************************************");  
  console.log("\x1b[0m");   // reset output color
});

let io = socketio(server, {serveClient: false});

io.on("connection", (socket) => {
  console.log("New user connected");
  
  socket.on("broadcast", (data) => {
    io.sockets.emit("broadcast", data);
  });
  
  socket.on("calibrate time", (data) => {
    socket.emit("calibrate time response", {serverTimestamp: Date.now()});
  });
  
  socket.on("disconnect", (data) => {
    console.log("Client disconnected!");  
  });
  
  socket.onAny((messageType, data) => {
    //console.log("Received message: " + messageType);
    //console.log(data);
    if (messageType == "response") {
      app.locals.currentResponse = data.response;
      app.locals.responses.push(app.locals.currentResponse);
      app.locals.currentCondition = app.locals.currentController.nextCondition(
        app.locals.currentCondition,
        app.locals.currentResponse,
        app.locals.conditions,
        app.locals.responses
      );
      if (app.locals.currentCondition) {
        app.locals.conditions.push(app.locals.currentCondition);
        io.sockets.emit("condition", {
          experimentIndex: app.locals.experimentIndex,
          condition: app.locals.currentCondition,
        });
      }
      else {
        app.locals.experimentIndex++;
        
        if (app.locals.experimentIndex == app.locals.experiment.experiments.length) {
          app.locals.experimentIndex = 0;
          // TODO: control looping behaviour, store data etc.
        }
        
        if (app.locals.experimentIndex < app.locals.experiment.experiments.length) {
          
          console.log("Next Experiment: " + app.locals.experimentIndex);
          
          app.locals.currentExperiment = app.locals.experiment.experiments[app.locals.experimentIndex];
          app.locals.responses = [];
          app.locals.conditions = [];
          app.locals.currentResponse = null;
          // default controller
          app.locals.currentController = app.locals.currentExperiment.controller() || nextOnResponse();
          app.locals.currentCondition = app.locals.currentController.nextCondition(
            app.locals.currentCondition,
            app.locals.currentResponse,
            app.locals.conditions,
            app.locals.responses
          );
          io.sockets.emit("experiment start", {
            experimentIndex: app.locals.experimentIndex,
            condition: app.locals.currentCondition
          });
        }
        else {
          // end of experiment
          io.sockets.emit("experiment end");
        }
      }
      // send raw response to all clients?
    }
  });
  
  socket.emit("experiment start", {
    experimentIndex: app.locals.experimentIndex,
    condition: app.locals.currentCondition
  });
  
});

app.get("/", (req, res) => {
  res.render("experiment.html", {
    experiment: experiment,
    role: req.clientRole,
    device: req.clientDevice
  });
  
});


app.post("/setclientid", (req, res) => {
  if (req.body.clientid) {
    clientRoleMiddleware.setClientIdCookie(res, req.body.clientid); 
  }  
  res.redirect(req.body.next || "/");
});

app.post("/selectrole", (req, res) => {
  
  let platform = "browser";
  let client = clients[platform];

  let selectedRole = req.body.role;
  
  res.redirect("/?role=" + req.body.role);
});


