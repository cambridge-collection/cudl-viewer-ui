# CUDL Viewer Front-end UI Assets

This project contains the front-end UI assets (JavaScript, CSS etc.) for the
[CUDL-Viewer](https://github.com/cambridge-collection/cudl-viewer).

It is exported as `ulcambridge.foundations.viewer:viewer-ui` in the
CUDL Maven repository for use in cudl-viewer.

[Webpack](https://webpack.js.org/) is used to compile the various js and css
files into bundles.

## Requirements: Maven 3.6+

This project requires Maven 3.6+, which is available on Ubuntu 16.04 LTS and above.

# Quickstart

Clone this repo and then run:

```
$ mvn install
```

Maven will download `node.js`, install all dependencies, run a full build and
install the result in your local Maven repository so that it can be resolved by
your copy of CUDL-Viewer.

Running a full build takes several minutes, so if you're making non-trivial
changes you'll want to follow the [Developing](https://github.com/cambridge-collection/cudl-viewer-ui/blob/main/README.md#developing) 
instructions, below, to get real-time updates to UI assets in your viewer.

In order for your local CUDL-Viewer app to depend on your local artifact of 
CUDL-Viewer-UI, you need to alter the CUDL-Viewer `pom.xml` file. 

First, find the *CUDL-Viewer-UI* `pom.xml` and find the project version, for example:
`<version>2.0.9-SNAPSHOT</version>`

Then, go to the *CUDL-Viewer* `pom.xml` and change the `cudl.viewer-ui-version` to match, for example:
`<cudl-viewer-ui.version>2.0.9-SNAPSHOT</cudl-viewer-ui.version>`.

# Developing

While actively making changes to the source you'll want to use the webpack
dev server, which supports Hot Module Replacement (HMO) to live update the page
being viewed as you update source files.

## Prerequisites

Optional: Node Version Manager (nvm) is recommended as a convenient way to managed multiple versions of node 
on your local machine. Check the official [nvm Installing and Updating](https://github.com/nvm-sh/nvm#install--update-script) 
instructions for the latest version.

Install the compatible version of [node.js](https://nodejs.org/en/download/) which should come with
[npm](https://www.npmjs.com/). Inspect the CUDL-Viewer-UI `pom.xml` for the correct version 
e.g. `<nodeVersion>v12.16.0</nodeVersion>`

If you have installed `node` with `nvm`, ensure you are switched to use the correct version:

```
$ nvm use 12.16.0
```

Install the compatible version of webpack and the other relevant dependencies globally 
so that they're available as shell commands. Inspect the `package.json` for the correct versions, 
rather than just copy-pasting the command below:

```
$ npm install -g webpack@^4.41.6 webpack-cli@^3.3.11 webpack-dev-server@^3.10.3 bower@^1.8.8 @babel/core@^7.8.6
```

Note that this will install these packages globally for this version of `node`.

## Install project dependencies

Make sure you are in the `cudl-viewer-ui` directory.

If you don’t already have the dependencies downloaded from a previous Maven build (see
[Quickstart](https://github.com/cambridge-collection/cudl-viewer-ui/blob/main/README.md#quickstart), above), 
you need to run the install manually. Most dependencies are npm/node modules, but some are only available via `bower`:

```
$ bower install
[lots of output...]
$ npm install
[lots of output...]
```

## Run Webpack Dev Server

The webpack dev server will watch your files and incrementally recompile what's
changed, making the result available immediately. The `cudl-viewer` has a mode
of operation which delegates serving of UI assets to the dev server instead of
serving the pre-built versions from Maven. This allows you to see changes in the
viewer without doing a Maven build.

> *See the [`cudl-viewer` README](https://github.com/cambridge-collection/cudl-viewer#development) 
> for details on enabling this mode of
> operation, but essentially you need to set `cudl.ui.dev` property to `true`
> in the `cudl-global.properties` file.*

Once you've got the viewer pointed at your dev server you'll need to run the
server as follows:

```
$ webpack-dev-server --config ./webpack.config.dev.babel.js --inline --hot
```

> *You can omit `--inline` and `--hot` if you don't want HMR.*

If this is successful, you should now see a directory structure at: http://localhost:8080/

You can check that it recompiles the assets on the fly by editing and saving a file in 
CUDL-Viewer-UI. The output should log a new hash each time, e.g.

```
 ｢wdm｣: Compiling...
ℹ ｢wdm｣: Hash: a6ebf3943a5d5fa551ed
Version: webpack 4.46.0
Time: 224ms
Built at: 01/17/2023 12:31:08
[...lots of output...]
ℹ ｢wdm｣: Compiled successfully.
```

# Linking CUDL UI dependencies -- not required for basic functionality

The UI currently has two sub projects — the similarity bubbles and tagging
functionality. These are installed in `node_modules` directly from git
repositories on bitbucket, so you can imagine changing them would be quite a
slow process if you had to commit, push and reinstall each time you changed
something. To get around this you can use NPM's linking feature to get live
updates to one or both of these dependencies.

First go to your checkout of the dependency and run `$ npm link`. This will
create a global reference to your version.

Next, in the `cudl-viewer-ui` dir run `$ npm link cudl-viewer-ui-tagging`
(substituting the module name as required).

If you look in `node_modules` you'll now see a symlink rather than a directory
for your dependency.

## Gotchas

Unfortunately this approach results in some problems, but they can be worked
around.

### File watching

Webpack's file watching functionality doesn't seem to traverse symlinks, so you
may need to specify `--watch-poll` when running `webpack-dev-server`.

### Hard-to-debug issues caused by duplicate modules

Linking modules can result in multiple versions of 3rd party modules being
included in the webpack. Some modules (like jQuery) only work correctly when a
single instance is used across the whole application. If different parts of your
code use different copies of jQuery then you get issues like events fired using
one jQuery don't get seen by listeners registered using the other jQuery.

If you suspect this is happening you can tell by using the `Ctrl+p`
functionality of the  Chrome dev tools to search for modules by name. i.e.
`Ctrl+p` -> type `jquery`. You should see a single jQuery module.

This occurs when modules are linked because both the host project and the linked
project have their own copies of jQuery (or whichever dep) in their
`node_modules` directories, as the linked project knows nothing about the
project linking to it. With a normal install the jQuery dep would be installed
once at the top-level `node_modules` directory (assuming both projects depend on
compatible versions).

#### Workaround

You can work around this issue with yet more linking! You link the duplicated
dependency from the top-level project into the linked project, so that they both
use the same version.

For example, say jQuery was being duplicated by `cudl-viewer-ui-tagging`. Enter
the `cudl-viewer-ui/node_modules/jquery` directory and run `$ npm link`. Then
enter `cudl-viewer-ui-tagging` and run `$ npm link jquery`. Now both `ui` and
`ui-tagging` will be pointing at exactly the same jQuery, so there'll be no
duplicate.

# Package CUDL-Viewer-UI for use in CUDL-Viewer

Use Maven to build the UI for use in CUDL-Viewer. `$ mvn package` will run
webpack in production mode (minifying) and package up the result in the
normal Maven way (output in `target/`).

Running `$ mvn install` will build the artifact and install it in your local
repository so that it can be resolved when running the Maven build of
CUDL-Viewer.

Note that you'll still need a copy of this artifact installed when using the
webpack dev server, as the artifact contains metadata JSON as well as the
webpack-built assets. The assets themselves will be ignored when using the
webpack devserver.

# Releasing

The Maven release plugin should be used to tag release versions and deploy
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

## Step 2

Run the prepare mojo of the Maven release plugin (but via our script as we have
to perform some extra steps which are awkward to do in maven):

```
$ bin/release-prepare.sh
```

It'll prompt you for the version to be released and the next development
version. **[Follow semver](http://semver.org/) when choosing version numbers**.

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
$ git push origin main 1.0.0
```

(Assuming you're on the main branch and you just created `1.0.0`. Adjust
version as appropriate.)
