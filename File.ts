import { format_number } from "./Math";

export const getFileName = function (fullName: string) {
	return fullName.substring(0, fullName.lastIndexOf('.'));
};

export const getFileExt = function (fullName: string) {
	if (fullName.lastIndexOf('.') === -1) {
		return '';
	}
	return fullName.substr(fullName.lastIndexOf('.') + 1).toUpperCase();
};

export const normalizeSuffix = function (suffix: string) {
	return suffix.replace(/^\./i, '').toUpperCase();
};

export const fileSize = function (filesize: number) {
	let sizeStr: string;
	if (filesize >= 1073741824) {
		sizeStr = format_number(filesize / 1073741824, 2, '.', ',') + ' GB';
	} else if (filesize >= 1048576) {
		sizeStr = format_number(filesize / 1048576, 2, '.', '') + ' MB';
	} else if (filesize >= 1024) {
		sizeStr = format_number(filesize / 1024, 0) + ' KB';
	} else {
		//filesize = '< 1KB';
		sizeStr = format_number(filesize, 0) + ' bytes';
	}
	return sizeStr;
};

export const FileTypes_Word = ['DOC', 'DOCX', 'DOTX'];
export const FileTypes_Excel = ['XLSX', 'XLSB', 'XLS', 'XLSM'];
export const FileTypes_Powerpoint = ['PPTX', 'PPSX', 'PPT', 'PPS', 'POTX', 'PPSM'];

/**
 * all uppercased office file ext names
 */
export const FileTypes_Office = [...FileTypes_Word, ...FileTypes_Excel, ...FileTypes_Powerpoint];

export const FileTypes_Image = ['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP'];
export const FileTypes_Video = ['MP4', 'WEBM', 'OGG', 'MOV'];
export const FileTypes_Audio = ['MP3', 'WAV', 'MIDI'];

export function isOffice(suffix: string) {
	let s = normalizeSuffix(suffix);
	return FileTypes_Office.indexOf(s) > -1;
}
export function isImg(suffix: string) {
	let s = normalizeSuffix(suffix);
	return FileTypes_Image.indexOf(s) > -1;
}
export function isAudio(suffix: string) {
	let s = normalizeSuffix(suffix);
	return FileTypes_Audio.indexOf(s) > -1;
}
export function isVideo(suffix: string) {
	let s = normalizeSuffix(suffix);
	return FileTypes_Video.indexOf(s) > -1;
}

/**
 *
 * @param blob  Blob
 * @param filename  string
 * @returns HTMLAnchorElement
 *
 * @example
 *
 * fetch('https://picsum.photos/list')
  .then(response => response.json())
  .then(data => data.filter(squareImages))
  .then(collectionToCSV(exportFields))
  .then(csv => {
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, 'photos.csv');
  })
  .catch(console.error);
 */
export function downloadBlob(blob: Blob, filename: string): HTMLAnchorElement {
	// Create an object URL for the blob object
	const url = URL.createObjectURL(blob);

	// Create a new anchor element
	const a = document.createElement('a');

	// Set the href and download attributes for the anchor element
	// You can optionally set other attributes like `title`, etc
	// Especially, if the anchor element will be attached to the DOM
	a.href = url;
	a.download = filename || 'download';

	// Click handler that releases the object URL after the element has been clicked
	// This is required for one-off downloads of the blob content
	const clickHandler = () => {
		setTimeout(() => {
			URL.revokeObjectURL(url);
			removeEventListener('click', clickHandler);
		}, 200);
	};

	// Add the click event listener on the anchor element
	// Comment out this line if you don't want a one-off download of the blob content
	a.addEventListener('click', clickHandler, false);

	// Programmatically trigger a click on the anchor element
	// Useful if you want the download to happen automatically
	// Without attaching the anchor element to the DOM
	// Comment out this line if you don't want an automatic download of the blob content
	a.click();

	// Return the anchor element
	// Useful if you want a reference to the element
	// in order to attach it to the DOM or use it in some other way
	return a;
}

/**
 * Retrieves the buffer of a file.
 * @param filePath The path of the file.
 * @returns A promise that resolves with the Uint8Array buffer.
 */
export function getBuffer(filePath: string): Promise<Uint8Array> {
	return new Promise<Uint8Array>(function (resolve, reject) {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', filePath);
		xhr.responseType = 'arraybuffer';
		xhr.onload = function () {
			resolve(new Uint8Array(xhr.response));
		};
		xhr.onerror = function () {
			reject(new Error('file is not loaded'));
		};
		xhr.send();
	});
}
