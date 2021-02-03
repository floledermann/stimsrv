import express from "express";
import nunjucks from "nunjucks";
import { Server as SocketIO } from "socket.io";

const app = express();

import experiment from "./experiment.js";

nunjucks.configure('views', {
  express: app,
  autoescape: true
});

app.use(express.static("static"));

let server = app.listen(8080);

let io = new SocketIO(server);

io.on("connection", (socket) => {
  console.log("New user connected");
  
  socket.on("bang", (data) => {
    console.log("Bang!");
    io.sockets.emit("bang", {});
  });
});


let devicesById = {};

experiment.devices.forEach( d => {
  if (d.id) devicesById[d.id] = d
});

app.get("/", (req, res) => {
  // figure out which role the client has
  let ip = req.socket.remoteAddress;
  
  let activeRoles = new Set();
  let potentialRoles = new Set();
  
  experiment.roles.forEach( r => {  
    let roles = r.role;
    if (!Array.isArray(roles)) {
      roles = [roles];
    }      
    if (r.id == "*") {
      roles.forEach(r => potentialRoles.add(r));
    }
    else {
      let device = devicesById[r.id];
      if (device && matchDevice(req, device)) {
        roles.forEach(r => activeRoles.add(r));
      }
    }
  })
  
  activeRoles.forEach( r => {
    potentialRoles.delete(r);
  });
  
  res.render("index.html", {
    ip: ip,
    potentialRoles: potentialRoles,
    activeRoles: activeRoles
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