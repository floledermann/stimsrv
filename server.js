const path = require("path");

const mri = require("mri");
const express = require("express");
const nunjucks = require("nunjucks");
const socketio = require("socket.io");
const session = require("express-session");

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const clients = require("./src/clients/index.js");
const clientRoleMiddleware = require("./src/server/clientRoleMiddleware.js");

let options = mri(process.argv.slice(2));

let experimentFileName = options._[0];
if (!experimentFileName) {
  console.error("No experiment file specified - exiting!");
  process.exit(1);
}
const experiment = require(experimentFileName);

const app = express();

app.locals.experimentTimestamp = Date.now();
app.locals.clients = {};
app.locals.roles = {};

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

app.use(clientRoleMiddleware(experiment.roles));

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
  
  socket.on("calibrate time", (data) => {
    socket.emit("calibrate time response", {serverTimestamp: Date.now()});
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
  
  
  if (!req.clientRole || req.session.experimentTimestamp != req.app.locals.experimentTimestamp) {
    
    req.session.experimentTimestamp = req.app.locals.experimentTimestamp;
    
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
    });
    
    // make first role active if not otherwise determined
    if (!activeRole && potentialRoles.length) {
      activeRole = potentialRoles[0];
      potentialRoles.splice(0,1);
    }
    
    res.render("select_role.html", {
      experiment: experiment,
      ip: ip,
      clientid: req.clientId,
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


app.post("/selectrole", (req, res) => {
  if (req.body.clientid) {
    clientRoleMiddleware.setClientIdCookie(res, req.body.clientid); 
  }  
  
  let platform = "browser";
  let client = clients[platform];

  let selectedRole = req.body.role;
  
  res.redirect("/?role=" + req.body.role);
});


function matchDevice(req, device) {
  // IP trumps clientID setting
  if (device.ip) {
    if (device.ip == ".") {
      //console.log(req.socket.address().address);
      return (req.socket.remoteAddress == req.socket.address().address);
    }
    return (req.socket.remoteAddress.endsWith(device.ip));
  }
  return false;
}