# rmprop [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> Override all properties inhereted by an object's prototype chain


If you've ever wanted to use property names for other purposes such as the `.length` property on an `Array` or `String`, this library will transform your object (eg: an instance of a class) into an object with all properties found in its prototype chain set to `undefined`, effectively stopping the javascript engine from bubbling up the prototype chain to find the values for those properties. 

This module was created to support meta-programming in javascript; it is useful for creating API objects in which a property name is set dynamically and used like a dictionary (ie: when the property name could be any string). While Proxies are not yet supported, this might suffice as an alternative to your trap needs.

## Install

```sh
$ npm install --save rmprop
```


## Usage

### rmprop(thing: anytype[, exclude: array{string}])

Finds all properties defined by each class in `thing`'s prototype chain, then creates a virtual copy of `thing` object with all those properties set to `undefined`. Not only does this block the prototype properties from being accessed, but it also lets you define properties that the original object might not allow (such as the `.length` property). The optional `exclude` argument declares which properties not to override.

```js
var rmprop = require('rmprop');

var arr = rmprop(['hello','there'], ['indexOf']);
// ^^ override all Array prototype properties except for the .indexOf method

arr.forEach; // undefined

arr[0]; // 'hello'
// ^^ this property is defined on the object itself, not in Array.prototype

arr.length; // undefined
// ^^ although this property is defined on the object itself, Array.prototype also contains a .length property, so this is overridden by default

arr.indexOf('there'); // 1
arr.join; // undefined
arr.reverse; // undefined

arr.prototype; // undefined
arr.__proto__; // undefined
```

### rmprop.real

This is a Symbol which allows you to access the original (real) value of `thing` that was given to rmprop. Eg:

```js
var rmprop = require('rmprop');

var arr = rmprop(['hi','there']);

// redefine how length is computed
Object.defineProperty(arr, 'length', {
	get: function() {
		return this[unprop.real].join('').length;
	},
})

arr[0]; // 'hi'
arr.length; // 7
arr.indexOf; // undefined

arr[rmprop.real].length; // 2
arr[rmprop.real].indexOf; // function indexOf() { [native code] }
```

### Testing equality

`rmprop` creates a virtual copy of the real object, meaning that it creates a property/method on a new object for each corresponding property/method on the original object. The object you get back from rmprop will never be identical to the one you gave it.

Consider the following example:

```js
var obj = {test: 'hi'};
var virtual = rmprop(obj);

virtual.test; // 'hi'

(virtual === obj); // false

(virtual[unprop.real] === obj); // true
```

However, excluding the `valueOf` property on primitive datatypes will yield true when the loose equality operator is used:
```js
var num = unprop(5, ['valueOf']);

(num == 5); // true
(num === 5); // false

typeof num; // 'object'
```

### Transparent properties/methods

The virtual copy returned by `rmprop` keeps any properties not defined in `thing`'s prototype chain and treats them as transparent proxies for the original object. This means that changes to the virtual copy will update the original object.

```js
var obj = {test: 'hi'};
var virtual = rmprop(obj);

// change the value of a property on the virtual object
virtual.test = 'hello';

// changes are reflected by real object
obj.test; // 'hello'
virtual.test; // 'hello'
```


### Primitive datatypes

Primitive datatypes get boxed into their object equivalent (eg: `25` becomes `Number(25)`) so that they can hold properties. 

```js
var str = rmprop('hi', ['valueOf']); // do not override .valueOf

(str == 'hi'); // true
// ^^ loose equality operator uses valueOf function

(str === 'hi'); // false
// ^^ strict equality checks types too; str will never be primitive type

(str[rmprop.real] === 'hi'); // true
// ^^ using the .real symbol grants access to the original (real) value

str.length; // undefined
str.indexOf; // undefined
str.__proto__; // undefined

str instanceof String; // false
```



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
