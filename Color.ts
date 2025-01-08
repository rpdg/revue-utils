import { random } from './Math';

/**
 * 调整颜色亮度
 * @param color - 十六进制颜色值
 * @param amt - 调整量
 * @param isDarken - 是否变暗
 */
export function adjustBrightness(color: string, amt: number | string, isDarken: boolean): string {
	// 1. 解析调整量
	const amount = parseAmount(amt);

	// 2. 获取 RGB 值
	const rgb = hexToRgb(color);
	if (!rgb) return color;

	// 3. 使用位运算调整颜色值
	const adjust = isDarken ? -amount : amount;
	const r = clamp(rgb.r + adjust);
	const g = clamp(rgb.g + adjust);
	const b = clamp(rgb.b + adjust);

	// 4. 转换回十六进制
	return rgbToHex({ r, g, b });
}

/**
 * 解析数量值为数字
 */
function parseAmount(amt: number | string): number {
	if (typeof amt === 'number') return amt;
	if (amt.endsWith('%')) {
		return Math.floor(255 * (parseInt(amt) / 100));
	}
	return parseInt(amt);
}

/**
 * 限制值在 0-255 范围内
 */
function clamp(value: number): number {
	return value < 0 ? 0 : value > 255 ? 255 : value;
}

export type RgbColor = {
	r: number;
	g: number;
	b: number;
};

export function darken(color: string, amt: number | string): string {
	return adjustBrightness(color, amt, true);
}

export function lighten(color: string, amt: number | string): string {
	return adjustBrightness(color, amt, false);
}

export function hexToRgb(hex: string): RgbColor {
	const normalized = hex.charAt(0) === '#' ? hex.substring(1) : hex;
	const full =
		normalized.length === 3
			? normalized
					.split('')
					.map((c) => c + c)
					.join('')
			: normalized;
	if (full.length !== 6) {
		throw new Error('Invalid hex color');
	}
	const num = parseInt(full, 16);
	if (isNaN(num)) {
		throw new Error('Invalid hex color');
	}

	const rgb = {
		r: (num >> 16) & 255,
		g: (num >> 8) & 255,
		b: num & 255,
	};

	return rgb;
}

export function rgbToHex({ r, g, b }: RgbColor): string {
	return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * 颜色格式类型
 */
export type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla';

/**
 * 颜色生成选项
 */
export interface ColorOptions {
	/** 颜色格式 */
	format?: ColorFormat;
	/** 透明度 (0-1) */
	alpha?: number;
	/** 色相范围 (0-360) */
	hue?: [number, number];
	/** 饱和度范围 (0-100) */
	saturation?: [number, number];
	/** 亮度范围 (0-100) */
	lightness?: [number, number];
}

/**
 * 生成随机颜色
 * @param options - 颜色生成选项
 * @returns 随机颜色字符串
 *
 * @example
		console.log(getRandomColor()); // '#FF0000'

		console.log(
			getRandomColor({
				format: 'rgb',
			})
		); // 'rgb(255, 0, 0)'

		console.log(
			getRandomColor({
				format: 'rgba',
				alpha: 0.5,
			})
		); // 'rgba(255, 0, 0, 0.5)'

		console.log(
			getRandomColor({
				format: 'hsl',
				hue: [0, 60], // 只生成红色到黄色
				saturation: [70, 100], // 高饱和度
				lightness: [40, 60], // 中等亮度
			})
		); // 'hsl(30, 85%, 50%)'

		// 生成柔和的粉色系
		console.log(
			getRandomColor({
				format: 'hex',
				hue: [300, 360], // 粉红色色相范围
				saturation: [20, 40], // 低饱和度
				lightness: [70, 90], // 高亮度
			})
		); // '#FFE6F0'
 */
export function getRandomColor(options: ColorOptions = {}): string {
	const { format = 'hex', alpha = 1, hue = [0, 360], saturation = [0, 100], lightness = [0, 100] } = options;

	// 根据指定格式返回颜色字符串
	switch (format) {
		case 'rgb':
			const [r, g, b] = generateRGB();
			return `rgb(${r}, ${g}, ${b})`;

		case 'rgba':
			const [ra, ga, ba] = generateRGB();
			const validAlpha = Math.max(0, Math.min(1, alpha));
			return `rgba(${ra}, ${ga}, ${ba}, ${validAlpha})`;

		case 'hsl': {
			const h = random(hue[0], hue[1]);
			const s = random(saturation[0], saturation[1]);
			const l = random(lightness[0], lightness[1]);
			return `hsl(${h}, ${s}%, ${l}%)`;
		}

		case 'hsla': {
			const h = random(hue[0], hue[1]);
			const s = random(saturation[0], saturation[1]);
			const l = random(lightness[0], lightness[1]);
			const validAlpha = Math.max(0, Math.min(1, alpha));
			return `hsla(${h}, ${s}%, ${l}%, ${validAlpha})`;
		}

		case 'hex':
		default:
			const [rh, gh, bh] = generateRGB();
			return `#${[rh, gh, bh]
				.map((x) => x.toString(16).padStart(2, '0'))
				.join('')
				.toUpperCase()}`;
	}
}

/**
 * 生成随机 RGB 值
 */
function generateRGB(options: ColorOptions = {}): [number, number, number] {
	const { hue = [0, 360], saturation = [0, 100], lightness = [0, 100] } = options;

	if (options.format === 'hsl' || options.format === 'hsla') {
		const h = random(hue[0], hue[1]);
		const s = random(saturation[0], saturation[1]) / 100;
		const l = random(lightness[0], lightness[1]) / 100;
		return hslToRgb(h, s, l);
	}

	return [random(0, 255), random(0, 255), random(0, 255)];
}

/**
 * HSL 转 RGB 的辅助函数
 */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
	h /= 360;
	let r: number, g: number, b: number;

	if (s === 0) {
		r = g = b = l;
	} else {
		const hue2rgb = (p: number, q: number, t: number): number => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * 将字符串转换为颜色值
 * @param str - 输入字符串
 * @returns 十六进制颜色值
 */
export function stringToColor(str: string): string {
	if (!str?.length || str.length < 3) return '#000000';

	// 1. 使用定长数组避免动态分配
	let r = 0,
		g = 0,
		b = 0;

	// 2. 使用字符串长度的三分之一作为分段长度
	const segLen = (str.length / 3) | 0;

	// 3. 展开循环，直接计算三个颜色分量
	let pos = 0;

	// 计算红色分量
	for (let i = 0; i < segLen; i++) {
		r += str.charCodeAt(pos++);
	}

	// 计算绿色分量
	for (let i = 0; i < segLen; i++) {
		g += str.charCodeAt(pos++);
	}

	// 计算蓝色分量
	while (pos < str.length) {
		b += str.charCodeAt(pos++);
	}

	// 4. 使用位运算限制值范围
	r &= 0xff;
	g &= 0xff;
	b &= 0xff;

	// 5. 使用预计算的查找表
	const HEX = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

	// 6. 直接拼接字符串
	return '#' + HEX[r >> 4] + HEX[r & 0xf] + HEX[g >> 4] + HEX[g & 0xf] + HEX[b >> 4] + HEX[b & 0xf];
}
