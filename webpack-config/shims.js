import WebpackConfig from 'webpack-config';
import { shim } from 'cudl-webpack-config';

import { rootPath } from './paths';


// Include configurations to shim these libraries as commonjs modules
export default new WebpackConfig()
    .merge(shim('cudl-webpack-config/lib/shims/bootstrap'))
    .merge(shim('cudl-webpack-config/lib/shims/ckeditor'))
    .merge(shim('cudl-webpack-config/lib/shims/fancybox'))
    .merge(shim('cudl-webpack-config/lib/shims/jquery-migrate'))
    .merge(shim('cudl-webpack-config/lib/shims/jquery-paging'))
    .merge(shim('cudl-webpack-config/lib/shims/jquery.easing'))
    .merge(shim('cudl-webpack-config/lib/shims/openseadragon'))
    .merge(shim('cudl-webpack-config/lib/shims/projectlight'));
