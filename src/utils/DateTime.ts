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
};

export const Hour = 3600e3;
export const Minute = 60e3;
export const Second = 1e3;
