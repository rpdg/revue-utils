## A typescript toy kit library for react.js and vue.js

### install

```bash
npm i -S @rpdg/revue-utils
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

