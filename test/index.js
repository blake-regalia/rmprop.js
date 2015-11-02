'use strict';

import assert from 'assert';
import unprop from '../lib';

describe('unprop', function () {

	it('supports booleans', () => {
		let b = unprop(false);

		assert.deepEqual(b.constructor);
		assert.deepEqual(b.valueOf);
		assert.deepEqual(b.toString);
		assert.deepEqual(b.__proto__);
	});

	it('supports numbers', () => {
		let n = unprop(10);

		assert.deepEqual(n.constructor);
		assert.deepEqual(n.valueOf);
		assert.deepEqual(n.toString);
		assert.deepEqual(n.__proto__);
	});

	it('supports strings', () => {
		let s = unprop('hi');

		assert.deepEqual(s.length)

		assert.deepEqual(s.constructor);
		assert.deepEqual(s.valueOf);
		assert.deepEqual(s.toString);
		assert.deepEqual(s.__proto__);
	});


	it('supports objects', () => {
		let o = unprop({test: 'hi'});

		assert.deepEqual(o.test, 'hi');
		assert.deepEqual(o.hasOwnProperty);
		assert.deepEqual(o.toString);
	});

	it('supports functions', () => {
		let f = unprop(() => {
			return 'hi';
		});

		assert.deepEqual(f(), 'hi');
		assert.deepEqual(f.length);
		assert.deepEqual(f.__proto__);
	});

	it('supports exclusion for booleans', () => {
		let b = unprop(false, ['valueOf', 'toString']);

		assert.deepEqual(b==false, true);
		assert.deepEqual(b+'', 'false');
	});


	it('supports exclusion for numbers', () => {
		let n = unprop(10, ['valueOf', 'toString']);

		assert.deepEqual(n == 10, true);
		assert.deepEqual(n+'', '10');
	});

	it('supports exclusion for strings', () => {
		let s = unprop('hi', ['valueOf', 'toString', 'length']);

		assert.deepEqual(s == 'hi', true);
		assert.deepEqual(s+'', 'hi');
		assert.deepEqual(s.length, 2);
	});


	it('supports exclusion for objects', () => {
		let o = unprop({test: 'hi'}, ['valueOf']);

		assert.deepEqual(o.test, 'hi');
		assert.deepEqual(o.toString);
		assert.deepEqual(o.valueOf(), o);
	});

	it('supports exclusion for functions', () => {
		let f = unprop(() => {
			return 'hi';
		}, ['apply', 'bind']);

		assert.deepEqual(typeof f.bind, 'function');
		assert.deepEqual(typeof f.apply, 'function');
	});

});
