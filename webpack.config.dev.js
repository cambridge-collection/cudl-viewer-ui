const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require('webpack');
/**
 * This contains just the specific config for development mode.
 *
 * This is not called directly. but using the command:
 * 'webpack --mode development'
 * This ensures that the common config is also included.
 **/

module.exports = {
    name: 'developmentConfig',
    mode: 'development',
    dependencies: ['common-config'],
    optimization: {
        minimize: false,
        //runtimeChunk: 'single', // needed fpr devserver
    },
    devtool: 'inline-source-map',
    devServer: {
        headers: {"Access-Control-Allow-Origin": "*"},
        static: {
            directory: path.join(__dirname, 'built'),
        },
        compress: false,
        port: 8080,
        hot: true,
    },
    output: {
        filename: "./js/[name].js",
    },
    plugins: [
        new MiniCssExtractPlugin({
        filename: 'css/[name].css',
        chunkFilename: 'css/[name].css'
    }),
        new webpack.EnvironmentPlugin({"GA4": "G-2XDQTMVL9Y"})
    ]
};