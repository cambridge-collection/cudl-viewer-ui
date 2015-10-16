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

const MODERNIZR_PATH = path.resolve(
    __dirname,
    './bower_components/project-light/javascripts/libs/modernizr.js');

const IOS_ZOOM_FIX = path.resolve(
    __dirname,
    './bower_components/project-light/javascripts/libs/ios-orientationchange-fix.js');

const FANCY_BOX_PATH = path.resolve(__dirname,
                                    './bower_components/fancybox/source');

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
            'page-login': './src/js/pages/login.js'
        },
        devtool: 'source-map',
        output: {
            path: OUT_DIR,
            filename: filenameTemplateJs
        },
        resolve: {
            root: [
                path.resolve(__dirname, 'bower_components')
            ],
            alias: {
                // Use the Modernizr bundled with Project Light as I've not yet
                // worked out which tests the use (if any, other than .mq()).
                modernizr: MODERNIZR_PATH,
                'ios-orientation-zoom-bug-fix': IOS_ZOOM_FIX
            }
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
                        'style-loader',
                        'css-loader?sourceMap!postcss-loader?sourceMap', {
                            // Not 100% sure if I'm correct, but I'm
                            // interpreting this as the path to the main
                            // publicPath from the css's output path.
                            // The css is in ./css/, so ../ is the output root.
                            publicPath: '../'
                        })
                },
                // Hash referenced external files
                {
                    test: /\.(png|jpg|gif|woff2?|eot|ttf|svg)(\?.*)?$/,
                    loader: 'file-loader?name=' + filenameTemplateAsset
                },
                // Shim the project light JS as a commonjs module
                {
                    test: path.resolve(__dirname, './bower_components/project-light/javascripts/custom.js'),
                    loader:'imports?'  + [
                        // This is a pain, Project Light has a load of deps
                        // we have to shim as commonjs modules
                        'jQuery=jquery',
                        '__jquery_migrate=jquery-migrate',
                        'Modernizr=modernizr',
                        '__ios_fix=ios-orientation-zoom-bug-fix'
                    ].join(',')
                },
                // Shim modernizr as a commonjs module
                {
                    test: MODERNIZR_PATH,
                    loader: 'imports?this=>global!exports?Modernizr'
                },
                // Shim jquery-migrate as a commonjs module.
                {
                    test: require.resolve('jquery-migrate'),
                    loader: 'imports?jQuery=jquery,window=>global'
                },
                // Shim the ios rotate fix script from project light
                {
                    test: IOS_ZOOM_FIX,
                    loader: 'imports?this=>global'
                },
                {
                    test: path.resolve(FANCY_BOX_PATH, 'jquery.fancybox.js'),
                    loader: 'imports?window=>global,document=>window.document,jQuery=jquery'
                },
                // Shim bootstrap.
                {
                    test: /bootstrap\/js\/\w+\.js$/,
                    loader: 'imports?jQuery=jquery'
                }
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
                chunks: [ 'page-standard', 'page-advancedsearch', 'page-login']
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