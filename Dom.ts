import { sleep } from './DateTime';

export const createFragment = function (htmlStr: string): HTMLElement[] {
	let frag = document.createDocumentFragment();
	let temp = document.createElement('div');
	temp.innerHTML = htmlStr;
	while (temp.firstChild) {
		frag.appendChild(temp.firstChild);
	}
	return [...frag.childNodes] as HTMLElement[];
};

/**
 * 找元素的第n级父元素
 * @param ele
 * @param n
 * @returns
 */
export function parents(ele: Node | null, n: number) {
	while (ele && n) {
		ele = ele.parentElement ? ele.parentElement : ele.parentNode;
		n--;
	}
	return ele;
}

/**
 * 获得滚动条的滚动距离
 * @returns
 */
export function getScrollOffset(): { x: number; y: number } {
	if (window.pageXOffset) {
		return {
			x: window.pageXOffset,
			y: window.pageYOffset,
		};
	} else {
		return {
			x: document.body.scrollLeft + document.documentElement.scrollLeft,
			y: document.body.scrollTop + document.documentElement.scrollTop,
		};
	}
}

/**
 * 获取元素的任意style属性
 * @param elem
 * @param prop
 * @returns
 */
export function getStyle(elem: HTMLElement, prop: string) {
	return window.getComputedStyle ? window.getComputedStyle(elem, null)[prop] : (elem as any).currentStyle[prop];
}

/**
 * 异步加载script
 * @param url
 * @param callback
 */
export function loadScript(url: string, callback: () => void) {
	let oscript: HTMLScriptElement = document.createElement('script');

	oscript.onload = function () {
		callback();
	};

	oscript.src = url;
	document.body.appendChild(oscript);
}

export const download = (name: string, data: BlobPart[]) => {
	if (!data) {
		return;
	}
	// console.log(data);
	let url = window.URL.createObjectURL(new Blob(data));
	let link = document.createElement('a');
	link.style.display = 'none';
	link.href = url;
	link.download = name;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
};

/**
 * !!!  does not work on iOS Safari
 * @params {array} files List of file items
 * @return FileList
 */
export function createFileList(files: File[]): FileList {
	let b = new ClipboardEvent('').clipboardData || new DataTransfer();
	for (let i = 0, len = files.length; i < len; i++) {
		b.items.add(files[i]);
	}
	return b.files;
}

/**
 * @description: open other URL (防拦截)
 * @param {*} url
 * @param {*} id
 */
export function openUrl(url: string, id: any = 'poppedWin'): void {
	let a = document.createElement('a');
	a.setAttribute('href', url);
	a.setAttribute('target', '_blank');
	a.setAttribute('id', id);
	// 防止反复添加
	if (!document.getElementById(id)) {
		document.body.appendChild(a);
	}
	a.click();
	document.body.removeChild(a);
}

/**
 *
 * wait until an element exists
 *
 * @example
 * const elm = await waitUntilExists('.some-class' , 0);
 *
 * or :
 *
 * waitUntilExists('.some-class').then((elm) => {
 *     console.log(elm.textContent);
 * });
 */
export function waitUntilExists(selector: string, timeoutInSecond: number = 30): Promise<Element> {
	return new Promise((resolve, reject) => {
		if (document.querySelector(selector)) {
			return resolve(document.querySelector(selector)!);
		}

		let t: number;
		if (timeoutInSecond > 0) {
			t = setTimeout(function () {
				observer.disconnect();
				reject('wait element timed out');
			}, 1e3 * timeoutInSecond);
		}

		const observer = new MutationObserver(function () {
			if (document.querySelector(selector) != null) {
				observer.disconnect();
				if (timeoutInSecond > 0) {
					clearTimeout(t);
				}
				resolve(document.querySelector(selector)!);
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	});
}

export function isVisible(selector: string | Element) {
	try {
		let elem = typeof selector === 'string' ? document.querySelector(selector) : selector;
		if (elem != null) {
			let rect = elem.getBoundingClientRect();
			return rect.height > 0 && rect.width > 0;
		} else {
			return false;
		}
	} catch (e) {
		return false;
	}
}

export interface IRaceShowResult {
	element: Element;
	selector: string;
	index: number;
}
/**
 * @example
 * try{
      let {element, selector, index} = await raceShow(['#pager a.next', '#loading'], 10);
      console.log(element, selector, index);
	} catch(e){
      console.error(e);
    }
 */
export function raceShow(selectors: string[], timeoutInSecond: number = 30, checkFrequencyInSecond: number = 0.1): Promise<IRaceShowResult> {
	return new Promise(async (resolve, reject) => {
		let t = 0;
		while (t < timeoutInSecond) {
			t += checkFrequencyInSecond;
			for (let i = 0, n = selectors.length; i < n; i++) {
				let selector = selectors[i];
				if (isVisible(selector)) {
					resolve({
						element: document.querySelector(selector)!,
						selector,
						index: i,
					});
					return;
				}
			}
			await sleep(1e3 * checkFrequencyInSecond);
		}
		reject('wait element timed out');
		return;
	});
}

/**
 * @example
	try{
        let elm = await waitShow('#loading' , 10)
        console.log(elm);
	} catch(e){
        console.error(e);
	}
 */
export function waitShow(selector: string, timeoutInSecond: number = 30, checkFrequencyInSecond: number = 0.1): Promise<Element> {
	return new Promise(async (resolve, reject) => {
		let p = false;
		let v = false;
		let t = 0;
		while (!p || !v) {
			v = isVisible(selector);
			console.log(t, v, p);
			if (v && !p) {
				debugger;
				p = v;
			}
			t += checkFrequencyInSecond;
			if (t > timeoutInSecond) {
				reject('wait element timed out');
				return;
			}
			await sleep(1e3 * checkFrequencyInSecond);
		}
		resolve(document.querySelector(selector)!);
		return;
	});
}

export function waitHide(selector: string, timeoutInSecond: number = 30, checkFrequencyInSecond: number = 0.1): Promise<void> {
	return new Promise(async (resolve, reject) => {
		let p = true;
		let v = true;
		let t = 0;
		while (p || v) {
			v = isVisible(selector);
			if (!v && p) {
				p = v;
			}
			t += checkFrequencyInSecond;
			if (t > timeoutInSecond) {
				reject('wait element timed out');
				return;
			}
			await sleep(1e3 * checkFrequencyInSecond);
		}
		resolve(void 0);
		return;
	});
}
