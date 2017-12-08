var path = require('path');

var Config = require('webpack-config').Config;


module.exports = new Config()
    .extend(path.resolve(__dirname, './loaders.js'))
    .merge({
        context: path.resolve(__dirname, '..'),
        entry: {
            client: path.resolve(__dirname, '../src/index')
        },
        output: {
            path: path.join(__dirname, '../dist'),
            filename: 'similarity.js',
            library: 'similarity'
        }
    });
