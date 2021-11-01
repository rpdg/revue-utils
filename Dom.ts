export const createFragment = function (htmlStr: string): DocumentFragment {
	let frag = document.createDocumentFragment();
	let temp = document.createElement('div');
	temp.innerHTML = htmlStr;
	while (temp.firstChild) {
		frag.appendChild(temp.firstChild);
	}
	return frag;
};

export const download = (name: string, data: BlobPart[]) => {
	if (!data) {
		return;
	}
	// console.log(data);
	let url = window.URL.createObjectURL(new Blob(data));
	let link = document.createElement('a');
	link.style.display = 'none';
	link.href = url;
	link.download = name;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
};

/**
 * !!!  does not work on iOS Safari
 * @params {array} files List of file items
 * @return FileList
 */
export function createFileList(files: File[]): FileList {
	let b = new ClipboardEvent('').clipboardData || new DataTransfer();
	for (let i = 0, len = files.length; i < len; i++) {
		b.items.add(files[i]);
	}
	return b.files;
}
