module.exports.propsToString = function(prop) {
  var returnString = prop.replace(/_/g, ' ')

  if (returnString.charAt(0) === ' '){
    returnString = returnString.slice(1, returnString.length)
  }
  // Make first letters uppercase
  returnString = toUpperCase(returnString)

  return returnString;
}

module.exports.objectToString = function(object, noQuotes=False) {
  var returnString = JSON.stringify(object)
  if (noQuotes) {
    returnString = returnString.replace(/\"([^(\")"]+)\":/g,"$1:");
  }
  return returnString;
}

function toUpperCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

module.exports.calcDistance = function(p1, p2) {
  return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y))
}
