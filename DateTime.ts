export default {
	addSeconds: function (d: Date, s: number) {
		return new Date(d.getTime() + s * 1000);
	},
	addMinutes: function (d: Date, s: number) {
		return new Date(d.getTime() + s * 60000);
	},
	addDays: function (d: Date, s: number) {
		return new Date(d.getTime() + s * 24 * 3600 * 1000);
	},
	daySpan: function (dateFrom: Date, dateTo: Date) {
		return Math.round((dateTo.valueOf() - dateFrom.valueOf()) / 86400000);
	},
	weekSpan: function (dateFrom: Date, dateTo: Date) {
		let d = this.daySpan(dateFrom, dateTo);
		return Math.ceil((d + dateFrom.getDay()) / 7);
	},
	format: function (date: Date, formatPatten: string = 'yyyy-MM-dd'): string {
		let o = {
			'M+': date.getMonth() + 1, //month
			'd+': date.getDate(), //date
			'h+': (date.getHours() > 12 ? date.getHours() - 12 : date.getHours()), //hour 12
			'H+': date.getHours(), //hour 24
			'm+': date.getMinutes(), //minute
			's+': date.getSeconds(), //second
			'q+': Math.floor((date.getMonth() + 3) / 3), //quarter
			'S': date.getMilliseconds(), //millisecond
		};

		if (/(y+)/.test(formatPatten)) {
			formatPatten = formatPatten.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
		}

		let k: keyof typeof o;

		for (k in o) {
			if (new RegExp('(' + k + ')').test(formatPatten)) {
				formatPatten = formatPatten.replace(RegExp.$1, RegExp.$1.length === 1 ? o[ k ].toString() : ('00' + o[ k ]).substr(('' + o[ k ]).length));
			}
		}

		return formatPatten;
	},
};

export const Hour = 3600e3;
export const Minute = 60e3;
export const Second = 1e3;
