

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
