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
