# CUDL Viewer front-end UI assets

This project contains the front-end UI assets (Javascript, CSS etc) for the
cudl-viewer.

It's exported as a Maven artifact for use in cudl-viewer.

[webpack](http://webpack.github.io/) is used to compile the various js and css
files into bundles.

There are several benefits to using webpack:

* Developer benefits
    * [Next-generation javascript features](https://babeljs.io/) not yet supported
      by browsers can be used via babel
    * [Next-generation CSS features](http://cssnext.io/) can be used via postcss
    * Images can be optimised on the fly, or multiple resolutions created for use
      with [srcset](http://www.webkit.org/demos/srcset/)
* User benefits
    * Faster page loads
        * less resources to download due to bundling
        * more aggressive caching can be used due to hashed filenames
    * Less bandwidth used

## How this all works

Each *type* of page has a javascript file entry point in `src/js/pages/`. A
bundle is generated containing the page javascript, and all
javascript/css/assets referenced from the entry point.

When using the dev config (`webpack.config.dev.babel.js`) the CSS is kept in the
bundle with the javascript. When using the normal config
(`webpack.config.babel.js`) the CSS gets extracted into separate files so that
it can be loaded in parallel with the js by the browser (and still works if js
is disabled).

Javascript/css files which are used by multiple pages are split into (one or
more, but currently just one) common chunks. This allows shared resources to be
downloaded and cached once on the first page view. Subsequent page views will
have the common chunk in the cache, so only the page-specific chunks need to be
requested by the browser.

As it builds bundles, webpack can transform the input files. We apply the [babel
compiler](https://babeljs.io/) to the javascript, allowing modern/future
javascript features to be used. The CSS is passed through
[postcss](https://github.com/postcss/postcss), allowing things like autoprefixer
to be used, which automatically adds vendor prefixes to CSS property names.

### Interaction with the CUDL Viewer server

The CUDL Viewer server depends on this project as a Maven artifact. The
artifacts created by `$ mvn package` include a jar with JSON metadata on the
build, as well as a separate .zip file containing the webpack compiler output.

There are two types of metadata files: chunk dependencies and chunk paths.
`deps.json` defines which chunks need to be loaded before each chunk. This is
used to load common chunks before the per-page chunks. `webpack-assets.json`
contains a mapping from the chunk names to file paths. This is required because
in production, the filenames contain a checksum of the file's contents, to allow
long cache expiration times. `webpack-assets-dev.json` is also included, which
performs the same chunk -> path data, but is used to locate the chunks on the
webpack dev server.

# Developing

While actively making changes to the source, you'll want to use the webpack
dev server, which supports Hot Module Replacement (HMO) to live update the page
being viewed as you update source files.

Run the dev server as follows:

```
$ webpack-dev-server --config ./webpack.config.dev.babel.js --inline --hot
```

You can omit `--inline` and `--hot` if you don't want HMR.

By default the CUDL-Viewer will use the webpack-built assets in the maven
artifact. You need to configure CUDL-Viewer to point at your webpack dev server.

**TODO: Explain how to make CUDL-Viewer use the dev server instead of the
pre-compiled assets in the maven artifact.**

# Building

Use maven to build the UI for use in CUDL-Viewer. `$ mvn package` will run
webpack in production mode (minifying) and package up the result in the
normal maven way (output in `target/`).

Running `$ mvn install` will build the artifact and install it in your local
repository so that it can be resolved when running the maven build of
CUDL-Viewer.

Note that you'll still need a copy of this artifact installed when using the
webpack dev server, as the artifact contains metadata JSON as well as the
webpack-built assets. The assets themselves will be ignored when using the
webpack devserver.
