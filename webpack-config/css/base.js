import { Config } from 'cudl-webpack-config/lib/config';


export default new Config().merge({
    postcss: [require('autoprefixer')]
});
