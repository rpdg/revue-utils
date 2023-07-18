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

export function stringToColor(str: string): string {
	if (!str || str.length < 3) {
		return '#000000';
	}

	let p = 3;
	let l = ~~(str.length / p);
	let arr: number[] = [];
	for (let x = 0; x < p; x++) {
		let codeSum = 0;
		for (let i = 0; i < l; i++) {
			codeSum += str.charCodeAt(i * x);
		}
		arr.push(codeSum % 256);
	}
	return `#${arr[0].toString(16)}${arr[1].toString(16)}${arr[2].toString(16)}`;
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
