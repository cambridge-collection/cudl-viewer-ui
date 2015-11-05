import WebpackConfig from 'webpack-config';

import { rootPath } from './paths';


export default new WebpackConfig().merge({
    resolve: {
        root: [
            rootPath('./bower_components'),
            rootPath('./vendor')
        ],
        alias: {
            // Allow dependencies to import modules from here
            'cudl-viewer-ui': rootPath()
        }
    }
});
