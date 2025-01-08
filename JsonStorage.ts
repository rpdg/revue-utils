type StorageValue = string | null;
type StorageType = 'local' | 'session';
type StorageListener<T> = (newValue: T | undefined, oldValue: T | undefined) => void;

interface StorageEvent<T> {
	key: string;
	newValue: T | undefined;
	oldValue: T | undefined;
	storageType: StorageType;
}

const deserialize = <T>(value: StorageValue): T | undefined => {
	if (typeof value !== 'string') {
		return undefined;
	}
	try {
		return JSON.parse(value) as T;
	} catch (e) {
		return value as unknown as T;
	}
};

/**
 * JsonStorage
 * @example
	interface User {
		name: string;
		age: number;
	}

	// 添加监听器
	const unwatch = JsonStorage.watch<User>('user', (newValue, oldValue) => {
		console.log('User data changed:');
		console.log('Old value:', oldValue);
		console.log('New value:', newValue);
	});

	// 存储数据时会触发监听器
	JsonStorage.set('user', { name: 'John', age: 30 });
	// 更新数据时会触发监听器
	JsonStorage.set('user', { name: 'John', age: 31 });

	// 获取数据
	const user = JsonStorage.get<{ name: string, age: number }>('user');

	// 删除数据时会触发监听器
	JsonStorage.remove('user');

	// 清除指定前缀的数据，排除特定键
	JsonStorage.clear('user_', new Set(['user_id']));

	// 取消监听
	unwatch();

	// 也可以使用 async/await 方式处理数据变化
	const watchUserChanges = async () => {
		return new Promise<void>((resolve) => {
			const unwatch = JsonStorage.watch<User>('user', (newValue) => {
				if (newValue) {
					console.log('User updated:', newValue);
					unwatch();
					resolve();
				}
			});
		});
	};

	// 使用示例
	const waitForUserUpdate = async () => {
		console.log('Waiting for user update...');
		await watchUserChanges();
		console.log('User update detected!');
	};
 */
export default class JsonStorage {
	private static storage: Storage = localStorage;
	private static session: Storage = sessionStorage;
	private static listeners: Map<string, Set<StorageListener<any>>> = new Map();

	private static getStorage(type: StorageType): Storage {
		return type === 'local' ? JsonStorage.storage : JsonStorage.session;
	}

	private static notifyListeners<T>(event: StorageEvent<T>): void {
		const listeners = this.listeners.get(event.key);
		if (listeners) {
			listeners.forEach((listener) => listener(event.newValue, event.oldValue));
		}
	}

	static unwatch<T>(key: string, listener: StorageListener<T>): void {
		const listeners = this.listeners.get(key);
		if (listeners) {
			listeners.delete(listener);
			if (listeners.size === 0) {
				this.listeners.delete(key);
			}
		}
	}

	static watch<T>(key: string, listener: StorageListener<T>): () => void {
		if (!this.listeners.has(key)) {
			this.listeners.set(key, new Set());
		}
		this.listeners.get(key)!.add(listener);

		// 返回取消监听的函数
		return () => this.unwatch(key, listener);
	}

	static get<T>(key: string, defaultVal?: T): T | undefined {
		let val = deserialize<T>(JsonStorage.storage.getItem(key));
		return val === undefined ? defaultVal : val;
	}

	static getSession<T>(key: string, defaultVal?: T): T | undefined {
		const val = deserialize<T>(JsonStorage.session.getItem(key));
		return val === undefined ? defaultVal : val;
	}

	static set<T>(key: string, val: T): void {
		const oldValue = this.get<T>(key);

		if (val === undefined) {
			JsonStorage.storage.removeItem(key);
		} else {
			JsonStorage.storage.setItem(key, JSON.stringify(val));
		}

		this.notifyListeners<T>({
			key,
			newValue: val,
			oldValue,
			storageType: 'local',
		});
	}

	static setSession<T>(key: string, val: T): void {
		const oldValue = this.getSession<T>(key);

		if (val === undefined) {
			JsonStorage.session.removeItem(key);
		} else {
			JsonStorage.session.setItem(key, JSON.stringify(val));
		}

		this.notifyListeners<T>({
			key,
			newValue: val,
			oldValue,
			storageType: 'session',
		});
	}

	static remove(key: string): void {
		const oldValue = this.get(key);
		JsonStorage.storage.removeItem(key);
		this.notifyListeners({
			key,
			newValue: undefined,
			oldValue,
			storageType: 'local',
		});
	}

	static removeSession(key: string): void {
		const oldValue = this.getSession(key);
		JsonStorage.session.removeItem(key);
		this.notifyListeners({
			key,
			newValue: undefined,
			oldValue,
			storageType: 'session',
		});
	}

	static clear(prefix?: string, excepts: Set<string> = new Set()): void {
		if (prefix) {
			const keys = Object.keys(JsonStorage.storage);
			for (const key of keys) {
				if (key.startsWith(prefix) && !excepts.has(key)) {
					const oldValue = this.get(key);
					JsonStorage.storage.removeItem(key);
					this.notifyListeners({
						key,
						newValue: undefined,
						oldValue,
						storageType: 'local',
					});
				}
			}
			return;
		}

		// 在完全清除前通知所有监听器
		Object.keys(JsonStorage.storage).forEach((key) => {
			const oldValue = this.get(key);
			this.notifyListeners({
				key,
				newValue: undefined,
				oldValue,
				storageType: 'local',
			});
		});

		JsonStorage.storage.clear();
	}

	static clearSession(prefix?: string, excepts: Set<string> = new Set()): void {
		if (prefix) {
			const keys = Object.keys(JsonStorage.session);
			for (const key of keys) {
				if (key.startsWith(prefix) && !excepts.has(key)) {
					const oldValue = this.getSession(key);
					JsonStorage.session.removeItem(key);
					this.notifyListeners({
						key,
						newValue: undefined,
						oldValue,
						storageType: 'session',
					});
				}
			}
			return;
		}

		// 在完全清除前通知所有监听器
		Object.keys(JsonStorage.session).forEach((key) => {
			const oldValue = this.getSession(key);
			this.notifyListeners({
				key,
				newValue: undefined,
				oldValue,
				storageType: 'session',
			});
		});

		JsonStorage.session.clear();
	}
}
