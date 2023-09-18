# CUDL Viewer Front-end UI Assets

This project contains the front-end UI assets (JavaScript, CSS etc.) for the
[CUDL-Viewer](https://github.com/cambridge-collection/cudl-viewer).

It is exported as `ulcambridge.foundations.viewer:viewer-ui` in the
CUDL Maven repository for use in cudl-viewer.

[Webpack](https://webpack.js.org/) is used to compile the various js and css
files into bundles.

## Requirements: 

This project requires **Maven 3.6+**, which is available on Ubuntu 16.04 LTS and above.
It also needs node version **v16.20+**
and npm version **8.19+**

# Quickstart

Clone this repo and then run:

```
$ make
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
`<version>4.0.9-SNAPSHOT</version>`

Then, go to the *CUDL-Viewer* `pom.xml` and change the `cudl.viewer-ui-version` to match, for example:
`<cudl-viewer-ui.version>4.0.9-SNAPSHOT</cudl-viewer-ui.version>`.

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
e.g. `<nodeVersion>v16.20.2</nodeVersion>`

If you have installed `node` with `nvm`, ensure you are switched to use the correct version:

```
$ nvm use 16.20.2
```

Install the compatible version of webpack and the other relevant dependencies globally 
so that they're available as shell commands. Inspect the `package.json` for the correct versions, 
rather than just copy-pasting the command below:

```
$ npm install -g webpack@^5.88.2 webpack-cli@^5.1.4 webpack-dev-server@^4.15.1
```

Note that this will install these packages globally for this version of `node`.

## Install project dependencies

Make sure you are in the `cudl-viewer-ui` directory.

If you don’t already have the dependencies downloaded from a previous Maven build (see
[Quickstart](https://github.com/cambridge-collection/cudl-viewer-ui/blob/main/README.md#quickstart), above), 
you need to run the install manually.

```
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
$ webpack serve --mode development --hot
```
or

```
$ make dev
```

If this is successful, you should now see a directory structure at: http://localhost:8080/

You can check that it recompiles the assets on the fly by editing and saving a file in 
CUDL-Viewer-UI, and checking the output as it should show the resources being recompiled.

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

**Releasing should be done from the main branch.**

The Maven release plugin should be used to tag release versions and deploy
release artifacts to the
[CUDL Maven repository](https://wiki.cam.ac.uk/cudl-docs/CUDL_Maven_Repository).


## Step 1

Run the prepare phase of the Maven release plugin:

```
mvn release:prepare
```

It'll prompt you for the version to be released and the next development
version. **[Follow semver](http://semver.org/) when choosing version numbers**.

This will run a full build, which will take longer than usual (several minutes)
due to minifying being enabled.

Once it's done you'll have two new commits on your current branch and a new tag.
None of these will have been pushed upstream yet.

# Step 3

Run the perform phase of the Maven release plugin:

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
