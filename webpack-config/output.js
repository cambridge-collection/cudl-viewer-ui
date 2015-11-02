import WebpackConfig from 'webpack-config';
import { env } from 'cudl-webpack-config/lib/util';

import { rootPath } from './paths';


export default new WebpackConfig().merge({
    output: {
        path: env('cudl-viewer-ui.outDir'),
        filename: env('cudl-viewer-ui.filenameTemplateJs'),
        chunkFilename: env('cudl-viewer-ui.filenameTemplateJsChunk'),
        publicPath: env('cudl-viewer-ui.publicPath')
    }
});
