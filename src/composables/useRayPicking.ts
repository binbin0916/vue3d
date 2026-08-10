import * as THREE from 'three';
import { shallowRef, type ShallowRef } from 'vue';

/**
 * RayPickingOptions - 射线拾取配置
 */
export interface RayPickingOptions {
	/** 触发拾取的事件类型 */
	event: 'click' | 'mousemove';
	/** 射线拾取的目标对象列表（默认场景所有子对象） */
	targets?: THREE.Object3D[];
	/** 是否拾取多个对象（mousemove 模式默认 true，click 模式默认 false） */
	multi?: boolean;
}

/**
 * RayPickingResult - 射线拾取结果
 */
export interface RayPickingResult {
	/** 拾取到的对象列表 */
	objects: THREE.Object3D[];
	/** 拾取点的世界坐标 */
	point: THREE.Vector3 | null;
	/** 交叉点信息（含面、法线等） */
	intersects: THREE.Intersection[];
}

/**
 * useRayPicking - 射线拾取 Composable
 *
 * @description 封装 Three.js Raycaster 的射线拾取功能，支持点击和鼠标移动两种触发方式。
 * 提供注册/注销机制，可动态启用或禁用拾取。
 *
 * @param {THREE.WebGLRenderer} renderer - Three.js 渲染器
 * @param {THREE.PerspectiveCamera} camera - 透视相机
 * @param {THREE.Scene} scene - Three.js 场景
 * @param {RayPickingOptions} options - 拾取配置
 *
 * @returns {Object} 包含以下属性和方法：
 * - `picked` - 当前拾取结果（ShallowRef<RayPickingResult | null>）
 * - `register()` - 注册拾取事件监听
 * - `unregister()` - 注销拾取事件监听
 * - `isRegistered` - 是否已注册（Ref<boolean>）
 * - `updateTargets(targets)` - 动态更新拾取目标对象
 * - `updateOptions(options)` - 动态更新拾取配置
 *
 * @example
 * ```ts
 * const { picked, register, unregister } = useRayPicking(
 *   renderer.value,
 *   camera.value,
 *   scene.value,
 *   { event: 'click', multi: false }
 * );
 *
 * // 注册拾取
 * register();
 *
 * // 监听拾取结果
 * watch(picked, (result) => {
 *   if (result) {
 *     console.log('拾取到:', result.objects);
 *     console.log('点击位置:', result.point);
 *   }
 * });
 *
 * // 注销拾取
 * unregister();
 * ```
 */
export function useRayPicking(
	renderer: THREE.WebGLRenderer,
	camera: THREE.PerspectiveCamera,
	scene: THREE.Scene,
	options: RayPickingOptions = { event: 'click' }
) {
	const picked = shallowRef<RayPickingResult | null>(null) as ShallowRef<RayPickingResult | null>;
	let isRegistered = false;
	let currentOptions = { ...options };
	let currentTargets: THREE.Object3D[] = options.targets ?? [scene];

	const raycaster = new THREE.Raycaster();

	/**
	 * getMouseNDC - 将鼠标坐标转换为 NDC（归一化设备坐标）
	 *
	 * @param {MouseEvent} e - 鼠标事件
	 * @returns {THREE.Vector2} NDC 坐标（-1 ~ 1）
	 */
	function getMouseNDC(e: MouseEvent): THREE.Vector2 {
		const rect = renderer.domElement.getBoundingClientRect();
		return new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
	}

	/**
	 * performPick - 执行射线拾取
	 *
	 * @param {MouseEvent} e - 鼠标事件
	 */
	function performPick(e: MouseEvent) {
		const ndc = getMouseNDC(e);
		raycaster.setFromCamera(ndc, camera);

		const intersects = raycaster.intersectObjects(currentTargets, true);

		if (currentOptions.multi) {
			// 多对象模式：返回所有交叉对象
			const objects = intersects.map((i) => i.object);
			const point = intersects.length > 0 ? intersects[0]!.point.clone() : null;
			picked.value = { objects, point, intersects };
		} else {
			// 单对象模式：只返回第一个交叉对象
			if (intersects.length > 0) {
				const first = intersects[0]!;
				picked.value = {
					objects: [first.object],
					point: first.point.clone(),
					intersects,
				};
			} else {
				picked.value = null;
			}
		}
	}

	/**
	 * register - 注册拾取事件监听
	 */
	function register() {
		if (isRegistered) return;
		isRegistered = true;
		renderer.domElement.addEventListener(currentOptions.event, performPick);
	}

	/**
	 * unregister - 注销拾取事件监听
	 */
	function unregister() {
		if (!isRegistered) return;
		isRegistered = false;
		renderer.domElement.removeEventListener(currentOptions.event, performPick);
	}

	/**
	 * updateTargets - 动态更新拾取目标对象
	 *
	 * @param {THREE.Object3D[]} targets - 新的拾取目标对象列表
	 */
	function updateTargets(targets: THREE.Object3D[]) {
		currentTargets = targets;
	}

	/**
	 * updateOptions - 动态更新拾取配置
	 *
	 * @description 会先注销旧配置，再用新配置重新注册
	 *
	 * @param {RayPickingOptions} newOptions - 新的拾取配置
	 */
	function updateOptions(newOptions: RayPickingOptions) {
		unregister();
		currentOptions = { ...newOptions };
		currentTargets = newOptions.targets ?? [scene];
		register();
	}

	return {
		/** 当前拾取结果 */
		picked,
		/** 注册拾取事件监听 */
		register,
		/** 注销拾取事件监听 */
		unregister,
		/** 是否已注册 */
		get isRegistered() {
			return isRegistered;
		},
		/** 动态更新拾取目标对象 */
		updateTargets,
		/** 动态更新拾取配置 */
		updateOptions,
	};
}
