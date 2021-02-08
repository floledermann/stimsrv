(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.client = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const protocol = require("../protocol.js");

function clientFactory(socket) {
  return {
        
    calibrate: function(options) {
      
      options = Object.assign({
        iterations: 3,
        interval: 1000,
        initialWait: 3000,
        updateCallback: null
      }, options);
      
      return new Promise((resolve, reject) => {
        let durations = [];
        let lastTimestamp = null;

        function sendTime() {
          lastTimestamp = Date.now();
          socket.emit(protocol.CALIBRATE_TIME, {clientTimestamp: lastTimestamp});
        }
        
        socket.on(protocol.CALIBRATE_TIME_RESPONSE, (data) => {
          let duration = Date.now() - lastTimestamp;
          durations.push(duration);
          if (--options.iterations > 0) {
            setTimeout(sendTime, options.interval);
          }
          else {
            let timestampAdjust = data.serverTimestamp - lastTimestamp - Math.round(duration / 2);
            clientFactory.timestampAdjust = timestampAdjust;
            resolve(timestampAdjust);
            socket.emit(protocol.CALIBRATE_TIME_RESULT, {clientTimestampAdjust: timestampAdjust});
          }
          if (options.updateCallback) {
            options.updateCallback(durations, durations.reduce((a,b) => a+b, 0) / durations.length)
          }
        });

        setTimeout(sendTime, options.initialWait);
      });
    }
  }
}

module.exports = clientFactory;
},{"../protocol.js":2}],2:[function(require,module,exports){
module.exports = {
  CALIBRATE_TIME: "calibrate time",
  CALIBRATE_TIME_RESPONSE: "calibrate time response",
  CALIBRATE_TIME_RESULT: "calibrate time result"
}
},{}],"client":[function(require,module,exports){
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
},{"./browser/timing.js":1}]},{},[])("client")
});
