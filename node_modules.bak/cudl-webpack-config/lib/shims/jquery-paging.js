'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    return new _webpackConfig.Config().merge({
        resolve: {
            alias: {
                // Alias the main file as "paging" is unclear and typing
                // import 'paging/jquery.paging' in code is annoying.
                'jquery-paging': 'paging/jquery.paging'
            }
        },
        module: {
            loaders: [{
                test: /\/jquery\.paging\.js$/,
                include: /\/bower_components\/paging\//,
                loader: 'imports?jQuery=jquery,this=>global'
            }]
        }
    });
};

var _webpackConfig = require('webpack-config');

var _util = require('../util');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zaGltcy9qcXVlcnktcGFnaW5nLmpzIl0sIm5hbWVzIjpbIm1lcmdlIiwicmVzb2x2ZSIsImFsaWFzIiwibW9kdWxlIiwibG9hZGVycyIsInRlc3QiLCJpbmNsdWRlIiwibG9hZGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7a0JBS2UsWUFBVztBQUN0QixXQUFPLDRCQUFhQSxLQUFiLENBQW1CO0FBQ3RCQyxpQkFBUztBQUNMQyxtQkFBTztBQUNIO0FBQ0E7QUFDQSxpQ0FBaUI7QUFIZDtBQURGLFNBRGE7QUFRdEJDLGdCQUFRO0FBQ0pDLHFCQUFTLENBQ0w7QUFDSUMsc0JBQU0sdUJBRFY7QUFFSUMseUJBQVMsOEJBRmI7QUFHSUMsd0JBQVE7QUFIWixhQURLO0FBREw7QUFSYyxLQUFuQixDQUFQO0FBa0JILEM7O0FBeEJEOztBQUVBIiwiZmlsZSI6ImpxdWVyeS1wYWdpbmcuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb25maWcgfSBmcm9tICd3ZWJwYWNrLWNvbmZpZyc7XG5cbmltcG9ydCB7IGxvYWRlciB9IGZyb20gJy4uL3V0aWwnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgQ29uZmlnKCkubWVyZ2Uoe1xuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBhbGlhczoge1xuICAgICAgICAgICAgICAgIC8vIEFsaWFzIHRoZSBtYWluIGZpbGUgYXMgXCJwYWdpbmdcIiBpcyB1bmNsZWFyIGFuZCB0eXBpbmdcbiAgICAgICAgICAgICAgICAvLyBpbXBvcnQgJ3BhZ2luZy9qcXVlcnkucGFnaW5nJyBpbiBjb2RlIGlzIGFubm95aW5nLlxuICAgICAgICAgICAgICAgICdqcXVlcnktcGFnaW5nJzogJ3BhZ2luZy9qcXVlcnkucGFnaW5nJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgbW9kdWxlOiB7XG4gICAgICAgICAgICBsb2FkZXJzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0ZXN0OiAvXFwvanF1ZXJ5XFwucGFnaW5nXFwuanMkLyxcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVkZTogL1xcL2Jvd2VyX2NvbXBvbmVudHNcXC9wYWdpbmdcXC8vLFxuICAgICAgICAgICAgICAgICAgICBsb2FkZXI6ICdpbXBvcnRzP2pRdWVyeT1qcXVlcnksdGhpcz0+Z2xvYmFsJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgIH0pO1xufVxuIl19