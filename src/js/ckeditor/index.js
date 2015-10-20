// This module loads ckeditor in a commonjs/webpack environment. It's a pain
// in the ass because ckeditor has its own custom module loading system and
// build system. The main (built, concatenated) ckeditor file depends on several
// others, even though it's been pre-built. There's no easy way to hook into
// the the import system, so we've got to expose all the ckeditor assets as
// static files and allow ckeditor to request them itself.

import url from 'url';

// Define the basepath according to the webpack build. The devserver serves
// the assets from a different location to the production build.
window.CKEDITOR_BASEPATH = url.resolve(__webpack_public_path__, CKEDITOR_LOCATION);

// Load the main ckeditor file
export default require('ckeditor/ckeditor');

// Even though ckeditor will resolve them itself, we can avoid a few requests
// by re-loading some modules using webpack.
require('ckeditor/lang/en');
require('ckeditor/styles');
