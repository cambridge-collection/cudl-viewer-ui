import { Config } from 'webpack-config';

import { rootPath, resolver } from '../paths';


let pwd = resolver(__dirname);

export default new Config()
    .extend(pwd('./base.js'))
    .merge({
        module: {
            rules: [
                {
                    test: /\.css$/,
                    include: rootPath('./src/css'),
                    use: [
                        'style-loader',
                        'css-loader',
                        'postcss-loader'
                    ]
                },
                // Plain library CSS
                {
                    test: /\.css(\?.*)?$/,
                    exclude: rootPath('./src/css'),
                    use: [
                        'style-loader',
                        'css-loader'
                    ]
                },
                // Bootstrap less - don't want to apply postcss
                {
                    include: rootPath('./src/less/bootstrap'),
                    test: /\.less$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        'less-loader'
                    ]
                }
            ]
        }
    });
