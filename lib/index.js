
// generate hash to override all super prototype properties
const unpropertize = (z_proto, a_exclude=[]) => {

	// prepare a hash to overwrite all properties found in prototype ancestry
	let h_undefine_properties = {
		['__proto__']: {
			enumerable: false,
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
				writable: (s_property !== 'length')? true: false,
				value: undefined,
			};
		});

		// continue up next __proto__ ancester
		z_proto = z_proto.__proto__;
	}

	// remove excluded properties from hash
	a_exclude.forEach((s_property) => {
		delete h_undefine_properties[s_property];
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


// symbol for virtual string class
const $_string = Symbol('string');

//
const VirtualString = function() {
	this[$_string] = String.apply(this, arguments);
};

// override all string prototype properties
Object.getOwnPropertyNames(String.prototype).forEach((s_property) => {

	// override prototype functions
	if('function' === typeof String.prototype[s_property]) {
		VirtualString.prototype[s_property] = function(s) {
			return this[$_string][s_property](s);
		};
	}
	// override prototype properties
	else {
		Object.defineProperty(VirtualString.prototype, s_property, {
			configurable: true,
			get: function() {
				return this[$_string][s_property];
			},
		});
	}
});


// primitive datatype unboxers
const H_BOXERS = {
	boolean: Boolean,
	number: Number,
	string: VirtualString,
};


// 
export default function(z_object, a_exclude=[]) {

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
