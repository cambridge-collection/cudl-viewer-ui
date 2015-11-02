import WebpackConfig from 'webpack-config';

import { rootPath, resolver } from '../paths';


let pwd = resolver(__dirname);

export default new WebpackConfig()
    .extend(pwd('./base.js'))
    .merge({
        module: {
            loaders: [
                {
                    test: /\.css$/,
                    include: rootPath('./src/css'),
                    loader: 'style-loader!css-loader?sourceMap!postcss-loader?sourceMap'
                },
                // Plain library CSS
                {
                    test: /\.css(\?.*)?$/,
                    exclude: rootPath('./src/css'),
                    loader: 'style-loader!css-loader?sourceMap'
                }
            ]
        }
    });
