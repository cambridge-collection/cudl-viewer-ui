import WebpackConfig from 'webpack-config';

import { resolver } from './paths';
import { populateEnvironment } from './environment';

let pwd = resolver(__dirname);
populateEnvironment(WebpackConfig.environment);

export default new WebpackConfig()
    .extend(('cudl-viewer-bubbles/webpack-config/external'))
    .extend(('cudl-viewer-tagging-ui/webpack-config/external'))
    .extend(pwd('./output.js'))
    .extend(pwd('./misc.js'))
    .extend(pwd('./entry.js'))
    .extend(pwd('./resolve.js'))
    .extend(pwd('./loaders.js'))
    .extend(pwd('./css/[env].js'))
    .extend(pwd('./plugins.js'))
    .extend(pwd('./shims.js'));
