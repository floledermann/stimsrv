let count = function(startVal) {
  
  let val = startVal || 1;
    
  return function*() {     
    while (true) {
      yield val;
      val++;
    }
  }
}

module.exports = count;