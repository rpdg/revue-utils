import * as mathFn from './Math';

export function swap<T>(arr: T[], x: number, y: number): T[] {
	let b = arr[x];
	arr[x] = arr[y];
	arr[y] = b;
	return arr;
}

/**
 * 数组洗牌
 * @param array 原始数组
 */
export function shuffle<T>(array: T[]) {
	let currentIndex = array.length,
		temporaryValue,
		randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

/**
 * 可以合并超大数组
 * @param ...arrs  n多个数组
 */
export function combineArrays(...arrs: Array<any>[]) {
	let arr: any[] = [];
	for (let i = 0, l = arrs.length; i < l; i++) {
		let a = arrs[i],
			len = a.length;
		for (let k = 0; k < len; k = k + 5000) {
			arr.push.apply(arr, a.slice(k, k + 5000));
		}
	}
	return arr;
}

/**
 * 数字数组堆排序（Heap Sort）
 */
export const heapSort = (function () {
	function heapify(array: number[], index: number, heapSize: number) {
		let left = 2 * index + 1,
			right = 2 * index + 2,
			largest = index;

		if (left < heapSize && array[left] > array[index]) largest = left;

		if (right < heapSize && array[right] > array[largest]) largest = right;

		if (largest !== index) {
			let temp = array[index];
			array[index] = array[largest];
			array[largest] = temp;
			heapify(array, largest, heapSize);
		}
	}

	function buildMaxHeap(array: number[]) {
		for (let i = Math.floor(array.length / 2); i >= 0; i -= 1) {
			heapify(array, i, array.length);
		}
		return array;
	}

	return function (array: number[]) {
		let size = array.length,
			temp;
		buildMaxHeap(array);
		for (let i = array.length - 1; i > 0; i -= 1) {
			temp = array[0];
			array[0] = array[i];
			array[i] = temp;
			size -= 1;
			heapify(array, 0, size);
		}
		return array;
	};
})();

/**
 * 数字数组快速排序（Quick Sort）
 */
export const quickSort = (function () {
	function partition(array: number[], left: number, right: number) {
		let cmp = array[right - 1],
			minEnd = left,
			maxEnd;
		for (maxEnd = left; maxEnd < right - 1; maxEnd += 1) {
			if (array[maxEnd] <= cmp) {
				swap(array, maxEnd, minEnd);
				minEnd += 1;
			}
		}
		swap(array, minEnd, right - 1);
		return minEnd;
	}

	function swap(array: number[], i: number, j: number) {
		let temp = array[i];
		array[i] = array[j];
		array[j] = temp;
		return array;
	}

	function quickSort(array: number[], left: number, right: number) {
		if (left < right) {
			let p = partition(array, left, right);
			quickSort(array, left, p);
			quickSort(array, p + 1, right);
		}
		return array;
	}

	return function (array: number[]) {
		return quickSort(array, 0, array.length);
	};
})();

/**
 * 传入number array 返回名次array，并列名次后跳空
 */
export function rank(v: number[]) {
	let rankIndex = quickSort(v.slice(0)).reduce(function (acc, item, index) {
		acc[item] = index;
		return acc;
	}, Object.create(null));

	return v.map(function (item) {
		return v.length - rankIndex[item];
	});
}

type SegmentStruct = {
	from: number;
	to: number;
	key: string;
};

/**
 * 分数段计算
 * @param from 开始数
 * @param to 结束数
 * @param segments 分段数
 * @param decimals 分数精确位数
 * @return 分段List
 */
export const segments = function (from: number, to: number, segments: number, decimals: number = 2) {
	let ph: SegmentStruct[] = [],
		tmp = from;
	let increase = mathFn.div(to - from, segments, 4),
		p = 1 / Math.pow(10, decimals);
	for (let i = 0; i < segments; i++) {
		let cur = increase + tmp;
		let obj: SegmentStruct = {
			from: Number(mathFn.format(tmp, decimals)),
			to: i === segments - 1 ? to : Number(mathFn.format(cur - p, decimals)),
			key: '',
		};
		obj.key = Math.floor(obj.from) + '-' + Math.floor(obj.to);
		ph.push(obj);
		tmp = cur;
	}

	return ph;
};

/**
 * 对象数组以某个字段排序
 * @param arr 对象数组
 * @param prop 排序字段
 */
export function sortOnProp<T extends Record<string, any>>(arr: T[], prop: keyof T): T[] {
	const dup = Array.from(arr);
	const compare = (a: any, b: any): number => {
        if (a === b) return 0;
        return a > b ? 1 : -1;
    };
	return dup.sort(function (a, b) {
		const A = a[prop];
        const B = b[prop];

        const isANumber = typeof A === 'number' && !isNaN(A);
        const isBNumber = typeof B === 'number' && !isNaN(B);

        // 两者都是数字
        if (isANumber && isBNumber) {
            return compare(A, B);
        }

        // A 不是数字，B 是数字
        if (!isANumber && isBNumber) {
            return -1;
        }

        // A 是数字，B 不是数字
        if (isANumber && !isBNumber) {
            return 1;
        }

        // 两者都不是数字
        if (A === '') return -1;
        if (B === '') return 1;
        return compare(A, B);
	});
}

/**
 * 产生数字序列
 * @param from 起始数字
 * @param to 结束数字
 */
export function litterN(from: number, to: number): number[] {
	let a: number[] = [from];
	for (let i = ++from; i < to + 1; i++) {
		a.push(i);
	}
	return a;
}

