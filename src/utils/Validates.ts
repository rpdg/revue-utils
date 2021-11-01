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
