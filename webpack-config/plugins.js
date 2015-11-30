import _ from 'lodash';
import without from 'lodash/array/without';
import AssetsPlugin from 'assets-webpack-plugin';
import webpack from 'webpack';
import WebpackConfig from 'webpack-config';
import { env } from 'cudl-webpack-config/lib/util';

import { rootPath, resolver } from './paths';
import entryConfig from './entry';


function removeEmptyModules(assets, names) {
    _(assets)
        .pairs()
        .map(([k, v]) => {
            if(_.includes(names, k)) {
                let stripped = _.omit(v, 'js');
                return stripped.length ? stripped : undefined;
            }
            return v;
        })
        // TODO: \
        // - finish this function
        // - Use to omit empty projectlight and bootstrap js modules from asset json
        // - check if IE 9 behaves with split up css
}

let pwd = resolver(__dirname);

export default new WebpackConfig()
    .merge({
        plugins: [
            // Every page apart from document and transcription share a fair
            // amount of stuff, so break out that stuff into a shared chunk.
            // There's scope to create a additional shared chunks if necessary.
            // For example, if the similarity and tagging code is loaded on
            // demand, there may be value in them having a shared chunk.

            // NOTE: Update the deps.json file to list dependencies implied by
            //       the common chunks config if you change it. The java code
            //       replies on deps.json to know which entry chunks to load in
            //       what order.
            new webpack.optimize.CommonsChunkPlugin({
                name: 'common',
                filename: env('cudl-viewer-ui.filenameTemplateJsChunk'),
                chunks: Object.keys(entryConfig.entry),
                minChunks: 2
                // chunks: without(
                //     Object.keys(entryConfig.entry),
                //     'page-document', 'page-transcription')
            }),
            new AssetsPlugin({
                filename: env('cudl-viewer-ui.assetJsonFilename'),
                path: env('cudl-viewer-ui.assetJsonPath'),
                prettyPrint: true,
                fullPath: false,
                processOutput: function(assets) {

                    return JSON.stringify(abc: assets}, null, 4);
                }
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
