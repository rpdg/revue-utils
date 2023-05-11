/**
 * 返回在某区间的一个随机数
 * @param min 最小值
 * @param max 最大值
 * @param decimals 小数点位数，默认返回整数
 */
export function getRandomArbitrary(min: number, max: number, decimals: number = 0): number {
	let t = Math.random() * (max - min) + min;
	let c = Math.pow(10, decimals);
	return ~~(t * c) / c;
}

/**
 * 加法函数，用来得到精确的加法结果
 * @param arg1
 * @param arg2
 * @param d 小数位数，如果不传则不处理小数位数
 */
export function add(arg1: number, arg2: number, d?: number): number {
	let arg1Arr = arg1.toString().split('.'),
		arg2Arr = arg2.toString().split('.'),
		d1 = arg1Arr.length == 2 ? arg1Arr[1] : '',
		d2 = arg2Arr.length == 2 ? arg2Arr[1] : '';
	let maxLen = Math.max(d1.length, d2.length);
	let m = Math.pow(10, maxLen);
	let result = Number(((arg1 * m + arg2 * m) / m).toFixed(maxLen));
	return typeof d === 'number' ? Number(result.toFixed(d)) : result;
}

/**
 * 减法函数，用来得到精确的减法结果
 * @param arg1
 * @param arg2
 * @param d 小数位数，如果不传则不处理小数位数
 */
export function sub(arg1: number, arg2: number, d?: number): number {
	return add(arg1, -arg2, d);
}

/**
 * 乘法函数，用来得到精确的乘法结果
 * @param arg1
 * @param arg2
 * @param d 小数位数，如果不传则不处理小数位数
 */
export function mul(arg1: number, arg2: number, d?: number): number {
	let r1 = arg1.toString(),
		r2 = arg2.toString();
	let m: number = (r1.split('.')[1] ? r1.split('.')[1].length : 0) + (r2.split('.')[1] ? r2.split('.')[1].length : 0);
	let resultVal = (Number(r1.replace('.', '')) * Number(r2.replace('.', ''))) / Math.pow(10, m);
	return typeof d === 'number' ? Number(resultVal.toFixed(~~d)) : Number(resultVal);
}

/**
 * 除法函数，用来得到精确的除法结果
 * @param arg1
 * @param arg2
 * @param d 小数位数，如果不传则不处理小数位数
 */
export function div(arg1: number, arg2: number, d?: number): number {
	let resultVal: number;
	if (arg2 === 0) {
		resultVal = 0;
	} else {
		let r1 = arg1.toString(),
			r2 = arg2.toString();
		let m = (r2.split('.')[1] ? r2.split('.')[1].length : 0) - (r1.split('.')[1] ? r1.split('.')[1].length : 0);
		resultVal = (Number(r1.replace('.', '')) / Number(r2.replace('.', ''))) * Math.pow(10, m);
	}
	return typeof d === 'number' ? Number(resultVal.toFixed(~~d)) : Number(resultVal);
}

/**
 * 平均数
 * @param arr
 * @returns
 */
export function avg(arr: number[]): number {
	let sum = 0;
	for (let i = 0; i < arr.length; i++) {
		sum = add(sum, arr[i]);
	}
	return div(sum, arr.length);
}

/**
 * 标准差, http://baike.baidu.com/view/78339.htm
 * @param arr 数字数组
 * @param avg 平均数
 * @param fix 保留小数位
 */
export function stdEVP(arr: number[], fix?: number): number {
	let sum = 0;
	let av = avg(arr);
	let l = arr.length;
	for (let i = 0; i < l; i++) {
		let dev = arr[i] - av;
		sum += dev * dev;
	}
	let resultVal = Math.sqrt(sum / l);
	return typeof fix === 'number' ? Number(resultVal.toFixed(fix)) : resultVal;
}

/**
 * 中位数,  http://baike.baidu.com/view/170892.htm
 * @param array 数字数组
 * @param d 保留小数位
 */
export function median(array: number[], d?: number): number {
	let l = array.length,
		m = Math.ceil(div(l, 2)) - 1;
	if (l % 2) {
		return array[m];
	} else {
		let m1 = Math.floor(l * 0.5),
			a = array[m1] + array[m];
		return div(a, 2, d);
	}
}

/**
 * usage: format(1234.5678, 2, '.', ''); return: 1234.57
 * @param number
 * @param decimals
 * @param dec_point
 * @param thousands_sep
 */
export function format(number: number, decimals: number, dec_point: string = '.', thousands_sep: string = '') {
	let s = number < 0 ? '-' : '',
		c = isNaN((decimals = Math.abs(decimals))) ? 2 : decimals;
	let n = Math.abs(+number || 0).toFixed(c);
	let d = dec_point;
	let t = thousands_sep;
	let i = parseInt(n) + '',
		j = i.length;
	j = j > 3 ? j % 3 : 0;

	let v =
		s +
		(j ? i.substr(0, j) + t : '') +
		i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) +
		(c
			? d +
			  Math.abs(parseFloat(n) - parseInt(n))
					.toFixed(c)
					.slice(2)
			: '');
	return thousands_sep ? v : parseFloat(v) + '';
}

/**
 *  百分比，返回带%
 * @param n
 * @param total
 * @param d 保留小数位，默认1
 */
export function percent(n: number, total: number, d: number = 1): string {
	if (total == 0) {
		return '--%';
	}
	return toFixed(Math.round((n / total) * 10000) / 100, d) + '%';
}

/**
 * 返回一个数值在指定小数点位数，四舍五入后的数值
 * @param value 数值
 * @param precision 保留小数位，默认1
 * @returns
 */
export function toFixed(value: number, precision: number = 1): number {
	let decimalVal = '0';

	if (value !== null) {
		let appendValue =
			value - Math.floor(value) !== 0
				? precision <= (value.toString().split('.')[1].length || 0)
					? '1'
					: ''
				: '';
		decimalVal = parseFloat(value.toString() + appendValue).toFixed(precision);
	}

	return Number(decimalVal);
}

/**
 * 大数相加
 * @param aNum
 * @param bNum
 * @returns
 */
export function sumBigNumber(aNum: string, bNum: string) {
	let res: number[] = [],
		c = 0,
		a = aNum.split(''),
		b = bNum.split('');
	let pointerA = a.length - 1,
		pointerB = b.length - 1;
	while (pointerA >= 0 || pointerB >= 0) {
		let x = 0,
			y = 0,
			sum: number;
		x = pointerA >= 0 ? parseInt(a[pointerA--]) : 0;
		y = pointerB >= 0 ? parseInt(b[pointerB--]) : 0;
		sum = x + y + c;
		c = (sum / 10) | 0;
		sum = sum % 10;
		res.unshift(sum);
	}
	if (c == 1) res.unshift(c);
	return res.join('');
}

/**
 * 产生一个包括 lower 与 upper 之间的数。 如果只提供一个参数返回一个0到提供数之间的数。
 * 如果 floating 设为 true，或者 lower 或 upper 是浮点数，结果返回浮点数。
 * @param lower
 * @param upper
 * @param floating
 * @returns (number): 返回随机数
 */
export function random(lower = 0, upper: number | boolean = 1, floating = false): number {
	if (typeof upper === 'boolean') {
		floating = upper;
		upper = lower;
		lower = 0;
	}
	if (lower > upper) {
		[lower, upper] = [upper, lower];
	}
	let range = upper - lower;
	if (floating || lower % 1 !== 0 || upper % 1 !== 0) {
		return Math.random() * range + lower;
	} else {
		return Math.floor(Math.random() * range) + lower;
	}
}

/**
 * Determine Whether Two Number Ranges Overlap
 * @param x1 range1 from
 * @param x2 range1 to
 * @param y1 range2 from
 * @param y2 range2 to
 * @returns bool
 */
export function isOverlapping(x1: number, x2: number, y1: number, y2: number): boolean {
	return (x1 <= y2) && (y1 <= x2);
}

/**
 * Determine Whether A Number is in range
 * @param x
 * @param min
 * @param max
 * @returns true if in range, otherwise false
 */
export function inRange(x: number, min: number, max: number): boolean {
	return (x - min) * (x - max) <= 0;
}
