# cudl-webpack-config

`cudl-webpack-config` is a javascript library containing webpack configuration
functionality shared between CUDL codebases using webpack to build.

Currently it contains definitions for shims to load legacy javascript code as
CommonJS modules.

The [`webpack-config`](https://github.com/mdreizin/webpack-config) library
is used to define and merge configuration snippets.

## Building

This codebase is written using ES6 javascript features, so currently requires
a compile to ES5 step before use. The `package.json` defines a prepublish script
which performs this compilation.
