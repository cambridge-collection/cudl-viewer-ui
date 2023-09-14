/**
 * This contains just the specific config for production mode.
 *
 * This is not called directly. but using the command:
 * 'webpack --mode production'
 * or just
 * 'webpack'
 * This ensures that the common config is also included.
 **/

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = {
    name: 'productionConfig',
    mode: 'production',
    dependencies: ['common-config'],
    optimization: {
        minimize: true,
    },
    output: {
        filename: "./js/[name]-[chunkhash].js",
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name]-[chunkhash].css',
            chunkFilename: 'css/[name]-[chunkhash].css'
        })
    ]
};