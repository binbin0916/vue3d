import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
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

/**
 * getBoundingBoxPoints - 获取包围盒的 8 个角点和 12 条边
 *
 * @param box - Three.js 包围盒
 * @returns vertices: 8 个角点, edges: 12 条边的顶点索引对
 */
export function getBoundingBoxPoints(box: THREE.Box3): {
	vertices: THREE.Vector3[];
	edges: [number, number][];
} {
	const { min, max } = box;

	// 8 个角点（按 XYZ 符号组合排列）
	const vertices = [
		new THREE.Vector3(min.x, min.y, min.z), // 0: ---
		new THREE.Vector3(max.x, min.y, min.z), // 1: +--
		new THREE.Vector3(max.x, max.y, min.z), // 2: ++-
		new THREE.Vector3(min.x, max.y, min.z), // 3: -+-
		new THREE.Vector3(min.x, min.y, max.z), // 4: --+
		new THREE.Vector3(max.x, min.y, max.z), // 5: +-+
		new THREE.Vector3(max.x, max.y, max.z), // 6: +++
		new THREE.Vector3(min.x, max.y, max.z), // 7: -++
	];

	// 12 条边（每条边由两个顶点索引定义）
	const edges: [number, number][] = [
		// 底面 (z = min.z)
		[0, 1],
		[1, 2],
		[2, 3],
		[3, 0],
		// 顶面 (z = max.z)
		[4, 5],
		[5, 6],
		[6, 7],
		[7, 4],
		// 竖棱 (连接底面和顶面)
		[0, 4],
		[1, 5],
		[2, 6],
		[3, 7],
	];

	return { vertices, edges };
}

/**
 * createLine2FromVertices - 从顶点和边创建 Line2 线框
 *
 * @param vertices - 顶点数组
 * @param edges - 边的索引对数组（默认为立方体 12 条边）
 * @param options - 线条样式选项
 */
export function createLine2FromVertices(
	vertices: THREE.Vector3[],
	edges: [number, number][],
	options: {
		color?: THREE.ColorRepresentation;
		lineWidth?: number;
		dashed?: boolean;
		dashSize?: number;
		gapSize?: number;
		opacity?: number;
	} = {}
): LineSegments2 {
	const { color = 0x00ff00, lineWidth = 3, dashed = false, dashSize = 0.1, gapSize = 0.05, opacity = 1.0 } = options;

	// 从 vertices + edges 提取位置数据
	const positions: number[] = [];
	for (const [i, j] of edges) {
		const vi = vertices[i];
		const vj = vertices[j];
		if (vi && vj) {
			positions.push(vi.x, vi.y, vi.z);
			positions.push(vj.x, vj.y, vj.z);
		}
	}

	const geometry = new LineSegmentsGeometry();
	geometry.setPositions(positions);

	const material = new LineMaterial({
		color,
		linewidth: lineWidth,
		resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
		dashed,
		dashSize,
		gapSize,
		transparent: opacity < 1,
		opacity,
	});

	const line = new LineSegments2(geometry, material);
	line.computeLineDistances();

	return line;
}

/**
 * 归一化模型：让所有模型在场景中大小一致，且在相机中占相同比例
 *
 * @param {THREE.Object3D} model      - 要归一化的模型
 * @param {THREE.Camera}   camera     - 场景相机
 * @param {Object}         options    - 可选配置
 * @param {number}         options.fillRatio   - 模型占视口的比例 (0~1)，默认 0.8
 * @param {number}         options.distance    - 相机到模型的距离，默认 2
 * @param {boolean}        options.center      - 是否居中到原点，默认 true
 * @param {THREE.Vector3}  options.pivot       - 归一化后模型中心放置的位置，默认 (0,0,0)
 * @returns {Object} { scale, size, center, distance } 归一化信息
 */
export const normalizeModel = (
	model: THREE.Object3D,
	camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
	options = {
		fillRatio: 0.8,
		distance: 2,
		center: true,
		pivot: new THREE.Vector3(0, 0, 0),
	}
) => {
	const { fillRatio, distance, center, pivot } = options;

	model.updateMatrixWorld(true);
	const box = new THREE.Box3().setFromObject(model);
	const size = new THREE.Vector3();
	const centerVec = new THREE.Vector3();
	box.getSize(size);
	box.getCenter(centerVec);

	const rawMaxSize = Math.max(size.x, size.y, size.z);
	if (rawMaxSize === 0) {
		console.warn('[normalizeModel] 模型尺寸为 0，跳过归一化');
		return null;
	}

	let visibleHeight, visibleWidth;

	if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
		const _camera = camera as THREE.PerspectiveCamera;
		const fov = (_camera.fov * Math.PI) / 180;
		visibleHeight = 2 * Math.tan(fov / 2) * distance;
		visibleWidth = visibleHeight * _camera.aspect;
	} else if ((camera as THREE.OrthographicCamera).isOrthographicCamera) {
		const _camera = camera as THREE.OrthographicCamera;
		visibleHeight = (_camera.top - _camera.bottom) / camera.zoom;
		visibleWidth = (_camera.right - _camera.left) / camera.zoom;
	} else {
		console.warn('[normalizeModel] 未知相机类型，使用默认可视范围');
		visibleHeight = 2;
		visibleWidth = 2;
	}

	const fitSize = Math.min(visibleHeight, visibleWidth) * fillRatio;
	const scale = fitSize / rawMaxSize;
	model.scale.setScalar(scale);

	if (center) {
		model.position.set(pivot.x - centerVec.x * scale, pivot.y - centerVec.y * scale, pivot.z - centerVec.z * scale);
	}

	// camera.position.set(0, 0, distance);
	// camera.lookAt(pivot);
	// camera.updateProjectionMatrix();

	return {
		scale,
		originalSize: size.clone(),
		originalCenter: centerVec.clone(),
		rawMaxSize,
		fitSize,
		distance,
		visibleHeight,
		visibleWidth,
	};
};

/**
 *
 */
