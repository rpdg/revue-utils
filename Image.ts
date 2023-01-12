import comlinker from './Comlinker';

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
 * trans an image file to base64 with web worker
 *
 * @example const dataUri = await fileToBase64Worker.run(file);
 */
export const fileToBase64Worker = comlinker<{ run: (file: File) => Promise<string> }>((exports) => {
	exports.run = async function fileToBase64(file: File) {
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
	};
});

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

export const downloadImage = async (img: HTMLImageElement | string, downName: string = 'download.jpg') => {
	let imageURL: string;
	if (typeof img === 'object' && 'tagName' in img && img.tagName === 'IMG') {
		img = img.src;
	}
	if (typeof img === 'string' && img.startsWith('http')) {
		const image = await fetch(img);
		const imageBlog = await image.blob();
		imageURL = URL.createObjectURL(imageBlog);
	}
	let link = document.createElement('a');
	link.href = imageURL!;
	link.download = downName;
	link.style.display = 'none';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};

export async function checkExists(src: string): Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {
		let img: HTMLImageElement = new Image();
		img.onload = () => {
			resolve(true);
		};
		img.onerror = (error) => {
			reject(false);
		};
		img.src = src;
	});
}

export async function checkImageSize(src: string): Promise<{ width: number; height: number }> {
	return new Promise(async (resolve, reject) => {
		let img: HTMLImageElement = new Image();
		img.onload = () => {
			let width = img.naturalWidth,
				height = img.naturalHeight;
			resolve({ width, height });
		};
		img.onerror = (error) => {
			reject(error);
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

export const canvasToImage = (canvas: HTMLCanvasElement, img: HTMLImageElement, quality = 0.9) => {
	canvas.toBlob(
		(blob) => {
			let url = URL.createObjectURL(blob!);
			img.src = url;
		},
		'image/jpeg',
		quality
	);
};

export const BlankGif = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * 接受一个图片的 URL 并返回该图片绘制的 canvas
 * @param imageUrl
 * @returns
 */
export function drawImageOnCanvas(imageUrl: string): Promise<HTMLCanvasElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = imageUrl;
		img.crossOrigin = 'anonymous';
		img.onload = function () {
			const canvas = document.createElement('canvas');
			canvas.width = img.width;
			canvas.height = img.height;

			const ctx = canvas.getContext('2d')!;
			ctx.drawImage(img, 0, 0);

			resolve(canvas);
		};
		img.onerror = function (error) {
			reject(error);
		};
	});
}

export type IRGBA = {
	r: number;
	g: number;
	b: number;
	a: number;
};

/***
 * 返回canvas的平均颜色
 */
export function getAverageColor(canvas: HTMLCanvasElement): IRGBA {
	const ctx = canvas.getContext('2d')!;
	const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
	let r = 0;
	let g = 0;
	let b = 0;
	let a = 0;
	for (let i = 0; i < pixels.length; i += 4) {
		r += pixels[i];
		g += pixels[i + 1];
		b += pixels[i + 2];
		a += pixels[i + 3];
	}
	r /= pixels.length / 4;
	g /= pixels.length / 4;
	b /= pixels.length / 4;
	a /= pixels.length / 4;
	return { r: r, g: g, b: b, a: a };
}

/**
 * k-means 算法。这个算法可以将图像中的像素分到 k 个不同的色调类中，
 * 然后取每类中像素数量最多的那个颜色作为该类的代表颜色，
 * 最终得到 k 个代表颜色作为图像的平均颜色。在较大的图像精度可能较高
 * @param imageData
 * @param k
 * @returns
 */
export function kmeans(canvas: HTMLCanvasElement, k: number): IRGBA {
	const ctx = canvas.getContext('2d')!;
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const pixels = imageData.data;
	const pixelCount = imageData.width * imageData.height;

	// 初始化 k 个中心点
	const centers: IRGBA[] = [];
	for (let i = 0; i < k; i++) {
		centers.push({
			r: Math.floor(Math.random() * 256),
			g: Math.floor(Math.random() * 256),
			b: Math.floor(Math.random() * 256),
			a: Math.floor(Math.random() * 256),
		});
	}

	let changed: boolean;
	do {
		// 分配每个像素到最近的中心
		const clusters: IRGBA[][] = Array.from({ length: k }, () => []);

		for (let i = 0; i < pixelCount; i++) {
			const r = pixels[i * 4];
			const g = pixels[i * 4 + 1];
			const b = pixels[i * 4 + 2];
			const a = pixels[i * 4 + 3];

			let minDistance = Infinity;
			let clusterIndex = 0;
			for (let j = 0; j < k; j++) {
				const distance = (r - centers[j].r) ** 2 + (g - centers[j].g) ** 2 + (b - centers[j].b) ** 2;
				if (distance < minDistance) {
					minDistance = distance;
					clusterIndex = j;
				}
			}

			clusters[clusterIndex].push({ r, g, b, a });
		}

		// 计算新的中心
		changed = false;
		for (let i = 0; i < k; i++) {
			const cluster = clusters[i];
			if (!cluster.length) {
				continue;
			}

			let r = 0;
			let g = 0;
			let b = 0;
			let a = 0;
			for (let j = 0; j < cluster.length; j++) {
				r += cluster[j].r;
				g += cluster[j].g;
				b += cluster[j].b;
				a += cluster[j].a;
			}
			r = Math.floor(r / cluster.length);
			g = Math.floor(g / cluster.length);
			b = Math.floor(b / cluster.length);
			a = Math.floor(a / cluster.length);

			if (r !== centers[i].r || g !== centers[i].g || b !== centers[i].b) {
				centers[i] = { r, g, b, a };
				changed = true;
			}
		}
	} while (changed);

	// return centers;

	let avgColor = { r: 0, g: 0, b: 0, a: 0 };
	centers.forEach((color) => {
		avgColor.r += color.r;
		avgColor.g += color.g;
		avgColor.b += color.b;
		avgColor.a += color.a;
	});
	return avgColor;
}


/**
 * 返回canvas中使用最多的颜色
 * @param canvas
 * @returns
 */
export function getMostUsedColor(canvas: HTMLCanvasElement): IRGBA {
	let colorCounts = {};
	let maxCount = 0;
	let mostFrequentColor: IRGBA = { r: 0, g: 0, b: 0, a: 0 };

	const ctx = canvas.getContext('2d')!;
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;
	// 遍历所有像素
	for (let i = 0; i < data.length; i += 4) {
		let red = data[i];
		let green = data[i + 1];
		let blue = data[i + 2];
		let alpha = data[i + 3];

		// 根据 RGBA 值构造颜色字符串
		let color = `rgba(${red}, ${green}, ${blue}, ${alpha})`;

		// 统计颜色数量
		if (colorCounts[color]) {
			colorCounts[color]++;
		} else {
			colorCounts[color] = 1;
		}

		// 更新最大值
		if (colorCounts[color] > maxCount) {
			maxCount = colorCounts[color];
			mostFrequentColor = { r: red, g: green, b: blue, a: alpha };
		}
	}

	return mostFrequentColor;
}
