import path from 'path';

import AssetsPlugin from 'assets-webpack-plugin';


const OUT_DIR = path.resolve(__dirname, './built');

export default {
    context: __dirname,
    entry: {
        // Used in transcription text iframe in document page
        'transcription.css': './src/css/style-transcription.css',
        // Sole style for document page
        'document.css': './src/css/style-document.css',
        // Main CUDL style for non-document pages
        'style.css': './src/css/style.css',
        // Addition styles (on top of style.css) for advanced search page
        'advancedsearch.css': './src/css/advancedsearch.css'
    },
    devtool: 'source-map',
    output: {
        path: OUT_DIR,
        filename: 'chunk-[chunkhash]-[name]'
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
                loaders: ['style-loader', 'css-loader?sourceMap', 'postcss-loader?sourceMap']
            },
            // Hash referenced external files
            {
                test: /\.(png|jpg|gif|woff2?|eot|ttf|svg)(\?.*)?$/,
                loader: 'file-loader?name=[name]-[hash].[ext]'
            },
        ]
    },
    postcss: [require('autoprefixer')],
    plugins: [
        new AssetsPlugin({path: OUT_DIR})
    ]
};
