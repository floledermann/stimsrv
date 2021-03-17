#!/usr/bin/env node

const path = require("path");
const { networkInterfaces } = require('os');

const mri = require("mri");
const express = require("express");
const nunjucks = require("nunjucks");
const socketio = require("socket.io");
const session = require("express-session");

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const Dimension = require("another-dimension");

const clients = require("./src/clients/index.js");
const clientRoleMiddleware = require("./src/server/clientRoleMiddleware.js");
const MainExperimentController = require("./src/controller/mainExperimentController.js");

let options = mri(process.argv.slice(2));

let experimentFileName = options._[0] || ".";
if (!experimentFileName) {
  console.error("No experiment file specified - exiting!");
  process.exit(1);
}

const experiment = require(path.resolve(experimentFileName));

const app = express();

app.locals.experiment = experiment;

Dimension.configure({ toJSON: d => d.toString() });
    
let controller = MainExperimentController(experiment);
controller.startExperiment();

// is this still needed as a global?
//app.locals.clients = {};
//app.locals.roles = {};

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

// use current dir and stimsrv package relative as fallback path for templates
// TODO: should locating templates be an option on the experiment object?
nunjucks.configure([path.resolve("views"), path.join(__dirname, "views")], {
  express: app,
  autoescape: true
});

app.use('/static', express.static(path.join(__dirname, "static")));

app.use(clientRoleMiddleware(experiment));

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
  
  let client = {
    message: function(type, data) {
      socket.emit(type, data);
    }
  }
  
  controller.addClient(client);
  
  socket.on("broadcast", (data) => {
    io.sockets.emit("broadcast", data);
  });
  
  socket.on("calibrate time", (data) => {
    socket.emit("calibrate time response", {serverTimestamp: Date.now()});
  });
  
  socket.on("disconnect", (data) => {
    console.log("Client disconnected!");  
    controller.removeClient(client);
  });
  
  socket.on("response", (data) => {
    controller.response(data.response);
  });
  
  socket.onAny((messageType, data) => {
    console.log("Received message: " + messageType);
    console.log(data);
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


