import * as THREE from 'three';
import { shallowRef, ref } from 'vue';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { createRenderer, createScene, createCamera, addLights, loadModel, createControls } from '@/three';
import type { LoadProgress } from '@/three';
// import { useViewCube } from './useViewCube';

import { ViewCube } from '@/utils/cube';
import type { ViewCube as TypeViewCube } from '@/utils/cube';

const MODEL_PATH = '/model/get/';

/**
 * useThreeScene - 3D 场景管理 Composable
 *
 * @description 封装 Three.js 渲染器、场景、相机、灯光、模型加载、控制器的完整生命周期。
 * 返回响应式状态和操作函数，供 Vue 组件消费。内部管理：
 * - 渲染循环（requestAnimationFrame）
 * - 窗口缩放自适应
 * - 移动模式（鼠标拖拽平移模型）
 *
 * @returns {Object} 包含以下属性和方法：
 * - `init(container, code)` - 初始化 3D 场景并加载模型
 * - `dispose()` - 销毁场景，释放资源和事件监听
 * - `loading` - 是否正在加载（Ref<boolean>）
 * - `loadProgress` - 加载进度（Ref<LoadProgress>）
 * - `renderer` - Three.js 渲染器（ShallowRef<WebGLRenderer>）
 * - `scene` - Three.js 场景（ShallowRef<Scene>）
 * - `camera` - Three.js 相机（ShallowRef<PerspectiveCamera>）
 * - `modelGroup` - 模型根组（ShallowRef<Object3D>）
 * - `controls` - 轨道控制器（ShallowRef<TrackballControls>）
 * - `modelSize` - 模型包围盒尺寸（Ref<number>）
 * - `isMoveMode` - 是否处于移动模式（Ref<boolean>）
 * - `moveSpeed` - 移动速度倍率（Ref<number>）
 * - `setMoveMode(enabled)` - 切换移动模式
 * - `setMoveSpeed(speed)` - 设置移动速度
 */
export function useThreeScene() {
	const renderer = shallowRef<THREE.WebGLRenderer>({} as THREE.WebGLRenderer);
	const scene = shallowRef<THREE.Scene>({} as THREE.Scene);
	const camera = shallowRef<THREE.PerspectiveCamera>({} as THREE.PerspectiveCamera);
	const modelGroup = shallowRef<THREE.Object3D>({} as THREE.Object3D);
	const controls = shallowRef<TrackballControls>({} as TrackballControls);

	const loading = ref(true);
	const loadProgress = ref<LoadProgress>({ loaded: 0, total: 0, percent: 0 });
	const modelSize = ref(0);

	let cube: TypeViewCube;

	// 移动模式状态
	const isMoveMode = ref(false);
	const moveSpeed = ref(1);
	let isDragging = false;
	let previousMousePosition = { x: 0, y: 0 };
	let containerElement: HTMLElement | null = null;
	let rafId = 0;

	/**
	 * render - 执行单帧渲染
	 *
	 * @description 清除缓冲区并使用当前相机渲染整个场景
	 */
	const render = () => {
		renderer.value.clear();
		renderer.value.setViewport(0, 0, window.innerWidth, window.innerHeight);
		renderer.value.render(scene.value, camera.value);
	};

	/**
	 * animate - 渲染循环（每帧执行）
	 *
	 * @description 通过 requestAnimationFrame 递归调用，持续渲染场景。
	 * 在非移动模式下同步更新控制器状态
	 */
	const animate = () => {
		rafId = requestAnimationFrame(animate);
		render();

		if (cube && modelGroup.value) {
			cube.setRotation(modelGroup.value.rotation);
			cube.update(camera.value);
		}

		if (!isMoveMode.value && controls.value.enabled) {
			controls.value.update();
		}
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

	/**
	 * init - 初始化 3D 场景
	 *
	 * @description 完整的场景初始化流程：
	 * 1. 创建渲染器、场景、灯光
	 * 2. 异步加载 GLB 模型（带进度回调）
	 * 3. 创建相机和控制器
	 * 4. 启动渲染循环
	 * 5. 等待最少 1.5s 展示加载动画后隐藏 loading
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
			scene.value = createScene();

			const startTime = performance.now();

			const result = await loadModel(path, (p) => {
				loadProgress.value = p;
			});

			modelGroup.value = result.group;
			modelSize.value = result.modelSize;
			scene.value.add(modelGroup.value);

			camera.value = createCamera(result.modelSize, modelGroup.value.position);
			addLights(scene.value, result.modelSize);
			controls.value = createControls(camera.value, renderer.value.domElement, result.modelSize);
			// Initialize ViewCube
			cube = new ViewCube({
				container: container,
				coordinateSystem: 'Y-up',
				size: 120,
				position: 'top-right',
				cameraDistance: 10,
				modelRotation: modelGroup.value.rotation,
				colors: {
					main: 0xe0e0e0,
					hover: 0x87ceeb,
					outline: 0x555555,
				},
				labels: {
					top: '上',
					bottom: '下',
					front: '前',
					back: '后',
					left: '左',
					right: '右',
				},
				font: {
					size: 60,
				},
			});

			cube.on('faceClick', (faceId, config) => {
				console.log('Navigate to:', faceId, config);
				// Get initial camera distance (保持初始距离不变)
				const initialDistance = camera.value.position.length();

				// Calculate target position with same distance
				const targetDirection = new THREE.Vector3(config.position.x, config.position.y, config.position.z).normalize();
				const targetPos = targetDirection.multiplyScalar(initialDistance);

				const startPos = camera.value.position.clone();
				const startUp = camera.value.up.clone();
				const targetUp = new THREE.Vector3(config.up.x, config.up.y, config.up.z);

				const duration = 500;
				const startTime = performance.now();

				function animateCamera() {
					const elapsed = performance.now() - startTime;
					const progress = Math.min(elapsed / duration, 1);
					const eased = progress;

					camera.value.position.lerpVectors(startPos, targetPos, eased);
					camera.value.up.lerpVectors(startUp, targetUp, eased).normalize();
					camera.value.lookAt(0, 0, 0);
					controls.value.update();

					if (progress < 1) {
						requestAnimationFrame(animateCamera);
					}
				}

				animateCamera();
			});

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
		cube.dispose();
		renderer.value.dispose();
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
		setMoveMode,
		setMoveSpeed,
	};
}
