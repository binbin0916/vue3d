import * as THREE from 'three';
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

/**
 * 优化的createTextTexture函数
 * 确保生成的Canvas纹理比例完美适配正方形Mesh，且文字加粗清晰、无拉伸。
 *
 * @param text 文字内容（如 "前"、"后" 等）
 * @param rotation 旋转弧度（由 cubeTextConfigs 提供）
 * @returns THREE.CanvasTexture
 */
export const createTextTexture = (text: string, rotation: number = 0): THREE.CanvasTexture => {
	const size = 512; // 512对于指示器足够清晰且性能更好
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d')!;

	// 1. 绘制背景色
	ctx.fillStyle = '#e1e6ed';
	ctx.fillRect(0, 0, size, size);

	// 2. 绘制文字 - 使用基础字体确保立即显示
	// 增加多种备选字体，确保加粗效果
	ctx.fillStyle = '#2b303b';
	ctx.font = 'bold 300px Arial, sans-serif';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	// 3. 核心修复：先保存状态，平移旋转，再绘制
	ctx.save();
	ctx.translate(size / 2, size / 2);
	// 注意：Canvas 旋转是顺时针，而 Three.js 纹理旋转是逆时针
	// 我们直接在 Canvas 层级处理旋转，或者在纹理层级处理。
	// 这里选择在纹理层级处理旋转更灵活，所以 Canvas 内部保持正向。
	ctx.fillText(text, 0, 0);
	ctx.restore();

	const texture = new THREE.CanvasTexture(canvas);

	// 4. 纹理层级处理旋转
	texture.center.set(0.5, 0.5);
	texture.rotation = rotation;

	// 5. 确保渲染器能识别到更新
	texture.needsUpdate = true;

	// 6. 颜色空间设置 (针对新版 Three.js)
	if ('colorSpace' in texture) {
		(texture as any).colorSpace = THREE.SRGBColorSpace;
	}

	return texture;
};
