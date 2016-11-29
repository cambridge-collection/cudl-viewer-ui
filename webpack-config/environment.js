import path from 'path';
import util from 'util';

import { ConfigEnvironment } from 'webpack-config';
import result from 'lodash/result';
import isFunction from 'lodash/isFunction';
import parseArgs from 'minimist';
import RecursiveIterator from 'recursive-iterator';
import { env } from 'cudl-webpack-config/lib/util';

import { rootPath } from './paths';


const DEFAULT_ENV = 'production';

const DEVSERVER_DEFAULT_HOST = 'localhost';
const DEVSERVER_DEFAULT_PORT = 8080;

// JSON metadata gets bundled under this package in the maven-built jar
const JAVA_NAMESPACE = 'ulcambridge.foundations.viewer.viewer-ui';


function resolve(value) {
    if(typeof value === 'function') {
        return value.call();
    }
    return value;
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
        return resultDefaultFunc(values, env(key, environ),
                                 defaultValue);
    }
}

/**
 * Try to guess the correct public path if --host or --port are provided to our
 * process. The devserver uses these to control how it listens.
 */
function defaultDevPublicPath(args) {
    let host = args['host'] || DEVSERVER_DEFAULT_HOST,
        port = args['port'] || DEVSERVER_DEFAULT_PORT,
        scheme = args['https'] ? 'https' : 'http';

    return `${scheme}://${host}:${port}/`;
}

/**
 * Enumerate pairs of [path, value] from leaf values in an object hierachy.
 */
function* flatten(obj, separator='.') {
    let iterator = new RecursiveIterator(obj);

    for(let {path, node} of iterator) {
        if(iterator.isLeaf(node)) {
            yield [path.join(separator), node];
        }
    }
}

/**
 * Add all of the [key, value] pairs in the pairs iterable into the
 * ConfigEnvironment.
 */
function setAll(env, pairs) {
    for(let [k, v] of pairs) {
        env.set(k, v);
    }
}

export function populateEnvironment(environ) {
    // Webpack doesn't expose its command line args, so have have to peek at
    // them in a hackish way.
    let args = parseArgs(process.argv);

    let ifEnv = function(values) {
        let defaultFunc = (environ, key) => {
            throw new Error(`Unknown ${key}: ${environ[key]}, values: ${util.inspect(values)}`);
        };

        return envDependant(environ, 'cudl-viewer-ui.env', values, defaultFunc);
    }

    setAll(environ, flatten({
        // TODO: flatten
        env: () => process.env.WEBPACK_ENV || DEFAULT_ENV,
        'cudl-viewer-ui': {
            env: () => env('env', environ),

            // Use ./built as the output path unless it's overridden on the
            // command line.
            outDir: rootPath(args['output-path'] ?
                             args['output-path'] : './built'),

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
                production: () => env('cudl-viewer-ui.outDir', environ)
            }),

            assetJsonPath: () => path.resolve(
                env('cudl-viewer-ui.assetJsonBasePath', environ),
                'resources',
                JAVA_NAMESPACE.replace(/\./g, '/')),

            // An absolute public path is required at compile time on the
            // dev build, as code is loaded on the devserver using blobs, which
            // have baseurls like blob:
            // In production the public path provided at runtime by the viewer.
            publicPath: ifEnv({
                dev:        defaultDevPublicPath(args),
                production: null
            }),

            // The location of the ckeditor assets, relative to the webpack public path
            ckeditorLocation: 'vendor/ckeditor/',

            sourceMapType: ifEnv({
                dev:        'eval-source-map',
                production: 'source-map'
            })
        }
    }));
}
