import WebpackConfig from 'webpack-config';

import { rootPath } from './paths';


export default new WebpackConfig().merge({
    resolve: {
        root: [
            rootPath('./bower_components'),
            rootPath('./vendor')
        ],
    }
});
