import WebpackConfig from 'webpack-config';

import { rootPath } from './paths';


export default new WebpackConfig().merge({
    context: rootPath('./'),
    devtool: 'source-map'
});
