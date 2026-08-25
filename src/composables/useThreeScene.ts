import { ref, shallowRef } from 'vue';
import * as THREE from 'three';
import type { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import type { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { createRenderer, createScene, createCamera, addLights, loadModel, createControls, createCSS2DRenderer } from '@/three';
import type { LoadProgress } from '@/three';
import { useViewCube } from './useViewCube';
import { cubeRotateConfigs } from '@/utils/view';

const MODEL_PATH = '/model/get/';

/**
 * useThreeScene - 3D 场景核心 Composable
 *
 * @description 封装 Three.js 场景的完整生命周期管理，包括：
 * - 渲染器、场景、相机、控制器的创建和配置
 * - GLB 模型的异步加载（带进度回调）
 * - 渲染循环和窗口响应
 * - 移动模式（拖拽平移）
 * - 视角旋转动画
 *
 * @returns {Object} 包含以下属性和方法：
 * - `init(container, code)` - 初始化场景
 * - `dispose()` - 销毁场景，释放资源
 * - `loading` - 加载状态
 * - `loadProgress` - 加载进度
 * - `renderer` / `scene` / `camera` / `modelGroup` / `controls` - 场景核心对象
 * - `modelSize` - 模型包围盒最大边长
 * - `isMoveMode` / `moveSpeed` - 移动模式状态
 * - `setMoveMode(enabled)` - 切换移动模式
 * - `setMoveSpeed(speed)` - 设置移动速度
 * - `rotateToView(targetPosition, targetUp, duration)` - 旋转相机到指定视角
 */
export function useThreeScene() {
	const renderer = shallowRef<THREE.WebGLRenderer>({} as THREE.WebGLRenderer);
	const css2dRenderer = shallowRef<CSS2DRenderer>({} as CSS2DRenderer);
	const scene = shallowRef<THREE.Scene>({} as THREE.Scene);
	const camera = shallowRef<THREE.PerspectiveCamera>({} as THREE.PerspectiveCamera);
	const modelGroup = shallowRef<THREE.Object3D>({} as THREE.Object3D);
	const controls = shallowRef<TrackballControls>({} as TrackballControls);
	const axes = shallowRef<THREE.AxesHelper>({} as THREE.AxesHelper);
	const autoRotate = ref(false);

	const loading = ref(true);
	const loadProgress = ref<LoadProgress>({ loaded: 0, total: 0, percent: 0 });
	const modelSize = ref(0);

	// 移动模式状态
	const isMoveMode = ref(false);
	const moveSpeed = ref(1);
	let isDragging = false;
	let previousMousePosition = { x: 0, y: 0 };
	let containerElement: HTMLElement | null = null;
	let rafId = 0;

	// ---- ViewCube（独立渲染器 + DOM） ----
	let cubeResult: ReturnType<typeof useViewCube> | null = null;

	/**
	 * render - 执行单帧渲染
	 *
	 * @description 清除缓冲区并使用当前相机渲染整个场景
	 */
	const render = () => {
		renderer.value.clear();
		renderer.value.setViewport(0, 0, window.innerWidth, window.innerHeight);
		renderer.value.render(scene.value, camera.value);

		css2dRenderer.value.render(scene.value, camera.value);

		// ViewCube 独立渲染
		if (cubeResult) {
			cubeResult.cubeRenderer.render(cubeResult.cubeScene, cubeResult.cubeCamera);
		}
	};

	// 旋转四元数
	const cameraWorldQuat = new THREE.Quaternion();
	const modelWorldQuat = new THREE.Quaternion();

	const clock = new THREE.Timer();
	/**
	 * animate - 渲染循环（每帧执行）
	 *
	 * @description 通过 requestAnimationFrame 递归调用，持续渲染场景。
	 * 在非移动模式下同步更新控制器状态
	 */
	const animate = () => {
		rafId = requestAnimationFrame(animate);

		controls.value.update();

		// 同步 ViewCube 旋转（跟随模型）
		if (cubeResult) {
			camera.value.getWorldQuaternion(cameraWorldQuat);
			modelGroup.value.getWorldQuaternion(modelWorldQuat);

			cubeResult.cubeGroup.quaternion.copy(cameraWorldQuat).invert().multiply(modelWorldQuat);
		}
		if (autoRotate.value) {
			modelGroup.value.rotateZ((Math.PI / 2) * clock.getDelta());
		}

		clock.update();
		render();
	};

	/**
	 * onResize - 窗口缩放响应
	 *
	 * @description 更新相机宽高比和渲染器尺寸，重新渲染以适应新的窗口大小
	 */
	const onResize = () => {
		camera.value.aspect = window.innerWidth / window.innerHeight;
		camera.value.updateProjectionMatrix();

		render();
		renderer.value.setSize(window.innerWidth, window.innerHeight);
		css2dRenderer.value.setSize(window.innerWidth, window.innerHeight);
	};

	/**
	 * onMouseDown - 鼠标按下事件处理
	 *
	 * @description 移动模式下记录鼠标按下位置，作为拖拽起点
	 *
	 * @param {MouseEvent} e - 原始鼠标事件
	 */
	const onMouseDown = (e: MouseEvent) => {
		if (!isMoveMode.value || e.button !== 0) return;
		isDragging = true;
		previousMousePosition = { x: e.clientX, y: e.clientY };
	};

	/**
	 * onMouseMove - 鼠标移动事件处理
	 *
	 * @description 移动模式下根据鼠标偏移量计算 3D 空间中的平移向量，
	 * 沿相机的右方向和上方向移动模型组（modelGroup）
	 *
	 * @param {MouseEvent} e - 原始鼠标事件
	 */
	const onMouseMove = (e: MouseEvent) => {
		if (!isDragging || !isMoveMode.value || !modelGroup.value) return;

		const deltaX = e.clientX - previousMousePosition.x;
		const deltaY = e.clientY - previousMousePosition.y;

		const cameraDistance = camera.value.position.length();

		const viewDirection = new THREE.Vector3();
		camera.value.getWorldDirection(viewDirection);

		const right = new THREE.Vector3();
		right.crossVectors(viewDirection, camera.value.up).normalize();

		const up = new THREE.Vector3();
		up.copy(camera.value.up).normalize();

		const panFactor = cameraDistance * moveSpeed.value * 0.0004;

		modelGroup.value.position.add(right.multiplyScalar(-deltaX * panFactor));
		modelGroup.value.position.add(up.multiplyScalar(deltaY * panFactor));

		previousMousePosition = { x: e.clientX, y: e.clientY };
	};

	/**
	 * onMouseUp - 鼠标释放事件处理
	 *
	 * @description 重置拖拽状态
	 */
	const onMouseUp = () => {
		isDragging = false;
	};

	/**
	 * setMoveMode - 切换移动模式
	 *
	 * @description 启用时禁用 TrackballControls 并注册鼠标事件监听器以支持拖拽平移；
	 * 禁用时重新启用控制器并重置视角，同时移除鼠标事件监听
	 *
	 * @param {boolean} enabled - 是否启用移动模式
	 */
	const setMoveMode = (enabled: boolean) => {
		isMoveMode.value = enabled;

		if (enabled) {
			// 进入移动模式：禁用控制器
			if (controls.value) {
				controls.value.enabled = false;
			}
		} else {
			// 退出移动模式：启用控制器并重置状态
			if (controls.value) {
				controls.value.enabled = true;
				controls.value.reset();
			}
		}

		if (containerElement) {
			containerElement.removeEventListener('mousedown', onMouseDown);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);

			if (enabled) {
				containerElement.addEventListener('mousedown', onMouseDown);
				window.addEventListener('mousemove', onMouseMove);
				window.addEventListener('mouseup', onMouseUp);
			}
		}
	};

	/**
	 * setMoveSpeed - 设置移动速度
	 *
	 * @description 控制鼠标拖拽平移时的灵敏度，值越大移动越快
	 *
	 * @param {number} speed - 移动速度倍率（建议范围 0.1-10，默认 1）
	 */
	const setMoveSpeed = (speed: number) => {
		moveSpeed.value = speed;
	};

	// ---- 面点击旋转动画 ----
	let animationRafId = 0;

	/**
	 * handleFaceClick - 处理 ViewCube 面点击事件
	 *
	 * @description 根据 mesh name 匹配 cubeRotateConfigs，平滑过渡模型到目标旋转角度
	 */
	const handleFaceClick = (meshName: string) => {
		const config = cubeRotateConfigs[meshName];
		if (!config || !modelGroup.value || !camera.value) return;

		// Cube 配置表示期望的“相机空间 / 屏幕空间”姿态
		const targetViewQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(config[0] ?? 0, config[1] ?? 0, config[2] ?? 0, 'XYZ'));

		// 当前相机世界旋转
		const cameraWorldQuat = new THREE.Quaternion();
		camera.value.getWorldQuaternion(cameraWorldQuat);

		// modelGroup 的父节点世界旋转；当前为 scene 时通常是单位四元数，保留是为兼容层级变换
		const parentWorldQuat = new THREE.Quaternion();
		modelGroup.value.parent?.getWorldQuaternion(parentWorldQuat);

		// 使 inverse(cameraQ) * targetModelWorldQ = targetViewQuat
		const targetModelWorldQuat = cameraWorldQuat.clone().multiply(targetViewQuat);

		// 将世界空间的目标旋转转换为 modelGroup 的局部旋转
		const targetModelLocalQuat = parentWorldQuat.invert().multiply(targetModelWorldQuat);

		const startQuat = modelGroup.value.quaternion.clone();

		// 固定时长
		// const duration = 500;

		// 恒定角速度
		const angle = startQuat.angleTo(targetModelLocalQuat);
		const angularSpeed = Math.PI / 2; // 每秒 90°
		const duration = Math.max(150, Math.min(1200, (angle / angularSpeed) * 1000));
		const startTime = performance.now();

		if (animationRafId) cancelAnimationFrame(animationRafId);

		const animateRotation = () => {
			const elapsed = performance.now() - startTime;
			const t = Math.min(elapsed / duration, 1);
			const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

			modelGroup.value.quaternion.slerpQuaternions(startQuat, targetModelLocalQuat, ease);

			if (t < 1) {
				animationRafId = requestAnimationFrame(animateRotation);
			}
		};

		animationRafId = requestAnimationFrame(animateRotation);
	};

	// 切换旋转状态
	const toggleAutoRotate = () => {
		autoRotate.value = !autoRotate.value;
	};
	// 切换旋转状态
	const setAutoRotate = (enabled: boolean) => {
		autoRotate.value = enabled;
	};

	// 切换坐标系显示
	const setAxesVisibe = (enabled: boolean) => {
		if (enabled) {
			(axes.value.material as any).opacity = 1;
		} else {
			(axes.value.material as any).opacity = 0;
		}
	};

	/**
	 * init - 初始化 3D 场景
	 *
	 * @description 完整的场景初始化流程：
	 * 1. 创建渲染器、场景、灯光
	 * 2. 异步加载 GLB 模型（带进度回调）
	 * 3. 创建相机和控制器
	 * 4. 启动渲染循环
	 * 5. 等待最少 1s 展示加载动画后隐藏 loading
	 *
	 * @param {HTMLElement} container - 渲染器 canvas 要挂载的 DOM 容器
	 * @param {string} code - 业务编码（暂未使用，保留扩展）
	 */
	const init = async (container: HTMLElement, code: string) => {
		const path = `${MODEL_PATH}${code}.glb`;
		const MIN_DISPLAY_TIME = 1000; // 最小loading时长

		containerElement = container;
		loading.value = true;

		try {
			renderer.value = createRenderer(container);
			css2dRenderer.value = createCSS2DRenderer(container);
			scene.value = createScene();

			const startTime = performance.now();

			const result = await loadModel(path, (p) => {
				loadProgress.value = p;
			});

			modelGroup.value = result.group;
			modelSize.value = result.modelSize;
			axes.value = result.axes;
			scene.value.add(modelGroup.value);

			camera.value = createCamera(result.modelSize, modelGroup.value.position);
			addLights(scene.value, result.modelSize);
			controls.value = createControls(camera.value, renderer.value.domElement, result.modelSize);

			// ViewCube（独立渲染器 + DOM 容器）
			cubeResult = useViewCube(container, handleFaceClick);

			animate();
			window.addEventListener('resize', onResize);

			const elapsed = performance.now() - startTime;
			const remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);
			await new Promise((resolve) => setTimeout(resolve, remaining));
		} catch (err) {
			console.error('useThreeScene init failed:', err);
		} finally {
			loading.value = false;
		}
	};

	/**
	 * dispose - 销毁 3D 场景
	 *
	 * @description 移除窗口 resize 监听、鼠标事件监听，释放渲染器资源。
	 * 应在组件 onUnmounted 时调用以防止内存泄漏
	 */
	const dispose = () => {
		cancelAnimationFrame(rafId);
		window.removeEventListener('resize', onResize);
		containerElement?.removeEventListener('mousedown', onMouseDown);
		window.removeEventListener('mousemove', onMouseMove);
		window.removeEventListener('mouseup', onMouseUp);
		renderer.value.dispose();
		cubeResult?.dispose();
	};

	/**
	 * rotateToView - 旋转相机到指定视角（公共方法）
	 *
	 * @description 在球面空间插值，保持相机到原点的距离恒定
	 *
	 * @param {THREE.Vector3} targetPosition - 目标位置方向
	 * @param {THREE.Vector3} targetUp - 目标上方向
	 * @param {number} duration - 动画时长（毫秒）
	 */
	const rotateToView = (targetPosition: THREE.Vector3, targetUp: THREE.Vector3, duration = 500) => {
		if (!camera.value) return;

		// 保持初始距离不变
		const initialDistance = camera.value.position.length();

		// 计算起始和目标方向（归一化）
		const startDirection = camera.value.position.clone().normalize();
		const targetDirection = targetPosition.clone().normalize();

		// 使用四元数球面插值（slerp）处理任意角度，包括180度
		const startQuat = new THREE.Quaternion().setFromUnitVectors(
			new THREE.Vector3(0, 0, 1), // 参考方向
			startDirection
		);
		const targetQuat = new THREE.Quaternion().setFromUnitVectors(
			new THREE.Vector3(0, 0, 1), // 参考方向
			targetDirection
		);

		const startUp = camera.value.up.clone();
		const startTime = performance.now();

		function animateCamera() {
			const elapsed = performance.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic

			// 使用四元数slerp进行球面插值
			const currentQuat = new THREE.Quaternion();
			currentQuat.slerpQuaternions(startQuat, targetQuat, eased);

			// 将四元数转换回方向向量
			const currentDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(currentQuat);
			camera.value!.position.copy(currentDirection.multiplyScalar(initialDistance));

			camera.value!.up.lerpVectors(startUp, targetUp, eased).normalize();
			camera.value!.lookAt(0, 0, 0);
			controls.value.update();

			if (progress < 1) {
				requestAnimationFrame(animateCamera);
			}
		}

		animateCamera();
	};

	return {
		init,
		dispose,
		loading,
		loadProgress,
		renderer,
		scene,
		camera,
		modelGroup,
		controls,
		modelSize,
		isMoveMode,
		moveSpeed,
		autoRotate,
		setMoveMode,
		setMoveSpeed,
		rotateToView,
		toggleAutoRotate,
		setAutoRotate,
		handleFaceClick,
		setAxesVisibe,
	};
}
