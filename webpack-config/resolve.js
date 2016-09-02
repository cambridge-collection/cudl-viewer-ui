import { Config } from 'webpack-config';

import { rootPath } from './paths';


export default new Config().merge({
    resolve: {
        root: [
            rootPath('./bower_components'),
            rootPath('./vendor')
        ],
        alias: {
            // Allow dependencies to import modules from here
            'cudl-viewer-ui': rootPath()
        },
        // Workaround for modules installed w/ $ npm link
        // These modules are not children of our root dir, so the node
        // resolution algorithm never looks in our node_modules dir. This
        // effectively adds our node_modules to the end of the search path.
        fallback: rootPath('./node_modules')
    }
});
