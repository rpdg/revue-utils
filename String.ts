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
