const fs = require('fs').promises;
const path = require('path');

function filestorage(options) {
  
  options = Object.assign({
    participantId: "user_###",
    filename: "#_YYYY-MM-DD_HH-mm", // https://momentjs.com/docs/#/displaying/format/
    destination: "./data",
    format: "json"    
  }, options);
  
  function padNum(num, pad) {
    let str = "" + num;
    let padStr = "0000000000".substring(0,pad-str.length);
    return padStr + str;
  }
  
  async function getNextParticipantId() {
    
    // if destination dir does not exist, warn and return 1
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
    console.log(userIdRegexStr);
    let userIdRegex = new RegExp(userIdRegexStr);
    
    let maxId = 0;
    
    let filenames = await fs.readdir(options.destination);
       
    for (let filename of filenames) {
      let num = filename.match(userIdRegex)?.groups?.num;
      if (num) {
        num = +num;
        if (num > maxId) {
          maxId = num;
        }
      }
    }
    
    let userId = maxId + 1;
    
    let idLength = options.participantId.match(/#+/)[0].length;
    let idStr = padNum(userId, idLength);
    
    idStr = options.participantId.replace(/#+/, idStr);
    let filename = idStr + ".lock";
    let filepath = path.join(options.destination, filename);
    
    // create empty lock file
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
    getNextParticipantId: getNextParticipantId
  }
  
  
}

module.exports = filestorage;