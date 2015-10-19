import path from 'path';

import _ from 'lodash';

import getConfig from './webpack.config.base';


export default getConfig({
    filenameTemplateJs: 'js/[name].js',
    filenameTemplateAsset: 'assets/[name].[ext]',
    filenameTemplateCss: 'css/[name].css',
    assetJsonBasePath: path.resolve(__dirname, './src'),
    assetJsonFilename: 'webpack-assets-dev.json',
    extractCSS: false,
    publicPath: 'http://localhost:8080/'
});
