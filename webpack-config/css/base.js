import { Config } from 'webpack-config';
import webpack from 'webpack';

export default new Config().merge({
    plugins: [
        new webpack.LoaderOptionsPlugin({
            // test: /\.xxx$/, // may apply this only for some modules
            options: {
                postcss: [require('autoprefixer')]
            }
        })
    ]
});
