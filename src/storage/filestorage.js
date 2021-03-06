const fs = require('fs').promises;
const path = require('path');

function filestorage(options) {
  
  options = Object.assign({
    participantId: "user_###",
    filename: "#_YYYY-MM-DD_HH-mm", // https://momentjs.com/docs/#/displaying/format/
    lockfileName: "#.lock",
    destination: "./data",
    format: "json"    
  }, options);
  
  let initTime = new Date();
  
  // lock variable to prevent multiple 
  let inFileOperation = false;
  
  function padNum(num, pad) {
    let str = "" + num;
    let padStr = "0000000000".substring(0,pad-str.length);
    return padStr + str;
  }
  
  let userIdStr = (function() {
    let idLength = options.participantId.match(/#+/)[0].length;
    return function(numId) {
      let idStr = padNum(numId, idLength);
      return options.participantId.replace(/#+/, idStr);
    }
  })();
  
  // helper function to prevent concurrent calls to a function
  function preventConcurrent(fn) {
    
    let inProgress = Promise.resolve();

    return async function(...args) {
      await inProgress;
      inProgress = inProgress.then(() => fn(...args));
      return inProgress;
    }
  }
  
  async function getNextParticipantId() {
    
    // if destination dir does not exist, warn and return id 1
    try {
      await fs.access(options.destination);
    }
    catch (error) {
      if (error.code === 'ENOENT') {
        let absPath = path.resolve(options.destination);
        console.warn("Destination folder " + absPath + " does not exist - assuming participant ID 1");
        return 1;
      } else {
        throw error;
      }      
    }

    // replace ### placeholders with capturing group
    let userIdRegexStr = options.participantId.replace(/#+/,match => "(?<num>\\d{" + match.length + "})");
    let userIdRegex = new RegExp(userIdRegexStr);
    
    let maxId = 0;
    
    let filenames = await fs.readdir(options.destination);
       
    for (let filename of filenames) {
      let num = filename.match(userIdRegex)?.groups?.num;
      if (num) {
        // convert to number
        num = +num;
        
        // check if this is orphaned lockfile - if so, delete
        let idStr = userIdStr(num);
        let lockFileName = options.lockfileName.replace("#",idStr);
        if (filename == lockFileName) {
          let filePath = path.join(options.destination, filename);
          let stat = await fs.stat(filePath);
          if (stat.mtime < initTime) {
            console.log("Found orphaned lock file: " + filename + " ... deleting.");
            await fs.unlink(filePath);
            // do not consider this id for the maximum
            num = -1;
          }
        }
        
        if (num > maxId) {
          maxId = num;
        }
      }
    }
    
    let userId = maxId + 1;
       
    let idStr = userIdStr(userId);
    
    // create empty lock file
    let filename = options.lockfileName.replace("#",idStr);
    let filepath = path.join(options.destination, filename);
    
    try {
      let fileHandle = await fs.open(filepath, "wx");
      await fileHandle?.close();
    }
    catch (error) {
      throw "Error creating lock file for user " + idStr + ": " + error;
    }
    console.log("New User ID: " + userId);
    
    return userId;

  }
  
  // public API
  return {
    getNextParticipantId: preventConcurrent(getNextParticipantId)
  }
  
  
}

module.exports = filestorage;