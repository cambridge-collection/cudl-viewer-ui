import { gzip, Z_BEST_COMPRESSION } from 'zlib';
import optional from 'optional';
let zopfli = optional('node-zopfli');

import WebpackConfig from 'webpack-config';
import CompressionPlugin from 'compression-webpack-plugin';

function compressZlibGzip(buf, callback) {
    return gzip(buf, {level: Z_BEST_COMPRESSION}, callback);
}

function compressZopfliGzip(buf, callback) {
    return zopfli.gzip(buf, callback);
}

export default new WebpackConfig().merge({
    plugins: [
        new CompressionPlugin({
            asset: "[file].gz",
            // Use Zopfli to gzip compress if it's available, otherwise zlib.
            // Zopfli compresses slightly better (0-10%) than zlib, but is much
            // slower to perform the compression.
            algorithm: zopfli ? compressZopfliGzip : compressZlibGzip,
            minRatio: 0.8
        })
    ]
});
