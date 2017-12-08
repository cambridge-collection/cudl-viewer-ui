# array-duplicated

[![NPM version](https://img.shields.io/npm/v/array-duplicated.svg)](https://www.npmjs.com/package/array-duplicated)
[![Bower version](https://img.shields.io/bower/v/array-duplicated.svg)](https://github.com/shinnn/array-duplicated/releases)
[![Build Status](https://travis-ci.org/shinnn/array-duplicated.svg?branch=master)](https://travis-ci.org/shinnn/array-duplicated)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/array-duplicated.svg)](https://coveralls.io/r/shinnn/array-duplicated)
[![devDependency Status](https://david-dm.org/shinnn/array-duplicated/dev-status.svg)](https://david-dm.org/shinnn/array-duplicated#info=devDependencies)

Return an array of duplicated values in a given array

```javascript
arrayDuplicated(['a', 2, 'b', true, 'b', 12, 'b', true, ['a']]) //=> ['b', true];
```

## Installation

### Package managers

#### [npm](https://www.npmjs.com/)

```sh
npm install array-duplicated
```

#### [bower](http://bower.io/)

```sh
bower install array-duplicated
```

#### [Duo](http://duojs.org/)

```javascript
var arrayDuplicated = require('shinnn/array-duplicated');
```

### Standalone

[Download the script file directly.](https://raw.githubusercontent.com/shinnn/array-duplicated/master/array-duplicated.js)

## API

### arrayDuplicated(*array*)

*array*: `Array` of any values  
Return: `Array`

It finds duplicated values in the array, and returns an array of them.

If the array doesn't contain duplicated values, it returns an empty array.

```javascript
arrayDuplicated([0,1,1,1,1,1,1,1,1,1]); //=> [1]
arrayDuplicated([0,1,2,3,4,5,6,7,8,9]); //=> []
```

## License

Copyright (c) 2014 - 2015 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).
