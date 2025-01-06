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

7. **getImageData**

    Retrieves the pixel data from an HTMLImageElement, optionally scaling the image to a specified size.

    It creates an OffscreenCanvas, draws the image onto it, and then extracts the image data as a Uint8ClampedArray.

    ```ts
    import { getImageData } from '@rpdg/revue-utils/Image';
    let img = document.getElementById('demoImg');
    let data = getImageData(img, 64);
    ```

8. **threshold**

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

    

9. **drawSvgOnCanvas**

    ```typescript
    // Create an SVG element
    const svgNS = "http://www.w3.org/2000/svg"; // Namespace for SVG
    const svgElement = document.createElementNS(svgNS, "svg");
    svgElement.setAttribute("width", "200");
    svgElement.setAttribute("height", "200");
    
    // Create a circle element
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", "100");
    circle.setAttribute("cy", "100");
    circle.setAttribute("r", "80");
    circle.setAttribute("fill", "blue");
    
    // Append the circle to the SVG element
    svgElement.appendChild(circle);
    
    // Append the SVG to the document for reference
    document.getElementById('svg-container').appendChild(svgElement);
    
    // Call the drawSvgOnCanvas function
    const canvas = await drawSvgOnCanvas(svgElement);
    
    // Optionally, append the canvas to the document body
    document.body.appendChild(canvas);
    ```

10. **drawImageOnCanvas**

    ```typescript
    const imageUrl = 'http://example.com/nonexistent.jpg';
    const canvas = await drawImageOnCanvas(imageUrl);
    ```

    



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



### Channel

The Channel<T> class implements a functionality similar to chan[T] in Golang.

```typescript

async function producer(ch: Channel<number>) {
  for (let i = 0; i < 5; i++) {
    console.log(`Producing: ${i}`);
    await ch.send(i);
	console.log(`Produced: ${i}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate production interval
  }
  ch.close(); // Close the channel after production is complete
}

async function consumer(ch: Channel<number>) {
  while (true) {
    const item = await ch.receive();
    if (item === undefined) {
      console.log("Channel closed, stopping consumer.");
      break;
    }
    console.log(`Consuming: ${item}`);
	await new Promise(resolve => setTimeout(resolve, 500)); // Simulate consumption interval
  }
}

// Set the channel capacity to 2
const ch = new Channel<number>(2); 

// Start the producer and consumer
producer(ch);
consumer(ch);
```

#### select

The select function simulates the multiplexing feature of select in Golang.

```typescript
async function producer(ch1: Channel<number>, ch2: Channel<number>) {
  for (let i = 0; i < 3; i++) {
    console.log(`Producer producing: ${i}`);
    await ch1.send(i);
    await ch2.send(i);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  ch1.close();
  ch2.close();
}

async function consumer(ch1: Channel<number>, ch2: Channel<number>) {
  while (true) {
    const result = await select([ch1, ch2]); // multiplexing

    if (result.value === undefined) {
      console.log("Channel closed, stopping consumer.");
      break;
    }

    console.log(`Received from channel: ${result.value}`);
  }
}

const ch1 = new Channel<number>(1);
const ch2 = new Channel<number>(1);

producer(ch1, 1);
producer(ch2, 2);

consumer(ch1, ch2);
```





## Thanks

[![](https://resources.jetbrains.com/storage/products/company/brand/logos/WebStorm.png)](https://jb.gg/OpenSourceSupport)

