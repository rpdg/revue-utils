// @ts-nocheck

export default {
	/**
	 * 某key-value对讲某个属性转成数组
	 * @param arr
	 * @param prop
	 */
	hashKeysToArray: function (obj: { [key: string]: any }): string[] {
		if (Object.keys) {
			return Object.keys(obj);
		} else {
			let arr: string[] = [];
			for (arr[arr.length] in obj);
			return arr;
		}
	},

	/**
	 * 某key-value对以属性转成数组
	 * @param arr
	 * @param prop
	 */
	hashToArray: <T>(obj: any, converter?: (key: string, val: any) => T): T[] => {
		let arr = [];
		for (let key in obj) {
			let val = obj[key];
			if (converter) val = converter(val, key);

			arr.push(val);
		}
		return arr;
	},
	/**
	 * 数组以某属性转成key-value对
	 * @param arr
	 * @param prop
	 */
	arrayToHash: function <T>(arr: Array<T>, key: string): { [key: string]: T } {
		let obj = {},
			i = 0,
			l = arr.length;
		for (; i < l; i++) {
			let item = arr[i];
			if (!(item[key] in obj)) {
				obj[item[key]] = item;
			}
		}
		return obj;
	},
	stringToDate: function (str: string, format: string = 'yyyy-MM-dd HH:mm:ss'): Date {
		//let format = formater || 'yyyy-MM-dd HH:mm:ss'; // default format
		const parts = str.match(/(\d+)/g);
		if (!parts) {
			throw new Error('Invalid date string');
		}
		const fmt: Record<string, number> = {};
		// extract date-part indexes from the format
		format.replace(/(yyyy|dd|MM|HH|hh|mm|ss)/g, function (part: string, _index: number) {
			fmt[part] = _index;
			return part;
		});
		//
		if (!fmt['HH'] && fmt['hh']) {
			fmt['HH'] = fmt['hh'];
		}

		const year = fmt['yyyy'] !== undefined && parts[fmt['yyyy']] !== undefined ? ~~parts[fmt['yyyy']] : 0;
		const month = fmt['MM'] !== undefined && parts[fmt['MM']] !== undefined ? ~~parts[fmt['MM']] - 1 : 0;
		const day = fmt['dd'] !== undefined && parts[fmt['dd']] !== undefined ? ~~parts[fmt['dd']] : 0;
		const hour = fmt['HH'] !== undefined && parts[fmt['HH']] !== undefined ? ~~parts[fmt['HH']] : 0;
		const minute = fmt['mm'] !== undefined && parts[fmt['mm']] !== undefined ? ~~parts[fmt['mm']] : 0;
		const second = fmt['ss'] !== undefined && parts[fmt['ss']] !== undefined ? ~~parts[fmt['ss']] : 0;

		return new Date(year, month, day, hour, minute, second);
	},
	jsonToDate: function (isoString: string) {
		return new Date(Date.parse(isoString));
	},

	/**
	 * Convert seconds to hh:mm:ss format.
	 * @param {number} totalSeconds - the total seconds to convert to hh- mm-ss
	 **/
	secondsToTimecode: function (totalSeconds: number): string {
		let hours = Math.floor(totalSeconds / 3600);
		let minutes = Math.floor((totalSeconds - hours * 3600) / 60);
		let seconds = totalSeconds - hours * 3600 - minutes * 60;

		// round seconds
		seconds = Math.round(seconds * 100) / 100;

		let result = (hours < 10 ? '0' : '') + hours;
		result += ':' + (minutes < 10 ? '0' + minutes : minutes);
		result += ':' + (seconds < 10 ? '0' + seconds : seconds);
		return result;
	},
};
