/**
 * The production loaders extract CSS into separate CSS files.
 */
import webpack from 'webpack';
import WebpackConfig from 'webpack-config';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import { env } from 'cudl-webpack-config/lib/util';

import { rootPath, resolver } from '../paths';


let pwd = resolver(__dirname);

// Not 100% sure if I'm correct, but I'm interpreting this as the path
// to the main publicPath from the css's output path. The css is in
// <publicPath>/css/, so ../ becomes <publicPath>/css/../ = <publicPath>
let publicPath = '../';

export default new WebpackConfig()
    .extend(pwd('./base.js'))
    .merge({
        entry: {
            bootstrap: ['bootstrap/dist/css/bootstrap.css'],
            projectlight: ['project-light/stylesheets/full-stylesheet.css']
        },
        module: {
            loaders: [
                {
                    test: /\.css$/,
                    include: rootPath('./src/css'),
                    loader: ExtractTextPlugin.extract(
                        'style-loader',
                        'css-loader?sourceMap!postcss-loader?sourceMap', {
                            publicPath: publicPath
                        })
                },
                // Plain library CSS
                {
                    test: /\.css(\?.*)?$/,
                    exclude: rootPath('./src/css'),
                    loader: ExtractTextPlugin.extract(
                        'style-loader', 'css-loader?sourceMap', {
                        publicPath: publicPath
                    })
                }
            ]
        },
        plugins: [
            new webpack.optimize.CommonsChunkPlugin({
                name: ['bootstrap', 'projectlight'],
                filename: env('cudl-viewer-ui.filenameTemplateJsChunk'),
                minChunks: Infinity
            }),
            new ExtractTextPlugin('css/[name]-[chunkhash].css', {
                allChunks: true
            })
        ]
    });
