// This relies on budled socket.io - consider requiring "socket.io-client"
// https://socket.io/docs/v3/client-installation/
// const io = require("socket.io-client");
const socketio = io(); 

const timing = require("./browser/timing.js");

function connect() {
  
  const socket = socketio.connect();
  
  timing(socket).calibrate({
    updateCallback: (durations, average) => console.log("Testing delay to server, average: " + average.toFixed(2) + "ms...")
  }).then(timestampAdjust => {
    console.log("Negotiated timestamp adjustment: " + timestampAdjust + "ms.");
  });
}

module.exports = {
  connect: connect,
  timing: timing
}