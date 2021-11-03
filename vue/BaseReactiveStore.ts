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

	descriptor.value = async function (this: BaseStore, ...rest) {
		try {
			this.loading_acts++;
			this.loading = true;
			return await method.call(this, ...rest);
		} catch (e) {
			// alert(e.message);
			throw e;
		} finally {
			if (this.loading_acts > 0) {
				this.loading_acts--;
			}

			if (this.loading_acts < 1) {
				this.loading_acts = 0;
				this.loading = false;
			}
		}
	};
}

export default abstract class BaseStore {
	loading_acts: number;
	loading: boolean;

	constructor() {
		this.loading_acts = 0;
		this.loading = false;
		return reactive(this);
	}
}
