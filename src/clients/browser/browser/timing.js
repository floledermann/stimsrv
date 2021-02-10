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
          let averageDelay = Math.round(durations.reduce((a,b) => a+b, 0) / durations.length / 2);
          if (--options.iterations > 0) {
            setTimeout(sendTime, options.interval);
          }
          else {
            let timestampAdjust = data.serverTimestamp - lastTimestamp - Math.round(duration / 2);
            clientFactory.timestampAdjust = timestampAdjust;
            resolve(timestampAdjust);
            socket.emit(protocol.CALIBRATE_TIME_RESULT, {
              clientTimestampAdjust: timestampAdjust,
              clientAverageDelay: averageDelay
            });
          }
          if (options.updateCallback) {
            options.updateCallback(durations, averageDelay);
          }
        });

        setTimeout(sendTime, options.initialWait);
      });
    }
  }
}

module.exports = clientFactory;