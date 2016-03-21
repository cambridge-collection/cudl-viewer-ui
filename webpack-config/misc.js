import { Config } from 'cudl-webpack-config/lib/config';

import { rootPath } from './paths';


export default new Config().merge({
    context: rootPath('./'),
    devtool: 'source-map'
});
