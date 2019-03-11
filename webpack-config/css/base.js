import { Config } from 'webpack-config';
import webpack from 'webpack';

export default new Config().merge({
    plugins: [
        new webpack.LoaderOptionsPlugin({
            options: {
                postcss: [require('autoprefixer')]
            }
        })
    ]
});
