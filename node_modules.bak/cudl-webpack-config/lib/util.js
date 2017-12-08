'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.loaders = loaders;
exports.loader = loader;
exports.env = env;

var _identity = require('lodash/identity');

var _identity2 = _interopRequireDefault(_identity);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _webpackConfig = require('webpack-config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Return a function which creates a Config with the specified array of
 * loaders when called.
 *
 * If a customiser function is provided, it's invoked when returned function is
 * invoked, with the defautLoaders array as the first argument followed by any
 * args the returned function is invoked with. It should return an array of
 * loaders which will be used in the resulting Config.
 */
function loaders(defaultLoaders) {
    var customiser = arguments.length <= 1 || arguments[1] === undefined ? _identity2.default : arguments[1];

    return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        if (!(0, _isArray2.default)(defaultLoaders)) throw new Error('first argument must be an array, got: ' + defaultLoaders);

        var loaders = customiser.apply(undefined, [defaultLoaders].concat(args));

        return new _webpackConfig.Config().merge({
            module: {
                loaders: loaders
            }
        });
    };
}

/**
 * As loaders(), except the function itself and the customiser take a single
 * loader, not an array of loaders.
 */
function loader(defaultLoader) {
    var customiser = arguments.length <= 1 || arguments[1] === undefined ? _identity2.default : arguments[1];

    return loaders([defaultLoader], function (_ref) {
        for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
        }

        var _ref2 = _slicedToArray(_ref, 1);

        var defaultLoader = _ref2[0];

        return [customiser.apply(undefined, [defaultLoader].concat(args))];
    });
}

/**
 * If value is a function, return the result of executing it, otherwise return
 * the value as is.
 */
function resolve(value) {
    if (typeof value === 'function') {
        return value.call();
    }
    return value;
}

/**
 * Lookup a value from the default webpack-config environment.
 */
function env(key) {
    var env = arguments.length <= 1 || arguments[1] === undefined ? _webpackConfig.environment : arguments[1];

    return resolve(env.get(key));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLmpzIl0sIm5hbWVzIjpbImxvYWRlcnMiLCJsb2FkZXIiLCJlbnYiLCJkZWZhdWx0TG9hZGVycyIsImN1c3RvbWlzZXIiLCJhcmdzIiwiRXJyb3IiLCJtZXJnZSIsIm1vZHVsZSIsImRlZmF1bHRMb2FkZXIiLCJyZXNvbHZlIiwidmFsdWUiLCJjYWxsIiwia2V5IiwiZ2V0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7OztRQWNnQkEsTyxHQUFBQSxPO1FBb0JBQyxNLEdBQUFBLE07UUFvQkFDLEcsR0FBQUEsRzs7QUF0RGhCOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUVBOzs7Ozs7Ozs7QUFTTyxTQUFTRixPQUFULENBQWlCRyxjQUFqQixFQUF3RDtBQUFBLFFBQXZCQyxVQUF1Qjs7QUFDM0QsV0FBTyxZQUFhO0FBQUEsMENBQVRDLElBQVM7QUFBVEEsZ0JBQVM7QUFBQTs7QUFDaEIsWUFBRyxDQUFDLHVCQUFRRixjQUFSLENBQUosRUFDSSxNQUFNLElBQUlHLEtBQUosNENBQ3VDSCxjQUR2QyxDQUFOOztBQUdKLFlBQUlILFVBQVVJLDZCQUFXRCxjQUFYLFNBQThCRSxJQUE5QixFQUFkOztBQUVBLGVBQU8sNEJBQWFFLEtBQWIsQ0FBbUI7QUFDdEJDLG9CQUFRO0FBQ0pSLHlCQUFTQTtBQURMO0FBRGMsU0FBbkIsQ0FBUDtBQUtILEtBWkQ7QUFhSDs7QUFFRDs7OztBQUlPLFNBQVNDLE1BQVQsQ0FBZ0JRLGFBQWhCLEVBQXNEO0FBQUEsUUFBdkJMLFVBQXVCOztBQUN6RCxXQUFPSixRQUFRLENBQUNTLGFBQUQsQ0FBUixFQUF5QixnQkFBOEI7QUFBQSwyQ0FBVEosSUFBUztBQUFUQSxnQkFBUztBQUFBOztBQUFBOztBQUFBLFlBQTVCSSxhQUE0Qjs7QUFDMUQsZUFBTyxDQUFDTCw2QkFBV0ssYUFBWCxTQUE2QkosSUFBN0IsRUFBRCxDQUFQO0FBQ0gsS0FGTSxDQUFQO0FBR0g7O0FBRUQ7Ozs7QUFJQSxTQUFTSyxPQUFULENBQWlCQyxLQUFqQixFQUF3QjtBQUNwQixRQUFHLE9BQU9BLEtBQVAsS0FBaUIsVUFBcEIsRUFBZ0M7QUFDNUIsZUFBT0EsTUFBTUMsSUFBTixFQUFQO0FBQ0g7QUFDRCxXQUFPRCxLQUFQO0FBQ0g7O0FBRUQ7OztBQUdPLFNBQVNULEdBQVQsQ0FBYVcsR0FBYixFQUFtQztBQUFBLFFBQWpCWCxHQUFpQjs7QUFDdEMsV0FBT1EsUUFBUVIsSUFBSVksR0FBSixDQUFRRCxHQUFSLENBQVIsQ0FBUDtBQUNIIiwiZmlsZSI6InV0aWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaWRlbnRpdHkgZnJvbSAnbG9kYXNoL2lkZW50aXR5JztcbmltcG9ydCBpc0FycmF5IGZyb20gJ2xvZGFzaC9pc0FycmF5JztcblxuaW1wb3J0IHsgQ29uZmlnLCBlbnZpcm9ubWVudCB9IGZyb20gJ3dlYnBhY2stY29uZmlnJztcblxuLyoqXG4gKiBSZXR1cm4gYSBmdW5jdGlvbiB3aGljaCBjcmVhdGVzIGEgQ29uZmlnIHdpdGggdGhlIHNwZWNpZmllZCBhcnJheSBvZlxuICogbG9hZGVycyB3aGVuIGNhbGxlZC5cbiAqXG4gKiBJZiBhIGN1c3RvbWlzZXIgZnVuY3Rpb24gaXMgcHJvdmlkZWQsIGl0J3MgaW52b2tlZCB3aGVuIHJldHVybmVkIGZ1bmN0aW9uIGlzXG4gKiBpbnZva2VkLCB3aXRoIHRoZSBkZWZhdXRMb2FkZXJzIGFycmF5IGFzIHRoZSBmaXJzdCBhcmd1bWVudCBmb2xsb3dlZCBieSBhbnlcbiAqIGFyZ3MgdGhlIHJldHVybmVkIGZ1bmN0aW9uIGlzIGludm9rZWQgd2l0aC4gSXQgc2hvdWxkIHJldHVybiBhbiBhcnJheSBvZlxuICogbG9hZGVycyB3aGljaCB3aWxsIGJlIHVzZWQgaW4gdGhlIHJlc3VsdGluZyBDb25maWcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2FkZXJzKGRlZmF1bHRMb2FkZXJzLCBjdXN0b21pc2VyID0gaWRlbnRpdHkpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgaWYoIWlzQXJyYXkoZGVmYXVsdExvYWRlcnMpKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBmaXJzdCBhcmd1bWVudCBtdXN0IGJlIGFuIGFycmF5LCBnb3Q6ICR7ZGVmYXVsdExvYWRlcnN9YCk7XG5cbiAgICAgICAgbGV0IGxvYWRlcnMgPSBjdXN0b21pc2VyKGRlZmF1bHRMb2FkZXJzLCAuLi5hcmdzKTtcblxuICAgICAgICByZXR1cm4gbmV3IENvbmZpZygpLm1lcmdlKHtcbiAgICAgICAgICAgIG1vZHVsZToge1xuICAgICAgICAgICAgICAgIGxvYWRlcnM6IGxvYWRlcnNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEFzIGxvYWRlcnMoKSwgZXhjZXB0IHRoZSBmdW5jdGlvbiBpdHNlbGYgYW5kIHRoZSBjdXN0b21pc2VyIHRha2UgYSBzaW5nbGVcbiAqIGxvYWRlciwgbm90IGFuIGFycmF5IG9mIGxvYWRlcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2FkZXIoZGVmYXVsdExvYWRlciwgY3VzdG9taXNlciA9IGlkZW50aXR5KSB7XG4gICAgcmV0dXJuIGxvYWRlcnMoW2RlZmF1bHRMb2FkZXJdLCAoW2RlZmF1bHRMb2FkZXJdLCAuLi5hcmdzKSA9PiB7XG4gICAgICAgIHJldHVybiBbY3VzdG9taXNlcihkZWZhdWx0TG9hZGVyLCAuLi5hcmdzKV07XG4gICAgfSlcbn1cblxuLyoqXG4gKiBJZiB2YWx1ZSBpcyBhIGZ1bmN0aW9uLCByZXR1cm4gdGhlIHJlc3VsdCBvZiBleGVjdXRpbmcgaXQsIG90aGVyd2lzZSByZXR1cm5cbiAqIHRoZSB2YWx1ZSBhcyBpcy5cbiAqL1xuZnVuY3Rpb24gcmVzb2x2ZSh2YWx1ZSkge1xuICAgIGlmKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gdmFsdWUuY2FsbCgpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG59XG5cbi8qKlxuICogTG9va3VwIGEgdmFsdWUgZnJvbSB0aGUgZGVmYXVsdCB3ZWJwYWNrLWNvbmZpZyBlbnZpcm9ubWVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVudihrZXksIGVudj1lbnZpcm9ubWVudCkge1xuICAgIHJldHVybiByZXNvbHZlKGVudi5nZXQoa2V5KSk7XG59XG4iXX0=