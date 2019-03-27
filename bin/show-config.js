#!/usr/bin/env babel-node
// Show the webpack config object generated from the dev or production config
// files.
//
// Usage: show-config [(dev|prod) [<depth>]]
//
// For example:
//    $ export PATH=$PATH:$(pwd)/node_modules/.bin
//    $ show-config dev
require('source-map-support').install();

import { inspect } from 'util';
import { resolve } from 'path';

const DEFAULT_DEPTH = 3;

let args = process.argv.slice(2),
    env = args[0] === 'dev' ? '.dev' : 'production',
    depth = parseInt(args[1]) || DEFAULT_DEPTH,
    path = resolve(__dirname, `../webpack-config`);

process.env.WEBPACK_ENV = env;

let configModule = require(path),
    config = configModule && configModule.default;

console.log(`${path} to depth ${depth}:`);
console.log(inspect(config, false, depth, true));