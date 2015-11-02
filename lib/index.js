
// generate hash to override all super prototype properties
const unpropertize = (z_proto, a_exclude=[]) => {

	// prepare a hash to overwrite all properties found in prototype ancestry
	let h_undefine_properties = {
		['__proto__']: {
			configurable: true,
			enumerable: false,
			writable: true,
			value: undefined,
		},
	};

	// repeat until we've reached the end of the __proto__ chain
	while(z_proto !== null) {

		// get all properties this prototype would catch
		Object.getOwnPropertyNames(z_proto).forEach((s_property) => {

			// override property with undefined
			h_undefine_properties[s_property] = {
				configurable: true,
				enumerable: false,
				writable: ('length' !== s_property)? true: false,
				value: undefined,
			};;
		});

		// continue up next __proto__ ancester
		z_proto = z_proto.__proto__;
	}

	// remove excluded properties from hash
	a_exclude.forEach((s_property) => {
		if(h_undefine_properties[s_property]) {
			delete h_undefine_properties[s_property];
		}
	});

	//
	return h_undefine_properties;
};


// cache function properties
const FUNCTION_PROPERTIES = unpropertize(Function.prototype);

// cache plain primitve-typed properties
const H_PROPERTIES = {
	boolean: unpropertize(Boolean.prototype),
	number: unpropertize(Number.prototype),
	string: unpropertize(String.prototype),
};


// symbol for accessing real class instance
const $_real = Symbol('real');

//
const VirtualClass = function(d_real) {

	// assign constructor or give default one
	let k_virtual = function(z_real) {

		// iterate all properties of real object
		Object.getOwnPropertyNames(z_real).forEach((s_property) => {

			// override object property
			Object.defineProperty(this, s_property, {
				configurable: true, // override properties even if they do not want to be changed
				enumerable: z_real.propertyIsEnumerable(s_property), // give enumerability setting same value as original

				// fetch property from real
				get: () => {
					return z_real[s_property];
				},
			})
		});

		// set means to access real object from elswhere
		this[$_real] = z_real;
	};

	// ref prototype
	let d_prototype = d_real.prototype;
	let d_proto = d_prototype;

	// build set of all properties in prototype chain
	let a_properties = new Set();

	//
	while(d_proto !== null) {

		// add all properties from this class' prototype to accumulative list
		Object.getOwnPropertyNames(d_proto).forEach((s_property) => {
			a_properties.add(s_property);
		});

		// next class in prototype chain
		d_proto = d_proto.__proto__;
	}

	// override all properties in prototype chain
	a_properties.forEach((s_property) => {

		// override prototype functions (saves the otherwise not-generic error)
		if('function' === typeof d_prototype[s_property]) {

			// implement same method name in virtual class
			k_virtual.prototype[s_property] = function() {

				// forward to real class
				return this[$_real][s_property].apply(this[$_real], arguments);
			};
		}
		// override prototype properties
		else {

			// define property in virtual class
			Object.defineProperty(k_virtual.prototype, s_property, {
				configurable: true,
				enumerable: false,

				// fetch actual property from actual class
				get: function() {
					return this[$_real][s_property];
				},
			});
		}
	});

	// set __proto__ property
	Object.defineProperties(k_virtual.prototype, {
		['__proto__']: {
			value: d_prototype,
		},
	})

	//
	return k_virtual;
};

//
const VirtualString = new VirtualClass(String);
const VirtualArray = new VirtualClass(Array);


// primitive datatype unboxers
const H_BOXERS = {
	boolean: Boolean,
	number: Number,
	string: VirtualString,
};


// 
const local = function(z_object, a_exclude=[]) {

	//
	if(!Array.isArray(a_exclude)) {
		throw 'exclude argument must be an array';
	}

	// ref typeof object
	let s_type = typeof z_object;

	// ref proto of object
	let z_proto = z_object.__proto__;

	// 
	switch(s_type) {

		//
		case 'function':

			// exclude certain properties
			if(a_exclude.length) {

				// forward exclusion to unpropertize
				return Object.defineProperties(z_object, unpropertize(Function.prototype, a_exclude));
			}

			// simple, plain function
			if(Function.prototype === z_proto) {

				// use cached property hash
				return Object.defineProperties(z_object, FUNCTION_PROPERTIES);
			}
		
		//
		case 'object':

			// Array
			if(Array.isArray(z_object)) {
				return Object.defineProperties(new VirtualArray(z_object), unpropertize(Array.prototype, a_exclude));
			}

			// override all properties found in prototype chain
			return Object.defineProperties(z_object, unpropertize(z_object.__proto__, a_exclude));

		// primitive types
		case 'boolean':
		case 'number':
		case 'string':

			// exclude certain properties
			if(a_exclude.length) {

				// box primitive type and then override all properties
				return Object.defineProperties(new H_BOXERS[s_type](z_object), unpropertize(H_BOXERS[s_type].prototype, a_exclude));
			}
			// do not exclude any properties, use cached versions
			else {

				// box primitive type and then override all properties
				return Object.defineProperties(new H_BOXERS[s_type](z_object), H_PROPERTIES[s_type]);
			}
	}

	// other type (undefined)
	return z_object;
};


// set real symbol
local.real = $_real;

//
export default local;

