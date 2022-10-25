/**
 * startVibrate(1000)   // 振动一次
 * 
 * startVibrate([1000, 200, 1000, 2000, 400])  //震动多次
  
 * @param level 
 */
export function startVibrate(level: VibratePattern) {
	window.navigator.vibrate?.(level);
}

let vibrateInterval: number;

/**
 * startPeristentVibrate(1000, 1500)  //持续震动
 * @param level
 * @param interval
 */
export function startPeristentVibrate(level: VibratePattern, interval: number) {
	if (!!window.navigator.vibrate) {
		vibrateInterval = window.setInterval(function () {
			startVibrate(level);
		}, interval);
	}
}

/**
 * stopVibrate() //停止震动
 */
export function stopVibrate() {
	if (vibrateInterval) window.clearInterval(vibrateInterval);
	window.navigator.vibrate?.(0);
}
