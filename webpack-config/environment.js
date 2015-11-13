import path from 'path';
import util from 'util';

import ConfigEnvironment from 'webpack-config/lib/configEnvironment';
import WebpackConfig from 'webpack-config';
import result from 'lodash/object/result';
import isFunction from 'lodash/lang/isFunction';
import parseArgs from 'minimist';

import { rootPath } from './paths';


const DEFAULT_ENV = 'production';

// JSON metadata gets bundled under this package in the maven-built jar
const JAVA_NAMESPACE = 'ulcambridge.foundations.viewer.viewer-ui';

function temporarilyMonkeyPatchWebpackConfig() {
    let value = function(key) {
        return result(this.variables, key);
    }

    ConfigEnvironment.prototype.value = value;
}

/**
 * As _.result() except if default is a function it's called to obtain the
 * default value.
 */
function resultDefaultFunc(object, path, defaultValue) {
    let sentinel = {};

    let value = result(object, path, sentinel);

    if(value === sentinel) {
        if(isFunction(defaultValue)) {
            return defaultValue(object, path);
        }

        return defaultValue;
    }

    return value;
}

function envDependant(environ, key, values, defaultValue) {
    return () => {
        return resultDefaultFunc(values, environ.value(key), defaultValue);
    }
}

export function populateEnvironment(environ) {
    temporarilyMonkeyPatchWebpackConfig();

    // Webpack doesn't expose its command line args, so have have to peek at
    // them in a hackish way.
    let args = parseArgs(process.argv);

    let ifEnv = function(values) {
        let defaultFunc = (environ, key) => {
            throw new Error(`Unknown ${key}: ${environ[key]}, values: ${util.inspect(values)}`);
        };

        return envDependant(environ, 'cudl-viewer-ui.env', values, defaultFunc);
    }

    environ.add({
        'cudl-viewer-ui': {
            // Use ./built as the output path unless it's overridden on the
            // command line.
            outDir: rootPath(args['output-path'] ?
                             args['output-path'] : './built'),
        }
    });

    environ.add({
        'cudl-viewer-ui': {
            env: () => environ.value('env') || DEFAULT_ENV,

            filenameTemplateJs: ifEnv({
                dev:        'js/[name].js',
                production: 'js/[name]-[chunkhash].js'
            }),

            filenameTemplateJsChunk: ifEnv({
                dev:        'js/chunks/[name].js',
                production: 'js/chunks/[name]-[chunkhash].js'
            }),

            filenameTemplateAsset: ifEnv({
                dev:        'assets/[name].[ext]',
                production: 'assets/[name]-[hash].[ext]'
            }),

            filenameTemplateCss: ifEnv({
                dev:        'css/[name].css',
                production: 'css/[name]-[chunkhash].css'
            }),

            assetJsonFilename: ifEnv({
                dev:        'webpack-assets-dev.json',
                production: 'webpack-assets.json'
            }),

            assetJsonBasePath: ifEnv({
                dev:        rootPath('./src'),
                production: environ.value('cudl-viewer-ui.outDir')
            }),

            assetJsonPath: () => path.resolve(
                environ.value('cudl-viewer-ui.assetJsonBasePath'),
                'resources',
                JAVA_NAMESPACE.replace(/\./g, '/')),

            // An absolute public path is required at compile time on the
            // dev build, as code is loaded on the devserver using blobs, which
            // have baseurls like blob:
            // In production the public path provided at runtime by the viewer.
            publicPath: ifEnv({
                dev:        'http://localhost:8080/',
                production: null
            }),

            // The location of the ckeditor assets, relative to the webpack public path
            ckeditorLocation: 'vendor/ckeditor/'
        }
    });
}