/**
 *
 * @param blob
 */
export async function blobToBase64(blob: Blob) {
	const imgFile = blobToFile(blob);
	return await fileToBase64(imgFile);
}

export function blobToFile(theBlob: Blob, fileName: string = 'new_image'): File {
	const imgFile: File = new File([theBlob], 'new_image', { lastModified: Date.now(), type: theBlob.type });
	return imgFile;
}

/**
 * trans an image file to base64
 * @param file raw file
 */
export async function fileToBase64(file: File) {
	return new Promise<string>((resolve, reject) => {
		if (!file.type.match(/image.*/)) {
			reject(new Error('Not an image'));
			return;
		}

		let reader = new FileReader();
		reader.onloadend = () => {
			resolve(reader.result as string);
		};
		reader.onerror = (error) => {
			reject(error);
		};
		reader.readAsDataURL(file);
	});
}

/**
 * 根据base64，返回Blob
 * @param dataURI base64 string
 */
export function base64ToBlob(dataURI: string): Blob {
	// convert base64/URLEncoded data component to raw binary data held in a string
	let byteString;
	if (dataURI.split(',')[0].indexOf('base64') >= 0) {
		byteString = atob(dataURI.split(',')[1]);
	} else {
		byteString = unescape(dataURI.split(',')[1]);
	}

	// separate out the mime component
	let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

	// write the bytes of the string to a typed array
	let ia = new Uint8Array(byteString.length);
	for (let i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}

	return new Blob([ia], { type: mimeString });
}

/**
 * 根据base64，返回文件
 * @param dataUrl base64字串
 * @param fileName 目标文件名
 */
export async function base64ToFile(dataURI: string, fileName?: string) {
	const res = await fetch(dataURI);
	const blob = await res.blob();
	// separate out the mime component
	let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

	fileName ??= (Date.now() + '' + Math.random()).replace(/[\.]/, '-');

	let suffix = '.' + mimeString.split('/')[1];
	let hasSuffix = fileName.lastIndexOf(suffix) === suffix.length;

	return new File([blob], `${fileName}${hasSuffix ? '' : suffix}`, { type: mimeString });
}

/**
 * 压缩图像文件
 * @param imgFile
 * @param maxSize
 * @param compressLevel
 */
export default async function imgFileCompress(
	imgFile: File,
	maxSize: number = 1280,
	compressLevel: number = 0.8
): Promise<string> {
	const dataUri = await fileToBase64(imgFile);
	return await imgCompress(dataUri, maxSize, compressLevel);
}

/**
 * 压缩base64的图像
 * @param srcBase64
 * @param maxSize default: 1280, while maxSize equls 0, will return original size
 * @param compressLevel 0 ~ 1, default: 0.8,
 */
export async function imgCompress(
	srcBase64: string,
	maxSize: number = 1280,
	compressLevel: number = 0.8
): Promise<string> {
	return new Promise((resolve, reject) => {
		let img = new Image();
		img.src = srcBase64;

		img.onload = function () {
			let w = img.naturalWidth,
				h = img.naturalHeight,
				resizeW = 0,
				resizeH = 0;

			if (w > maxSize || h > maxSize) {
				const multiple = Math.max(w / maxSize, h / maxSize);
				resizeW = w / multiple;
				resizeH = h / multiple;
			} else {
				(resizeW = w), (resizeH = h);
			}

			if (compressLevel < 1 && compressLevel > 0) {
				const imgType = srcBase64.indexOf('image/png') > -1 ? 'image/png' : 'image/jpeg';

				let canvas = document.createElement('canvas');
				let ctx = canvas.getContext('2d');
				canvas.width = resizeW;
				canvas.height = resizeH;

				ctx?.drawImage(img, 0, 0, resizeW, resizeH);
				let base64 = canvas.toDataURL(imgType, compressLevel);

				resolve(base64);
			} else {
				reject('image compress level must during 0~1');
			}
		};
	});
}

/**
 * get image type( .jpg .png .gif ...) from base64 uri
 * @param dataURI
 */
export function getImageSurfix(dataURI: string): string {
	let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

	return '.' + mimeString.substr(6);
}

export const downloadImage = (img: HTMLImageElement, downName?: string) => {
	let link = document.createElement('a');
	link.href = img.src;
	link.download = downName ?? 'download.jpg';
	link.style.display = 'none';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};

export async function checkExists(src: string): Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {
		let img = new Image();
		img.onload = () => {
			resolve(true);
		};
		img.onerror = (error) => {
			reject(false);
		};
		img.src = src;
	});
}

export const checkCanvasMime = (canvas: HTMLCanvasElement) => {
	let imageMimes = ['image/png', 'image/bmp', 'image/gif', 'image/jpeg', 'image/tiff']; //Extend as necessary
	let acceptedMimes: string[] = [];
	for (let i = 0; i < imageMimes.length; i++) {
		if (canvas.toDataURL(imageMimes[i]).search(imageMimes[i]) >= 0) {
			acceptedMimes[acceptedMimes.length] = imageMimes[i];
		}
	}

	// console.log(acceptedMimes);
	return acceptedMimes;
};

export const canvasToImage = (canvas: HTMLCanvasElement, img: HTMLImageElement) => {
	canvas.toBlob(
		(blob) => {
			let url = URL.createObjectURL(blob!);
			img.src = url;
		},
		'image/jpeg',
		0.9
	);
};

export const BlankGif = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
