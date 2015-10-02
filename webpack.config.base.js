import path from 'path';

import parseArgs from 'minimist';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import AssetsPlugin from 'assets-webpack-plugin';


let args = parseArgs(process.argv);


// Use ./built as the output path unless it's overridden on the command line
const OUT_DIR = path.resolve(__dirname, args['output-path'] ? 
                                        args['output-path'] : './built');

const JAVA_NAMESPACE = 'ulcambridge.foundations.viewer.viewer-ui';

export default function getConfig(options) {
    options = options || {};

    let filenameTemplateJs = options.filenameTemplateJs || 'js/[name]-[chunkhash].js';
    let filenameTemplateAsset = options.filenameTemplateAsset || 'assets/[name]-[hash].[ext]';
    let filenameTemplateCss = options.filenameTemplateCss || 'css/[name]-[chunkhash].css';

    let assetJsonBasePath = options.assetJsonBasePath || OUT_DIR
    // Write a JSON file with chunk filenames under our java namespace.
    // The main viewer can read this file to determine hashed filenames
    let defaultAssetJsonPath = path.resolve(
        assetJsonBasePath, 'resources', 
        JAVA_NAMESPACE.replace(/\./g, '/'));

    let assetJsonPath = options.assetJsonPath || defaultAssetJsonPath;
    let assetJsonFilename = options.assetJsonFilename || undefined;
        

    return {
        context: __dirname,
        entry: {
            'page-standard': './src/js/pages/standard.js',
            'page-document': './src/js/pages/document.js',
            'page-advancedsearch': './src/js/pages/advancedsearch.js',
            'page-transcription': './src/js/pages/transcription.js',
        },
        devtool: 'source-map',
        output: {
            path: OUT_DIR,
            filename: filenameTemplateJs
        },
        resolve: {
            root: [
                path.resolve(__dirname, 'bower_components')
            ]
        },
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    include: path.resolve(__dirname, './src/js'),
                    loader: 'babel-loader'
                },
                {
                    test: /\.css$/,
                    include: path.resolve(__dirname, './src/css'),
                    loader: ExtractTextPlugin.extract(
                        'style-loader', 'css-loader?sourceMap!postcss-loader?sourceMap')
                },
                // Hash referenced external files
                {
                    test: /\.(png|jpg|gif|woff2?|eot|ttf|svg)(\?.*)?$/,
                    loader: 'file-loader?name=' + filenameTemplateAsset
                },
            ]
        },
        postcss: [require('autoprefixer')],
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
                filename: filenameTemplateJs,
                chunks: [ 'page-standard', 'page-advancedsearch']
            }),
            new ExtractTextPlugin(filenameTemplateCss, {
                allChunks: true
            }),
            new AssetsPlugin({
                filename: assetJsonFilename,
                path: assetJsonPath
            })
        ]
    };
}
