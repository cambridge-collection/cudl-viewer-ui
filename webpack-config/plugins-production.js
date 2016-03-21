import { gzip, Z_BEST_COMPRESSION } from 'zlib';

import WebpackConfig from 'webpack-config';
import CompressionPlugin from 'compression-webpack-plugin';


function gzipBest(buf, callback) {
    return gzip(buf, {level: Z_BEST_COMPRESSION}, callback);
}

export default new WebpackConfig().merge({
    plugins: [
        new CompressionPlugin({
            asset: "[file].gz",
            algorithm: gzipBest,
            minRatio: 0.8
        })
    ]
});
