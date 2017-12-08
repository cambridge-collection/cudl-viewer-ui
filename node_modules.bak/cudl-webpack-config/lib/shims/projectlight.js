'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    var projectLight = _path2.default.join(PL_JS_DIR, 'custom.js');
    var modernizr = _path2.default.join(PL_LIB_DIR, 'modernizr.js');
    var iosFix = _path2.default.join(PL_LIB_DIR, 'ios-orientationchange-fix.js');

    return new _webpackConfig.Config().merge({
        resolve: {
            alias: {
                modernizr: modernizr,
                'ios-orientation-zoom-bug-fix': iosFix
            }
        },
        module: {
            loaders: [
            // Shim the project light JS as a commonjs module
            {
                test: bowerTestRegex(projectLight),
                loader: 'imports?' + ['__1=jquery-migrate', '__2=ios-orientation-zoom-bug-fix'].join(',')
            },
            // Shim modernizr as a commonjs module
            {
                test: bowerTestRegex(modernizr),
                loader: 'imports?this=>global!exports?Modernizr'
            },
            // Shim the ios rotate fix script
            {
                test: bowerTestRegex(iosFix),
                loader: 'imports?this=>global'
            }]
        }
    });
};

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _webpackConfig = require('webpack-config');

var _escapeStringRegexp = require('escape-string-regexp');

var _escapeStringRegexp2 = _interopRequireDefault(_escapeStringRegexp);

var _util = require('../util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PL_JS_DIR = 'project-light/javascripts';
var PL_LIB_DIR = _path2.default.join(PL_JS_DIR, 'libs');

function bowerTestRegex(location) {
    return new RegExp((0, _escapeStringRegexp2.default)(_path2.default.join('/', location)) + '$');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zaGltcy9wcm9qZWN0bGlnaHQuanMiXSwibmFtZXMiOlsicHJvamVjdExpZ2h0Iiwiam9pbiIsIlBMX0pTX0RJUiIsIm1vZGVybml6ciIsIlBMX0xJQl9ESVIiLCJpb3NGaXgiLCJtZXJnZSIsInJlc29sdmUiLCJhbGlhcyIsIm1vZHVsZSIsImxvYWRlcnMiLCJ0ZXN0IiwiYm93ZXJUZXN0UmVnZXgiLCJsb2FkZXIiLCJsb2NhdGlvbiIsIlJlZ0V4cCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O2tCQWVlLFlBQVc7QUFDdEIsUUFBSUEsZUFBZSxlQUFLQyxJQUFMLENBQVVDLFNBQVYsRUFBcUIsV0FBckIsQ0FBbkI7QUFDQSxRQUFJQyxZQUFZLGVBQUtGLElBQUwsQ0FBVUcsVUFBVixFQUFzQixjQUF0QixDQUFoQjtBQUNBLFFBQUlDLFNBQVMsZUFBS0osSUFBTCxDQUFVRyxVQUFWLEVBQXNCLDhCQUF0QixDQUFiOztBQUVBLFdBQU8sNEJBQWFFLEtBQWIsQ0FBbUI7QUFDdEJDLGlCQUFTO0FBQ0xDLG1CQUFPO0FBQ0hMLDJCQUFXQSxTQURSO0FBRUgsZ0RBQWdDRTtBQUY3QjtBQURGLFNBRGE7QUFPdEJJLGdCQUFRO0FBQ0pDLHFCQUFTO0FBQ0w7QUFDQTtBQUNJQyxzQkFBTUMsZUFBZVosWUFBZixDQURWO0FBRUlhLHdCQUFPLGFBQWMsQ0FDakIsb0JBRGlCLEVBRWpCLGtDQUZpQixFQUduQlosSUFIbUIsQ0FHZCxHQUhjO0FBRnpCLGFBRks7QUFTTDtBQUNBO0FBQ0lVLHNCQUFNQyxlQUFlVCxTQUFmLENBRFY7QUFFSVUsd0JBQVE7QUFGWixhQVZLO0FBY0w7QUFDQTtBQUNJRixzQkFBTUMsZUFBZVAsTUFBZixDQURWO0FBRUlRLHdCQUFRO0FBRlosYUFmSztBQURMO0FBUGMsS0FBbkIsQ0FBUDtBQThCSCxDOztBQWxERDs7OztBQUVBOztBQUNBOzs7O0FBRUE7Ozs7QUFHQSxJQUFNWCxZQUFZLDJCQUFsQjtBQUNBLElBQU1FLGFBQWEsZUFBS0gsSUFBTCxDQUFVQyxTQUFWLEVBQXFCLE1BQXJCLENBQW5COztBQUVBLFNBQVNVLGNBQVQsQ0FBd0JFLFFBQXhCLEVBQWtDO0FBQzlCLFdBQU8sSUFBSUMsTUFBSixDQUFXLGtDQUFZLGVBQUtkLElBQUwsQ0FBVSxHQUFWLEVBQWVhLFFBQWYsQ0FBWixJQUF3QyxHQUFuRCxDQUFQO0FBQ0giLCJmaWxlIjoicHJvamVjdGxpZ2h0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7IENvbmZpZyB9IGZyb20gJ3dlYnBhY2stY29uZmlnJztcbmltcG9ydCBlc2NhcGVSZWdleCBmcm9tICdlc2NhcGUtc3RyaW5nLXJlZ2V4cCc7XG5cbmltcG9ydCB7IGxvYWRlciB9IGZyb20gJy4uL3V0aWwnO1xuXG5cbmNvbnN0IFBMX0pTX0RJUiA9ICdwcm9qZWN0LWxpZ2h0L2phdmFzY3JpcHRzJztcbmNvbnN0IFBMX0xJQl9ESVIgPSBwYXRoLmpvaW4oUExfSlNfRElSLCAnbGlicycpO1xuXG5mdW5jdGlvbiBib3dlclRlc3RSZWdleChsb2NhdGlvbikge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKGVzY2FwZVJlZ2V4KHBhdGguam9pbignLycsIGxvY2F0aW9uKSkgKyAnJCcpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgICBsZXQgcHJvamVjdExpZ2h0ID0gcGF0aC5qb2luKFBMX0pTX0RJUiwgJ2N1c3RvbS5qcycpXG4gICAgbGV0IG1vZGVybml6ciA9IHBhdGguam9pbihQTF9MSUJfRElSLCAnbW9kZXJuaXpyLmpzJyk7XG4gICAgbGV0IGlvc0ZpeCA9IHBhdGguam9pbihQTF9MSUJfRElSLCAnaW9zLW9yaWVudGF0aW9uY2hhbmdlLWZpeC5qcycpO1xuXG4gICAgcmV0dXJuIG5ldyBDb25maWcoKS5tZXJnZSh7XG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIGFsaWFzOiB7XG4gICAgICAgICAgICAgICAgbW9kZXJuaXpyOiBtb2Rlcm5penIsXG4gICAgICAgICAgICAgICAgJ2lvcy1vcmllbnRhdGlvbi16b29tLWJ1Zy1maXgnOiBpb3NGaXgsXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG1vZHVsZToge1xuICAgICAgICAgICAgbG9hZGVyczogW1xuICAgICAgICAgICAgICAgIC8vIFNoaW0gdGhlIHByb2plY3QgbGlnaHQgSlMgYXMgYSBjb21tb25qcyBtb2R1bGVcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRlc3Q6IGJvd2VyVGVzdFJlZ2V4KHByb2plY3RMaWdodCksXG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcjonaW1wb3J0cz8nICArIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdfXzE9anF1ZXJ5LW1pZ3JhdGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ19fMj1pb3Mtb3JpZW50YXRpb24tem9vbS1idWctZml4J1xuICAgICAgICAgICAgICAgICAgICBdLmpvaW4oJywnKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLy8gU2hpbSBtb2Rlcm5penIgYXMgYSBjb21tb25qcyBtb2R1bGVcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRlc3Q6IGJvd2VyVGVzdFJlZ2V4KG1vZGVybml6ciksXG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcjogJ2ltcG9ydHM/dGhpcz0+Z2xvYmFsIWV4cG9ydHM/TW9kZXJuaXpyJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLy8gU2hpbSB0aGUgaW9zIHJvdGF0ZSBmaXggc2NyaXB0XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0ZXN0OiBib3dlclRlc3RSZWdleChpb3NGaXgpLFxuICAgICAgICAgICAgICAgICAgICBsb2FkZXI6ICdpbXBvcnRzP3RoaXM9Pmdsb2JhbCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICB9KTtcbn1cbiJdfQ==