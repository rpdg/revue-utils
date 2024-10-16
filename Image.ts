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
	const imgFile: File = new File([theBlob], fileName, { lastModified: Date.now(), type: theBlob.type });
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
		img.onerror = (error: any) => {
			console.error(error);
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

/**
 * 去除PNG透明背景,叠加指定颜色（默认白色）,同时保留原图非透明像素信息。
 * @param srcData
 * @returns
 */
export function applyBackgroundOverlay(
	srcData: Uint8ClampedArray,
	bgColor: { r: number; g: number; b: number } = { r: 255, g: 255, b: 255 }
): Uint8ClampedArray {
	let outputData = new Uint8ClampedArray(srcData.length);

	for (let i = 0; i < srcData.length; i += 4) {
		const alpha = srcData[i + 3];

		if (alpha < 255) {
			// 对半透明像素进行颜色混合
			const alphaFactor = alpha / 255;
			outputData[i] = bgColor.r + alphaFactor * (outputData[i] - bgColor.r); // 混合红色通道
			outputData[i + 1] = bgColor.g + alphaFactor * (outputData[i + 1] - bgColor.g); // 混合绿色通道
			outputData[i + 2] = bgColor.b + alphaFactor * (outputData[i + 2] - bgColor.b); // 混合蓝色通道
			outputData[i + 3] = 255;
		} else {
			outputData[i] = srcData[i]; // 保留原有的颜色信息
			outputData[i + 1] = srcData[i + 1]; // 保留原有的颜色信息
			outputData[i + 2] = srcData[i + 2]; // 保留原有的颜色信息
			outputData[i + 3] = srcData[i + 3]; // 保留原有的 alpha 通道值
		}
	}

	return outputData;
}

/**
 * 图像反色
 * @param data
 * @returns
 */
export function invert(data: Uint8ClampedArray): Uint8ClampedArray {
	let outputData = new Uint8ClampedArray(data.length);

	for (let i = 0; i < data.length; i += 4) {
		outputData[i] = 255 - data[i]; // 反色处理，即将原色取补
		outputData[i + 1] = 255 - data[i + 1];
		outputData[i + 2] = 255 - data[i + 2];
		outputData[i + 3] = data[i + 3]; // 保持 alpha 通道不变
	}

	return outputData;
}

/**
 * 转换为灰度
 * @param data
 * @param contrast 取值范围为0到1，代表从完全黑到原始灰度
 * @returns
 */
export function grayScale(data: Uint8ClampedArray, contrast: number = 1): Uint8ClampedArray {
	let outputData = new Uint8ClampedArray(data.length);
	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		let brightness = (r + g + b) / 3;
		// Adjust brightness based on contrast level
		brightness = brightness * contrast + (1 - contrast) * 128;
		outputData[i] = outputData[i + 1] = outputData[i + 2] = brightness;
		outputData[i + 3] = data[i + 3]; // 保持 alpha 值不变
	}
	return outputData;
}

/**
 * 转换为灰度, 加权平均的方式计算灰度值
 * @param data
 * @returns
 */
export function grayScale2(data: Uint8ClampedArray): Uint8ClampedArray {
	let outputData = new Uint8ClampedArray(data.length);
	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		// const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
		const brightness = r * 0.34 + g * 0.5 + b * 0.16;
		// const brightness = (r + g + b) / 3;
		outputData[i] = outputData[i + 1] = outputData[i + 2] = brightness;
		outputData[i + 3] = data[i + 3]; // 保持 alpha 值不变
	}

	return outputData;
}

/**
 * 自适应阈值二值化
 * @param data
 * @param threshold
 * @returns
 */
export function threshold(data: Uint8ClampedArray, threshold: number = 160): Uint8ClampedArray {
	const width = data.length / 4;
	const height = 1;
	const newPixData = new Uint8ClampedArray(width * height * 4);

	for (let i = 0; i < width * height; i++) {
		const r = data[i * 4];
		const g = data[i * 4 + 1];
		const b = data[i * 4 + 2];
		const a = data[i * 4 + 3];

		const gray = (r + g + b) / 3;

		if (gray > threshold) {
			newPixData[i * 4] = newPixData[i * 4 + 1] = newPixData[i * 4 + 2] = 255;
			newPixData[i * 4 + 3] = a;
		} else {
			newPixData[i * 4] = newPixData[i * 4 + 1] = newPixData[i * 4 + 2] = 0;
			newPixData[i * 4 + 3] = a;
		}
	}

	return newPixData;
}

/**
 * 自适应阈值二值化, 加权平均的方式计算灰度值
 * @param data
 * @param threshold
 * @returns
 */
export function threshold2(data: Uint8ClampedArray, threshold: number = 160): Uint8ClampedArray {
	let outputData = new Uint8ClampedArray(data.length);
	for (let i = 0; i < data.length; i += 4) {
		let r = data[i];
		let g = data[i + 1];
		let b = data[i + 2];

		// 加权平均的方式计算灰度值
		let brightness = r * 0.34 + g * 0.5 + b * 0.16;
		if (brightness > threshold) {
			outputData[i] = outputData[i + 1] = outputData[i + 2] = 255;
		} else {
			outputData[i] = outputData[i + 1] = outputData[i + 2] = 0;
		}
		outputData[i + 3] = 255; // 设置alpha通道值为不透明
	}

	return outputData;
}

/**
 * 膨胀操作
 * @param data
 * @param width
 * @param height
 * @param radius （表示膨胀的像素数量）
 * @returns
 */
export function dilate(data: Uint8ClampedArray, width: number, height: number, radius: number = 1): Uint8ClampedArray {
	let outputData = new Uint8ClampedArray(data.length);
	for (let i = 0; i < data.length; i += 4) {
		if (data[i] === 0) {
			for (let j = -radius; j <= radius; j++) {
				// 替换原来的-1和1
				for (let k = -radius; k <= radius; k++) {
					// 替换原来的-1和1
					let x = (i / 4) % width;
					let y = Math.floor(i / 4 / width);
					if (x + j >= 0 && x + j < width && y + k >= 0 && y + k < height) {
						let index = 4 * (width * (y + k) + (x + j));
						outputData[index] = 0;
						outputData[index + 1] = 0;
						outputData[index + 2] = 0;
						outputData[index + 3] = 255;
					}
				}
			}
		} else {
			outputData[i] = 255;
			outputData[i + 1] = 255;
			outputData[i + 2] = 255;
			outputData[i + 3] = 255;
		}
	}
	return outputData;
}

/**
 * 腐蚀操作
 * 如果该区域中非白色（不是255）像素的数量超过了intensity值，则当前像素会被标记为黑色（蚀刻效果）。
 * 因此，intensity越高，蚀刻就越少，因为只有当周围非白色像素的数量足够多时，当前像素才会被蚀刻。
 * @param data
 * @param width
 * @param height
 * @param kernel 蚀核二维数组
 * @param intensity 阈值，用于确定一个像素是否应该被转换为背景色, 如果你希望蚀刻效果较轻，可以选择较小的intensity值；反之，如果希望蚀刻效果更明显，可以选择较大的intensity值。
 * @returns
 * @usage
 *
 * let kernel = [
			[0, 1, 0],
			[1, 1, 1],
			[0, 1, 0],
		];

	let intensity = 2; // 根据腐蚀效果调整这个值

	erode(data, width, height, kernel, intensity);
 */
export function erode(
	data: Uint8ClampedArray,
	width: number,
	height: number,
	kernel: number[][],
	intensity: number
): Uint8ClampedArray {
	let outputData = new Uint8ClampedArray(data.length);
	for (let i = 0; i < data.length; i += 4) {
		let x = (i / 4) % width;
		let y = Math.floor(i / 4 / width);
		let flag = true;
		if (data[i] === 255) {
			let count = 0;
			for (let j = -1; j <= 1; j++) {
				for (let k = -1; k <= 1; k++) {
					if (x + j >= 0 && x + j < width && y + k >= 0 && y + k < height) {
						let dataIndex = 4 * (width * (y + k) + (x + j));
						// 当kernel对应的值为1，并且该数据不是白色时，递增计数器
						if (kernel[k + 1][j + 1] === 1 && data[dataIndex] !== 255) {
							count++;
						}
					}
				}
			}
			// 如果非白色像素点的数量高于强度值，标记为false
			if (count > intensity) {
				flag = false;
			}
			if (flag) {
				outputData[i] = 255;
				outputData[i + 1] = 255;
				outputData[i + 2] = 255;
				outputData[i + 3] = 255;
			} else {
				outputData[i] = 0;
				outputData[i + 1] = 0;
				outputData[i + 2] = 0;
				outputData[i + 3] = 255;
			}
		} else {
			outputData[i] = 0;
			outputData[i + 1] = 0;
			outputData[i + 2] = 0;
			outputData[i + 3] = 255;
		}
	}
	return outputData;
}

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

/**
 * getImageData retrieves the pixel data from an HTMLImageElement, optionally scaling the image to a specified size.
 * It creates an OffscreenCanvas, draws the image onto it, and then extracts the image data as a Uint8ClampedArray.
 * @param img
 * @param scaledSize
 * @returns
 */
export function getImageData(img: HTMLImageElement, scaledSize?: number): Uint8ClampedArray {
	let w = img.naturalWidth,
		h = img.naturalHeight;
	if (scaledSize) {
		if (w > h) {
			h = scaledSize;
			w = Math.round(img.naturalWidth * (h / img.naturalHeight));
		} else {
			w = scaledSize;
			h = Math.round(img.naturalHeight * (w / img.naturalWidth));
		}
	}
	const canvas = new OffscreenCanvas(w, h);
	const ctx = canvas.getContext('2d')!;
	ctx.drawImage(img, 0, 0, w, h);
	const imgData = ctx.getImageData(0, 0, w, h);
	return imgData.data;
}

/**
 * drawImageData creates a canvas element, sets its dimensions, and draws image data onto it using a Uint8ClampedArray.
 * The canvas is then appended to the document body and returned for further use.
 */
export function drawImageData(data: Uint8ClampedArray, w: number, h: number): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.height = h;
	canvas.width = w;
	document.body.appendChild(canvas);
	const ctx = canvas.getContext('2d')!;
	ctx.putImageData(new ImageData(data, w, h), 0, 0);
	return canvas;
}

export const BlankGif = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * drawImageOnCanvas loads an image from a given URL and draws it onto a canvas of specified width and height.
// It returns a Promise that resolves with the created HTMLCanvasElement once the image is successfully loaded,
// or rejects with an error if the image fails to load.
 * @param imageUrl
 * @returns
 */
export function drawImageOnCanvas(imageUrl: string, w: number, h: number): Promise<HTMLCanvasElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = imageUrl;
		img.crossOrigin = 'anonymous';
		img.onload = function () {
			const canvas = document.createElement('canvas');
			canvas.width = w || img.width || img.naturalWidth;
			canvas.height = h || img.height || img.naturalHeight;
			const ctx = canvas.getContext('2d')!;
			ctx.drawImage(img, 0, 0);
			resolve(canvas);
		};
		img.onerror = function (error) {
			reject(error);
		};
	});
}

/**
 * This function converts an SVG element into a base64-encoded data URL and draws it onto a canvas element.
 * It takes an SVGElement as input and returns a Promise that resolves to an HTMLCanvasElement.
 * @param svgElement
 * @returns
 */
export async function drawSvgOnCanvas(svgElement: SVGElement): Promise<HTMLCanvasElement> {
	let serializer = new XMLSerializer();
	let svgString = serializer.serializeToString(svgElement);
	let encodedData = window.btoa(unescape(encodeURIComponent(svgString)));
	let dataUrl = 'data:image/svg+xml;base64,' + encodedData;
	return await drawImageOnCanvas(dataUrl, svgElement.clientWidth, svgElement.clientHeight);
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
	let colorCounts: any = {};
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
