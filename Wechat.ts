import wx from 'wechat-jssdk-ts';
import { base64ToFile, getImageSurfix, imgCompress } from './Image';

let fileNameSeed = 0;

/**
 * 包含了文件和base64的对象
 */
export type FileUriPaire = {
	file: File;
	uri: string;
};

/**
 * 包含了文件数组和base64数组的对象
 */
export type FilesUrisPaire = {
	files: File[];
	uries: string[];
};

/**
 * 根据微信选择图像返回的localId，返回base64
 * @param localId
 */
export async function localIdToBase64(localId: string): Promise<string> {
	return new Promise((resolve, reject) => {
		wx.getLocalImgData({
			localId,
			success: function (res: any) {
				let { localData } = res;

				// 兼容处理，安卓获取的图片base64码没有前缀，而苹果有,base64前缀并不固定
				if (localData.indexOf('data:image') === -1) {
					localData = 'data:image/jpeg;base64,' + localData;
				}

				// 兼容处理，若是苹果手机，将前缀中的jgp替换成jpeg
				if (localData.indexOf('data:image/jgp;base64,') != -1) {
					localData = localData.replace(/\r|\n/g, '').replace('data:image/jgp', 'data:image/jpeg');
				}

				resolve(localData as string);
			},
			fail: function (err: any) {
				reject(err);
			},
		});
	});
}

/**
 *
 * @param localId
 * @param maxSize default: 1280, while maxSize equls 0, will return original size
 * @param compressLevel 0 ~ 1, default: 0.8,
 */
export async function localIdToFile(
	localId: string,
	maxSize: number = 1280,
	compressLevel: number = 0.8
): Promise<FileUriPaire> {
	let base64 = await localIdToBase64(localId);

	if (maxSize != 0) {
		base64 = await imgCompress(base64, maxSize, compressLevel);
	}

	let file = await base64ToFile(base64, `file-${++fileNameSeed}${getImageSurfix(base64)}`);

	return { file, uri: base64 };
}

/**
 *
 * @param localIds
 * @param maxSize default: 1280, while maxSize equls 0, will return original size
 * @param compressLevel 0 ~ 1, default: 0.8,
 */
export async function localIdsToFiles(
	localIds: string[],
	maxSize: number = 1280,
	compressLevel: number = 0.8
): Promise<FilesUrisPaire> {
	let result: { files: File[]; uries: string[] } = { files: [], uries: [] };

	for (let i = 0; i < localIds.length; i++) {
		const localId = localIds[i];
		let filePaire = await localIdToFile(localId, maxSize, compressLevel);
		result.files.push(filePaire.file);
		result.uries.push(filePaire.uri);
	}

	return result;
}

/**
 *
 */

declare global {
	interface Window {
		WeixinJSBridge: any;
	}
}

export type ShareType = 'timeline' | 'appMessage';
export type PayResultType = 'ok' | 'cancel' | 'fail';

/**
 * JS-SDK初始化
 * @param config 配置
 * @example wx.readyAsync().then()
 */
export const readyAsync = (config: wx.ConfigOptions) => {
	return new Promise((resolve, reject) => {
		wx.config(config);
		// @ts-ignore
		wx.ready(resolve);
		wx.error(reject);
	});
};

/**
 * 微信分享
 * @param types 类型 ['timeline', 'appMessage']
 * @param option
 */
export const shareAsync = (types: ShareType[], option: wx.shareDataOptions) => {
	const wxShareMessage = wx.onMenuShareAppMessage || wx.updateAppMessageShareData;
	const wxShareTimeline = wx.onMenuShareTimeline || wx.updateTimelineShareData;

	const { title, desc, link, imgUrl } = option;

	return new Promise((resolve, reject) => {
		const options = {
			title,
			desc,
			link,
			imgUrl,
			success: resolve,
			cancel: reject,
		};
		types.indexOf('appMessage') > -1 && wxShareMessage(options);
		types.indexOf('timeline') > -1 && wxShareTimeline(options);
	});
};

/**
 * Promise版本 支付
 * @param option
 */
export const payAsync = async (option: wx.chooseWxPayOptions): Promise<PayResultType> => {
	if (typeof window.WeixinJSBridge === 'undefined') return Promise.reject('fail');

	return new Promise((resove, reject) => {
		window.WeixinJSBridge.invoke('getBrandWCPayRequest', option, (res: any) => {
			// get_brand_wcpay_request:ok
			const msg = res.err_msg ? res.err_msg.split(':')[1] : 'fail';
			msg === 'ok' ? resove(msg) : reject(msg);
		});
	});
};

/**
 * 隐藏分享按钮(不需要 initConfig)
 */
export const hideShareMenus = () => {
	if (typeof window.WeixinJSBridge === 'undefined') return;
	document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
		window.WeixinJSBridge.call('hideOptionMenu');
	});
};

/**
 * 隐藏底部导航栏
 */
export const hideToolbar = () => {
	if (typeof window.WeixinJSBridge === 'undefined') return;
	document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
		window.WeixinJSBridge.call('hideToolbar');
	});
};

export type IPlatform = 'iOS' | 'Android' | 'wechat' | 'unkown';

/**
 * 判断在何种平台下
 *
 * (ps: 鸿蒙归于安卓)
 * @returns 'iOS' | 'Android' | 'wechat' | 'unkown'
 */
export function platform(): IPlatform {
	//检查用户代理
	const ua = navigator.userAgent.toLowerCase();
	if (/iphone|ipad|ipod/.test(ua)) {
		return 'iOS';
	} else if (/android/.test(ua) || /harmonyos/.test(ua)) {
		return 'Android';
	} else if (/micromessenger/.test(ua)) {
		return 'wechat';
	} else {
		return 'unkown';
	}
}
