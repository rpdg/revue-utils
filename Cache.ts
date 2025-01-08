/**
 * LRU (Least Recently Used) 缓存实现
 * 使用 Map 数据结构来存储键值对，利用 Map 的插入顺序特性来实现 LRU 功能
 *
 * @template K - 缓存键的类型
 * @template V - 缓存值的类型
 *
 * @example
 * ```typescript
 * // 创建一个最大容量为 3 的缓存
 * const cache = new LRUCache<string, number>(3);
 *
 * // 设置缓存
 * cache.set('a', 1);
 * cache.set('b', 2);
 * cache.set('c', 3);
 * console.log(cache.get('a')); // 1
 *
 * // 获取缓存值
 * const value = cache.get('a'); // 1
 *
 * // 超出容量
 * cache.set('d', 4); // 'b' 将被移除, 因为'a'最近被访问
 * console.log(cache.get('b')); // undefined
 *
 * // 使用迭代器遍历缓存
 * for (const [key, value] of cache.entries()) {
 *     console.log(key, value);
 * }
 *
 * // 使用 forEach 方法遍历缓存
 * cache.forEach((value, key) => {
 *     console.log(key, value);
 * });
 *
 * // 序列化
 * console.log(JSON.stringify(cache));
 * ```
 */
class LRUCache<K, V> {
    /** 存储缓存数据的 Map */
	private cache: Map<K, V>;

    /** 缓存的最大容量 */
	private maxSize: number;

    /**
     * 创建一个新的 LRU 缓存实例
     *
     * @param maxSize - 缓存的最大容量，必须大于 0
     */
	constructor(maxSize: number) {
		this.maxSize = Math.max(1, Math.floor(maxSize));
		this.cache = new Map();
	}

	/**
	 * 获取缓存中的值
	 * 如果键存在，该项会被移动到缓存的最后（表示最近使用）
	 *
	 * @param key - 要获取的缓存键
	 * @returns 缓存的值，如果键不存在则返回 undefined
	 *
	 * @example
	 * ```typescript
	 * const value = cache.get('key');
	 * if (value !== undefined) {
	 *     console.log('Cache hit:', value);
	 * }
	 * ```
	 */
	get(key: K): V | undefined {
		if (!this.cache.has(key)) {
			return undefined;
		}
		const value = this.cache.get(key)!;
		if (this.cache.size > 1) {
			this.cache.delete(key);
			this.cache.set(key, value);
		}
		return value;
	}

	/**
	 * 在缓存中设置一个值
	 * 如果缓存已满，会删除最久未使用的项
	 *
	 * @param key - 缓存键
	 * @param value - 要存储的值
	 *
	 * @example
	 * ```typescript
	 * cache.set('key', 'value');
	 * ```
	 */
	set(key: K, value: V): void {
		if (this.cache.has(key)) {
			this.cache.delete(key);
			this.cache.set(key, value);
			return;
		}

		if (this.cache.size >= this.maxSize) {
			const oldestKey = this.cache.keys().next().value;
			this.cache.delete(oldestKey);
		}

		this.cache.set(key, value);
	}

	/**
	 * 检查键是否存在于缓存中
	 *
	 * @param key - 要检查的键
	 * @returns 如果键存在则返回 true，否则返回 false
	 */
	has(key: K): boolean {
		return this.cache.has(key);
	}

	/**
	 * 从缓存中删除指定的键
	 *
	 * @param key - 要删除的键
	 * @returns 如果键存在并且被删除则返回 true，否则返回 false
	 */
	delete(key: K): void {
		this.cache.delete(key);
	}

	/**
	 * 清空缓存
	 * 重置所有统计信息
	 */
	clear(): void {
		this.cache.clear();
	}

	get size(): number {
		return this.cache.size;
	}

	// 添加迭代器支持
	/**
	 * 返回一个包含缓存中所有键值对的迭代器
	 *
	 * @returns 键值对迭代器
	 *
	 * @example
	 * ```typescript
	 * for (const [key, value] of cache.entries()) {
	 *     console.log(key, value);
	 * }
	 * ```
	 */
	*entries(): IterableIterator<[K, V]> {
		yield* this.cache.entries();
	}

	/**
	 * 返回一个包含缓存中所有键的迭代器
	 *
	 * @returns 键迭代器
	 */
	*keys(): IterableIterator<K> {
		yield* this.cache.keys();
	}

	/**
	 * 返回一个包含缓存中所有值的迭代器
	 *
	 * @returns 值迭代器
	 */
	*values(): IterableIterator<V> {
		yield* this.cache.values();
	}

	// forEach 方法
	/**
	 * 对缓存中的每个键值对执行指定的回调函数
	 *
	 * @param callbackfn - 要执行的回调函数
	 *
	 * @example
	 * ```typescript
	 * cache.forEach((value, key) => {
	 *     console.log(`${key}: ${value}`);
	 * });
	 * ```
	 */
	forEach(callbackfn: (value: V, key: K, cache: this) => void): void {
		this.cache.forEach((value, key) => callbackfn(value, key, this));
	}

	// 序列化支持
	/**
	 * 返回缓存的 JSON 表示
	 *
	 * @returns 包含所有键值对的数组
	 */
	toJSON() {
		return Array.from(this.cache.entries());
	}
}

export default LRUCache;
