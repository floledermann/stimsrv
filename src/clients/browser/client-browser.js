
const socketio = require("socket.io-client");

const timing = require("./browser/timing.js");

function connect() {
  
  const socket = socketio.connect();
  
  socket.onAny(handleIncomingEvent);

  timing(socket).calibrate({
    updateCallback: (durations, average) => console.log("Testing delay to server, average: " + average.toFixed(2) + "ms...")
  }).then(timestampAdjust => {
    console.log("Negotiated timestamp adjustment: " + timestampAdjust + "ms.");
  });
  
  
}

let eventSubscribers = {};

function handleIncomingEvent(eventType, data) {
  for (let cb of eventSubscribers[eventType]) {
    cb(data);
  }
}

function event(eventType, data) {
  socket.emit(eventType, data);
}

function subscribeEvent(eventType, callback) {
  if (!eventSubscribers[eventType]) {
    eventSubscribers[eventType] = [];
  }
  eventSubscribers[eventType].push(callback);
}

function next() {
}

function run(experiment) {
  
}

module.exports = {
  connect: connect,
  timing: timing,
  event: event,
  subscribeEvent: subscribeEvent,
  next: next,
  run: run
}