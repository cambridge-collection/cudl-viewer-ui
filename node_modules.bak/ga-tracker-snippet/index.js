/*!
 * ga-tracker-snippet | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/ga-tracker-snippet
*/

'use strict';

var isVarName = require('is-var-name');

module.exports = function gaTrackerSnippet(options) {
  if (typeof options === 'string') {
    options = {id: arguments[0], domain: arguments[1]};
  } else {
    options = options || {};
  }

  var templateData = {};

  var defultValues = {
    id: 'XXXXX-X',
    domain: 'auto',
    globalName: 'ga'
  };

  Object.keys(defultValues).forEach(function(key) {
    var prop = options[key];
    if (prop) {
      if (typeof prop !== 'string') {
        throw new TypeError(prop + ' is not a string. ' + key + ' property must be a string.');
      }
      templateData[key] = prop;
    } else {
      templateData[key] = defultValues[key];
    }
  });

  if (!isVarName(templateData.globalName)) {
    throw new Error(templateData.globalName + ' cannot be used as a global variable name.');
  }

  if (templateData.id.indexOf('UA-') === 0) {
    templateData.id = templateData.id.substring(3);
  }

  var space;
  if (options.minify) {
    space = '';
  } else {
    space = ' ';
  }

  var code = templateData.globalName +
             '(\'create\',' + space +
             '\'UA-' + templateData.id + '\',' + space +
             '\'' + templateData.domain + '\');' +
             (options.minify ? '' : '\n') +
             templateData.globalName +
             '(\'send\',' + space + '\'pageview\');';

  if (options.singleQuotes === false) {
    code = code.replace(/'/g, '"');
  }

  return code;
};
