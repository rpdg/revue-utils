const _str_pad_repeater = function (s: string, len: number): string {
	let collect = '';

	while (collect.length < len) {
		collect += s;
	}
	collect = collect.substr(0, len);

	return collect;
};

export function pad(
	input: string,
	result_full_length: number,
	pad_string: string = '0',
	pad_type: 'STR_PAD_LEFT' | 'STR_PAD_BOTH' | 'STR_PAD_RIGHT' = 'STR_PAD_RIGHT'
) {
	//   example 1: str.pad('Kevin van Zonneveld', 30, '-=', 'STR_PAD_LEFT');
	//   returns 1: '-=-=-=-=-=-Kevin van Zonneveld'
	//   example 2: str.pad('Kevin van Zonneveld', 30, '-', 'STR_PAD_BOTH');
	//   returns 2: '------Kevin van Zonneveld-----'

	let half = '',
		pad_to_go;

	input += '';
	pad_string = pad_string !== undefined ? pad_string : ' ';

	if (pad_type !== 'STR_PAD_LEFT' && pad_type !== 'STR_PAD_RIGHT' && pad_type !== 'STR_PAD_BOTH') {
		pad_type = 'STR_PAD_RIGHT';
	}
	if ((pad_to_go = result_full_length - input.length) > 0) {
		if (pad_type === 'STR_PAD_LEFT') {
			input = _str_pad_repeater(pad_string, pad_to_go) + input;
		} else if (pad_type === 'STR_PAD_RIGHT') {
			input = input + _str_pad_repeater(pad_string, pad_to_go);
		} else if (pad_type === 'STR_PAD_BOTH') {
			half = _str_pad_repeater(pad_string, Math.ceil(pad_to_go / 2));
			input = half + input + half;
			input = input.substr(0, result_full_length);
		}
	}

	return input;
}

export function padLeft(oStr: string, length: number, pad_string: string = '0'): string {
	return pad(oStr, length, pad_string, 'STR_PAD_LEFT');
}

export function padRight(oStr: string, length: number, pad_string: string = '0'): string {
	return pad(oStr, length, pad_string, 'STR_PAD_RIGHT');
}

export function trim(str: string, char: string = ' ') {
	const reg = new RegExp(`^[${char}]+|[${char}]+$`, 'g');
	return str.replace(reg, '');
}

export function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function camelCase(str: string) {
	str = str.replace(/[\s_\-]+/g, ' ').trim();
	return str
		.split(' ')
		.map(function (word, index) {
			if (index == 0) {
				return word;
			}
			return word[0].toUpperCase() + word.slice(1);
		})
		.join('');
}

export function getRandomColor(): string {
	let letters = '0123456789ABCDEF'.split('');
	let color = '#';
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

export async function copy(txt: string) {
	await navigator.clipboard.writeText(txt);
}

export async function paste(): Promise<string> {
	return await navigator.clipboard.readText();
}
