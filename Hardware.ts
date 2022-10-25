/**
 * startVibrate(1000)   // 振动一次
 * 
 * startVibrate([1000, 200, 1000, 2000, 400])  //震动多次
  
 * @param level 
 */
export function startVibrate(level: Iterable<number>) {
	navigator.vibrate(level);
}

let vibrateInterval: number;

/**
 * startPeristentVibrate(1000, 1500)  //持续震动
 * @param level 
 * @param interval 
 */
export function startPeristentVibrate(level: Iterable<number>, interval: number) {
	vibrateInterval = setInterval(function () {
		startVibrate(level);
	}, interval);
}

/**
 * stopVibrate() //停止震动
 */
export function stopVibrate() {
	if (vibrateInterval) clearInterval(vibrateInterval);
	navigator.vibrate(0);
}
