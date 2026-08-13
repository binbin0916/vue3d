import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

interface TextOptions {
	size?: number; // 文字大小，默认 0.35
	height?: number; // 厚度，默认 0.02
	color?: string | number; // 颜色，默认 '#2b303b'
	fontPath?: string; // 字体 JSON 路径
}
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

export const createTextTexture = (text: string, rotation: number) => {
	const size = 512;
	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d')!;

	// 填充背景色 (#e1e6ed)
	ctx.fillStyle = '#e1e6ed';
	ctx.fillRect(0, 0, size, size);

	// 绘制加粗文字
	ctx.fillStyle = '#2b303b';
	// 使用 900 权重确保最粗，并提供多个后备字体
	ctx.font = '900 320px "Microsoft YaHei", "PingFang SC", "SimHei", Arial, sans-serif';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	// 确保在 Canvas 准备好后绘制
	ctx.fillText(text, size / 2, size / 2);

	const texture = new THREE.CanvasTexture(canvas);
	texture.center.set(0.5, 0.5);
	texture.rotation = rotation;

	// 适配现代 Three.js 的颜色空间设置
	if ('colorSpace' in texture) {
		(texture as any).colorSpace = THREE.SRGBColorSpace;
	} else if ('encoding' in texture) {
		(texture as any).encoding = (THREE as any).sRGBEncoding;
	}

	texture.needsUpdate = true;

	return texture;
};
