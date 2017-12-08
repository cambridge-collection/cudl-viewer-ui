# assert-unique

[![Build Status](https://travis-ci.org/shinnn/assert-unique.svg?branch=master)](https://travis-ci.org/shinnn/assert-unique)
[![Build status](https://ci.appveyor.com/api/projects/status/w903h2cdw14tafdj?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/assert-unique)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/assert-unique.svg)](https://coveralls.io/r/shinnn/assert-unique)
[![Dependency Status](https://david-dm.org/shinnn/assert-unique.svg)](https://david-dm.org/shinnn/assert-unique)
[![devDependency Status](https://david-dm.org/shinnn/assert-unique/dev-status.svg)](https://david-dm.org/shinnn/assert-unique#info=devDependencies)

Test if values have no duplication

```javascript
assertUnique(3, 'a', 3, 3, true, 'a'); // Error: 3 and "a" are duplicated. 
```

## Installation

### Package managers

#### [npm](https://www.npmjs.org/) [![NPM version](https://badge.fury.io/js/assert-unique.svg)](https://www.npmjs.org/package/assert-unique)

```sh
npm install assert-unique
```

#### [bower](http://bower.io/) [![Bower version](https://badge.fury.io/bo/assert-unique.svg)](https://github.com/shinnn/assert-unique/releases)

```sh
bower install assert-unique
```

#### [Duo](http://duojs.org/)

```javascript
var assertUnique = require('shinnn/assert-unique');
```

### Standalone

Directly download [the script file](https://raw.githubusercontent.com/shinnn/assert-unique/master/assert-unique.js) and its dependencies.

#### Dependencies

* [array-duplicated](https://raw.githubusercontent.com/shinnn/array-duplicated/master/array-duplicated.js)
* [array-to-sentence](https://raw.githubusercontent.com/shinnn/array-to-sentence/master/array-to-sentence.js)

## API

### assertUnique([*val0*, *val1*, *val2*, ...])

*val0*, *val1*, *val2*, ...: any types  

It throws an error when the arguments include duplicated values. Otherwise it doesn't throw any errors.

```javascript
assertUnique(1, '1',); // doesn't throw error
assertUnique(); // doesn't throw error

assertUnique('h', 'e', 'l', 'l', 'o'); // Error: "l" is duplicated.
assertUnique(parseInt, parseInt); // Error: [Function: parseInt] is duplicated.
```

*Note that it doesn't check deep equality.*

```javascript
var obj = {};

assertUnique(obj, obj); // Error: {} is duplicated.

assertUnique({}, {}); // doesn't throw error
```

## License

Copyright (c) 2014 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).
