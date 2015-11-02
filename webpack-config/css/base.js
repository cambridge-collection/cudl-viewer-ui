import WebpackConfig from 'webpack-config';


export default new WebpackConfig().merge({
    postcss: [require('autoprefixer')]
});
