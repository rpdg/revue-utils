
/**
 * 防抖
 * @param handle
 * @param delay
 * @returns
 */
export function debounce<T extends (...args: any[]) => any>(handler: T, delay: number): T {
	let timer: any = null;
	return function (this: unknown, ...args: Parameters<T>) {
		let _self = this;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			handler.apply(_self, args);
		}, delay);
	} as T;
}

/**
 * 节流
 * @param handler
 * @param delay
 * @returns
 */
export function throttle<T extends (...args: any[]) => any>(handler: T, delay: number): T {
	let lastTime = 0;
	return function (this: unknown, ...args: Parameters<T>) {
		let nowTime = Date.now();
		if (nowTime - lastTime > delay) {
			handler.call(this, args);
			lastTime = nowTime;
		}
	} as T;
}