import AssetsPlugin from 'assets-webpack-plugin';
import webpack from 'webpack';
import WebpackConfig from 'webpack-config';
import { env } from 'cudl-webpack-config/lib/util';

import { rootPath, resolver } from './paths';


let pwd = resolver(__dirname);

export default new WebpackConfig()
    .merge({
        plugins: [
            // Currently only the standard and advancedsearch pages share content.
            // In the future we may wish to have a global common chunk and a nested
            // one for the standard and advancedsearch pages.

            // NOTE: Update the deps.json file to list dependencies implied by
            //       the common chunks config if you change it. The java code
            //       replies on deps.json to know which entry chunks to load in
            //       what order.
            new webpack.optimize.CommonsChunkPlugin({
                name: 'common',
                filename: env('cudl-viewer-ui.filenameTemplateJsChunk'),
                // FIXME: determine sensible common chunks
                chunks: [ 'page-standard', 'page-advancedsearch', 'page-login']
            }),
            new AssetsPlugin({
                filename: env('cudl-viewer-ui.assetJsonFilename'),
                path: env('cudl-viewer-ui.assetJsonPath'),
                prettyPrint: true
            }),
            new webpack.DefinePlugin({
                // Relative to the public path
                CKEDITOR_LOCATION:
                    JSON.stringify(env('cudl-viewer-ui.ckeditorLocation')),
                CUDL_PRODUCTION_BUILD:
                    JSON.stringify(env('cudl-viewer-ui.env') === 'production')
            })
        ]
    })
    .extend(pwd('./plugins-[env].js'));
