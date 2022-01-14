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

### wechat

```javascript
import {localIdsToFiles} from '@rpdg/revue-utils/Wechat';
wx.chooseImage({
    success: async function (res: any) {
		let localIds = res.localIds as string[];
 		let filePaires = await localIdsToFiles(localIds); 
	},
});
```



### pinyin

```javascript
import py from '@rpdg/revue-utils/Pinyin';
let testStr = '中文';
console.log(py(testStr));
```

