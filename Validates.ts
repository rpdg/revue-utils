export function verifyEmail(email: string) {
	// 邮箱验证正则
	// 1234@qq.com（纯数字）
	// wang@126.com（纯字母）
	// wang123@126.com（数字、字母混合）
	// wang123@vip.163.com（多级域名）
	// wang_email@outlook.com（含下划线 _）
	// wang.email@gmail.com（含英语句号 .）

	var reg = /^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/;
	return reg.test(email);
}

export function verifyMobile(mobile: string) {
	return /^1[3456789]\d{9}$/.test(mobile);
}

/**
 * 检测是否含有emoji
 */
export const checkEmoji = (function () {
	let ranges = [
		'\ud83c[\udf00-\udfff]', // U+1F300 to U+1F3FF
		'\ud83d[\udc00-\ude4f]', // U+1F400 to U+1F64F
		'\ud83d[\ude80-\udeff]', // U+1F680 to U+1F6FF
	];

	let pattern = new RegExp(ranges.join('|'), 'g');

	return function (val: string) {
		return pattern.test(val);
	};
})();

/**
 * 过滤emoji
 */
export function filterEmoji(txt: string): string {
	const regex =
		/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
	return txt.replace(regex, '');
}

const emptyFn: (obj: any) => any = function () {};
const is: {
	Array: (obj: any) => boolean;
	RegExp: (obj: any) => boolean;
	Date: (obj: any) => boolean;
	Number: (obj: any) => boolean;
	String: (obj: any) => boolean;
	Object: (obj: any) => boolean;
	HTMLDocument: (obj: any) => boolean;
} = {
	Array: emptyFn,
	RegExp: emptyFn,
	Date: emptyFn,
	Number: emptyFn,
	String: emptyFn,
	Object: emptyFn,
	HTMLDocument: emptyFn,
};

let isTypes = ['Array', 'RegExp', 'Date', 'Number', 'String', 'Object', 'HTMLDocument'];
for (let i = 0, c: string; (c = isTypes[i++]); ) {
	is[c] = (function (type) {
		return function (obj: any) {
			return Object.prototype.toString.call(obj) == '[object ' + type + ']';
		};
	})(c);
}

export { is };

