/**
 * 返回 min（包含）到 max（不包含）的随机数
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
 * 移除统计异常值
 * 使用 IQR 方法移除异常值
 */
export function removeStatisticalOutliers(arr: number[]): number[] {
	const sorted = [...arr].sort((a, b) => a - b);
	const q1 = sorted[Math.floor(sorted.length * 0.25)];
	const q3 = sorted[Math.floor(sorted.length * 0.75)];
	const iqr = q3 - q1;
	const lowerBound = q1 - 1.5 * iqr;
	const upperBound = q3 + 1.5 * iqr;

	return arr.filter((x) => x >= lowerBound && x <= upperBound);
}

/**
 * 标准差, http://baike.baidu.com/view/78339.htm
 * @param arr 数字数组
 * @param avg 平均数
 * @param fix 保留小数位
 * @returns 标准差
 * @throws {Error} 当输入数组为空或包含非数字值时
 */
export function stdEVP(arr: number[], fix?: number): number {
	// 输入验证
	if (!Array.isArray(arr) || arr.length === 0) {
		throw new Error('Input must be a non-empty array');
	}

	if (arr.some((n) => typeof n !== 'number' || isNaN(n))) {
		throw new Error('Array must contain only valid numbers');
	}

	// 使用 reduce 计算平均值，避免多次遍历
	const sum = arr.reduce((acc, val) => acc + val, 0);
	const mean = sum / arr.length;

	// 计算偏差平方和
	const squaredDeviations = arr.reduce((acc, val) => {
		const deviation = val - mean;
		return acc + deviation * deviation;
	}, 0);

	// 计算标准差
	const standardDeviation = Math.sqrt(squaredDeviations / arr.length);

	// 处理精度，修复类型检查问题
	if (typeof fix === 'number' && fix >= 0) {
		return Number(standardDeviation.toFixed(fix));
	}
	return standardDeviation;
}

/**
 * 统计计算选项接口
 */
export interface StatisticsOptions {
	fix?: number; // 保留小数位数
	population?: boolean; // 是否为总体标准差
	removeOutliers?: boolean; // 是否移除异常值
}

/**
 * 增强的标准差计算函数
 */
export function calculateStandardDeviation(arr: number[], options: StatisticsOptions = {}): number {
	const { fix, population = false, removeOutliers = false } = options;

	let data = [...arr];

	// 移除异常值
	if (removeOutliers) {
		data = removeStatisticalOutliers(data);
	}

	// 计算必要的统计量
	const { sum, sumSquares, length } = data.reduce(
		(acc, val) => ({
			sum: acc.sum + val,
			sumSquares: acc.sumSquares + val * val,
			length: acc.length + 1,
		}),
		{ sum: 0, sumSquares: 0, length: 0 }
	);

	// 计算标准差
	// 使用计算公式：σ = √(E[X²] - (E[X])²)
	const mean = sum / length;
	const denominator = population ? length : length - 1;
	const variance = (sumSquares - sum * mean) / denominator;
	const standardDeviation = Math.sqrt(Math.max(0, variance));

	if (typeof fix === 'number' && fix >= 0) {
		return Number(standardDeviation.toFixed(fix));
	}
	return standardDeviation;
}

/**
 * 中位数,  http://baike.baidu.com/view/170892.htm
 * @param array 数字数组
 * @param precision - 结果保留的小数位数（可选）
 * @returns 中位数
 * @throws {Error} 当输入数组为空或包含非数字值时
 */
export function median(array: number[], precision?: number): number {
	// 输入验证
	if (!Array.isArray(array) || array.length === 0) {
		throw new Error('Input must be a non-empty array');
	}

	if (array.some((n) => typeof n !== 'number' || isNaN(n))) {
		throw new Error('Array must contain only valid numbers');
	}

	const length = array.length;
	const middleIndex = Math.floor(length / 2);

	// 如果数组长度为奇数
	if (length % 2 === 1) {
		return array[middleIndex];
	}

	// 如果数组长度为偶数，计算中间两个数的平均值
	const middleValue = (array[middleIndex - 1] + array[middleIndex]) / 2;

	// 处理精度
	if (typeof precision === 'number' && precision >= 0) {
		return Number(middleValue.toFixed(precision));
	}
	return middleValue;
}

export interface MedianOptions {
	precision?: number; // 保留小数位数
	sorted?: boolean; // 数组是否已排序
	removeOutliers?: boolean; // 是否移除异常值
}

export function calculateMedian(array: number[], options: MedianOptions = {}): number {
	const { precision, sorted = false, removeOutliers = false } = options;

	// 输入验证
	if (!Array.isArray(array) || array.length === 0) {
		throw new Error('Input must be a non-empty array');
	}

	let workingArray = [...array];

	// 移除异常值（如果需要）
	if (removeOutliers) {
		workingArray = removeStatisticalOutliers(workingArray);
	}

	// 排序（如果需要）
	if (!sorted) {
		workingArray.sort((a, b) => a - b);
	}

	const length = workingArray.length;
	const middleIndex = Math.floor(length / 2);

	let result: number;
	if (length % 2 === 1) {
		result = workingArray[middleIndex];
	} else {
		result = (workingArray[middleIndex - 1] + workingArray[middleIndex]) / 2;
	}

	// 处理精度
	if (typeof precision === 'number' && precision >= 0) {
		return Number(result.toFixed(precision));
	}
	return result;
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
	return x1 <= y2 && y1 <= x2;
}

/**
 * 两个范围重叠的长度
 * @returns 两个范围没有重叠，返回 0；否则，返回这个长度
 */
export function getOverlapLength(x1: number, x2: number, y1: number, y2: number): number {
	let length = Math.min(x2, y2) - Math.max(x1, y1) + 1;
	return Math.max(0, length);
}

// 定义一个类型别名，表示一个范围是一个包含两个数字的数组
export type Range = [number, number];

/**
 * 找出两个范围重叠的范围
 *
 * console.log (getOverlappingRange (1, 5, 3, 7)); // [3, 5]
 *
 * console.log (getOverlappingRange (1, 3, 5, 7)); // null
 *
 * @returns 如果这个范围的起点大于终点，说明两个范围没有重叠，返回null；否则，返回这个范围
 */
export function getOverlappingRange(x1: number, x2: number, y1: number, y2: number): Range | null {
	let start = Math.max(x1, y1);
	let end = Math.min(x2, y2);
	if (start > end) {
		return null;
	} else {
		return [start, end];
	}
}

/***
 * 合并两个范围
 *
 * @returns 如果这个范围的起点大于终点，说明两个范围没有交集，返回空；否则，返回这个范围
 */
export function getMergedRange(x1: number, x2: number, y1: number, y2: number): Range | null {
	let start = Math.min(x1, y1);
	let end = Math.max(x2, y2);
	if (start > end) {
		return null;
	} else {
		return [start, end];
	}
}

/**
 * 接受一个范围的数组作为参数，返回一个范围的数组作为结果
 * @param ranges
 *
 * console.log (mergeRanges ( [[7, 10], [11, 13], [11, 15], [14, 20], [23, 39]])); // [[7, 20], [23, 39]]
 *
 * console.log (mergeRanges ( [[2,4], [1,6]])); // [[1, 6]]
 *
 * @returns
 */
export function mergeRanges(ranges: Range[]): Range[] {
	// 对所有的范围按照起点进行排序
	ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
	// 创建一个空的列表
	let merged: Range[] = [];
	// 遍历所有的范围
	for (let r of ranges) {
		// 如果列表为空，或者当前范围的起点大于列表中最后一个范围的终点
		if (!merged.length || r[0] > merged[merged.length - 1][1]) {
			// 直接将当前范围加入列表
			merged.push(r);
		} else {
			// 否则，说明有重叠，更新列表中最后一个范围的终点
			merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], r[1]);
		}
	}
	// 返回列表中的所有范围
	return merged;
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

/**
 * 将数字四舍五入到指定小数位
 */
function roundNumber(num: number, decimals: number): number {
	if (decimals === 0) {
		return Math.round(num);
	}

	const factor = Math.pow(10, decimals);
	const tempNumber = num * factor;

	// 处理非常小的数字
	if (Math.abs(tempNumber) < 1) {
		return parseFloat(num.toFixed(decimals));
	}

	return Math.round(tempNumber) / factor;
}

/**
 * 将数字分割为整数部分和小数部分
 */
function splitNumber(num: number, decimals: number): [string, string] {
	// 对于非常小的数字，直接使用 toFixed
	if (Math.abs(num) < 1e-6) {
		const [intPart, decPart = ''] = num.toFixed(decimals).split('.');
		return [intPart, decPart];
	}

	// 常规情况
	const numStr = num.toFixed(decimals);
	const [intPart, decPart = ''] = numStr.split('.');
	return [intPart, decPart];
}

/**
 * 添加千位分隔符
 */
function addThousandsSeparator(numStr: string, separator: string): string {
	if (!separator) return numStr;
	return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/**
 * 补齐小数位数
 */
function padDecimals(decimalPart: string, precision: number): string {
	if (precision === 0) return '';
	if (decimalPart.length < precision) {
		return decimalPart.padEnd(precision, '0');
	}
	return decimalPart;
}

/**
 * 格式化数字为字符串
 * @param num - 要格式化的数字
 * @param decimals - 小数位数
 * @param dec_point - 小数点符号
 * @param thousands_sep - 千位分隔符
 * @returns 格式化后的字符串
 *
 * @example
 * format_number(1234.56, 2) // '1,234.56'
 * format_number(1234.56, 2, ',', ' ') // '1 234,56'
 * format_number(67.311, 2) // '67.31'
 */
export function format_number(
	num: number | string,
	decimals: number = 0,
	dec_point = '.',
	thousands_sep = ','
): string {
	//   example 1: number_format(1234.56);
	//   returns 1: '1,235'
	//   example 2: number_format(1234.56, 2, ',', ' ');
	//   returns 2: '1 234,56'
	//   example 3: number_format(1234.5678, 2, '.', '');
	//   returns 3: '1234.57'
	//   example 4: number_format(67, 2, ',', '.');
	//   returns 4: '67,00'
	//   example 5: number_format(1000);
	//   returns 5: '1,000'
	//   example 6: number_format(67.311, 2);
	//   returns 6: '67.31'
	//   example 7: number_format(1000.55, 1);
	//   returns 7: '1,000.6'
	//   example 8: number_format(67000, 5, ',', '.');
	//   returns 8: '67.000,00000'
	//   example 9: number_format(0.9, 0);
	//   returns 9: '1'
	//   example 10: number_format('1.20', 2);
	//   returns 10: '1.20'
	//   example 11: number_format('1.20', 4);
	//   returns 11: '1.2000'
	//   example 12: number_format('1.2000', 3);
	//   returns 12: '1.200'
	//   example 13: number_format('1 000,50', 2, '.', ' ');
	//   returns 13: '100 050.00'
	//   example 14: number_format(1e-8, 8, '.', '');
	//   returns 14: '0.00000001'

	// 设置 decimals 的默认值为 0
	const prec = decimals === undefined ? 0 : Math.max(0, Math.floor(decimals));

	// 验证并清理输入
	const cleanNumber = typeof num === 'string' ? parseFloat(num.replace(/[^0-9.+-eE]/g, '')) : num;

	// 处理非有效数字
	if (!Number.isFinite(cleanNumber)) {
		return '0';
	}

	// 使用 toFixed 进行初步格式化，但保留原始精度
	let numStr = cleanNumber.toFixed(20);

	// 对于科学计数法的数字，需要特殊处理
	if (Math.abs(cleanNumber) < 1e-6 || Math.abs(cleanNumber) >= 1e21) {
		numStr = cleanNumber.toFixed(20);
	}

	// 将字符串转回数字，以确保正确的舍入
	const parsedNum = parseFloat(numStr);

	// 处理四舍五入和小数位数
	const roundedNum = roundNumber(parsedNum, prec);
	const [intPart, decPart] = splitNumber(roundedNum, prec);

	// 添加千位分隔符
	const formattedIntPart = addThousandsSeparator(intPart, thousands_sep);

	// 处理小数部分
	const formattedDecPart = padDecimals(decPart, prec);

	// 组合结果
	return formattedDecPart ? `${formattedIntPart}${dec_point}${formattedDecPart}` : formattedIntPart;
}
