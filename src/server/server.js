#!/usr/bin/env node

const path = require("path");
const { networkInterfaces } = require('os');

const rollup = require("rollup");
const rollupResolve = require("@rollup/plugin-node-resolve").nodeResolve;
const rollupCommonJS = require("@rollup/plugin-commonjs");
const rollupInject = require("@rollup/plugin-inject");
      
const mri = require("mri");
const express = require("express");
const nunjucks = require("nunjucks");
const socketio = require("socket.io");
const session = require("express-session");

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const Dimension = require("another-dimension");

const clientRoleMiddleware = require("./clientRoleMiddleware.js");
const MainExperimentController = require("./mainExperimentController.js");

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
  // TODO: this also suppresses module not found errors e.g. in tasks, which is not helpful!
  //'MODULE_NOT_FOUND': error => "No module found."
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
let experimentFullPath = null;
let experimentDirectory = null;

try {
  experimentFullPath = path.resolve(experimentFileName);
  experimentDirectory = path.dirname(experimentFullPath);
  experiment = require(experimentFullPath);
}
catch (e) {
  let msg = "Experiment could not be loaded " + (options._[0] ? ("from " + options._[0]) : " - no experiment file specified!")
  exitError(msg, e);
}

let serverConfig = null;

if (experiment.serverConfigFile) {
  serverConfig = require(path.resolve(experiment.serverConfigFile));
}

async function bundleClientCode(inputFileName, outputFileName, globalName) {
  
  let bundle = await rollup.rollup({
    input: inputFileName,
    external: ["fs/promises", "path", "shim-globals"],
    plugins: [
      rollupResolve({browser: true}),
      rollupCommonJS(),
      rollupInject({
        __dirname: ['shim-globals', 'dirname'],
        __filename: ['shim-globals', 'filename'],
      }),
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
      "path": "null",
      "shim-globals": "{dirname:'',filename:''}"
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
let templateDirs = [path.resolve("views"), path.join(__dirname, "../../views")];

if (serverConfig?.clients) {
  for (let client of Object.values(serverConfig.clients)) {
    if (client.templateDir) {
      templateDirs.push(client.templateDir);
    }
  }
}

nunjucks.configure(templateDirs, {
  express: app,
  autoescape: true
});

app.use('/static', express.static(path.join(__dirname, "../../static")));

function serveResources(resources) {
  
  if (!resources) return;
  
    if (!Array.isArray(resources)) resources = [resources];
    
    for (let res of resources) {
      
      if (Array.isArray(res)) {
        // recurse into sub-arrays - this makes collecting across tasks easier
        serveResources(res);
      }
      else if (typeof res == "string") {
        // resource specified as string is looked up relative to experiment dir, 
        // and served under that name
        let resolvedPath = path.resolve(experimentDirectory, res);
        console.log("Serving static: " + "/static/resource/" + res + " : " + resolvedPath);
        app.use("/static/resource/" + res, express.static(resolvedPath));
      }
      else if (res.path && res.id) {
        // resource specified with context uses specified context dir 
        let resolvedPath = path.resolve(res.context || experimentDirectory, res.path);
        console.log("Serving static: " + "/static/resource/" + res.id + " : " + resolvedPath);
        app.use("/static/resource/" + res.id, express.static(resolvedPath));
      }
      else {
        throw new Error("Cannot resolve resource specification " + res);
      }
    }
  
}

serveResources(experiment.resources);

for (let task of experiment.tasks) {
  serveResources(task.resources);
}

function ignoreFavicon(req, res, next) {
  if (req.originalUrl.endsWith('favicon.ico')) {
    res.status(204).end();
  }
  else {
    next();
  }
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
  
  function pad(str, size) {
    str = str + ""; // convert to string
    let padSize = size - str.length;
    return str + ("                                                    ".substring(0, padSize));
  }
  
  //console.log("\x1b[32m%s\x1b[0m", "Green");
  console.log("\x1b[32m\x1b[1m");  // output color to green
  console.log("******************************************************");
  console.log("** stimsrv server running on:                       **");
  
  for (let ip of ips) {
    let adrStr = "http://" + ip + ":" + port + "/";
    console.log("**   " + pad(adrStr, 47) + "**"); 
  }
  
  console.log("**                                                  **");  
  console.log("** Client IDs in this experiment:                   **"); 
  for (let client of (experiment.devices || [{id:"anyone"}])) {
    console.log("**  - " + pad(client.id, 46) + "**");
  }
  console.log("******************************************************");  
  console.log("\x1b[0m");   // reset output color
  
  if (options.open) {
    const open = require("open");
    let firstAdr = "http://" + ips[0] + ":" + port + "/";
    open(firstAdr);
  }
});


let controller = MainExperimentController(experiment, experiment.settings);

const adapters = {
  'browser': require("./clientAdapter/browser.js")(experiment, controller)
};

if (serverConfig?.clients) {
  for (let [type, client] of Object.entries(serverConfig?.clients)) {
    adapters[type] = client(experiment, controller);
  }
}

let clients = {};

controller.startExperiment();


let io = socketio(server, {serveClient: false }); // , transports: ["websocket"]

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

app.post("/setclientid", (req, res) => {
  if (req.body.clientid) {
    clientRoleMiddleware.setClientIdCookie(res, req.body.clientid); 
  }  
  res.redirect(req.body.next || "/");
});

app.post("/selectrole", (req, res) => {
  res.redirect("/?role=" + req.body.role);
});

app.get("*", (req, res) => {
    
  if (req.clientDevice && req.clientRole) {
    
    // allow override through query param
    let clientType = req.query.client || req.clientDevice.client || "browser";
    
    if (!clients[clientType]) {
      clients[clientType] = {};
    }
    
    let client = clients[clientType][req.clientDevice.id + "." + req.clientRole.role];
  
    // allow override through query param
    if (!client) {      
      client = adapters[clientType](req.clientDevice, req.clientRole);
      clients[clientType][req.clientDevice.id + "." + req.clientRole.role] = client;
      controller.addClient(client);
    }
    
    if (!client) {
      console.log(req.path);
      throw new Error("No client adapter found for client id '" + req.clientDevice.id + "'");
    }
    
    client.render(req, res);
    
    return;
    
  }
  
  console.log("No resource found for path " + req.path);
  res.status(404).send("Resource not found!")
  
});




