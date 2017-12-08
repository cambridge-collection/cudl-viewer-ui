var path = require('path');

var Config = require('webpack-config').Config;


module.exports = new Config().merge({
    module: {
        loaders: [
            {
                test: /\.js$/,
                include: path.resolve(__dirname, '../src'),
                loader: 'babel',
                query: {
                    cacheDirectory: true,
                    presets: ['es2015']
                }
            },
            {
                test: /\.less$/,
                include: path.resolve(__dirname, '../styles'),
                loader: 'style-loader?sourceMap!css-loader?sourceMap!less-loader?sourceMap'
            }
        ]
    }
});
