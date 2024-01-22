export default function loadJs(src: string) {
	return new Promise<void>((resolve, reject) => {
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = src;
		script.onload = function () {
			resolve();
		};
		script.onerror = function () {
			reject();
		};
		document.body.appendChild(script);
	});
}
