const deserialize = (value: string | any): any => {
	if (typeof value !== 'string') {
		return undefined;
	}
	try {
		return JSON.parse(value);
	} catch (e) {
		return value || undefined;
	}
};

export default class JsonStorage {
	static storage: Storage = localStorage;
	static session: Storage = sessionStorage;

	static get<T>(key: string, defaultVal?: any): T {
		let val = deserialize(JsonStorage.storage.getItem(key));
		return val === undefined ? defaultVal : val;
	}

	static getSession<T>(key: string, defaultVal?: any): T {
		let val = deserialize(JsonStorage.session.getItem(key));
		return val === undefined ? defaultVal : val;
	}

	static set(key: string, val: any): void {
		if (val !== undefined) {
			JsonStorage.storage.setItem(key, JSON.stringify(val));
		} else {
			JsonStorage.storage.removeItem(key);
		}
	}

	static setSession(key: string, val: any): void {
		if (val !== undefined) {
			JsonStorage.session.setItem(key, JSON.stringify(val));
		} else {
			JsonStorage.session.removeItem(key);
		}
	}

	static remove(key: string) {
		JsonStorage.storage.removeItem(key);
	}

	static removeSession(key: string) {
		JsonStorage.session.removeItem(key);
	}

	static clear(prefix?: string, excepts?: Set<string>) {
		if (prefix) {
			Object.keys(JsonStorage.storage).forEach((key) => {
				if (key.indexOf(prefix) === 0) {
					JsonStorage.storage.removeItem(key);
				}
			});
		} else {
			JsonStorage.storage.clear();
		}
	}

	static clearSession(prefix?: string, excepts?: Set<string>) {
		if (prefix) {
			Object.keys(JsonStorage.session).forEach((key) => {
				if (key.indexOf(prefix) === 0) {
					JsonStorage.session.removeItem(key);
				}
			});
		} else {
			JsonStorage.session.clear();
		}
	}
}
