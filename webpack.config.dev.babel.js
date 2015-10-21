import path from 'path';

import _ from 'lodash';

import getConfig from './webpack.config.base';


export default getConfig({
    isDevBuild: true,
    filenameTemplateJs: 'js/[name].js',
    filenameTemplateJsChunk: 'js/chunks/[name].js',
    filenameTemplateAsset: 'assets/[name].[ext]',
    filenameTemplateCss: 'css/[name].css',
    assetJsonBasePath: path.resolve(__dirname, './src'),
    assetJsonFilename: 'webpack-assets-dev.json',
    extractCSS: false,
    publicPath: 'http://localhost:8080/',
    // The location of the ckeditor assets, relative to the webpack public path
    ckeditorLocation: 'vendor/ckeditor/'
});
