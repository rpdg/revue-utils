function padNumber(num: number, length: number): string {
	return num.toString().padStart(length, '0');
}

// 时间常量
export const Millisecond = 1;
export const Second = 1e3;
export const Minute = 60e3;
export const Hour = 3600e3;
export const Day = 864e5;
const DAYS_PER_WEEK = 7;

/**
 * 日期时间操作工具类
 */
export default class DateTime {
	/**
	 * 添加秒数
	 * @param date - 原始日期
	 * @param seconds - 要添加的秒数
	 * @returns 新的日期对象
	 */
	static addSeconds(date: Date, seconds: number): Date {
		this.validateDate(date);
		return new Date(date.getTime() + seconds * Second);
	}

	/**
	 * 添加分钟数
	 * @param date - 原始日期
	 * @param minutes - 要添加的分钟数
	 * @returns 新的日期对象
	 */
	static addMinutes(date: Date, minutes: number): Date {
		this.validateDate(date);
		return new Date(date.getTime() + minutes * Minute);
	}

	/**
	 * 添加小时数
	 * @param date - 原始日期
	 * @param hours - 要添加的小时数
	 * @returns 新的日期对象
	 */
	static addHours(date: Date, hours: number): Date {
		this.validateDate(date);
		return new Date(date.getTime() + hours * Hour);
	}

	/**
	 * 添加天数
	 * @param date - 原始日期
	 * @param days - 要添加的天数
	 * @returns 新的日期对象
	 */
	static addDays(date: Date, days: number): Date {
		this.validateDate(date);
		return new Date(date.getTime() + days * Day);
	}

	/**
	 * 计算两个日期之间的天数差
	 * @param dateFrom - 起始日期
	 * @param dateTo - 结束日期
	 * @returns 天数差
	 */
	static daySpan(dateFrom: Date, dateTo: Date): number {
		this.validateDate(dateFrom);
		this.validateDate(dateTo);
		return Math.round((dateTo.getTime() - dateFrom.getTime()) / Day);
	}

	/**
	 * 计算两个日期之间的周数差
	 * @param dateFrom - 起始日期
	 * @param dateTo - 结束日期
	 * @returns 周数差
	 */
	static weekSpan(dateFrom: Date, dateTo: Date): number {
		this.validateDate(dateFrom);
		this.validateDate(dateTo);
		const days = this.daySpan(dateFrom, dateTo);
		return Math.ceil((days + dateFrom.getDay()) / DAYS_PER_WEEK);
	}

	/**
	 * 验证日期对象是否有效
	 * @param date - 要验证的日期对象
	 * @throws {Error} 当日期无效时抛出错误
	 */
	private static validateDate(date: Date): void {
		if (!(date instanceof Date) || isNaN(date.getTime())) {
			throw new Error('Invalid date object');
		}
	}

	/**
	 * 获取日期的开始时间（00:00:00.000）
	 * @param date - 日期对象
	 * @returns 新的日期对象，时间设置为当天开始
	 */
	static startOfDay(date: Date): Date {
		this.validateDate(date);
		const newDate = new Date(date);
		newDate.setHours(0, 0, 0, 0);
		return newDate;
	}

	/**
	 * 获取日期的结束时间（23:59:59.999）
	 * @param date - 日期对象
	 * @returns 新的日期对象，时间设置为当天结束
	 */
	static endOfDay(date: Date): Date {
		this.validateDate(date);
		const newDate = new Date(date);
		newDate.setHours(23, 59, 59, 999);
		return newDate;
	}

	/**
	 * 比较两个日期是否是同一天
	 * @param date1 - 第一个日期
	 * @param date2 - 第二个日期
	 * @returns 是否是同一天
	 */
	static isSameDay(date1: Date, date2: Date): boolean {
		this.validateDate(date1);
		this.validateDate(date2);
		return (
			date1.getFullYear() === date2.getFullYear() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getDate() === date2.getDate()
		);
	}

	/**
	 * Get all dates within the specified date range
	 * @param startDate - Start date
	 * @param endDate - End date
	 * @returns Array of dates
	 */
	static generateDateRange(startDate: Date, endDate: Date): Date[] {
		let dateRange: Date[] = [];
		let currentDate = new Date(startDate);

		while (currentDate <= endDate) {
			dateRange.push(new Date(currentDate));
			currentDate.setDate(currentDate.getDate() + 1);
		}

		return dateRange;
	}

	/**
	 * Format a date
	 * @param date - The date to be formatted
	 * @param formatPattern - The format pattern
	 * @returns The formatted date string
	 *
	 * @example
	 * format(new Date(), 'yyyy-MM-dd HH:mm:ss') // "2024-01-06 14:30:45"
	 * format(new Date(), 'yyyy年MM月dd日 HH时mm分') // "2024年01月06日 14时30分"
	 * format(new Date(), 'h:mm a') // "2:30 pm"
	 */
	static format(date: Date, formatPattern: string = 'yyyy-MM-dd'): string {
		// 定义格式化选项
		const options = {
			'y+': date.getFullYear(), // 年
			'M+': date.getMonth() + 1, // 月
			'd+': date.getDate(), // 日
			'H+': date.getHours(), // 24小时
			'h+': date.getHours() % 12 || 12, // 12小时
			'm+': date.getMinutes(), // 分
			's+': date.getSeconds(), // 秒
			'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
			S: date.getMilliseconds(), // 毫秒
		};

		// 添加上午/下午标记
		const meridiem = date.getHours() >= 12 ? 'pm' : 'am';
		let result = formatPattern;

		// 处理特殊格式
		if (result.includes('a')) {
			result = result.replace('a', meridiem);
		}

		// 处理所有格式化选项
		for (const [key, value] of Object.entries(options)) {
			if (new RegExp(`(${key})`).test(result)) {
				const match = RegExp.$1;
				result = result.replace(match, padNumber(value, match.length));
			}
		}

		return result;
	}
}

/**
 *
 * @param t 毫秒
 * @param v return value
 * @returns
 */
export function sleep<T>(t: number, v?: T): Promise<T> {
	return new Promise(function (resolve) {
		setTimeout(resolve.bind(null, v as any), t);
	});
}


/**
 * 日期模拟器类
 * @example
		try {
			const mocker = new DateMocker();

			// 设置特定日期
			mocker.setDateTime('2024-01-01');
			console.log('Mocked date:', new Date());
			console.log('Mocked timestamp:', Date.now());
			console.log('Is mocking?', mocker.isMocking()); // true

			// 使用带参数的构造函数（不受影响）
			console.log('Specific date:', new Date('2023-12-31'));

			// 恢复原始日期
			mocker.restore();
			console.log('Restored date:', new Date());
			console.log('Still mocking?', mocker.isMocking()); // false

		} catch (error) {
			console.error('Error:', error);
		}

		// 高级使用示例
		class DateTestHelper {
			private mocker: DateMocker;

			constructor() {
				this.mocker = new DateMocker();
			}

			// 在特定时间环境下运行测试
			runAtTime<T>(dateTime: Date | string | number, testFn: () => T): T {
				try {
					this.mocker.setDateTime(dateTime);
					return testFn();
				} finally {
					this.mocker.restore();
				}
			}

			// 模拟时间流逝
			async advanceTime(ms: number): Promise<void> {
				const currentTime = Date.now();
				this.mocker.setTimestamp(currentTime + ms);
			}
		}

		// 高级使用示例
		async function demonstrateAdvancedUsage() {
			const helper = new DateTestHelper();

			// 在特定时间点运行测试
			const result = helper.runAtTime('2024-01-01', () => {
				console.log('Current time:', new Date());
				return Date.now();
			});
			console.log('Test ran at:', new Date(result));

			// 模拟时间流逝
			await helper.runAtTime('2024-01-01', async () => {
				console.log('Start:', new Date());
				await helper.advanceTime(24 * 60 * 60 * 1000); // 前进一天
				console.log('After one day:', new Date());
			});
		}

		// 运行高级示例
		demonstrateAdvancedUsage().catch(console.error);
 */
export class DateMocker {
    private readonly originalDate: DateConstructor;
    private currentProxy: DateConstructor | null = null;

    constructor() {
        this.originalDate = Date;
    }

    /**
     * 设置特定的日期时间
     * @param dateTime - 要设置的日期时间
     */
    setDateTime(dateTime: Date | string | number): void {
        const date = new this.originalDate(dateTime);
        this.setTimestamp(date.getTime());
    }

    /**
     * 设置特定的时间戳
     * @param timestamp - 要设置的时间戳
     */
    setTimestamp(timestamp: number): void {
        // 创建日期代理
        const DateProxy = new Proxy(this.originalDate, {
            // 处理构造函数调用
            construct: (target: DateConstructor, args: any[]): Date => {
                if (args.length === 0) {
                    // 没有参数时返回假日期
                    return new target(timestamp);
                }
                // 有参数时使用原始构造函数
				return new target(...(args as [any]));
            },

            // 处理函数调用
            apply: (target: DateConstructor, thisArg: any, args: any[]): string => {
                return target.apply(thisArg, args);
            },

            // 处理静态属性和方法
            get: (target: DateConstructor, prop: PropertyKey, receiver: any): any => {
                if (prop === 'now') {
                    return () => timestamp;
                }
                if (prop === 'parse' || prop === 'UTC') {
                    return target[prop].bind(target);
                }
                return Reflect.get(target, prop, receiver);
            }
        });

        // 保存当前代理并替换全局 Date
        this.currentProxy = DateProxy as DateConstructor;
        window.Date = this.currentProxy;
    }

    /**
     * 恢复原始日期
     */
    restore(): void {
        if (this.currentProxy) {
            window.Date = this.originalDate;
            this.currentProxy = null;
        }
    }

    /**
     * 获取原始的 Date 构造函数
     */
    getOriginalDate(): DateConstructor {
        return this.originalDate;
    }

    /**
     * 检查是否正在模拟日期
     */
    isMocking(): boolean {
        return this.currentProxy !== null;
    }
}


/**
 * setFakeDate(2000,0,1)
 * console.log(new Date());            //  2000-01-01
 * console.log(new Date(2023, 5, 18)); //  2023-06-18
 * console.log(Date());                //  current date time
 */
export function setFakeDate(...fakeArgs: Parameters<typeof Date>) {
	const OriginalDate = Date;

	const DateProxy = new Proxy(OriginalDate, {
		construct(target, args) {
			if (args.length === 0) {
				// fake date
				// 当没有参数时，返回 fake date
				// @ts-ignore
				return new target(...fakeArgs);
			} else {
				// 有参数时，正常调用原始 Date 构造函数
				// @ts-ignore
				return new target(...args);
			}
		},
		apply(target, thisArg, args) {
			// 如果 Date 作为普通函数调用，则返回当前时间字符串
			return target.apply(thisArg, args);
		},
	});

	window.Date = DateProxy;
}

/**
// 得到指定日期的所在月的第一天和最后一天
*/
export function getMonthBounds(date: Date): [Date, Date] {
	const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
	const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

	return [firstDay, lastDay];
}

/**
 * 获取当前日期月的完整日期列表
 * @returns
 */
export function getMonthDates(date: Date): Date[] {
	const [firstDay, lastDay] = getMonthBounds(date);
	return DateTime.generateDateRange(firstDay, lastDay);
}
