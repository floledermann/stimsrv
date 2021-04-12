#!/usr/bin/env node

const path = require("path");
const { networkInterfaces } = require('os');

const rollup = require("rollup");
const rollupResolve = require("@rollup/plugin-node-resolve").nodeResolve;
const rollupCommonJS = require("@rollup/plugin-commonjs");
      
const mri = require("mri");
const express = require("express");
const nunjucks = require("nunjucks");
const socketio = require("socket.io");
const session = require("express-session");

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const Dimension = require("another-dimension");

const clientRoleMiddleware = require("./clientRoleMiddleware.js");
const MainExperimentController = require("../controller/mainExperimentController.js");

let options = mri(process.argv.slice(2), {
  boolean: ["open","verbose"],
  alias: {
    open: "o"
  },
  default: {
    port: 8080
  }
});

const errorHelpers = {
  'MODULE_NOT_FOUND': error => "No module found."
}

function exitError(message, error) {
  
  // https://stackoverflow.com/a/41407246/ for colors reference
  console.log("\x1b[31m\x1b[1m");  // output color to red
  
  console.error("\n" + message + "\n");
  
  console.log("\x1b[0m");   // reset output color
  
  let helper = errorHelpers[error.code];
  
  if (helper !== undefined) {
    if (helper) {
      console.error(helper(error) + "\n");
    }
    if (options.verbose) {
      throw error;
    }
  }
  else {
    throw error;
  }
  
  process.exit(1);
}

// you can also run stimsrv in a folder without specifying experiment, 
// in which case it will consider the local package as the experiment
let experimentFileName = options._[0] || ".";
if (!experimentFileName) {
  console.error("No experiment file specified - exiting!");
  process.exit(1);
}

let experiment = null;

try {
  experiment = require(path.resolve(experimentFileName));
}
catch (e) {
  let msg = "Experiment could not be loaded " + (options._[0] ? ("from " + options._[0]) : " - no experiment file specified!")
  exitError(msg, e);
}

async function bundleClientCode(inputFileName, outputFileName, globalName) {
  
  let bundle = await rollup.rollup({
    input: inputFileName,
    external: ["fs/promises", "path"],
    plugins: [
      rollupResolve({browser: true}),
      rollupCommonJS()
    ],
    onwarn: function(warning, rollupWarn) {
      // ignore waring for circular dependencies on d3
      let ignoredCircular = ["d3-interpolate"];
      if (warning.code == "CIRCULAR_DEPENDENCY" &&
        ignoredCircular.some(d => warning.importer.includes(d))) {
        return;
      }
      if (warning.code == "MISSING_NODE_BUILTINS" &&
        warning.modules?.includes("path")) {
        return;
      }
      debugger;
      rollupWarn(warning);
    }
  });
  
  await bundle.write({
    file: outputFileName,
    format: "iife",
    name: globalName,
    // remove node-specific libraries
    globals: {
      "fs/promises": "null",
      "path": "null"
    }
  }); 
  
  await bundle.close();
}

Promise.all([
  bundleClientCode(path.resolve(experimentFileName), path.join(__dirname, "../../static/experiment.js"), "experiment"),
  bundleClientCode(path.join(__dirname, "../client/browser/client-browser.js"), path.join(__dirname, "../../static/client-browser.js"), "stimsrvClient")
])
.then(() => {
  console.log("Bundled experiment code for browser at static/experiment.js.");
  console.log("Bundled client code for browser at static/client-browser.js.");
  console.log("Ready.");
  controller.reload();
});

const app = express();

app.locals.experiment = experiment;

Dimension.configure({ toJSON: d => d.toString() });
    
let controller = MainExperimentController(experiment, experiment.settings);
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
nunjucks.configure([path.resolve("views"), path.join(__dirname, "../../views")], {
  express: app,
  autoescape: true
});

app.use('/static', express.static(path.join(__dirname, "../../static")));

function ignoreFavicon(req, res, next) {
  if (req.originalUrl.endsWith('favicon.ico')) {
    res.status(204).end();
  }
  next();
}
app.use(ignoreFavicon);

app.use(clientRoleMiddleware(experiment));

let port = options.port || 8080;

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
  console.log("\x1b[32m\x1b[1m");  // output color to green
  console.log("******************************************************");
  console.log("** stimsrv server running on:                       **");
  
  for (ip of ips) {
    let adrStr = "http://" + ip + ":" + port + "/";
    let padSize = 47 - adrStr.length;
    let pad = "                                       ".substring(0, padSize);
    console.log("**   " + adrStr + pad + "**"); 
  }
  
  console.log("******************************************************");  
  console.log("\x1b[0m");   // reset output color
  
  if (options.open) {
    const open = require("open");
    let firstAdr = "http://" + ips[0] + ":" + port + "/";
    open(firstAdr);
  }
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
  
  socket.on("warning", (data) => {
    let message = data.message;
    delete data.message;
    controller.warn(message, data);
  });
  
  // "error" cannot be used as an event in socket.io 😳
  socket.on("clientError", (data) => {
    let message = data.message;
    delete data.message;
    controller.error(message, data);
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
  res.redirect("/?role=" + req.body.role);
});


