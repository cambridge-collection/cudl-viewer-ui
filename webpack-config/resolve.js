import { Config } from 'webpack-config';

import { rootPath } from './paths';


export default new Config().merge({
    resolve: {
        modules: [
            rootPath('./bower_components'),
            rootPath('./vendor')
        ],
        alias: {
            // Allow dependencies to import modules from here
            'cudl-viewer-ui': rootPath()
        }
    }
});
