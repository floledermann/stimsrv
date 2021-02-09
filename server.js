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
app.locals.experiment = experiment;

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

let server = app.listen(8080);

let io = socketio(server, {serveClient: false});

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

app.get("/", (req, res) => {
  res.render("experiment.html", {
    experiment: experiment,
    roles: req.session.roles
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


