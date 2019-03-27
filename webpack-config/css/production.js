/**
 * The production loaders extract CSS into separate CSS files.
 */
import { Config } from 'webpack-config';
import MiniCssExtractPlugin  from 'mini-css-extract-plugin';

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
            rules: [
                {
                    test: /\.css$/,
                    include: rootPath('./src/css'),
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
                {
                    test: /\.css(\?.*)?$/,
                    exclude: rootPath('./src/css'),
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: { publicPath: publicPath }
                        },
                        'css-loader'
                    ]
                },
                // Bootstrap less - don't want to apply postcss
                {
                    include: rootPath('./src/less/bootstrap'),
                    test: /\.less$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: { publicPath: publicPath }
                        },
                        'css-loader',
                        'less-loader'
                    ]
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: 'css/[name]-[chunkhash].css',
                chunkFilename: 'css/[name]-[chunkhash].css'
            })
        ]
    });
