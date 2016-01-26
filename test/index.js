'use strict';

import assert from 'assert';
import rmprop from '../lib';
import arginfo from 'arginfo';

const eq = (z_expect, z_actual) => {
	assert.deepEqual(z_expect, z_actual);
};

const udf = (z_thing, s_property) => {
	assert.deepEqual(z_thing[s_property], undefined, '"'+s_property+'" is not undefined; instead = '+z_thing[s_property]);
};

describe('rmprop', function () {

	it('supports booleans', () => {
		let b = rmprop(false);

		udf(b, 'constructor');
		udf(b, 'valueOf');
		udf(b, 'toString');
		udf(b, '__proto__');
	});

	it('supports exclusion for booleans', () => {
		let b = rmprop(false, ['valueOf', 'toString']);

		eq(b==false, true);
		eq(b+'', 'false');
	});

	it('supports numbers', () => {
		let n = rmprop(10);

		udf(n, 'constructor');
		udf(n, 'valueOf');
		udf(n, 'toString');
		udf(n, '__proto__');
	});

	it('supports exclusion for numbers', () => {
		let n = rmprop(10, ['valueOf', 'toString']);

		eq(n == 10, true);
		eq(n+'', '10');
	});

	it('supports strings', () => {
		let s = rmprop('hi');

		udf(s, 'length');

		udf(s, 'constructor');
		udf(s, 'valueOf');
		udf(s, 'toString');
		udf(s, '__proto__');
	});

	it('supports exclusion for strings', () => {
		let s = rmprop('hi', ['valueOf', 'toString', 'length']);

		eq(s == 'hi', true);
		eq(s+'', 'hi');
		eq(s.length, 2);
	});

	it('supports objects', () => {
		let o = rmprop({test: 'hi'});

		eq(o.test, 'hi');

		udf(o, 'hasOwnProperty');
		udf(o, 'toString');
	});

	it('supports exclusion for objects', () => {
		let o = rmprop({test: 'hi'}, ['valueOf']);

		eq(o.test, 'hi');
		eq(o.valueOf(), o);

		udf(o, 'toString');
	});

	it('supports functions', () => {
		let f = rmprop(function() {
			return 'hi';
		});

		eq(f(), 'hi');
		udf(f, 'name');
		udf(f, 'length');
		udf(f, 'prototype');
		udf(f, '__proto__');
	});

	it('supports exclusion for functions', () => {
		let f = rmprop(() => {
			return 'hi';
		}, ['apply', 'bind']);

		eq(typeof f.bind, 'function');
		eq(typeof f.apply, 'function');

		udf(f, 'name');
		udf(f, 'length');
	});

	it('supports arrays', () => {
		let a = rmprop(['hi']);

		eq(a[0], 'hi');
		udf(a, 'length');
		udf(a, 'indexOf');
	});

	it('supports exclusion for arrays', () => {
		let a = rmprop(['hi'], ['indexOf']);

		eq(a[0], 'hi');
		eq(a.indexOf('hi'), 0);
	});


	it('allows access to real entity', () => {
		let s = rmprop('hi');

		eq(s[rmprop.real], 'hi');
		eq(s[rmprop.real].length, 2);
	});

	it('allows new methods to use real object', () => {
		let a = rmprop(['hi','there']);

		a.last = function() {
			return this[rmprop.real][this[rmprop.real].length-1];
		};

		eq(a.last(), 'there');
	});

	it('allows new property getters to use real object', () => {
		let a = rmprop(['hi', 'there']);

		Object.defineProperty(a, 'length', {
			get: function() {
				return this[rmprop.real].join('').length;
			},
		});

		eq(a.length, 7);
	});


	it('creates a virtual copy of simple objects', () => {
		let h = {test: 'hi'};
		let p = rmprop(h);

		eq(h === p, false);
		eq(p.test, 'hi');
	});

	it('updates real object from changes to virtual copy', () => {
		var h = {test: 'hi'};
		var p = rmprop(h);

		p.test = 'hello';

		eq(h.test, 'hello');
		eq(p.test, 'hello');
	});

	it('supports array emulation', () => {
		var a = ['hello', 'world'];

		let f = rmprop.emulateArray(a, (s) => {
			return s+'!';
		});

		eq(f.length, 2);
		eq(f[0], 'hello');
		eq(typeof f.filter, 'function');
		eq(f('test'), 'test!');
	});

	it('supports updating emulated array', () => {
		var a = ['hello', 'world'];

		let f = rmprop.emulateArray(a, (s) => {
			return s+'!';
		});

		eq(f.length, 2);
		f.push('!');
		eq(f[2], '!');
		eq(f.length, 3);
		f.pop();
		eq(f.length, 2);
		f.length = 0;
		f.push(1);
		eq(f.length, 1);
	});
});
