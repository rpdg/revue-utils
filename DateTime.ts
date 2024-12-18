const DateTime = {
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
	generateDateRange: function (startDate: Date, endDate: Date): Date[] {
		let dateRange: Date[] = [];
		let currentDate = new Date(startDate);

		while (currentDate <= endDate) {
			dateRange.push(new Date(currentDate));
			currentDate.setDate(currentDate.getDate() + 1);
		}

		return dateRange;
	},
	format: function (date: Date, formatPatten: string = 'yyyy-MM-dd'): string {
		let o = {
			'M+': date.getMonth() + 1, //month
			'd+': date.getDate(), //date
			'h+': date.getHours() > 12 ? date.getHours() - 12 : date.getHours(), //hour 12
			'H+': date.getHours(), //hour 24
			'm+': date.getMinutes(), //minute
			's+': date.getSeconds(), //second
			'q+': Math.floor((date.getMonth() + 3) / 3), //quarter
			S: date.getMilliseconds(), //millisecond
		};

		if (/(y+)/.test(formatPatten)) {
			formatPatten = formatPatten.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
		}

		let k: keyof typeof o;

		for (k in o) {
			if (new RegExp('(' + k + ')').test(formatPatten)) {
				formatPatten = formatPatten.replace(
					RegExp.$1,
					RegExp.$1.length === 1 ? o[k].toString() : ('00' + o[k]).substr(('' + o[k]).length)
				);
			}
		}

		return formatPatten;
	},
};

export default DateTime;

export const Millisecond = 1;
export const Second = 1e3;
export const Minute = 60e3;
export const Hour = 3600e3;
export const Day = 864e5;

/**
 *
 * @param t 毫秒
 * @param v return value
 * @returns
 */
export function sleep<T>(t: number, v?: T): Promise<T> {
	return new Promise(function (resolve) {
		setTimeout(resolve.bind(null, v as any), t);
	});
}

/**
 * makeFakeDate(2000,0,1)
 * console.log(new Date());            //  2000-01-01
 * console.log(new Date(2023, 5, 18)); //  2023-06-18
 * console.log(Date());                //  current date time
 */
export function makeFakeDate(...fakeArgs) {
	const OriginalDate = Date;

	const DateProxy = new Proxy(OriginalDate, {
		construct(target, args) {
			if (args.length === 0) {
				// fake date
				// 当没有参数时，返回 fake date
				// @ts-ignore
				return new target(...fakeArgs);
			} else {
				// 有参数时，正常调用原始 Date 构造函数
				// @ts-ignore
				return new target(...args);
			}
		},
		apply(target, thisArg, args) {
			// 如果 Date 作为普通函数调用，则返回当前时间字符串
			return target.apply(thisArg, args);
		},
	});

	window.Date = DateProxy;
}

/**
// 得到指定日期的所在月的第一天和最后一天
*/
export function getMonthBounds(date: Date): [Date, Date] {
	const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
	const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

	return [firstDay, lastDay];
}
