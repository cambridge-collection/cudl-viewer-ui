import { Config } from 'cudl-webpack-config/lib/config';
import { env } from 'cudl-webpack-config/lib/util';

import { rootPath } from './paths';


export default new Config().merge({
    module: {
        loaders: [
            {
                test: /\.js$/,
                include: rootPath('./src/js'),
                loader: 'babel-loader',
                query: {
                    cacheDirectory: true,
                    presets: ['es2015']
                }
            },
            // Meta-modules which export a string which is used as their src
            {
                test: rootPath('./src/js/google-analytics.js'),
                loader: 'val?cacheable=true'
            },
            {
                test: /\.jade$/,
                include: rootPath('./src'),
                loader: 'jade-loader'
            },
            // Hash referenced external files
            {
                test: /\.(png|jpg|gif|woff2?|eot|ttf|svg)(\?.*)?$/,
                loader: 'file-loader?name=' + encodeURIComponent(
                    env('cudl-viewer-ui.filenameTemplateAsset'))
            }
        ]
    }
});
