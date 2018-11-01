import { Config } from 'webpack-config';
import { env } from 'cudl-webpack-config/lib/util';

import { rootPath } from './paths';


export default new Config().merge({
    module: {
        rules: [
            {
                test: /\.js$/,
                include: rootPath('./src/js'),
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        presets: ['@babel/preset-env']
                    }
                }
            },
            // Meta-modules which export a string which is used as their src
            {
                test: rootPath('./src/js/google-analytics.js'),
                use: {
                    loader: 'val-loader',
                    options: { cacheable: true }
                }
            },
            {
                test: /\.jade$/,
                include: rootPath('./src'),
                loader: 'pug-loader'
            },
            // Hash referenced external files
            {
                test: /\.(png|jpg|gif|woff2?|eot|ttf|svg)(\?.*)?$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: encodeURIComponent(env('cudl-viewer-ui.filenameTemplateAsset'))
                    }
                }
            }
        ]
    }
});
