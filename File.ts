export const getFileName = function (fullName: string) {
	return fullName.substring(0, fullName.lastIndexOf('.'));
};

export const getFileExt = function (fullName: string) {
	return fullName.substr(fullName.lastIndexOf('.') + 1).toUpperCase();
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
		toFixedFix = function (n, prec) {
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
