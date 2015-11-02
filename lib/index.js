
import arginfo from 'arginfo';

// these properties may resist being overriden
const A_TROUBLE_PROPERTIES = ['prototype'];

// symbol for accessing real class instance
const $_REAL = Symbol('real');


// 
const generate_undefine_properties = (w_proto) => {

	//
	let h_undefine = {
		['__proto__']: {
			configurable: true,
			enumerable: false,
			writable: true,
			value: undefined,
		},
	};

	// repeat until we've reached the end of the __proto__ chain
	while(w_proto !== null) {

		// get all properties this prototype would catch
		Object.getOwnPropertyNames(w_proto).forEach((s_property) => {

			// override property with undefined
			h_undefine[s_property] = {

				// grant user full capability to modify this property
				configurable: true,

				// do not enumerate this property
				enumerable: false,

				// by default, allow user to set value
				writable: true, //('length' !== s_property)? true: false,

				// set value to undefined
				value: undefined,
			};;
		});

		// continue up next __proto__ ancester
		w_proto = w_proto.__proto__;
	}

	//
	return h_undefine;
};


// cache some native class prototype properties
const H_OBJECT_PROPERTIES = generate_undefine_properties(Object.prototype);
const H_FUNCTION_PROPERTIES = generate_undefine_properties(Function.prototype);
const H_ARRAY_PROPERTIES = generate_undefine_properties(Array.prototype);
const H_STRING_PROPERTIES = generate_undefine_properties(String.prototype);
const H_NUMBER_PROPERTIES = generate_undefine_properties(Number.prototype);
const H_BOOLEAN_PROPERTIES = generate_undefine_properties(Boolean.prototype);


// fetch or generate undefine hash for given prototype
const undefine_properties = (w_proto) => {

	// cached prototypes
	switch(w_proto) {
		case Object.prototype: return H_OBJECT_PROPERTIES;
		case Function.prototype: return H_FUNCTION_PROPERTIES;
		case Array.prototype: return H_ARRAY_PROPERTIES;
		case String.prototype: return H_STRING_PROPERTIES;
		case Number.prototype: return H_NUMBER_PROPERTIES;
		case Boolean.prototype: return H_BOOLEAN_PROPERTIES;
	}

	// prototype is not cached, create and return undefine hash
	return generate_undefine_properties(w_proto);
};


// creates a transparent property on w_copy using z_real
const transparent = function(z_real, w_copy, s_property) {

	// property is a function (ie: instance method)
	if('function' === typeof z_real[s_property]) {
		
		// implement same method name in virtual object
		w_copy[s_property] = function() {

			// forward to real class
			return z_real[s_property].apply(z_real, arguments);
		};
	}
	// read/write property
	else {

		// try to override object property
		try {
			Object.defineProperty(w_copy, s_property, {

				// grant user full capability to modify this property
				configurable: true,

				// give enumerability setting same value as original
				enumerable: z_real.propertyIsEnumerable(s_property),

				// fetch property from real object
				get: () => {
					return z_real[s_property];
				},

				// set property on real object
				set: (z_value) => {
					z_real[s_property] = z_value;
				},
			});
		}
		// cannot redefine property
		catch(d_err) {

			// try again, this time only set the value
			try {
				Object.defineProperty(w_copy, s_property, {

					// give enumerability setting same value as original
					enumerable: z_real.propertyIsEnumerable(s_property),

					// 
					value: undefined,
				});

				// was not exepecting this property to give us trouble
				if(!A_TROUBLE_PROPERTIES.includes(s_property)) {
					console.warn('was not expecting "'+s_property+'" to prohibit redefinition on '+arginfo(w_copy));
				}
			}
			// cannot even do that?!
			catch(e) {
				throw 'cannot override property "'+s_property+'" on '+arginfo(w_copy);
			}
		}
	}
};

//
const virtual = function(z_real, w_copy={}) {

	// create hash to undefine all real's prototype properties
	let h_undefine = undefine_properties(z_real.__proto__);

	// each property of real object
	Object.getOwnPropertyNames(z_real).forEach((s_property) => {

		// property is defined in real's protoype chain
		if(h_undefine[s_property]) {

			// do not proxy this property onto virtual copy
			return;
		};

		// create transparent property
		transparent(z_real, w_copy, s_property);
	});

	// virtual copy needs to undefine length
	if(h_undefine.length) {

		// length is a weird one; first define with writable setting false
		h_undefine.length.writable = false;
	}

	// redefine properties on virtual copy (DO NOT use return value from defineProperties)
	Object.defineProperties(w_copy, h_undefine);

	// virtual copy redefined length
	if(h_undefine.length) {

		// now, redefine length again with writable setting true
		h_undefine.length.writable = true;
		Object.defineProperty(w_copy, 'length', h_undefine.length);
	}

	//
	return w_copy;
};


// 
const local = function(z_thing, a_bypass=[]) {

	//
	if(!Array.isArray(a_bypass)) {
		throw 'bypass argument must be an array';
	}

	// prepare to create a virtual copy of thing using default empty plain object
	let w_copy = {};

	// thing is a function
	if('function' === typeof z_thing) {

		// create virtual copy of thing using a transparent function
		w_copy = function() {
			return z_thing.apply(this, arguments);
		};
	}

	// define transparent properties
	w_copy = virtual(z_thing, w_copy);

	// also make bypass properties transparent
	a_bypass.forEach((s_property) => {
		transparent(z_thing, w_copy, s_property);
	});

	// set acessor to real value
	w_copy[$_REAL] = z_thing;

	//
	return w_copy;
};



// set real symbol
local.real = $_REAL;

//
export default local;

