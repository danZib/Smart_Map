export function dbKeyToDisplayString(dbKey) {
  let returnString = dbKey.replace('ifc', '')
    .replace(/_/g, ' ')

  if (returnString.charAt(0) === ' '){
    returnString = returnString.slice(1, returnString.length)
  }
  // Make first letters uppercase
  returnString = [...returnString].map((char, index) => {
    return index ? char : char.toUpperCase();
  }).join('');

  return returnString;
}

export function prepareAsUrlProp(str) {
  let returnString = str.replace(/ /g, '_').toLowerCase();

  return returnString;
}

export function roundFloat(float, numOfDigits) {
  return Number((float).toFixed(numOfDigits));
}

export function isFloat(number) {
  return Number(number) === number && number % 1 !== 0;
}
