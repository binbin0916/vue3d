/**
 * 数字滚动动画
 * @param duration 动画持续时间(ms)
 * @param from 起始数值
 * @param to 目标数值
 * @param callback 每帧回调 (当前值, 初始起始值) => void
 * @param fixed 保留小数位数，默认不处理
 * @returns 停止动画函数
 */
export const animationCount = (
	duration: number,
	from: number,
	to: number,
	callback: (_current: number, _originFrom: number) => void,
	fixed?: number
): (() => void) => {
	const diff = to - from;
	const speed = diff / duration;
	const startTime = performance.now();
	let rafId: number;

	const run = () => {
		const time = performance.now() - startTime;

		// 动画结束，直接赋值目标值
		if (time >= duration) {
			let finalVal = to;
			if (fixed !== undefined) finalVal = Number(finalVal.toFixed(fixed));
			callback(finalVal, from);
			return;
		}

		// 计算当前帧数值
		let current = from + speed * time;
		if (fixed !== undefined) current = Number(current.toFixed(fixed));

		// 回调携带第二个参数：原始起始值 from
		callback(current, from);

		rafId = requestAnimationFrame(run);
	};

	// 启动动画
	rafId = requestAnimationFrame(run);

	// 返回取消函数，外部可手动终止动画
	return () => cancelAnimationFrame(rafId);
};
