## A typescript toy kit library for react.js and vue.js

[![NPM Version](https://img.shields.io/npm/v/@rpdg/revue-utils.svg)](https://npmjs.org/package/@rpdg/revue-utils) [![NPM Downloads](http://img.shields.io/npm/dm/@rpdg/revue-utils.svg)](https://npmjs.org/package/@rpdg/revue-utils)


This is a tool library written in TypeScript that mainly provides encapsulation of a series of commonly used methods, including graphic processing, WeChat functions, file handling, string processing, etc.

### install

```bash
npm i -S @rpdg/revue-utils
```

### vue/useEventListener

Attaching an event when the component is mounted and activated, then removing the event when the component is unmounted and deactivated.

```javascript
import { ref } from 'vue';
import { useEventListener, useClickAway } from '@rpdg/revue-utils/vue/use';

export default {
	setup() {
		const root = ref();
		useClickAway(root, () => {
			console.log('click outside!');
		});

		// attach the resize event to window
		useEventListener('resize', () => {
			console.log('window resize');
		});

		// attach the click event to the body element
		useEventListener(
			'click',
			() => {
				console.log('click body');
			},
			{ target: document.body }
		);
	},
};
```

### wechat utils

1. convert wechat local image ids to image files

```javascript
import {localIdsToFiles} from '@rpdg/revue-utils/Wechat';
wx.chooseImage({
    success: async function (res: any) {
		let localIds = res.localIds as string[];
 		let filePaires = await localIdsToFiles(localIds);
	},
});
```

2. initial wechat js sdk

```javascript
import { readyAsync } from '@rpdg/revue-utils/Wechat';
async function init() {
	await readyAsync(cfg);
}
```

3. wechat share

```javascript
import { shareAsync } from '@rpdg/revue-utils/Wechat';
async function init() {
	await shareAsync(['timeline', 'appMessage'], options);
}
```

4. wechat pay

    ```js
    import { payAsync } from '@rpdg/revue-utils/Wechat';
    // ...
    await payAsync(options);
    ```




### Image utils

1. checkExists

    ```js
    import { checkExists } from '@rpdg/revue-utils/Image';
    await checkExists('https://www.google.com/images/branding/googlelogo_92x30dp.png');
    ```

2. imgCompress

    ```typescript
    import { imgCompress } from '@rpdg/revue-utils/Image';
    await imgCompress(srcBase64, 1280, 0.9); //
    ```

3. checkImageSize

    ```typescript
    import { checkImageSize } from '@rpdg/revue-utils/Image';
    let {width, height} = await checkImageSize('https://gitee.com/static/images/logo.png');
    ```

4. fileToBase64

    ```typescript
    import { fileToBase64 } from '@rpdg/revue-utils/Image';
    await fileToBase64(imgFile);
    ```

5. canvasToImage

    ```typescript
    import { canvasToImage } from '@rpdg/revue-utils/Image';
    canvasToImage(canvasElem , imgElem);    
    ```

6. downloadImage

    ```typescript
    import { downloadImage } from '@rpdg/revue-utils/Image';
    await downloadImage(imgElem , 'img1.jpg');
    ```

7. getImageData
    ```ts
    import { getImageData } from '@rpdg/revue-utils/Image';
    let img = document.getElementById('demoImg');
    let data = getImageData(img, 64);
    ```

8. threshold
    ```ts
    import {threshold, drawImageData} from '@rpdg/revue-utils/Image';
    const scaledSize = 64;
    let img = document.getElementById('demoImg');
    let data = getImageData(img, scaledSize);
    data = threshold(data, 180);
    
    let w = img.naturalWidth, h = img.naturalHeight;
    if (w > h) {
    	h = scaledSize;
    	w = Math.round(img.naturalWidth * (h / img.naturalHeight));
    } else {
    	w = scaledSize;
    	h = Math.round(img.naturalHeight * (w / img.naturalWidth));
    }
    
    drawImageData(data, w, h);
    ```

    

9. 



### File

```typescript
import {getFileName, getFileExt, normalizeSuffix} from '@rpdg/revue-utils/File';
let fileFullName = 'abcd.test.jpg';
getFileName(fileFullName); // 'abcd.test'
getFileExt(fileFullName); // 'JPG'
normalizeSuffix('.Docx'); // 'DOCX'
```



### DOM

```typescript
import {createFragment, download, getStyle} from '@rpdg/revue-utils/Dom';
createFragment(`<div>abc</div><p>def</p>`);
download('file.txt' , ['some text', '\n', 'next text']);
getStyle(document.body, 'font-size')
```



### JsonStorage

```js
import JsonStorage from '@rpdg/revue-utils/JsonStorage';
type Book = {
	title: string,
	isbn: string,
};

let book: Book = {
	title: 'Publish News Letter',
	isbn: '978-93-8067-432-2',
};

JsonStorage.set('book', book);

let book2 = JsonStorage.get < Book > 'book'; // typed Book object
```



### String

```js
import { padLeft, padRight } from '@rpdg/revue-utils/String';

padLeft('A', 4); // '000A'
padRight('A', 4); // 'A000'
```



### Math2

fix the error of js floating point operation

```js
import * as Math2 from '@rpdg/revue-utils/Math';

0.1+0.2; // 0.30000000000000004
Math2.add(0.1 , 0.2); // 0.3

0.15/0.2; // 0.7499999999999999
Math2.div(0.15, 0.2); // 0.75

Math2.format(1234.5678, 2); // return: 1234.57

// Median
Math2.median([23, 29, 20, 32, 23, 21, 33, 25]); // 20

// Standard Deviation
Math2.stdEVP([0,5,9,14]); // 5.1478150704935
Math2.stdEVP([5,6,8,9]); // 1.5811388300841898

// percents
Math2.percent(2 , 10); // 20.0% 
Math2.percent(2 , 10 , 2); // 20.00% 
Math2.percent(2 , 10 , 0); // 20% 
Math2.percent(2 , 0); // --% 

// fixed point
(859.385).toFixed(2); // '859.38' <- not rounding
Math2.toFixed(859.385, 2); // 859.39 <- round
```



### DateTime

```js
import DateTime from '@rpdg/revue-utils/DateTime';
DateTime.addDays(new Date(), 7); // add 7 days
DateTime.format(new Date(), 'yyyy/MM/dd HH:mm'); // 2022/02/28 10:04
```



### Array

```typescript
import { litterN, sortOnProp, shuffle} from '@rpdg/revue-utils/Array';

litterN(50, 100); // [50, 51, 52, ... 99, 100];

let arr = [
	{ age: 5, name: 'Tom' },
	{ age: 2, name: 'Jerry' },
	{ age: 3, name: 'Whoever' },
];
sortOnProp(arr, 'age'); // [{age: 2 , name:'Jerry'}, { age: 3, name: 'Whoever' }, {age:5 , name: 'Tom'}]

shuffle(arr);
```



### Url 

```typescript
import { request , url } from '@rpdg/revue-utils/Url';

// page url : some.html?id=a01&name=tom
console.log(reuqest['id']); // a01
console.log(request['name']); // tom

url.setParam("some.html?id=a01&name=tom", {name:'Bob'} ); // some.html?id=a01&name=Bob
url.getParam("some.html?id=a01&name=tom" , "id"); // a01
```



### Validates

```typescript
import { is } from '@rpdg/revue-utils/Validates';
is.Array([1,2,3]); // true
is.Date(new Date); // true
is.Number("123"); // false
is.String("123"); // true
```



### Hardware

```typescript
import { startVibrate , startPeristentVibrate , stopVibrate } from '@rpdg/revue-utils/Hardware';
startVibrate(1000)   // 振动一次
startVibrate([1000, 200, 1000, 2000, 400])  //震动多次
startPeristentVibrate(1000, 1500)  //持续震动
stopVibrate() //停止震动
```





## Thanks

[![](https://resources.jetbrains.com/storage/products/company/brand/logos/WebStorm.png)](https://jb.gg/OpenSourceSupport)

