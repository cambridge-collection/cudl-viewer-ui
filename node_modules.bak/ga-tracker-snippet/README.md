# ga-tracker-snippet

[![Build Status](https://travis-ci.org/shinnn/ga-tracker-snippet.svg?branch=master)](https://travis-ci.org/shinnn/ga-tracker-snippet)
[![Build status](https://ci.appveyor.com/api/projects/status/2t08amtmb6w4trjv?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/ga-tracker-snippet)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/ga-tracker-snippet.svg)](https://coveralls.io/r/shinnn/ga-tracker-snippet)
[![Dependency Status](https://david-dm.org/shinnn/ga-tracker-snippet.svg)](https://david-dm.org/shinnn/ga-tracker-snippet)
[![devDependency Status](https://david-dm.org/shinnn/ga-tracker-snippet/dev-status.svg)](https://david-dm.org/shinnn/ga-tracker-snippet#info=devDependencies)

Generate a code snippet to create a [Google Analytics](http://www.google.com/analytics/) tracker object

```javascript
gaTrackerSnippet({id: '36461297-9', domain: 'shinnn.github.io'});
```

yields:

```javascript
ga('create', 'UA-36461297-9', 'shinnn.github.io');
ga('send', 'pageview');
```

## Installation

### Package managers

#### [npm](https://www.npmjs.org/) [![NPM version](https://badge.fury.io/js/ga-tracker-snippet.svg)](https://www.npmjs.org/package/ga-tracker-snippet)

```sh
npm install ga-tracker-snippet
```

#### [bower](http://bower.io/) [![Bower version](https://badge.fury.io/bo/ga-tracker-snippet.svg)](https://github.com/shinnn/ga-tracker-snippet/releases)

```sh
bower install ga-tracker-snippet
```

#### [Duo](http://duojs.org/)

```javascript
var gaTrackerSnippet = require('shinnn/ga-tracker-snippet');
```

### Standalone

[Download the standalone build.](https://raw.githubusercontent.com/shinnn/ga-tracker-snippet/master/dist/ga-tracker-snippet-standalone.js)

## API

### gaTrackerSnippet([*options*])

*options*: `Object`  
Return: `String`

It returns a string of JavaScript code which creates a [tracker object of Google Universal Analytics](https://developers.google.com/analytics/devguides/collection/analyticsjs/advanced#creation).

```javascript
gaTrackerSnippet(); //=> 'ga(\'create\', \'UA-XXXXX-X\', \'auto\');\nga(\'send\', \'pageview\');'
```

#### options.id

Type: `String`  
Default: `XXXXX-X`

Set web property ID. `UA-` prefix maybe omitted.

```javascript
gaTrackerSnippet({id: '36461297-9'}); //=> 'ga(\'create\', \'UA-36461297-9\', ... '

gaTrackerSnippet({id: 'UA-36461297-9'}) === gaTrackerSnippet({id: '36461297-9'}); //=> true
```

#### options.domain

Type: `String`  
Default: `auto`

Set domain of the site.

```javascript
gaTrackerSnippet({domain: 'foo.example.com'});
//=> 'ga(\'create\', \'UA-XXXXX-X\', \'foo.example.com\');\nga(\'send\', \'pageview\');'
```

#### options.globalName

Type: `String`  
Default: `ga`

Change the [global function name](https://developers.google.com/analytics/devguides/collection/analyticsjs/advanced#renaming).

```javascript
gaTrackerSnippet({globalName: '__tracker'});
//=> '__tracker(\'create\', \'UA-XXXXX-X\', \'auto\');\n__tracker(\'send\', \'pageview\');'
```

#### options.minify

Type: `Boolean`  
Default: `false`

Omit whitespaces and newlines from the result.

#### options.singleQuotes

Type: `Boolean`  
Default: `true`

`false` replaces all single quotes with double quotes.

### gaTrackerSnippet([*id*, *domain*])

A simple alias using two strings as its arguments instead of an object.

```javascript
gaTrackerSnippet('36461297-9', 'foo.example.com');
//=> 'ga(\'create\', \'UA-36461297-9\', \'foo.example.com\');\nga(\'send\', \'pageview\');'
```

## CLI

You can use this module as a CLI tool by installing it [globally](https://www.npmjs.org/doc/files/npm-folders.html#global-installation).

```sh
npm install -g ga-tracker-snippet
```

### Usage

```sh
Usage: ga-tracker-snippet [options]

Options:
--id,      -i  Set web property ID
--domain,  -d  Set domain ("auto" by default)
--global,  -g  Change the global function name ("ga" by default)
--minify,  -m  Omit whitespaces and newlines from output
--double,  -w  Use double quotes (single quotes by default)
--help,    -h  Print usage information
--version, -v  Print version
```

## License

Copyright (c) 2014 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).
