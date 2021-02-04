const path = require("path");

const express = require("express");
const nunjucks = require("nunjucks");
const socketio = require("socket.io");
const session = require("express-session");

const experiment = require("./experiment.js");

const app = express();

app.locals.experimentTimestamp = Date.now();

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

let server = app.listen(8080);

let io = socketio(server);

io.on("connection", (socket) => {
  console.log("New user connected");
  
  socket.on("bang", (data) => {
    io.sockets.emit("bang", {});
  });
  
  socket.on("disconnect", (data) => {
    console.log("Client disconnected!");
    
  });
});


let devicesById = {};

experiment.devices.forEach( d => {
  if (d.id) devicesById[d.id] = d
});

app.get("/", (req, res) => {
  if (!req.session.roles || req.session.experimentTimestamp != req.app.locals.experimentTimestamp) {
    
    req.session.experimentTimestamp = req.app.locals.experimentTimestamp;
    req.session.roles = ["display"];
    
    // figure out which role the client has
    let ip = req.socket.remoteAddress;
    
    let activeRole = null;
    let potentialRoles = [];
    
    for (let d of experiment.devices) {
      if (matchDevice(req, d)) {
        req.session.device = d;
        break;
      }
    }
    
    experiment.roles.forEach( rolespec => { 
    
      if (!Array.isArray(rolespec.role)) {
        rolespec.role = [rolespec.role];
      }
      
      let roles = rolespec.role;
      
      if (rolespec.device == "*") {
        potentialRoles.push(rolespec);
      }
      else {
        let device = devicesById[rolespec.device];
        if (device && device.id == req.session?.device?.id) {
          if (!activeRole) {
            activeRole = rolespec;
          }
          else {
            potentialRoles.push(rolespec);
          }
        }
      }
    })
    
    res.render("select_role.html", {
      experiment: experiment,
      ip: ip,
      potentialRoles: potentialRoles,
      activeRole: activeRole,
      device: req.session.device
    });
    
    return;
  }
  res.render("experiment.html", {
    experiment: experiment,
    roles: req.session.roles
  });
  
});

function matchDevice(req, device) {
  if (device.ip) {
    if (device.ip == ".") {
      //console.log(req.socket.address().address);
      return (req.socket.remoteAddress == req.socket.address().address);
    }
    return (req.socket.remoteAddress.endsWith(device.ip));
  }
  return false;
}