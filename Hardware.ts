/**
 * startVibrate(1000)   // 振动一次
 * 
 * startVibrate([1000, 200, 1000, 2000, 400])  //震动多次
  
 * @param level 
 */
export function startVibrate(level: VibratePattern) {
	navigator.vibrate?.(level);
}

let vibrateInterval: number;

/**
 * startPeristentVibrate(1000, 1500)  //持续震动
 * @param level
 * @param interval
 */
export function startPeristentVibrate(level: VibratePattern, interval: number) {
	if (!!navigator.vibrate) {
		vibrateInterval = setInterval(function () {
			startVibrate(level);
		}, interval);
	}
}

/**
 * stopVibrate() //停止震动
 */
export function stopVibrate() {
	if (vibrateInterval) clearInterval(vibrateInterval);
	navigator.vibrate?.(0);
}
