#!/usr/bin/env babel-node
// Show the webpack config object generated from the dev or production config
// files.
//
// Usage: show-config [--mode=(dev|prod)] [--depth=<depth>]
//
// For example:
//    $ export PATH=$PATH:$(pwd)/node_modules/.bin
//    $ show-config --mode development --depth 4
//    $ NODE_ENV=development show-config
require('source-map-support').install();

import { inspect } from 'util';
import { resolve } from 'path';

import parseArgs from 'minimist';

const DEFAULT_DEPTH = 3;

let args = parseArgs(process.argv, {
    default: {depth: DEFAULT_DEPTH}
});

let depth = args.depth,
    path = resolve(__dirname, `../webpack-config`);

let configModule = require(path),
    config = configModule && configModule.default;

console.log(`${path} to depth ${depth}:`);
console.log(inspect(config, false, depth, true));
