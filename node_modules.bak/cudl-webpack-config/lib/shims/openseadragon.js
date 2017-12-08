'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (version) {
    if ((0, _semver.satisfies)(version, '^2.2')) {
        return shim_2_2();
    } else if ((0, _semver.satisfies)(version, '^2')) {
        return shim_2_1();
    }

    return new _webpackConfig.Config().merge({
        resolve: {
            alias: {
                // Enough openseadragons?
                openseadragon: 'openseadragon/built-openseadragon/' + 'openseadragon/openseadragon.js'
            }
        },
        module: {
            loaders: [{
                test: /\/openseadragon\.js$/,
                include: /\/bower_components\/openseadragon\//,
                loader: 'exports?OpenSeadragon'
            }]
        }
    });
};

var _webpackConfig = require('webpack-config');

var _semver = require('semver');

var _util = require('../util');

var OSD_2_SHIM = {
    before: '// Redirect assignment of OpenSeadragon global to local var. This is required\n// as otherwise we can\'t assign the OpenSeadragon local before it\'s passed to\n// the main module wrapping function.\nvar OpenSeadragon;\nObject.defineProperty(window, \'OpenSeadragon\', {\n    get: function() { return OpenSeadragon; },\n    set: function(value) { OpenSeadragon = value; },\n    configurable: true,\n    enumerable: true\n});\n',
    after: '// Clean up our intercepting property\ndelete window.OpenSeadragon;\n'
};

function shim_2_2() {
    return new _webpackConfig.Config().merge({
        module: {
            loaders: [{
                include: require.resolve('openseadragon'),
                loaders: [
                // Disable AMD define used by OSD
                'imports?window=>global&define=>false', 'exports?OpenSeadragon', 'wrap?shim-openseadragon-2.x']
            }]
        },
        wrap: {
            'shim-openseadragon-2.x': OSD_2_SHIM
        }
    });
}

function shim_2_1() {
    // OpenSeadragon < 2.2 had non-standard packaging which required lots of
    // hacking. ^2.2 has an NPM release, but contains only a concatenated file
    // as they don't use js modules internally yet.
    var dirPattern = /\/node_modules\/OpenSeadragon\/src\//;

    return new _webpackConfig.Config().merge({
        module: {
            loaders: [{
                include: dirPattern,
                test: /\/.*\.js$/,
                exclude: /\/openseadragon\.js/,
                loader: 'imports?OpenSeadragon=./openseadragon.js'
            }, {
                include: dirPattern,
                test: /\/openseadragon\.js$/,
                loaders: ['imports?window=>global', 'exports?OpenSeadragon', 'wrap?shim-openseadragon-2.x']
            }]
        },
        wrap: {
            'shim-openseadragon-2.x': OSD_2_SHIM
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zaGltcy9vcGVuc2VhZHJhZ29uLmpzIl0sIm5hbWVzIjpbInZlcnNpb24iLCJzaGltXzJfMiIsInNoaW1fMl8xIiwibWVyZ2UiLCJyZXNvbHZlIiwiYWxpYXMiLCJvcGVuc2VhZHJhZ29uIiwibW9kdWxlIiwibG9hZGVycyIsInRlc3QiLCJpbmNsdWRlIiwibG9hZGVyIiwiT1NEXzJfU0hJTSIsImJlZm9yZSIsImFmdGVyIiwicmVxdWlyZSIsIndyYXAiLCJkaXJQYXR0ZXJuIiwiZXhjbHVkZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O2tCQThFZSxVQUFTQSxPQUFULEVBQWtCO0FBQzdCLFFBQUcsdUJBQVVBLE9BQVYsRUFBbUIsTUFBbkIsQ0FBSCxFQUErQjtBQUMzQixlQUFPQyxVQUFQO0FBQ0gsS0FGRCxNQUdLLElBQUcsdUJBQVVELE9BQVYsRUFBbUIsSUFBbkIsQ0FBSCxFQUE2QjtBQUM5QixlQUFPRSxVQUFQO0FBQ0g7O0FBRUQsV0FBTyw0QkFBYUMsS0FBYixDQUFtQjtBQUN0QkMsaUJBQVM7QUFDTEMsbUJBQU87QUFDSDtBQUNBQywrQkFBZSx1Q0FDQztBQUhiO0FBREYsU0FEYTtBQVF0QkMsZ0JBQVE7QUFDSkMscUJBQVMsQ0FDTDtBQUNJQyxzQkFBTSxzQkFEVjtBQUVJQyx5QkFBUyxxQ0FGYjtBQUdJQyx3QkFBUTtBQUhaLGFBREs7QUFETDtBQVJjLEtBQW5CLENBQVA7QUFrQkgsQzs7QUF4R0Q7O0FBQ0E7O0FBRUE7O0FBRUEsSUFBTUMsYUFBYTtBQUNmQyx1YkFEZTtBQWFmQztBQWJlLENBQW5COztBQW9CQSxTQUFTYixRQUFULEdBQW9CO0FBQ2hCLFdBQU8sNEJBQWFFLEtBQWIsQ0FBbUI7QUFDdEJJLGdCQUFRO0FBQ0pDLHFCQUFTLENBQ0w7QUFDSUUseUJBQVNLLFFBQVFYLE9BQVIsQ0FBZ0IsZUFBaEIsQ0FEYjtBQUVJSSx5QkFBUztBQUNMO0FBQ0Esc0RBRkssRUFHTCx1QkFISyxFQUlMLDZCQUpLO0FBRmIsYUFESztBQURMLFNBRGM7QUFjdEJRLGNBQU07QUFDRixzQ0FBMEJKO0FBRHhCO0FBZGdCLEtBQW5CLENBQVA7QUFrQkg7O0FBRUQsU0FBU1YsUUFBVCxHQUFvQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQSxRQUFJZSxhQUFhLHNDQUFqQjs7QUFFQSxXQUFPLDRCQUFhZCxLQUFiLENBQW1CO0FBQ3RCSSxnQkFBUTtBQUNKQyxxQkFBUyxDQUNMO0FBQ0lFLHlCQUFTTyxVQURiO0FBRUlSLHNCQUFNLFdBRlY7QUFHSVMseUJBQVMscUJBSGI7QUFJSVAsd0JBQVE7QUFKWixhQURLLEVBT0w7QUFDSUQseUJBQVNPLFVBRGI7QUFFSVIsc0JBQU0sc0JBRlY7QUFHSUQseUJBQVMsQ0FDTCx3QkFESyxFQUVMLHVCQUZLLEVBR0wsNkJBSEs7QUFIYixhQVBLO0FBREwsU0FEYztBQW9CdEJRLGNBQU07QUFDRixzQ0FBMEJKO0FBRHhCO0FBcEJnQixLQUFuQixDQUFQO0FBd0JIIiwiZmlsZSI6Im9wZW5zZWFkcmFnb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb25maWcgfSBmcm9tICd3ZWJwYWNrLWNvbmZpZyc7XG5pbXBvcnQgeyBzYXRpc2ZpZXMgfSBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQgeyBsb2FkZXJzIH0gZnJvbSAnLi4vdXRpbCc7XG5cbmNvbnN0IE9TRF8yX1NISU0gPSB7XG4gICAgYmVmb3JlOiBgXFxcbi8vIFJlZGlyZWN0IGFzc2lnbm1lbnQgb2YgT3BlblNlYWRyYWdvbiBnbG9iYWwgdG8gbG9jYWwgdmFyLiBUaGlzIGlzIHJlcXVpcmVkXG4vLyBhcyBvdGhlcndpc2Ugd2UgY2FuJ3QgYXNzaWduIHRoZSBPcGVuU2VhZHJhZ29uIGxvY2FsIGJlZm9yZSBpdCdzIHBhc3NlZCB0b1xuLy8gdGhlIG1haW4gbW9kdWxlIHdyYXBwaW5nIGZ1bmN0aW9uLlxudmFyIE9wZW5TZWFkcmFnb247XG5PYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LCAnT3BlblNlYWRyYWdvbicsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gT3BlblNlYWRyYWdvbjsgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7IE9wZW5TZWFkcmFnb24gPSB2YWx1ZTsgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxufSk7XG5gLFxuICAgIGFmdGVyOiBgXFxcbi8vIENsZWFuIHVwIG91ciBpbnRlcmNlcHRpbmcgcHJvcGVydHlcbmRlbGV0ZSB3aW5kb3cuT3BlblNlYWRyYWdvbjtcbmBcbn07XG5cblxuZnVuY3Rpb24gc2hpbV8yXzIoKSB7XG4gICAgcmV0dXJuIG5ldyBDb25maWcoKS5tZXJnZSh7XG4gICAgICAgIG1vZHVsZToge1xuICAgICAgICAgICAgbG9hZGVyczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVkZTogcmVxdWlyZS5yZXNvbHZlKCdvcGVuc2VhZHJhZ29uJyksXG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIERpc2FibGUgQU1EIGRlZmluZSB1c2VkIGJ5IE9TRFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2ltcG9ydHM/d2luZG93PT5nbG9iYWwmZGVmaW5lPT5mYWxzZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZXhwb3J0cz9PcGVuU2VhZHJhZ29uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICd3cmFwP3NoaW0tb3BlbnNlYWRyYWdvbi0yLngnXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHdyYXA6IHtcbiAgICAgICAgICAgICdzaGltLW9wZW5zZWFkcmFnb24tMi54JzogT1NEXzJfU0hJTVxuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNoaW1fMl8xKCkge1xuICAgIC8vIE9wZW5TZWFkcmFnb24gPCAyLjIgaGFkIG5vbi1zdGFuZGFyZCBwYWNrYWdpbmcgd2hpY2ggcmVxdWlyZWQgbG90cyBvZlxuICAgIC8vIGhhY2tpbmcuIF4yLjIgaGFzIGFuIE5QTSByZWxlYXNlLCBidXQgY29udGFpbnMgb25seSBhIGNvbmNhdGVuYXRlZCBmaWxlXG4gICAgLy8gYXMgdGhleSBkb24ndCB1c2UganMgbW9kdWxlcyBpbnRlcm5hbGx5IHlldC5cbiAgICBsZXQgZGlyUGF0dGVybiA9IC9cXC9ub2RlX21vZHVsZXNcXC9PcGVuU2VhZHJhZ29uXFwvc3JjXFwvLztcblxuICAgIHJldHVybiBuZXcgQ29uZmlnKCkubWVyZ2Uoe1xuICAgICAgICBtb2R1bGU6IHtcbiAgICAgICAgICAgIGxvYWRlcnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGluY2x1ZGU6IGRpclBhdHRlcm4sXG4gICAgICAgICAgICAgICAgICAgIHRlc3Q6IC9cXC8uKlxcLmpzJC8sXG4gICAgICAgICAgICAgICAgICAgIGV4Y2x1ZGU6IC9cXC9vcGVuc2VhZHJhZ29uXFwuanMvLFxuICAgICAgICAgICAgICAgICAgICBsb2FkZXI6ICdpbXBvcnRzP09wZW5TZWFkcmFnb249Li9vcGVuc2VhZHJhZ29uLmpzJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpbmNsdWRlOiBkaXJQYXR0ZXJuLFxuICAgICAgICAgICAgICAgICAgICB0ZXN0OiAvXFwvb3BlbnNlYWRyYWdvblxcLmpzJC8sXG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdpbXBvcnRzP3dpbmRvdz0+Z2xvYmFsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdleHBvcnRzP09wZW5TZWFkcmFnb24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3dyYXA/c2hpbS1vcGVuc2VhZHJhZ29uLTIueCdcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgd3JhcDoge1xuICAgICAgICAgICAgJ3NoaW0tb3BlbnNlYWRyYWdvbi0yLngnOiBPU0RfMl9TSElNXG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmVyc2lvbikge1xuICAgIGlmKHNhdGlzZmllcyh2ZXJzaW9uLCAnXjIuMicpKSB7XG4gICAgICAgIHJldHVybiBzaGltXzJfMigpO1xuICAgIH1cbiAgICBlbHNlIGlmKHNhdGlzZmllcyh2ZXJzaW9uLCAnXjInKSkge1xuICAgICAgICByZXR1cm4gc2hpbV8yXzEoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IENvbmZpZygpLm1lcmdlKHtcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgYWxpYXM6IHtcbiAgICAgICAgICAgICAgICAvLyBFbm91Z2ggb3BlbnNlYWRyYWdvbnM/XG4gICAgICAgICAgICAgICAgb3BlbnNlYWRyYWdvbjogJ29wZW5zZWFkcmFnb24vYnVpbHQtb3BlbnNlYWRyYWdvbi8nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ29wZW5zZWFkcmFnb24vb3BlbnNlYWRyYWdvbi5qcydcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgbW9kdWxlOiB7XG4gICAgICAgICAgICBsb2FkZXJzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0ZXN0OiAvXFwvb3BlbnNlYWRyYWdvblxcLmpzJC8sXG4gICAgICAgICAgICAgICAgICAgIGluY2x1ZGU6IC9cXC9ib3dlcl9jb21wb25lbnRzXFwvb3BlbnNlYWRyYWdvblxcLy8sXG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcjogJ2V4cG9ydHM/T3BlblNlYWRyYWdvbidcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuIl19