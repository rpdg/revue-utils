/**
 * sort an object by its keys/properties, alphabetically
 * @param unordered
 * @returns ordered
 */
export function sortKeys<T = any>(unordered: any): T {
	const ordered = Object.keys(unordered)
		.sort()
		.reduce((obj :any, key:string) => {
			obj[key] = unordered[key];
			return obj;
		}, {});
	return ordered;
}

export function clone<T = any>(item: T): T {
	if (!item) {
		return item;
	} // null, undefined values check

	let types = [Number, String, Boolean],
		result;

	// normalizing primitives if someone did new String('aaa'), or new Number('444');
	types.forEach(function (type) {
		if (item instanceof type) {
			result = type(item);
		}
	});

	if (typeof result == 'undefined') {
		if (Object.prototype.toString.call(item) === '[object Array]') {
			result = [];
			// @ts-ignore
			item.forEach(function (child, index, array) {
				result[index] = clone(child);
			});
		} else if (typeof item == 'object') {
			// testing that this is DOM
			// @ts-ignore
			if (item.nodeType && typeof item.cloneNode == 'function') {
				// @ts-ignore
				result = item.cloneNode(true);
				// @ts-ignore
			} else if (!item.prototype) {
				// check that this is a literal
				if (item instanceof Date) {
					result = new Date(item);
				} else {
					// it is an object literal
					result = {};
					for (let i in item) {
						// @ts-ignore
						result[i] = clone(item[i]);
					}
				}
			} else {
				// depending what you would like here,
				// just keep the reference, or create new object
				// @ts-ignore
				if (false && item.constructor) {
					// would not advice to do that, reason? Read below
					// @ts-ignore
					result = new item.constructor();
				} else {
					result = item;
				}
			}
		} else {
			result = item;
		}
	}

	return result;
}

/**
 * 防抖
 * @param handle
 * @param delay
 * @returns
 */
export function debounce(handler: (args: any) => any, delay: number) {
	let timer: any;
	return function (this: Function) {
		let _self = this,
			_args = arguments;
		clearTimeout(timer);
		timer = setTimeout(function () {
			handler.call(_self, _args);
		}, delay);
	};
}

/**
 * 节流
 * @param handler
 * @param delay
 * @returns
 */
export function throttle(handler: (args: any) => any, delay: number) {
	let lastTime = 0;
	return function (this: Function) {
		let nowTime = new Date().getTime();
		if (nowTime - lastTime > delay) {
			handler.call(this, arguments);
			lastTime = nowTime;
		}
	};
}

/**
 * 分配来源对象的可枚举属性到目标对象上
 * @example:
	let target = {};
	let source1 = {a: 1, b: {c: 2}};
	let source2 = {a: 3, b: {d: 4}};
	assignDeep(target, source1, source2);
	console.log(target);  // {a: 3, b: {c: 2, d: 4}}
 */
export function assignDeep(target: any, ...sources: any[]) {
	sources.forEach((source) => {
		for (let key in source) {
			if (source.hasOwnProperty(key)) {
				if (typeof source[key] === 'object' && source[key] !== null) {
					if (typeof target[key] !== 'object') {
						target[key] = {};
					}
					assignDeep(target[key], source[key]);
				} else {
					target[key] = source[key];
				}
			}
		}
	});
	return target;
}
