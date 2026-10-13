import { ref, shallowRef } from 'vue';
import * as THREE from 'three';
import type { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import type { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { createRenderer, createScene, createCamera, addLights, loadModel, createControls, createCSS2DRenderer } from '@/three';
import type { LoadProgress } from '@/three';
import { useViewCube } from './useViewCube';
import { cubeRotateConfigs } from '@/utils/view';
import type { FrameTask } from '@/tools/types';
import type { GLBSceneUserData } from '@/types/userdata-types';

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
	const meshes = ref<THREE.Mesh[]>([]);
	const lines = ref<THREE.LineSegments[]>([]);
	const box = shallowRef<THREE.Box3>({} as THREE.Box3);
	const autoRotate = ref(false);
	const sceneUserData = ref<GLBSceneUserData>({} as GLBSceneUserData);

	const loading = ref(true);
	const loadProgress = ref<LoadProgress>({ loaded: 0, total: 0, percent: 0 });
	const modelSize = ref(0);
	const scaleFactor = ref(1);

	// 移动模式状态
	const isMoveMode = ref(false);
	const moveSpeed = ref(1);
	let isDragging = false;
	let previousMousePosition = { x: 0, y: 0 };
	let containerElement: HTMLElement | null = null;
	let rafId = 0;

	const frameTasks = new Map<string, FrameTask>();

	/**
	 * 动态注册逐帧执行的动画任务。
	 * 若 ID 已存在，新任务会覆盖旧任务。
	 * @returns 注销函数，推荐在 onUnmounted 中调用。
	 */
	const addFrameTask = (id: string, task: FrameTask) => {
		frameTasks.set(id, task);

		return () => {
			frameTasks.delete(id);
		};
	};

	const removeFrameTask = (id: string) => {
		frameTasks.delete(id);
	};

	// ---- ViewCube（独立渲染器 + DOM） ----
	let cubeResult: ReturnType<typeof useViewCube> | null = null;

	// ---- 环境光照资源（场景销毁时释放，避免 GPU 资源泄漏） ----
	let lightingResult: ReturnType<typeof addLights> | null = null;

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

	const timer = new THREE.Timer();
	/**
	 * animate - 渲染循环（每帧执行）
	 *
	 * @description 通过 requestAnimationFrame 递归调用，持续渲染场景。
	 * 在非移动模式下同步更新控制器状态
	 */
	const animate = () => {
		rafId = requestAnimationFrame(animate);
		timer.update();

		const delta = timer.getDelta();
		const elapsed = timer.getElapsed();

		controls.value.update();

		if (cubeResult) {
			camera.value.getWorldQuaternion(cameraWorldQuat);
			modelGroup.value.getWorldQuaternion(modelWorldQuat);
			cubeResult.cubeGroup.quaternion.copy(cameraWorldQuat).invert().multiply(modelWorldQuat);
		}

		if (autoRotate.value) {
			modelGroup.value.rotateZ((Math.PI / 2) * delta);
		}

		// 执行从其他文件动态注册的逐帧逻辑
		frameTasks.forEach((task, id) => {
			try {
				task({
					delta,
					elapsed,
					scene: scene.value,
					camera: camera.value,
					modelGroup: modelGroup.value,
				});
			} catch (error) {
				// 单个任务报错时自动移除，避免每帧重复报错
				console.error(`[Three frame task: ${id}] 执行失败，已移除`, error);
				frameTasks.delete(id);
			}
		});

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
		beginDegrade(false); // 平移：模型在动、阴影需逐帧跟随，故不冻结阴影
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
	 * @description 重置拖拽状态并退出平移降级
	 */
	const onMouseUp = () => {
		if (!isDragging) return;
		isDragging = false;
		endDegrade(false);
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

	// ---- 线条临时隐藏（引用计数）----
	// 交互降级与「模型分离(爆炸)」动画都会临时隐藏线条以减少 draw call；
	// 用引用计数让多个来源叠加时互不干扰，仅在计数归零时恢复原始可见性。
	let lineHideCount = 0;
	let lineHideSnapshot: { line: THREE.LineSegments; visible: boolean }[] = [];

	/** hideLines - 临时隐藏全部线条（与 showLines 配对使用，引用计数） */
	const hideLines = () => {
		if (lineHideCount === 0) {
			lineHideSnapshot = lines.value.map((line) => ({ line, visible: line.visible }));
			lineHideSnapshot.forEach(({ line }) => (line.visible = false));
		}
		lineHideCount += 1;
	};

	/** showLines - 撤销一次隐藏，计数归零时恢复原始可见性 */
	const showLines = () => {
		if (lineHideCount === 0) return;
		lineHideCount -= 1;
		if (lineHideCount === 0) {
			lineHideSnapshot.forEach(({ line, visible }) => (line.visible = visible));
			lineHideSnapshot = [];
		}
	};

	// ---- 交互/动画期间性能降级（隐藏线条 + 冻结阴影）----
	// 重模型（如 6868 条 LineSegments）逐条绘制会造成 draw call 爆炸，拖拽/缩放期间明显卡顿。
	// 线条显示与阴影贴图重绘都与「最终静止画面」无关：降级期间临时隐藏线条、冻结阴影贴图自动更新，
	// 结束后补渲染一次阴影，保证静止画面正确。
	// 交互（旋转/缩放）与模型分离（爆炸）共用同一套引用计数，可叠加、互不干扰。
	// 仅对「重模型」生效：小模型逐帧成本低，降级带来的线条闪现反而更明显，故直接跳过。
	// 线条/网格对象总数阈值：实测重模型（主轴-1≈8483、机械式驻车制动卡钳-1≈8610）远超此值，
	// 其余模型均 < 800，取 2000 可稳定区分且不误伤小模型
	const DEGRADE_OBJECT_THRESHOLD = 2000;
	const DEGRADE_RESTORE_DELAY = 180; // 交互降级结束的防抖时长（毫秒），合并滚轮 start/end 抖动
	let heavyModel = false; // 当前模型是否重模型（加载后判定）

	let degradeHolders = 0; // 降级持有者数量（引用计数）
	let degradeFreezeHolders = 0; // 需要冻结阴影的持有者数量
	let degradeShadowAutoUpdate = true; // 冻结前 shadowMap.autoUpdate 的原值
	let degradeRestoreTimer = 0; // 交互降级结束的防抖定时器

	/**
	 * beginDegrade - 进入性能降级（引用计数）
	 *
	 * @description 隐藏全部线条；freezeShadow 为 true 时同时冻结阴影贴图自动更新。
	 * 交互（旋转/缩放）与模型分离（爆炸）共用本方法，通过引用计数叠加，
	 * 任一方仍在使用时不会误恢复。仅重模型生效，小模型直接跳过。
	 *
	 * @param {boolean} freezeShadow - 是否冻结阴影贴图自动更新
	 */
	const beginDegrade = (freezeShadow: boolean) => {
		if (!heavyModel) return;
		if (degradeHolders === 0) hideLines();
		degradeHolders += 1;

		if (freezeShadow) {
			if (degradeFreezeHolders === 0) {
				const shadowMap = renderer.value.shadowMap;
				if (shadowMap) {
					degradeShadowAutoUpdate = shadowMap.autoUpdate;
					shadowMap.autoUpdate = false;
				}
			}
			degradeFreezeHolders += 1;
		}
	};

	/**
	 * endDegrade - 退出性能降级（与 beginDegrade 配对）
	 *
	 * @description 引用计数归零时才真正恢复：还原线条可见性；若阴影曾被冻结，
	 * 恢复 autoUpdate 并补渲染一次（needsUpdate），使静止画面与交互前一致。
	 *
	 * @param {boolean} freezeShadow - 与进入时传参保持一致
	 */
	const endDegrade = (freezeShadow: boolean) => {
		if (degradeHolders === 0) return;
		degradeHolders -= 1;

		if (freezeShadow && degradeFreezeHolders > 0) {
			degradeFreezeHolders -= 1;
			if (degradeFreezeHolders === 0) {
				const shadowMap = renderer.value.shadowMap;
				if (shadowMap) {
					shadowMap.autoUpdate = degradeShadowAutoUpdate;
					shadowMap.needsUpdate = true;
				}
			}
		}

		if (degradeHolders === 0) showLines();
	};

	// 交互（旋转/缩放）降级状态：控制器 start/end 可能连续触发，故独立去重
	let interactionDegradeActive = false;

	/** 控制器交互开始（旋转/缩放）：进入降级并冻结阴影（模型静止，冻结安全） */
	const onControlsStart = () => {
		if (degradeRestoreTimer) {
			clearTimeout(degradeRestoreTimer);
			degradeRestoreTimer = 0;
		}
		if (interactionDegradeActive) return;
		interactionDegradeActive = true;
		beginDegrade(true);
	};

	/** 控制器交互结束：防抖后退出降级，合并滚轮缩放的同帧 start/end 抖动 */
	const onControlsEnd = () => {
		if (degradeRestoreTimer) clearTimeout(degradeRestoreTimer);
		degradeRestoreTimer = window.setTimeout(() => {
			degradeRestoreTimer = 0;
			if (!interactionDegradeActive) return;
			interactionDegradeActive = false;
			endDegrade(true);
		}, DEGRADE_RESTORE_DELAY);
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
			scaleFactor.value = result.scaleFactor;
			axes.value = result.axes;
			meshes.value = result.meshes;
			lines.value = result.lines;
			// 判定是否为「重模型」：线条/网格对象总数超过阈值才启用交互/爆炸降级
			heavyModel = result.lines.length + result.meshes.length >= DEGRADE_OBJECT_THRESHOLD;
			box.value = result.box;
			sceneUserData.value = result.sceneUserData;
			scene.value.add(modelGroup.value);

			camera.value = createCamera(result.modelSize, modelGroup.value.position);
			lightingResult = addLights(scene.value, result.modelSize, renderer.value);
			// 主光/阴影相机每帧跟随模型世界坐标，保证平移模型时投影实时跟随、不丢失
			const lightOrigin = new THREE.Vector3();
			addFrameTask('light-follow', () => {
				modelGroup.value.getWorldPosition(lightOrigin);
				lightingResult?.update(lightOrigin);
			});
			controls.value = createControls(camera.value, renderer.value.domElement, result.modelSize);
			// 交互（旋转/缩放）期间降级（仅重模型）：隐藏线条 + 冻结阴影贴图重绘，松手恢复
			controls.value.addEventListener('start', onControlsStart);
			controls.value.addEventListener('end', onControlsEnd);

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
		frameTasks.clear();
		window.removeEventListener('resize', onResize);
		containerElement?.removeEventListener('mousedown', onMouseDown);
		window.removeEventListener('mousemove', onMouseMove);
		window.removeEventListener('mouseup', onMouseUp);
		controls.value.removeEventListener('start', onControlsStart);
		controls.value.removeEventListener('end', onControlsEnd);
		if (degradeRestoreTimer) clearTimeout(degradeRestoreTimer);
		renderer.value.dispose();
		cubeResult?.dispose();
		lightingResult?.dispose();
		lightingResult = null;
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
		scaleFactor,
		isMoveMode,
		moveSpeed,
		autoRotate,
		meshes,
		lines,
		box,
		sceneUserData,
		setMoveMode,
		setMoveSpeed,
		rotateToView,
		toggleAutoRotate,
		setAutoRotate,
		handleFaceClick,
		setAxesVisibe,
		addFrameTask,
		removeFrameTask,
		hideLines,
		showLines,
		beginDegrade,
		endDegrade,
	};
}
