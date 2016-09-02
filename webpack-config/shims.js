import { Config } from 'webpack-config';
import { shim } from 'cudl-webpack-config';

import { rootPath } from './paths';


// Include configurations to shim these libraries as commonjs modules
export default new Config()
    .merge(shim('cudl-webpack-config/lib/shims/bootstrap'))
    .merge(shim('cudl-webpack-config/lib/shims/ckeditor'))
    .merge(shim('cudl-webpack-config/lib/shims/fancybox'))
    .merge(shim('cudl-webpack-config/lib/shims/jquery-migrate'))
    .merge(shim('cudl-webpack-config/lib/shims/jquery-paging'))
    .merge(shim('cudl-webpack-config/lib/shims/jquery.easing'))
    .merge(shim('cudl-webpack-config/lib/shims/openseadragon', '2.1.0'))
    .merge(shim('cudl-webpack-config/lib/shims/projectlight'));
