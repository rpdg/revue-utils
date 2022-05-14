import { is } from './Validates';

function hasOwnProperty(obj, prop) {
	return !!obj && obj.hasOwnProperty(prop);
}

function setParamsObject(obj, param, value, castBoolean) {
	let reg = /^(.+?)(\[.*\])$/,
		paramIsArray,
		match,
		allKeys,
		key,
		k;
	if ((match = param.match(reg))) {
		key = match[1];
		allKeys = match[2].replace(/^\[|\]$/g, '').split('][');
		for (let i = 0; (k = allKeys[i]); i++) {
			paramIsArray = !k || k.match(/^\d+$/);
			if (!key && is.Array(obj)) key = obj.length;
			if (!hasOwnProperty(obj, key)) {
				obj[key] = paramIsArray ? [] : {};
			}
			obj = obj[key];
			key = k;
		}
		if (!key && paramIsArray) key = obj.length.toString();
		setParamsObject(obj, key, value, castBoolean);
	} else if (castBoolean && value === 'true') {
		obj[param] = true;
	} else if (castBoolean && value === 'false') {
		obj[param] = false;
	} else if (castBoolean && is.Number(value)) {
		obj[param] = parseFloat(value);
	} else {
		obj[param] = value;
	}
}

const request = (function (str: string, castBoolean) {
	let result = {},
		split;
	str = str && str.toString ? str.toString() : '';
	let arr = str.replace(/^.*?\?/, '').split('&'),
		p;
	for (let i = 0; (p = arr[i]); i++) {
		split = p.split('=');
		if (split.length !== 2) continue;
		setParamsObject(result, split[0], decodeURIComponent(split[1]), castBoolean);
	}
	return result;
})(window.location.search, false);

function objectToQueryString(base, obj) {
	let tmp;
	// If a custom toString exists bail here and use that instead
	if (is.Array(obj) || is.Object(obj)) {
		tmp = [];
		iterateOverObject(obj, function (key, value) {
			if (base) key = base + '[' + key + ']';
			tmp.push(objectToQueryString(key, value));
		});
		return tmp.join('&');
	} else {
		if (!base) return '';
		return sanitizeURIComponent(base) + '=' + (is.Date(obj) ? obj.getTime() : sanitizeURIComponent(obj));
	}
}

function sanitizeURIComponent(obj) {
	// undefined, null, and NaN are represented as a blank string,
	// while false and 0 are stringified. "+" is allowed in query string
	return !obj && obj !== false && obj !== 0 ? '' : encodeURIComponent(obj);
	//.replace(/%20/g, '+')
	//.replace(/%5B/g, '[')
	//.replace(/%5D/g, ']');
}

function iterateOverObject(obj, fn) {
	let key: string;
	for (key in obj) {
		if (!hasOwnProperty(obj, key)) continue;
		if (fn.call(obj, key, obj[key], obj) === false) break;
	}
}

const url = {
	addSearch: function (url: string, ...params): string {
		for (let i = 1, len = arguments.length; i < len; i++) {
			let p = arguments[i];
			if (p !== undefined && p !== null) {
				if (p.indexOf('?') === 0 || p.indexOf('&') === 0) p = p.substr(1);

				let prefix = i > 1 ? '&' : url.indexOf('?') > -1 ? '&' : '?';

				url += prefix + p;
			}
		}

		return url;
	},
	//opg.url.setParam('http://127.0.0.1:8080/page/home/' , {name:'Bob'}, 'user' );
	//opg.url.setParam('http://127.0.0.1:8080/page/home/' , {name:'Bob'} );
	setParam: function (urlString: string, obj: object, namespace?: string): string {
		return url.addSearch(urlString, objectToQueryString(namespace, obj));
	},
	getParam: function (url: string, name: string): any {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		let regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
			results = regex.exec(url.substr(url.indexOf('?')));
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	},
};

export { url, request };

