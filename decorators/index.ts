import {
	debounce as debounceFn,
	DebounceSettings,
	once as onceFn,
	throttle as throttleFn,
	ThrottleSettings
} from 'lodash';
import JsonStorage from '../JsonStorage';

/**
 * automatically bind methods to class instances
 */
export function bind(target: any, key: string, descriptor: TypedPropertyDescriptor<(...params: any) => any>): any {
	let fn = descriptor.value;

	if (typeof fn !== 'function') {
		throw new Error(`@autobind decorator can only be applied to methods not: ${typeof fn}`);
	}

	// In IE11 calling Object.defineProperty has a side-effect of evaluating the
	// getter for the property which is being replaced. This causes infinite
	// recursion and an "Out of stack space" error.
	let definingProperty = false;

	return {
		configurable: true,
		get() {
			if (definingProperty || this === target.prototype || this.hasOwnProperty(key) || typeof fn !== 'function') {
				return fn;
			}

			let boundFn = fn.bind(this);
			definingProperty = true;
			Object.defineProperty(this, key, {
				configurable: true,
				get() {
					return boundFn;
				},
				set(value) {
					fn = value;
					delete this[key];
				},
			});
			definingProperty = false;
			return boundFn;
		},
		set(value:(...params: any) => any) {
			fn = value;
		},
	};
}

/**
 * Add debounce functionality to the method
 * @debounce(1000, options)
	method() {
	// ...
	}
	// see https://lodash.com/docs/4.17.15#debounce
 */

export function debounce(milliseconds: number = 0, options?: DebounceSettings): any {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const map = new WeakMap();
		const originalMethod = descriptor.value;
		descriptor.value = function (...params:any[]) {
			let debounced = map.get(this);
			if (!debounced) {
				debounced = debounceFn(originalMethod, milliseconds, options).bind(this);
				map.set(this, debounced);
			}
			debounced(...params);
		};
		return descriptor;
	};
}

/**
 * Add throttle functionality to the method
 * @throttle(1000, options)
	method() {
	// ...
	}
	// see https://lodash.com/docs/4.17.15#throttle
 */
export function throttle(milliseconds: number = 0, options?: ThrottleSettings): any {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;
		descriptor.value = throttleFn(originalMethod, milliseconds, options);
		return descriptor;
	};
}

/**
 * Add once functionality to the method
 * @once
	method() {
	// This will run only once
	}
 */
export function once(target: any, propertyKey: string, descriptor: PropertyDescriptor): any {
	const originalMethod = descriptor.value;
	descriptor.value = onceFn(originalMethod);
	return descriptor;
}

/**
 * Add setTimeout functionality to the method
 *  @delay(1000)
	method() {
		// ...
	}
 */
export function delay(milliseconds: number = 0): any {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;

		descriptor.value = function (...args:any[]) {
			setTimeout(() => {
				originalMethod.apply(this, args);
			}, milliseconds);
		};
		return descriptor;
	};
}

const sortFunc = (a: any, b: any) => {
	if (a < b) {
		return -1;
	} else if (a > b) {
		return 1;
	}
	return 0;
};

/**
	* Sort array by a specific element property, its value type must be one of string, number and date
	* @param {string | undefined} sortByProperty specify a property from each element that sorting will be based on, undefined means sorty by element itself
	* @param {
		isDescending: boolean;
		sortByPropertyType: string;
	  } options 
	* @returns script version
	*/

/**
 * sort - sort an array by a specific property in individual 
 * elements or non-object items 
 * (By default, it sorts by type === 'string' and isDescending === true)
 * 
 * class Test {
  
  @sort('name', {
    isDescending: false,
    type: 'string'
  })
  names = [ { name: 'b' }, { name: 'a' }, { name: 'c' } ];

  @sort('', {
    isDescending: true,
    type: 'date'
  })
  dates = [ '2020-06-17', '2020-06-16', '2020-06-20', '2020-06-10' ];

  @sort('', {
    isDescending: false,
    type: 'number'
  })
  numbers = [ 6, 3, 4, 1 ];
}
 */
export function sort<T>(
	sortByProperty: string | symbol | number,
	options: {
		isDescending: boolean;
		type: string;
	} = {
		isDescending: true,
		type: 'string',
	}
) {
	const cachedValueKey = Symbol();
	return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {
		Object.defineProperty(target, propertyKey, {
			set: function (arr: Array<T>) {
				if (!arr || !Array.isArray(arr)) {
					throw `Value of property ${propertyKey} is not a valid array!`;
				}

				// Perform sorting logic
				const isDateType = options.type === 'date';
				if (sortByProperty) {
					this[cachedValueKey] = arr.sort(function (a: any, b: any) {
						const aValue = isDateType ? new Date(a[sortByProperty]) : a[sortByProperty];
						const bValue = isDateType ? new Date(b[sortByProperty]) : b[sortByProperty];
						const sortResult = sortFunc(aValue, bValue);
						return options.isDescending ? sortResult * -1 : sortResult;
					});
				} else {
					this[cachedValueKey] = arr.sort(function (a: any, b: any) {
						const aValue = isDateType ? new Date(a) : a;
						const bValue = isDateType ? new Date(b) : b;
						const sortResult = sortFunc(aValue, bValue);
						return options.isDescending ? sortResult * -1 : sortResult;
					});
				}
			},
			get: function () {
				return this[cachedValueKey];
			},
		});
	};
}

/**
 * @deprecated("Use another instance method")
  deprecatedMethod () {
    //....
  }
 */
export function deprecated(deprecationReason: string) {
	return (target: any, memberName: string, propertyDescriptor: PropertyDescriptor) => {
		return {
			get() {
				const wrapperFn = (...args: any[]) => {
					console.warn(`Method ${memberName} is deprecated: ${deprecationReason}`);
					propertyDescriptor.value.apply(this, args);
				};

				Object.defineProperty(this, memberName, {
					value: wrapperFn,
					configurable: true,
					writable: true,
				});
				return wrapperFn;
			},
		};
	};
}

/**
 * Add log while value changes
 * @log
 * name:string;
 * 
 */
export function log<C>(target: C, propertyKey: string, propertyDescriptor: PropertyDescriptor) {
	let oldValue: any;

	Object.defineProperty(target, propertyKey, {
		enumerable: true, //对象属性是否可通过for-in和 Object.keys()，flase为不可循环，默认值为true
		configurable: true, //能否使用delete、能否需改属性特性、或能否修改访问器属性、，false为不可重新定义，默认值为true
		set: function (this: any, newValue: any) {
			console.log(`[LOG] set ${propertyKey}: `, oldValue, '-->', newValue);
			// console.log(`[LOG] whole data: `, this);
			oldValue = newValue;
		},
		get: function () {
			return oldValue;
		},
	});
}

export enum PersistType {
	STORAGE = 1,
	SESSION,
}
/**
 * 持久化到locale storage
 * 
 *  @persist(AUTH_TOKEN)
	token: string;

	@persist(USER_PROFILE)
	user?: IUser;
 */
export function persist(storeKey: string, type: PersistType = 1): PropertyDecorator {
	return function (this: any, target: Object, propertyName: string | symbol) {
		let _val: any;

		Object.defineProperty(target, propertyName, {
			get: () => _val,
			set: function (newVal) {
				_val = newVal;
				console.log('[JsonStorage]', propertyName, newVal);
				if (type === PersistType.STORAGE) {
					JsonStorage.set(storeKey, newVal);
				} else {
					JsonStorage.setSession(storeKey, newVal);
				}
			},
			enumerable: true,
			configurable: true,
		});
	};
}

export function seal(constructor: Function) {
	Object.seal(constructor);
	Object.seal(constructor.prototype);
}
