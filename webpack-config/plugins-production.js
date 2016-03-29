import { gzip, Z_BEST_COMPRESSION } from 'zlib';

import optional from 'optional';
let zopfli = optional('node-zopfli');
import assign from 'lodash/assign';

import { Config } from 'cudl-webpack-config/lib/config';
import CompressionPlugin from 'compression-webpack-plugin';

function compressZlibGzip(buf, options, callback) {
    if(callback === undefined && typeof options === 'function') {
        callback = options;
        options = {};
    }
    return gzip(buf, assign({level: Z_BEST_COMPRESSION}, options), callback);
}

function compressZopfliGzip(buf, options, callback) {
    if(callback === undefined && typeof options === 'function') {
        callback = options;
        options = {};
    }
    return zopfli.gzip(buf, options, callback);
}

export default new Config().merge({
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
