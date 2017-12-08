# CUDL Viewer Bubbles

This repository contains the bubble similarity view shown in the CUDL Viewer's
similar items tab.

It uses [D3](http://d3js.org/) with a
[custom](src/views/bubbles/bubblelayout.js)
[layout](https://github.com/mbostock/d3/wiki/Layouts) to represent similar
items as bubbles sized in proportion to their level of similarity.

The project is compiled as a library by [Webpack](http://webpack.github.io/).
It exports itself as a function on the global `cudl` object provided by the
CUDL Viewer, and assumes the presence of existing CUDL Viewer dependencies such
as jQuery.

It's integrated with the CUDL Viewer by manually copying and pasting the build
js/css files. My plan going forward is to use Webpack for the rest of the CUDL
Viewer UI, and have the Viewer code depend on this repo as a private npm
package.

## Developing

Run `$ npm install` first, and also ensure you have webpack installed globally:
`$ npm install -g webpack`. Then run `$ webpack -w` from the project root
directory. This will start webpack in watch mode, which will update the bundled
code automatically on file changes.

The javascript and css bundles will be produced in `dist/similarity.js` and
`dist/similarity.css` respectively. Sourcemaps for both will also be created to
allow debugging the original source code in browsers.

Then temporarily modify your local CUDL Viewer to symlink to the bundles in
`dist/` rather than the `git-submodule` versions. For tomcat to allow symlinks
you need to set `allowLinking="true"`. This can be achieved by editing/creating
`src/main/webapp/META-INF/context.xml` to contain something like:

```
<Context path="" allowLinking="true"/>
```

## Building

Run `$ npm install` and ensure `grunt-cli` is installed globally:
`$ npm install -g grunt-cli`.

Run `$ grunt clean webpack:production` to build the code into `dist/`.

## Releasing a version

1. Build as per previous instructions
2. Add the contents of `dist/` to git (`-f` will be required as it's ignored)
3. Commit and tag the commit with the version in `package.json`
4. Remove the files committed in dist/ (so that they don't constantly show up
   in `$ git status` when developing) and increment the version in
   `package.json` in preparation for the next development phase
5. Update the version in `cudl-viewer` by manually copying:

    * `dist/similarity.js` to `src/main/webapp/scripts/`
    * `dist/similarity.css` to `src/main/webapp/styles/`
