import { Config } from 'webpack-config';


export default new Config().merge({
    postcss: [require('autoprefixer')]
});
