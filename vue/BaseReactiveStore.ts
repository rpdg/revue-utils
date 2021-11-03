import { reactive } from 'vue';

/**
 * 同步改变 store类的 loading属性
 */
export function loader(
	target: any,
	propertyName: string,
	descriptor: TypedPropertyDescriptor<(...params: any) => any>
) {
	let method = descriptor.value!;

	descriptor.value = async function (this: BaseStore & { __loading_acts: number }, ...rest) {
		if (this.__loading_acts === undefined) {
			this.__loading_acts = 0;
		}
		
		try {
			this.__loading_acts++;
			this.loading = true;
			return await method.call(this, ...rest);
		} catch (e) {
			// alert(e.message);
			throw e;
		} finally {
			if (this.__loading_acts > 0) {
				this.__loading_acts--;
			}

			if (this.__loading_acts < 1) {
				this.__loading_acts = 0;
				this.loading = false;
			}
		}
	};
}

export default abstract class BaseStore {
	loading: boolean;

	constructor() {
		this.loading = false;
		return reactive(this);
	}
}
