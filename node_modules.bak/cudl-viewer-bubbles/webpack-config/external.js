var path = require('path');

var Config = require('webpack-config').Config;


module.exports = new Config()
    .extend(path.resolve(__dirname, './loaders.js'));
