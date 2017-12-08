/*!
 * array-duplicated | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/array-duplicated
*/
module.exports = function arrayDuplicated(arr) {
  'use strict';

  if (!Array.isArray(arr)) {
    throw new TypeError(
      arr +
      ' is not an array. Argument to array-duplicated  must be an array.'
    );
  }

  var result = [];
  for (var i = 0; i < arr.length; i++) {
    if (arr.indexOf(arr[i]) !== i && result.indexOf(arr[i]) === -1) {
      result.push(arr[i]);
    }
  }

  return result;
};
