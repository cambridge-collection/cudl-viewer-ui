/**
 * The production loaders extract CSS into separate CSS files.
 */
import { Config } from 'webpack-config';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

import { rootPath, resolver } from '../paths';


let pwd = resolver(__dirname);

// Not 100% sure if I'm correct, but I'm interpreting this as the path
// to the main publicPath from the css's output path. The css is in
// <publicPath>/css/, so ../ becomes <publicPath>/css/../ = <publicPath>
let publicPath = '../';

export default new Config()
    .extend(pwd('./base.js'))
    .merge({
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
                        'style-loader',
                        'css-loader?sourceMap', {
                            publicPath: publicPath
                        })
                },
                // Bootstrap less - don't want to apply postcss
                {
                    include: rootPath('./src/less/bootstrap'),
                    test: /\.less$/,
                    loader: ExtractTextPlugin.extract(
                        'style-loader',
                        'css-loader?sourceMap!less-loader?sourceMap', {
                            publicPath: publicPath
                        })
                }
            ]
        },
        plugins: [
            new ExtractTextPlugin('css/[name]-[chunkhash].css', {
                allChunks: true
            })
        ]
    });
