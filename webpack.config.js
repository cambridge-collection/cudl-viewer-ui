/**
 * This contains the common configuration between both the development and production
 * servers.  When called with no specific mode set it will default to production.
 * For example to compile for development run:
 * 'webpack --mode development'
 * and to compile for production just run:
 * 'webpack'
 *
 * Specific extensions to the configuration for production and dev
 * are contained in the other two webpack configuration files 'webpack.config.dev.js' and 'webpack.config.prod.js'.
 */

const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const AssetsPlugin = require('assets-webpack-plugin');
const webpack = require('webpack');
const webpack_merge = require('webpack-merge');

// Not 100% sure if I'm correct, but I'm interpreting this as the path
// to the main publicPath from the css's output path. The css is in
// <publicPath>/css/, so ../ becomes <publicPath>/css/../ = <publicPath>
let publicPath = '../';

const developmentConfig = require('./webpack.config.dev.js');
const productionConfig = require('./webpack.config.prod.js');

module.exports = (env, args) => {
    switch(args.mode) {
        case 'development':
            return webpack_merge.merge(commonConfig, developmentConfig);
        default:
            return webpack_merge.merge(commonConfig, productionConfig); // default to production mode
    }
}

const commonConfig = {
    name: 'common-config',
    mode: 'production',
    entry: {
        'page-standard': './src/js/pages/standard.js',
        'page-document': './src/js/pages/document.js',
        'page-advancedsearch': './src/js/pages/advancedsearch.js',
        'page-transcription': './src/js/pages/transcription.js',
        'page-collection-organisation': './src/js/pages/collection-organisation.js',
        'page-advanced-search-results': './src/js/pages/advanced-search-results.js',
        'page-error-500': './src/js/pages/error-500.js',
        'page-feedback': './src/js/pages/embedded/feedback.js'
    },
    optimization: {
        // Every page apart from document and transcription share a fair
        // amount of stuff, so break out that stuff into a shared chunk.
        // There's scope to create a additional shared chunks if necessary.

        // NOTE: Update the src/resources/deps.json file to list dependencies implied by
        //       the common chunks config if you change it. The java code
        //       replies on deps.json to know which entry chunks to load in
        //       what order.

         splitChunks: {
        //     chunks (chunk) {
        //         if ((chunk.name !== 'page-document') && (chunk.name !== 'page-transcription')) {
        //             return true;
        //         }
        //     },
        //     name: 'common',
        //     minChunks: 1
        // },
            chunks (chunk) {
                if ((chunk.name !== 'page-document') && (chunk.name !== 'page-transcription')) {
                    return true;
                }
            },
            minSize: 20000,
            minRemainingSize: 0,
            minChunks: 1,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            enforceSizeThreshold: 50000,
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    reuseExistingChunk: true,
                    name: 'common',
                },
                default: {
                    minChunks:3,
                    priority: -20,
                    reuseExistingChunk: true,
                    name: 'common',
                },
            },
        }
    },
    output: {
        publicPath:"", // default is "auto"
        path: path.join(__dirname, "built"),
        assetModuleFilename: './assets/[name][ext]'
    },
    target:'web',
    module: {
        rules: [
            // {
            //     test: /\.js$/,
            //     use: {
            //         loader: 'babel-loader',
            //         options: {
            //             cacheDirectory: true,
            //             presets: ['@babel/preset-env']
            //         }
            //     }
            // },
            {
                test: /\.jade$/,
                loader:'simple-pug-loader'
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|woff2?|eot|ttf|otf)(\?.*)?$/i,
                type: 'asset/resource'
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: { publicPath: publicPath }
                    },
                    'css-loader',
                    'postcss-loader'
                ]
            },
            // Plain library CSS
            // {
            //     test: /\.css(\?.*)?$/,
            //     exclude: path.resolve(__dirname, '/src/css'),
            //     use: [
            //         {
            //             loader: MiniCssExtractPlugin.loader,
            //             options: { publicPath: publicPath }
            //         },
            //         {
            //             loader: 'css-loader'
            //             // options: {
            //             //     url: {
            //             //         filter: (url, _resourcePath) => {
            //             //             // Do not load resources from css
            //             //             return false
            //             //         },
            //             //     },
            //             // }
            //         }
            //     ]
            // },
            // ,
            // // Bootstrap less - don't want to apply postcss
            // {
            //     include: path.resolve(__dirname, '/src/less/bootstrap'),
            //     test: /\.less$/,
            //     use: [
            //         {
            //             loader: MiniCssExtractPlugin.loader,
            //             options: { publicPath: publicPath }
            //         },
            //         'css-loader',
            //         'less-loader'
            //     ]
            // }
        ]
    },
    plugins: [
        // This creates the json file in dest/resources with
        // the paths to the css and js chunks in
        new AssetsPlugin({
            filename: 'webpack-assets.json',
            path: path.resolve(__dirname,'built/resources'),
            prettyPrint: true,
            fullPath: false,
            // Only include CSS and JS files (we don't load anything else
            // manually, so don't need every png listed in the assets file).
            includeAllFileTypes: false
        }),
        new webpack.DefinePlugin({
            // Relative to the public path
            CUDL_PRODUCTION_BUILD:
                JSON.stringify(process.env.NODE_ENV === 'production')
        }),
    ],

    resolve: {
        fallback: {
            package: false,
            generate: false,
            lib: false,
            path: false,
            fs: false
        }
    },


};