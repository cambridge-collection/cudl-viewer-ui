#!/usr/bin/env node
'use strict';

var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    i: 'id',
    d: 'domain',
    g: ['global', 'globalName'],
    m: 'minify',
    w: 'double',
    h: 'help',
    v: 'version'
  },
  string: ['id', 'domain', 'g', 'global'],
  boolean: ['minify', 'double', 'help', 'version']
});

if (argv.version) {
  console.log(require('./package.json').version);
} else if (argv.help) {
  var yellow = require('chalk').yellow;
  var pkg = require('./package.json');
  var sumUp = require('sum-up');

  console.log([
    sumUp(pkg),
    '',
    'Usage: ' + pkg.name + ' [options]',
    '',
    'Options:',
    yellow('--id,      -i') + '  Set web property ID',
    yellow('--domain,  -d') + '  Set domain ("auto" by default)',
    yellow('--global,  -g') + '  Change the global function name ("ga" by default)',
    yellow('--minify,  -m') + '  Omit whitespaces and newlines from output',
    yellow('--double,  -w') + '  Use double quotes (single quotes by default)',
    yellow('--help,    -h') + '  Print usage information',
    yellow('--version, -v') + '  Print version',
    ''
  ].join('\n'));
} else {
  var gaTrackerCode = require('./');

  argv.singleQuotes = !argv.double;
  try {
    console.log(gaTrackerCode(argv));
  } catch (e) {
    process.stderr.write(e.message + '\n', function() {
      process.exit(1);
    });
  }
}
