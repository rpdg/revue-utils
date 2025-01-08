/**
 * 将 HTML 字符串转换为 DOM 元素数组
 *
 * @param htmlStr - HTML 字符串
 * @returns HTMLElement 数组
 *
 * @example
 * ```typescript
 * const elements = createFragment('<div>Hello</div><span>World</span>');
 * elements.forEach(el => document.body.appendChild(el));
 * ```
 */
export function createFragment(htmlStr: string): HTMLElement[] {
	if (!htmlStr.trim()) {
		return [];
	}

	const temp = document.createElement('div');
	temp.innerHTML = htmlStr;

	const elements: HTMLElement[] = new Array(temp.children.length);
	for (let i = elements.length - 1; i >= 0; i--) {
		elements[i] = temp.children[i] as HTMLElement;
	}
	temp.innerHTML = '';

	return elements;
}

/**
 * 获取元素的第 n 层父节点
 *
 * @param element - 起始元素
 * @param level - 向上查找的层级数
 * @param selector - 可选的选择器匹配条件
 * @returns 找到的父节点，如果未找到返回 null
 *
 * @example
 * ```typescript
 * // 获取第 2 层父节点
 * const parent = parents(element, 2);
 *
 * // 获取最近的 div 父节点
 * const divParent = parents(element, 'div');
 *
 * // 获取第 2 层 class 包含 'container' 的父节点
 * const containerParent = parents(element, 2, '.container');
 * ```
 */
export function parents(
	element: Node | null | undefined,
	levelOrSelector?: number | string,
	selector?: string
): Element | null {
	if (!element) return null;

	// 处理选择器参数
	let level = 1;
	let matchSelector: string | undefined;

	if (typeof levelOrSelector === 'string') {
		matchSelector = levelOrSelector;
		level = Infinity; // 无限向上查找直到找到匹配的元素
	} else if (typeof levelOrSelector === 'number') {
		level = levelOrSelector;
		matchSelector = selector;
	}

	// 如果层级为 0，直接返回元素本身（如果是 Element）
	if (level === 0) {
		return element instanceof Element ? element : null;
	}

	// 查找父节点
	let current: Node | null = element;
	let currentLevel = level;

	while (current && currentLevel > 0) {
		current = current.parentElement || current.parentNode;

		if (!current || current === document) {
			return null;
		}

		// 如果有选择器，检查是否匹配
		if (matchSelector && current instanceof Element) {
			try {
				if (current.matches(matchSelector)) {
					return current;
				}
				// 如果指定了具体层级但未找到匹配，继续查找
				if (typeof levelOrSelector === 'number') {
					currentLevel--;
				}
				continue;
			} catch (e) {
				// 处理无效的选择器
				console.warn('Invalid selector:', matchSelector);
				return null;
			}
		}

		currentLevel--;
	}

	return current instanceof Element ? current : null;
}

/**
 * 获取所有符合条件的父节点
 *
 * @param element - 起始元素
 * @param selector - 可选的选择器匹配条件
 * @param until - 可选的终止节点或选择器
 * @returns 父节点数组
 */
export function parentsUntil(element: Node | null | undefined, selector?: string, until?: Element | string): Element[] {
	const result: Element[] = [];
	if (!element) return result;

	let current: Node | null = element;

	while (current) {
		current = current.parentElement || current.parentNode;

		if (!current || current === document || current === until) {
			break;
		}

		if (current instanceof Element) {
			if (until && typeof until === 'string') {
				if (current.matches(until)) break;
			}

			if (!selector || current.matches(selector)) {
				result.push(current);
			}
		}
	}

	return result;
}

/**
 * 获取最近的匹配选择器的父节点
 *
 * @param element - 起始元素
 * @param selector - 选择器
 * @returns 找到的父节点或 null
 */
export function closest(element: Node | null | undefined, selector: string): Element | null {
	if (!element) return null;

	// 如果元素本身支持 closest 方法，直接使用
	if (element instanceof Element && element.closest) {
		return element.closest(selector);
	}

	// 回退到手动查找
	return parents(element, selector);
}

/**
 * 标准化 CSS 属性名
 */
export function normalizeCSSProperty(property: string): string {
	return property.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * CSS 属性类型
 */
export type CSSPropertyName = keyof CSSStyleDeclaration;
/**
 * 获取元素的计算样式值
 * @param element - 目标元素
 * @param property - CSS 属性名
 * @param pseudoElement - 可选的伪元素
 * @returns 计算后的样式值
 *
 * @example
 * ```typescript
 * // 获取单个样式
 * const width = getStyle(element, 'width');
 *
 * // 获取伪元素样式
 * const beforeContent = getStyle(element, 'content', '::before');
 * ```
 */
export function getStyle(element: HTMLElement, property: CSSPropertyName, pseudoElement?: string): string {
	// 参数验证
	if (!element || !property) {
		return '';
	}

	// 标准化属性名
	const normalizedProperty = normalizeCSSProperty(String(property));

	try {
		// 获取样式
		const value =
			window.getComputedStyle(element, pseudoElement)?.[normalizedProperty] ||
			(element as any).currentStyle?.[normalizedProperty] ||
			'';
		return value;
	} catch (e) {
		console.warn(`Error getting style "${String(property)}" for element:`, element, e);
		return '';
	}
}

/**
 * 获取多个样式属性
 * @example
 * ```typescript
 * // 获取多个样式
 * const styles = getStyles(element, ['width', 'height']);
 * ```
 */
export function getStyles(element: HTMLElement, properties: CSSPropertyName[]): Record<string, string> {
	const result: Record<string, string> = {};

	// 优化：一次性获取 computedStyle
	const computedStyle = window.getComputedStyle(element, null);

	for (const prop of properties) {
		const normalizedProp = normalizeCSSProperty(String(prop));
		result[normalizedProp] = computedStyle[normalizedProp];
	}

	return result;
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
 * const elm = await waitUntilExists('.my-class' , 10);
 *
 * or :
 *
 * waitUntilExists('.my-class').then(elm => {
 *     console.log('Element found:', element);
 * }).catch(error => {
        console.error('Error:', error.message);
    });
 */
export function waitUntilExists(selector: string, timeoutInSecond: number = 30): Promise<Element> {
	return new Promise((resolve, reject) => {
		// 检查DOM是否已经准备好
		if (typeof document === 'undefined') {
			return reject(new Error('DOM is not available'));
		}

		// 首次检查
		const element = document.querySelector(selector);
		if (element) {
			return resolve(element);
		}

		let timeoutId: number | undefined;
		const observer = new MutationObserver(() => {
			const element = document.querySelector(selector);
			if (element) {
				cleanup();
				resolve(element);
			}
		});

		// 清理函数
		const cleanup = () => {
			observer.disconnect();
			if (timeoutId !== undefined) {
				clearTimeout(timeoutId);
			}
		};

		// 设置超时
		if (timeoutInSecond > 0) {
			timeoutId = setTimeout(() => {
				cleanup();
				reject(new Error(`Element ${selector} not found after ${timeoutInSecond} seconds`));
			}, timeoutInSecond * 1000);
		}

		// 开始观察
		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	});
}

/**
 * Check if the element is visible.
 * @param selector - CSS selector string or DOM element.
 * @returns Is the element visible
 */
export function isVisible(selector: string | Element): boolean {
	try {
		let elem = typeof selector === 'string' ? document.querySelector(selector) : selector;

		if (!elem) {
			return false;
		}

		// 获取元素的样式
		const style = window.getComputedStyle(elem);

		// 检查基本的可见性属性
		if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
			return false;
		}

		// 检查元素是否有实际尺寸
		let rect = elem.getBoundingClientRect();
		return rect.height > 0 && rect.width > 0;

		// 检查元素是否在视口内
		const isInViewport =
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth);
		return isInViewport;
	} catch (e) {
		return false;
	}
}

export interface IRaceShowResult {
	element: Element;
	index: number;
	selector: string;
}
/**
 * Race to check the first visible element among multiple selectors
 * @param selectors - Array of selectors to check
 * @param timeoutInSecond - Timeout (seconds)
 * @param checkFrequencyInSecond - Check frequency (seconds)
 * @returns Promise<IRaceShowResult>
 *
 * @example
 * try{
      let {element, selector, index} = await raceShow(['#pager a.next', '#loading'], 10);
      console.log(element, selector, index);
	} catch(e){
      console.error(e);
    }
 */
export function raceShow(
	selectors: string[],
	timeoutInSecond: number = 30,
	checkFrequencyInSecond: number = 0.1
): Promise<IRaceShowResult> {
	return new Promise(async (resolve, reject) => {
		// 参数验证
		if (!Array.isArray(selectors) || selectors.length === 0) {
			reject(new Error('Selectors array must not be empty'));
			return;
		}

		if (timeoutInSecond <= 0 || checkFrequencyInSecond <= 0) {
			reject(new Error('Time parameters must be positive'));
			return;
		}

		let isResolved = false;
		const startTime = Date.now();
		const timeoutMs = timeoutInSecond * 1000;
		const checkIntervalMs = checkFrequencyInSecond * 1000;

		// 检查函数
		const checkElements = () => {
			if (isResolved) return;

			const elapsedTime = Date.now() - startTime;
			if (elapsedTime >= timeoutMs) {
				reject(new Error(`Timeout after ${timeoutInSecond} seconds`));
				return;
			}

			for (let i = 0; i < selectors.length; i++) {
				const selector = selectors[i];
				const element = document.querySelector(selector);

				if (element && isVisible(element)) {
					isResolved = true;
					resolve({
						element,
						index: i,
						selector,
					});
					return;
				}
			}

			// 继续检查
			setTimeout(checkElements, checkIntervalMs);
		};

		// 开始检查
		checkElements();
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
export function waitShow(
	selector: string,
	timeoutInSecond: number = 30,
	checkFrequencyInSecond: number = 0.1
): Promise<Element> {
	return new Promise(async (resolve, reject) => {
		// 参数验证
		if (!selector) {
			reject(new Error('Selector must not be empty'));
			return;
		}

		if (timeoutInSecond <= 0 || checkFrequencyInSecond <= 0) {
			reject(new Error('Time parameters must be positive'));
			return;
		}

		// 首次检查
		const element = document.querySelector(selector);
		if (element && isVisible(element)) {
			resolve(element);
			return;
		}

		let isResolved = false;
		const startTime = Date.now();
		const timeoutMs = timeoutInSecond * 1000;
		const checkIntervalMs = checkFrequencyInSecond * 1000;
		let wasVisible = false;

		// 检查函数
		const checkElement = () => {
			if (isResolved) return;

			const elapsedTime = Date.now() - startTime;
			if (elapsedTime >= timeoutMs) {
				reject(new Error(`Timeout waiting for element ${selector} to show after ${timeoutInSecond} seconds`));
				return;
			}

			const element = document.querySelector(selector);
			const isCurrentlyVisible = element && isVisible(element);

			if (isCurrentlyVisible) {
				if (!wasVisible) {
					wasVisible = true;
				} else {
					// 元素连续两次可见，确认其稳定显示
					isResolved = true;
					resolve(element);
					return;
				}
			} else {
				wasVisible = false;
			}

			setTimeout(checkElement, checkIntervalMs);
		};

		// 开始检查
		checkElement();
	});
}

export function waitHide(
	selector: string,
	timeoutInSecond: number = 30,
	checkFrequencyInSecond: number = 0.1
): Promise<void> {
	return new Promise(async (resolve, reject) => {
		// 参数验证
		if (!selector) {
			reject(new Error('Selector must not be empty'));
			return;
		}

		if (timeoutInSecond <= 0 || checkFrequencyInSecond <= 0) {
			reject(new Error('Time parameters must be positive'));
			return;
		}

		// 首次检查
		if (!isVisible(selector)) {
			resolve();
			return;
		}

		let isResolved = false;
		const startTime = Date.now();
		const timeoutMs = timeoutInSecond * 1000;
		const checkIntervalMs = checkFrequencyInSecond * 1000;
		let wasHidden = false;

		// 检查函数
		const checkElement = () => {
			if (isResolved) return;

			const elapsedTime = Date.now() - startTime;
			if (elapsedTime >= timeoutMs) {
				reject(new Error(`Timeout waiting for element ${selector} to hide after ${timeoutInSecond} seconds`));
				return;
			}

			const isCurrentlyVisible = isVisible(selector);

			if (!isCurrentlyVisible) {
				if (!wasHidden) {
					wasHidden = true;
				} else {
					// 元素连续两次不可见，确认其稳定隐藏
					isResolved = true;
					resolve();
					return;
				}
			} else {
				wasHidden = false;
			}

			setTimeout(checkElement, checkIntervalMs);
		};

		// 开始检查
		checkElement();
	});
}
