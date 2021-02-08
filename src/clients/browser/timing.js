const protocol = require("./protocol.js");

function client(socket) {
  return {
    calibrate: function(iterations=3, interval=1000, initialWait=3000, updateCallback=null) {
      return new Promise((resolve, reject) => {
        let durations = [];
        let lastTimestamp = null;
        let timestampAdjust = 0;

        function sendTime() {
          lastTimestamp = Date.now();
          socket.emit(protocol.CALIBRATE_TIME, {clientTimestamp: lastTimestamp});
        }
        
        socket.on(protocol.CALIBRATE_TIME_RESPONSE, (data) => {
          let duration = Date.now() - lastTimestamp;
          durations.push(duration);
          if (--iterations > 0) {
            setTimeout(sendTime, interval);
          }
          else {
            timestampAdjust = data.serverTimestamp - lastTimestamp - Math.round(duration / 2);
            resolve(timestampAdjust);
            socket.emit(protocol.CALIBRATE_TIME_RESULT, {clientTimestampAdjust: timestampAdjust});
          }
          if (updateCallback) {
            updateCallback(durations, durations.reduce((a,b) => a+b, 0) / durations.length)
          }
        });

        setTimeout(sendTime, initialWait);
      });
    }
  }
}

module.exports = client;