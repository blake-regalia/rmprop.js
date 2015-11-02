# rmprop [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> Override all properties inhereted by an object's prototype chain


If you've ever wanted to use property names for other purposes such as the `.length` property on an `Array` or `String`, this library will transform your object (eg: an instance of a class) into an object with all properties found in its prototype chain set to `undefined`, effectively stopping the javascript engine from bubbling up the prototype chain to find the values for those properties. 


## Install

```sh
$ npm install --save rmprop
```


## Usage

### rmprop(thing: anytype[, exclude: array{string}])

The optional `exclude` argument declares which properties to not override.

```js
var rmprop = require('rmprop');

var array = rmprop(['hello','there', ['indexOf']); // override all array properties except for the .indexOf method

array.length; // undefined
array[0]; // 'hello'; because this property is defined on the object itself, not in Array.prototype
array.indexOf('there'); // 1
array.join; // undefined
array.reverse; // undefined

var str = rmprop('hi', ['valueOf']); // do not override .valueOf
(str == 'hi'); // true; loose equality operator uses valueOf function
(str === 'hi'); // false; str type is a String object
str.length; // undefined
str.__proto__; // undefined
str[rmprop.real] === 'hi'; // true
```

### Primitive datatypes
Primitive datatypes will be boxed into their object equivalent (eg: `25` becomes `Number(25)`) so that they can hold properties. This also means that you need to 

## License

ISC © [Blake Regalia]()


[npm-image]: https://badge.fury.io/js/rmprop.svg
[npm-url]: https://npmjs.org/package/rmprop
[travis-image]: https://travis-ci.org/blake-regalia/rmprop.svg?branch=master
[travis-url]: https://travis-ci.org/blake-regalia/rmprop
[daviddm-image]: https://david-dm.org/blake-regalia/rmprop.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/blake-regalia/rmprop
[coveralls-image]: https://coveralls.io/repos/blake-regalia/rmprop/badge.svg
[coveralls-url]: https://coveralls.io/r/blake-regalia/rmprop
