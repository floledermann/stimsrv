let count = function(startVal) {
  
  let val = startVal;
    
  return function*() {     
    while (true) {
      yield val;
      val++;
    }
  }
}

module.exports = count;