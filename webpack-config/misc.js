import { Config } from 'cudl-webpack-config/lib/config';
import { env } from 'cudl-webpack-config/lib/util';

import { rootPath } from './paths';


export default new Config().merge({
    context: rootPath('./'),
    devtool: env('cudl-viewer-ui.sourceMapType')
});
