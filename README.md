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
    * Internal modules can be shared between different projects. For example,
      the embedded viewer and this (main) viewer can share code.
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
build, as well as a separate .jar file containing the webpack compiler output
under `META-INF/resources`.

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

# Releasing

The maven release plugin should be used to tag release versions and deploy
release artifacts to the
[CUDL Maven repository](https://wiki.cam.ac.uk/cudl-docs/CUDL_Maven_Repository).

## Step 1: Update `package.json`
Make sure the versions of CUDL dependencies are locked down to tagged versions
in `package.json`, e.g:

```
{
  ...
  "dependencies": {
    ...
    "cudl-viewer-bubbles": "git+ssh://git@bitbucket.org/CUDL/cudl-viewer-bubbles.git#1.1.0",
    "cudl-viewer-tagging-ui": "git+ssh://git@bitbucket.org/CUDL/cudl-viewer-tagging-ui.git#1.0.0",
    ...
  }
  ...
}
```

Update the version in `package.json` to the version to be released. (It'd be
nice to automate this.)

## Step 2

Run the prepare mojo of the Maven release plugin:

```
$ mvn release:prepare
```

It'll prompt you for the version to be released and the next development version.
**[Follow semver](http://semver.org/) when choosing version numbers**.

This will run a full build, which will take longer than usual (several minutes)
due to minifying being enabled.

Once it's done you'll have two new commits on your current branch and a new tag.
None of these will have been pushed upstream yet.

# Step 3

Run the perform mojo of the Maven release plugin:

```
$ mvn release:perform
```

This will checkout the tag that `prepare` just created into a subdirectory, run
ANOTHER full rebuild with that and deploy the result to the CUDL Maven
repository.

# Step 4

Push the new commits and tag to the upstream repository:

```
$ git push origin master 1.0.0
```

(Assuming you're on the master branch and you just created `1.0.0`. Adjust
version as appropriate.)
