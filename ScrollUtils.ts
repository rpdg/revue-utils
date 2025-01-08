/**
 * 滚动位置接口
 */
export interface ScrollPosition {
	x: number;
	y: number;
}

/**
 * 滚动选项接口
 */
export interface ScrollOptions {
	/** 目标元素（默认为 window） */
	target?: Window | Element | null;
	/** 是否包含所有父元素的滚动偏移 */
	includeParents?: boolean;
	/** 滚动行为 */
	behavior?: ScrollBehavior;
	/** 滚动完成的回调函数 */
	onComplete?: () => void;
}

export interface ScrollState {
	/** 是否滚动到顶部 */
	isAtTop: boolean;
	/** 是否滚动到底部 */
	isAtBottom: boolean;
	/** 是否滚动到最左边 */
	isAtLeft: boolean;
	/** 是否滚动到最右边 */
	isAtRight: boolean;
	/** 当前滚动位置 */
	position: ScrollPosition;
	/** 可滚动区域大小 */
	scrollSize: ScrollPosition;
	/** 可见区域大小 */
	viewSize: ScrollPosition;
}

/**
 * 滚动工具类
 * @example
 * ```typescript

// 使用示例
async function example() {
	// 1. 获取滚动位置
	const position = ScrollUtils.getOffset();
	console.log(`Scroll position: ${position.x}, ${position.y}`);

	// 2. 平滑滚动
	await ScrollUtils.smoothScrollTo({ y: 500 }, { onComplete: () => console.log('Scroll complete') });

	// 3. 监听滚动
	let cleanup = ScrollUtils.watch((position) => console.log('Scrolled to:', position));
	// 清理监听器
	cleanup();

	// 4. 滚动到元素
	const element = document.querySelector('.target');
	if (element) {
		await ScrollUtils.scrollIntoView(element);
	}

	// 5. 获取滚动父元素
	const scrollParent = ScrollUtils.getScrollParent(element!);
	console.log('Scroll parent:', scrollParent);

	// 6. 检查滚动状态
    const state = ScrollUtils.getScrollState();
    if (state.isAtBottom) {
        console.log('Reached bottom!');
    }
	// 6.1 对特定元素进行监控
	const element = document.querySelector('.scrollable');
    if (element) {
        const elementState = ScrollUtils.getScrollState({ target: element });
        console.log('Element scroll state:', elementState);
    }

	// 7. 监听滚动边界
    let cleanup = ScrollUtils.watchScrollBoundary({}, {
        onReachBottom: () => {
            console.log('Reached bottom, loading more...');
            loadMoreContent();
        },
        onLeaveBottom: () => {
            console.log('Left bottom');
        }
    });

	// 8. 检查是否可滚动
    const canScrollVertically = ScrollUtils.canScroll(undefined, 'vertical');
    console.log('Can scroll vertically:', canScrollVertically);

	// 实际应用示例：无限滚动
	function setupInfiniteScroll(
		container: Element | Window = window,
		loadMore: () => Promise<void>
	) {
		let isLoading = false;

		return ScrollUtils.watchScrollBoundary(
			{ target: container },
			{
				onReachBottom: async () => {
					if (isLoading) return;
					isLoading = true;

					try {
						await loadMore();
					} finally {
						isLoading = false;
					}
				}
			}
		);
	}
}
 * ```
 */
export default class ScrollUtils {
	/**
	 * 获取滚动偏移量
	 */
	static getOffset(options: ScrollOptions = {}): ScrollPosition {
		const { target = window, includeParents = false } = options;

		// 处理 window 对象
		if (target === window) {
			return {
				x: window.pageXOffset ?? window.scrollX ?? this.getWindowFallbackScroll().x,
				y: window.pageYOffset ?? window.scrollY ?? this.getWindowFallbackScroll().y,
			};
		}

		// 处理 DOM 元素
		if (target instanceof Element) {
			const position = {
				x: target.scrollLeft,
				y: target.scrollTop,
			};

			// 包含父元素滚动
			if (includeParents) {
				let parent = target.parentElement;
				while (parent) {
					position.x += parent.scrollLeft;
					position.y += parent.scrollTop;
					parent = parent.parentElement;
				}
				// 添加窗口滚动
				const windowScroll = this.getOffset();
				position.x += windowScroll.x;
				position.y += windowScroll.y;
			}

			return position;
		}

		return { x: 0, y: 0 };
	}

	/**
	 * 平滑滚动到指定位置
	 */
	static async smoothScrollTo(position: Partial<ScrollPosition>, options: ScrollOptions = {}): Promise<void> {
		const { target = window, behavior = 'smooth', onComplete } = options;

		return new Promise((resolve) => {
			const supportsScrollBehavior = 'scrollBehavior' in document.documentElement.style;

			if (supportsScrollBehavior && behavior === 'smooth') {
				const scrollOptions: ScrollToOptions = {
					behavior,
					left: position.x,
					top: position.y,
				};

				if (target === window) {
					window.scrollTo(scrollOptions);
				} else if (target instanceof Element) {
					target.scrollTo(scrollOptions);
				}

				this.waitForScrollEnd(target!, position, () => {
					onComplete?.();
					resolve();
				});
			} else {
				this.animateScroll(position, target!, () => {
					onComplete?.();
					resolve();
				});
			}
		});
	}

	/**
	 * 滚动到元素
	 */
	static async scrollIntoView(
		element: Element,
		options: ScrollIntoViewOptions = { behavior: 'smooth' }
	): Promise<void> {
		return new Promise((resolve) => {
			element.scrollIntoView(options);

			const observer = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting) {
					observer.disconnect();
					resolve();
				}
			});

			observer.observe(element);
		});
	}

	/**
	 * 获取元素的滚动父元素
	 */
	static getScrollParent(element: Element): Element | Window {
		const style = getComputedStyle(element);
		const excludeStaticParent = style.position === 'absolute';
		const overflowRegex = /(auto|scroll)/;

		if (style.position === 'fixed') return window;

		for (let parent = element.parentElement; parent; parent = parent.parentElement) {
			const style = getComputedStyle(parent);

			if (excludeStaticParent && style.position === 'static') {
				continue;
			}

			if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) {
				return parent;
			}
		}

		return window;
	}

	/**
	 * 监听滚动位置变化
	 */
	static watch(callback: (position: ScrollPosition) => void, options: ScrollOptions = {}): () => void {
		const { target = window } = options;

		let ticking = false;

		const handler = () => {
			if (!ticking) {
				requestAnimationFrame(() => {
					callback(this.getOffset(options));
					ticking = false;
				});
				ticking = true;
			}
		};

		target!.addEventListener('scroll', handler, { passive: true });

		return () => target!.removeEventListener('scroll', handler);
	}

	// 私有辅助方法
	private static getWindowFallbackScroll(): ScrollPosition {
		return {
			x: document.documentElement.scrollLeft + document.body.scrollLeft,
			y: document.documentElement.scrollTop + document.body.scrollTop,
		};
	}

	private static animateScroll(
		position: Partial<ScrollPosition>,
		target: Window | Element,
		onComplete: () => void
	): void {
		const start = this.getOffset({ target });
		const end = {
			x: position.x ?? start.x,
			y: position.y ?? start.y,
		};

		const duration = 500;
		const startTime = performance.now();

		const animate = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);

			const easeProgress = 1 - Math.pow(1 - progress, 3);

			const currentX = start.x + (end.x - start.x) * easeProgress;
			const currentY = start.y + (end.y - start.y) * easeProgress;

			if (target === window) {
				window.scrollTo(currentX, currentY);
			} else if (target instanceof Element) {
				target.scrollLeft = currentX;
				target.scrollTop = currentY;
			}

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				onComplete();
			}
		};

		requestAnimationFrame(animate);
	}

	private static waitForScrollEnd(
		target: Window | Element,
		position: Partial<ScrollPosition>,
		onComplete: () => void
	): void {
		const checkScrollEnd = () => {
			const current = this.getOffset({ target });
			if (
				(position.x === undefined || Math.abs(current.x - position.x) < 1) &&
				(position.y === undefined || Math.abs(current.y - position.y) < 1)
			) {
				onComplete();
			} else {
				requestAnimationFrame(checkScrollEnd);
			}
		};

		requestAnimationFrame(checkScrollEnd);
	}

	/**
	 * 获取元素或窗口的滚动状态
	 * @param options - 配置选项
	 * @param threshold - 判断到达边界的阈值（像素）
	 * @returns 滚动状态对象
	 *
	 * @example
	 * ```typescript
	 * // 检查窗口滚动状态
	 * const state = ScrollUtils.getScrollState();
	 * if (state.isAtBottom) {
	 *     loadMore();
	 * }
	 *
	 * // 检查元素滚动状态
	 * const elementState = ScrollUtils.getScrollState({ target: myElement });
	 * ```
	 */
	static getScrollState(options: ScrollOptions = {}, threshold: number = 1): ScrollState {
		const { target = window } = options;

		if (target === window) {
			const position = this.getOffset(options);
			const viewHeight = window.innerHeight;
			const viewWidth = window.innerWidth;
			const scrollHeight = Math.max(
				document.documentElement.scrollHeight,
				document.documentElement.offsetHeight,
				document.documentElement.clientHeight
			);
			const scrollWidth = Math.max(
				document.documentElement.scrollWidth,
				document.documentElement.offsetWidth,
				document.documentElement.clientWidth
			);

			return {
				isAtTop: position.y <= threshold,
				isAtBottom: scrollHeight - (position.y + viewHeight) <= threshold,
				isAtLeft: position.x <= threshold,
				isAtRight: scrollWidth - (position.x + viewWidth) <= threshold,
				position,
				scrollSize: {
					x: scrollWidth,
					y: scrollHeight,
				},
				viewSize: {
					x: viewWidth,
					y: viewHeight,
				},
			};
		}

		if (target instanceof Element) {
			const position = {
				x: target.scrollLeft,
				y: target.scrollTop,
			};

			return {
				isAtTop: position.y <= threshold,
				isAtBottom: Math.abs(target.scrollHeight - target.clientHeight - position.y) <= threshold,
				isAtLeft: position.x <= threshold,
				isAtRight: Math.abs(target.scrollWidth - target.clientWidth - position.x) <= threshold,
				position,
				scrollSize: {
					x: target.scrollWidth,
					y: target.scrollHeight,
				},
				viewSize: {
					x: target.clientWidth,
					y: target.clientHeight,
				},
			};
		}

		// 默认状态
		return {
			isAtTop: true,
			isAtBottom: true,
			isAtLeft: true,
			isAtRight: true,
			position: { x: 0, y: 0 },
			scrollSize: { x: 0, y: 0 },
			viewSize: { x: 0, y: 0 },
		};
	}

	/**
	 * 监听滚动到达边界的事件
	 * @param options - 配置选项
	 * @param callbacks - 回调函数对象
	 * @returns 清理函数
	 *
	 * @example
	 * ```typescript
	 * const cleanup = ScrollUtils.watchScrollBoundary({
	 *     onReachBottom: () => loadMore(),
	 *     onLeaveBottom: () => hideLoadingIndicator()
	 * });
	 * ```
	 */
	static watchScrollBoundary(
		options: ScrollOptions = {},
		callbacks: {
			onReachTop?: () => void;
			onReachBottom?: () => void;
			onReachLeft?: () => void;
			onReachRight?: () => void;
			onLeaveTop?: () => void;
			onLeaveBottom?: () => void;
			onLeaveLeft?: () => void;
			onLeaveRight?: () => void;
		}
	): () => void {
		const { target = window } = options;
		let previousState = this.getScrollState(options);

		const handler = () => {
			const currentState = this.getScrollState(options);

			// 检查各个边界的变化
			if (currentState.isAtTop !== previousState.isAtTop) {
				if (currentState.isAtTop) {
					callbacks.onReachTop?.();
				} else {
					callbacks.onLeaveTop?.();
				}
			}

			if (currentState.isAtBottom !== previousState.isAtBottom) {
				if (currentState.isAtBottom) {
					callbacks.onReachBottom?.();
				} else {
					callbacks.onLeaveBottom?.();
				}
			}

			if (currentState.isAtLeft !== previousState.isAtLeft) {
				if (currentState.isAtLeft) {
					callbacks.onReachLeft?.();
				} else {
					callbacks.onLeaveLeft?.();
				}
			}

			if (currentState.isAtRight !== previousState.isAtRight) {
				if (currentState.isAtRight) {
					callbacks.onReachRight?.();
				} else {
					callbacks.onLeaveRight?.();
				}
			}

			previousState = currentState;
		};

		// 使用节流来优化性能
		const throttledHandler = this.throttle(handler, 100);
		target!.addEventListener('scroll', throttledHandler, { passive: true });

		return () => target!.removeEventListener('scroll', throttledHandler);
	}

	/**
	 * 检查是否可以滚动
	 */
	static canScroll(
		target: Window | Element = window,
		direction: 'vertical' | 'horizontal' | 'both' = 'both'
	): boolean {
		const state = this.getScrollState({ target });

		switch (direction) {
			case 'vertical':
				return state.scrollSize.y > state.viewSize.y;
			case 'horizontal':
				return state.scrollSize.x > state.viewSize.x;
			case 'both':
				return state.scrollSize.y > state.viewSize.y || state.scrollSize.x > state.viewSize.x;
		}
	}

	// 工具方法：节流函数
	private static throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
		let inThrottle = false;
		let lastFunc: ReturnType<typeof setTimeout>;
		let lastRan: number;

		return ((...args: Parameters<T>) => {
			if (!inThrottle) {
				func.apply(null, args);
				lastRan = Date.now();
				inThrottle = true;
			} else {
				clearTimeout(lastFunc);
				lastFunc = setTimeout(() => {
					if (Date.now() - lastRan >= limit) {
						func.apply(null, args);
						lastRan = Date.now();
					}
				}, limit - (Date.now() - lastRan));
			}
		}) as T;
	}
}
