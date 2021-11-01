// @ts-nocheck

export default {
	hashKeysToArray: function (obj: Object): string[] {
		if (Object.keys) {
			return Object.keys(obj);
		} else {
			let arr: any[] = [];
			for (arr[arr.length] in obj);
			return arr;
		}
	},
	hashToArray: (obj: any, converter?: Function): any[] => {
		let arr = [];
		for (let key in obj) {
			let val = obj[key];
			if (converter) val = converter(val, key);

			arr.push(val);
		}
		return arr;
	},
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
	stringToDate: function (str: string, format: string = 'yyyy-MM-dd HH:mm:ss') {
		//let format = formater || 'yyyy-MM-dd HH:mm:ss'; // default format
		let parts = str.match(/(\d+)/g),
			i = 0,
			fmt = {};
		// extract date-part indexes from the format
		format.replace(/(yyyy|dd|MM|HH|hh|mm|ss)/g, function (part: string) {
			fmt[part] = i++;
			return part;
		});
		//
		if (!fmt['HH'] && fmt['hh']) fmt['HH'] = fmt['hh'];

		return new Date(
			~~parts[fmt['yyyy']] || 0,
			~~(parts[fmt['MM']] || 1) - 1,
			~~parts[fmt['dd']] || 0,
			~~parts[fmt['HH']] || 0,
			~~parts[fmt['mm']] || 0,
			~~parts[fmt['ss']] || 0
		);
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
