// Dynamically set the output.publicPath in production mode. We don't
// necessarily know where the webpack resources will be served from, so we
// allow it to be set via a global var.
if(CUDL_PRODUCTION_BUILD) {
    if(typeof window.__cudl_webpack_public_path__ !== 'string')
        throw new Error('The global __cudl_webpack_public_path__ is not set');

    // Webpack handles this assignment specially, it doesn't actually assign
    // a global.
    // See: http://webpack.github.io/docs/configuration.html#output-publicpath
    __webpack_public_path__ = window.__cudl_webpack_public_path__;
}
