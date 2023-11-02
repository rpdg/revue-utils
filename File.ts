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

function format_number(num: number, decimals: number, dec_point = ',', thousands_sep = '') {
	//   example 1: number_format(1234.56);
	//   returns 1: '1,235'
	//   example 2: number_format(1234.56, 2, ',', ' ');
	//   returns 2: '1 234,56'
	//   example 3: number_format(1234.5678, 2, '.', '');
	//   returns 3: '1234.57'
	//   example 4: number_format(67, 2, ',', '.');
	//   returns 4: '67,00'
	//   example 5: number_format(1000);
	//   returns 5: '1,000'
	//   example 6: number_format(67.311, 2);
	//   returns 6: '67.31'
	//   example 7: number_format(1000.55, 1);
	//   returns 7: '1,000.6'
	//   example 8: number_format(67000, 5, ',', '.');
	//   returns 8: '67.000,00000'
	//   example 9: number_format(0.9, 0);
	//   returns 9: '1'
	//  example 10: number_format('1.20', 2);
	//  returns 10: '1.20'
	//  example 11: number_format('1.20', 4);
	//  returns 11: '1.2000'
	//  example 12: number_format('1.2000', 3);
	//  returns 12: '1.200'
	//  example 13: number_format('1 000,50', 2, '.', ' ');
	//  returns 13: '100 050.00'
	//  example 14: number_format(1e-8, 8, '.', '');
	//  returns 14: '0.00000001'

	let number = (num + '').replace(/[^0-9+\-Ee.]/g, '');
	let n = !isFinite(+number) ? 0 : +number,
		prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
		sep = typeof thousands_sep === 'undefined' ? ',' : thousands_sep,
		dec = typeof dec_point === 'undefined' ? '.' : dec_point,
		//s = '',
		toFixedFix = function (n: number, prec: number) {
			let k = Math.pow(10, prec);
			return '' + (Math.round(n * k) / k).toFixed(prec);
		};
	// Fix forar IE parseFloat(0.55).toFixed(0) = 0;
	let s: Array<any> = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
	if (s[0].length > 3) {
		s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
	}
	if ((s[1] || '').length < prec) {
		s[1] = s[1] || '';
		s[1] += new Array(prec - s[1].length + 1).join('0');
	}
	return s.join(dec);
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
