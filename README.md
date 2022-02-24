## A typescript toy kit library for react.js and vue.js

### install

```bash
npm i -S @rpdg/revue-utils
```

### vue/useEventListener
Attaching an event when the component is mounted and activated, then removing the event when the component is unmounted and deactivated.

```javascript
import { ref } from 'vue';
import { useEventListener , useClickAway } from '@rpdg/revue-utils/vue/use';

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
import {readyAsync} from '@rpdg/revue-utils/Wechat';
async function init(){
  await readyAsync(cfg);
}
```

3. wechat share
```javascript
import {shareAsync} from '@rpdg/revue-utils/Wechat';
async function init(){
  await shareAsync(['timeline', 'appMessage'], options);
}
```

4. wechat pay

	```js
	import {payAsync} from '@rpdg/revue-utils/Wechat';
	// ...
	await payAsync(options);
	```

### Chinese pinyin

```javascript
import py from '@rpdg/revue-utils/Pinyin';
let testStr = '中文';
console.log(py(testStr)); // output: zhongwen
```

### Image utils

1. checkExists 

	```js
	import {checkExists} from '@rpdg/revue-utils/Image';
	await checkExists('https://www.google.com/images/branding/googlelogo_92x30dp.png');
	```

2. imgCompress

	```js
	import {imgCompress} from '@rpdg/revue-utils/Image';
	await imgCompress(srcBase64 , 1280 , 0.9);
	```

	
