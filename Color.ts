export type RgbColor = {
	r: number;
	g: number;
	b: number;
};

export function darken(color: string, amt: number | string) {
	let amount: number;
	if (typeof amt === 'string' && amt.endsWith('%')) {
		amount = Math.floor(255 * (parseInt(amt) / 100));
	} else if (typeof amt === 'number') {
		amount = amt;
	} else {
		amount = parseInt(amt);
	}

	let rgb = hexToRgb(color);

	rgb.r = Math.max(rgb.r - amount, 0);
	rgb.g = Math.max(rgb.g - amount, 0);
	rgb.b = Math.max(rgb.b - amount, 0);

	return rgbToHex(rgb);
}

export function lighten(color: string, amt: number | string) {
	let amount: number;
	if (typeof amt === 'string' && amt.endsWith('%')) {
		amount = Math.floor(255 * (parseInt(amt) / 100));
	} else if (typeof amt === 'number') {
		amount = amt;
	} else {
		amount = parseInt(amt);
	}

	let rgb = hexToRgb(color);

	rgb.r = Math.min(rgb.r + amount, 255);
	rgb.g = Math.min(rgb.g + amount, 255);
	rgb.b = Math.min(rgb.b + amount, 255);

	return rgbToHex(rgb);
}

export function hexToRgb(hex: string): RgbColor {
	let r = parseInt(hex.slice(1, 3), 16);
	let g = parseInt(hex.slice(3, 5), 16);
	let b = parseInt(hex.slice(5, 7), 16);

	return { r, g, b };
}

export function rgbToHex({ r, g, b }: RgbColor): string {
	return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
