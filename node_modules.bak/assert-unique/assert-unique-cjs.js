/*!
 * assert-unique | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/assert-unique
*/

'use strict';

var arrayDuplicated = require('array-duplicated');
var arrayToSentence = require('array-to-sentence');

module.exports = function assertUnique() {
  if (arguments.length === 0) {
    return;
  }

  var duplicates = arrayDuplicated([].slice.call(arguments));

  if (duplicates.length === 0) {
    return;
  }

  var len = duplicates.length;
  while (len--) {
    if (typeof duplicates[len] === 'function') {
      var fnName = '';
      if (duplicates[len].name) {
        fnName = ': ' + duplicates[len].name;
      }

      duplicates[len] = '[Function' + fnName + ']';
    } else {
      duplicates[len] = JSON.stringify(duplicates[len]);
    }
  }

  var aux;
  if (duplicates.length === 1) {
    aux = 'is';
  } else {
    aux = 'are';
  }

  throw new Error(arrayToSentence(duplicates) + ' ' + aux + ' duplicated.');
};
