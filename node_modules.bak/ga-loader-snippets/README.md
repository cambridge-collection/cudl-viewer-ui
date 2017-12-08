# ga-loader-snippets

[![NPM version](https://badge.fury.io/js/ga-loader-snippets.svg)](https://www.npmjs.org/package/ga-loader-snippets)
[![Bower version](https://badge.fury.io/bo/ga-loader-snippets.svg)](https://github.com/shinnn/ga-loader-snippets/releases)
[![Build Status](https://travis-ci.org/shinnn/ga-loader-snippets.svg?branch=master)](https://travis-ci.org/shinnn/ga-loader-snippets)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/ga-loader-snippets.svg)](https://coveralls.io/r/shinnn/ga-loader-snippets)
[![devDependency Status](https://david-dm.org/shinnn/ga-loader-snippets/dev-status.svg)](https://david-dm.org/shinnn/ga-loader-snippets#info=devDependencies)

A collection of Google Analytics loader scripts with various number of parameters, used in [isogram](https://github.com/shinnn/isogram)

## Download

* [**For production**](https://github.com/shinnn/ga-loader-snippets/tree/master/snippets-production)
* [**For development**](https://github.com/shinnn/ga-loader-snippets/tree/master/snippets-development)

### File size (production version)

| number of parameters | file size (byte) |
| --- | --- |
| 3 | 273 |
| 4 | 275 |
| 5 | 273 |
| 6 | 293 |
| 7 | 297 |

*Note that 3, 4, and 5 parameter versions don't support Firefox < 9, BlackBerry OS 5 or  OmniWeb 622.*

## Use as a JavaScript Library

### Installation

#### Package managers

##### [npm](https://www.npmjs.org/)

```sh
npm install ga-loader-snippets
```

##### [Bower](http://bower.io/)

```sh
bower install ga-loader-snippets
```

##### [Duo](http://duojs.org/)

```javascript
var gaLoaderSnippets = require('shinnn/ga-loader-snippets');
```

### API

#### gaLoaderSnippets

Type: `Object`

It has these 5 properties:

* **gaLoaderSnippets.with3params**
* **gaLoaderSnippets.with4params**
* **gaLoaderSnippets.with5params**
* **gaLoaderSnippets.with6params**
* **gaLoaderSnippets.with7params**

Type: `String`

Each of them contains a Google Analytics loader script.

```javascript
gaLoaderSnippets.with3params;
//=> '!function(A,B,C){A.GoogleAnalyticsObject=C,A[C]||(A[C]=function(){\n(A[C].q=A[C].q||[]).push(arguments)}),A[C].l=+new Date;var s=B.createElement("script"),\ne=B.scripts[0];s.src="//www.google-analytics.com/analytics.js",\ne.parentNode.insertBefore(s,e)}(window,document,"ga");'

gaLoaderSnippets.with7params;
//=> '!function(A,B,C,D,E,F,G){A.GoogleAnalyticsObject=C,A[C]||(A[C]=function(){\n(A[C].q=A[C].q||[]).push(arguments)}),A[C].l=+new Date,F=B.createElement(D),\nG=B.getElementsByTagName(D)[0],F.src=E,G.parentNode.insertBefore(F,G)}\n(window,document,"ga","script","//www.google-analytics.com/analytics.js");'
```

## Acknowledgement

I used [Mathias Bynens's blog post about Google Analytics snippet](https://mathiasbynens.be/notes/async-analytics-snippet) and [his commit](https://github.com/h5bp/html5-boilerplate/commit/48d49e96d6db282eb9686d31ebbc5cbbbdd4d966) on [HTML5 boilerplate](https://github.com/h5bp/html5-boilerplate) as reference. Thanks, [mathiasbynens](https://github.com/mathiasbynens).

## Licenses

### [HTML5 boilerplate](http://html5boilerplate.com/)

Copyright (c) HTML5 Boilerplate

Licensed under [the MIT License](https://github.com/h5bp/html5-boilerplate/blob/master/LICENSE.md).

### ga-loader-snippets

Copyright (c) 2014 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSES.md#ga-loader-snippets).
