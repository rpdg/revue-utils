import { reactive } from 'vue';
import JsonStorage from '../JsonStorage';

export function log<C>(target: C, propertyName: string) {
	let value: any;

	Object.defineProperty(target, propertyName, {
		enumerable: true, //对象属性是否可通过for-in和 Object.keys()，flase为不可循环，默认值为true
		configurable: true, //能否使用delete、能否需改属性特性、或能否修改访问器属性、，false为不可重新定义，默认值为true
		set: function (this: any, newValue: any) {
			console.log(`[LOG] set ${propertyName}: `, value, '-->', newValue);
			// console.log(`[LOG] whole data: `, this);
			value = newValue;
		},
		get: function () {
			return value;
		},
	});
}

/**
 * 持久化到locale storage
 */
export function persist(storeKey: string): PropertyDecorator {
	return function (this: any, target: Object, propertyName: string | symbol) {
		let _val: any;

		Object.defineProperty(target, propertyName, {
			get: () => _val,
			set: function (newVal) {
				_val = newVal;
				console.log('[JsonStorage]', propertyName, newVal);
				JsonStorage.set(storeKey, newVal);
			},
			enumerable: true,
			configurable: true,
		});
	};
}

/**
 * 同步改变 store类的 loading属性
 */
export function loader(
	target: any,
	propertyName: string,
	descriptor: TypedPropertyDescriptor<(...params: any) => any>
) {
	let method = descriptor.value!;

	descriptor.value = async function (this: BaseStore, ...rest) {
		try {
			this.loading = true;
			return await method.call(this, ...rest);
		} catch (e) {
			// alert(e.message);
			throw e;
		} finally {
			this.loading = false;
		}
	};
}

export function seal(constructor: Function) {
    Object.seal(constructor);
    Object.seal(constructor.prototype);
}

export default abstract class BaseStore {
	loading: boolean;

	constructor() {
		this.loading = false;
		return reactive(this);
	}
}
