/**
 * 处理单个单词的大小写
 */
export function capitalizeWord(str: string, { lowerRest = true, preserveCase = false }): string {
	if (!str) return '';

	// 如果保留原有大小写
	if (preserveCase && str.length > 0 && /[A-Z]/.test(str[0])) {
		return str;
	}

	const first = str.charAt(0).toUpperCase();
	const rest = str.slice(1);

	return first + (lowerRest ? rest.toLowerCase() : rest);
}
export interface CapitalizeOptions {
	/** 是否将剩余部分转为小写 */
	lowerRest?: boolean;
	/** 是否保留原有的大小写 */
	preserveCase?: boolean;
	/** 是否对每个单词都进行首字母大写 */
	words?: boolean;
}

/**
 * 增强版首字母大写函数
 * @param str - 输入字符串
 * @param options - 配置选项
 * @returns 转换后的字符串
 *
 * @example
	console.log(capitalize('hello'));           // 'Hello'
	console.log(capitalize('HELLO'));           // 'Hello'
	console.log(capitalize('hello world'));     // 'Hello world'
	console.log(capitalize(''));                // ''
	console.log(capitalize('中文测试'));         // '中文测试'
	console.log(capitalize('hello world'));   // 'Hello world'
	console.log(capitalize('hello world', { words: true }));  // 'Hello World'
	console.log(capitalize('HELLO WORLD', { preserveCase: true }));  // 'HELLO WORLD'
	console.log(capitalize('hello WORLD', { lowerRest: false }));  // 'Hello WORLD'
 */
export function capitalize(str: string, options: CapitalizeOptions = {}): string {
	// 处理空值和非字符串
	if (!str) return '';
	if (typeof str !== 'string') return '';

	const { lowerRest = true, preserveCase = false, words = false } = options;

	// 如果需要处理每个单词
	if (words) {
		return str
			.split(/\s+/)
			.map((word) => capitalizeWord(word, { lowerRest, preserveCase }))
			.join(' ');
	}

	return capitalizeWord(str, { lowerRest, preserveCase });
}

export interface CamelCaseOptions {
	/** 是否使用大驼峰（首字母大写） */
	pascalCase?: boolean;
	/** 是否保留数字之间的分隔符 */
	preserveNumbers?: boolean;
	/** 自定义单词分隔符 */
	separator?: RegExp;
}

/**
 * 增强版驼峰命名转换函数
 * @param str - 输入字符串
 * @param options - 配置选项
 * @returns 驼峰命名格式的字符串
 *
 * @example
	console.log(camelCase('hello world'));      // 'helloWorld'
	console.log(camelCase('hello-world'));      // 'helloWorld'
	console.log(camelCase('hello_world'));      // 'helloWorld'
	console.log(camelCase('HelloWorld'));       // 'helloWorld'
	console.log(camelCase('  hello  world  ')); // 'helloWorld'

	// 增强的使用示例：
	console.log(camelCase('hello world', { pascalCase: true }));  // 'HelloWorld'
	console.log(camelCase('hello123world', { preserveNumbers: true }));  // 'hello123World'
	console.log(camelCase('hello@#$world'));  // 'helloWorld'
	console.log(camelCase('hello.world', { separator: /\.+/g }));  // 'helloWorld'
 */
export function camelCase(str: string, options: CamelCaseOptions = {}): string {
	// 处理空值和非字符串
	if (!str) return '';
	if (typeof str !== 'string') return '';

	const { pascalCase = false, preserveNumbers = false, separator = /[^a-zA-Z0-9]+/g } = options;

	// 1. 清理字符串
	let cleanStr = str.toLowerCase();

	// 2. 处理数字
	if (preserveNumbers) {
		// 在数字前后添加空格，但保留连续的数字
		cleanStr = cleanStr.replace(/([0-9]+)/g, ' $1 ');
	}

	// 3. 替换分隔符
	cleanStr = cleanStr.replace(separator, ' ').trim();

	// 4. 转换为驼峰格式
	const words = cleanStr.split(' ').filter(Boolean);
	if (!words.length) return '';

	const camelCased = words.reduce((result, word, index) => {
		if (index === 0 && !pascalCase) {
			return word;
		}
		return result + capitalize(word);
	}, '');

	return pascalCase ? capitalize(camelCased) : camelCased;
}

export async function copy(txt: string) {
	await navigator.clipboard.writeText(txt);
}

export async function paste(): Promise<string> {
	return await navigator.clipboard.readText();
}

export function generatePassword(length = 10, includeSpecialCharacters = true) {
	const lowerCaseLetters = 'abcdefghijklmnopqrstuvwxyz';
	const upperCaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const specialCharacters = '!@#$%^&*()-_=+[]{}|;:,.<>?';
	const allCharacters = lowerCaseLetters + upperCaseLetters + (includeSpecialCharacters ? specialCharacters : '');

	let password = '';
	let hasLowerCase = false;
	let hasUpperCase = false;
	let hasSpecialCharacter = false;

	while (!hasLowerCase || !hasUpperCase || (includeSpecialCharacters && !hasSpecialCharacter)) {
		password = '';
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * allCharacters.length);
			const char = allCharacters[randomIndex];
			password += char;

			if (lowerCaseLetters.includes(char)) {
				hasLowerCase = true;
			} else if (upperCaseLetters.includes(char)) {
				hasUpperCase = true;
			} else if (specialCharacters.includes(char)) {
				hasSpecialCharacter = true;
			}
		}
	}

	return password;
}
