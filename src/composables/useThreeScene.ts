import * as THREE from 'three';
import { shallowRef, ref } from 'vue';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { createRenderer, createScene, createCamera, addLights, loadModel, createControls } from '@/three';
import type { LoadProgress } from '@/three';

const MODEL_PATH = '/model/get/';

export function useThreeScene() {
	const renderer = shallowRef<THREE.WebGLRenderer>({} as THREE.WebGLRenderer);
	const scene = shallowRef<THREE.Scene>({} as THREE.Scene);
	const camera = shallowRef<THREE.PerspectiveCamera>({} as THREE.PerspectiveCamera);
	const modelGroup = shallowRef<THREE.Object3D>({} as THREE.Object3D);
	const controls = shallowRef<TrackballControls>({} as TrackballControls);

	const loading = ref(true);
	const loadProgress = ref<LoadProgress>({ loaded: 0, total: 0, percent: 0 });
	const modelSize = ref(0);

	// 移动模式状态
	const isMoveMode = ref(false);
	const moveSpeed = ref(1);
	let isDragging = false;
	let previousMousePosition = { x: 0, y: 0 };
	let containerElement: HTMLElement | null = null;

	const render = () => {
		renderer.value.clear();
		renderer.value.setViewport(0, 0, window.innerWidth, window.innerHeight);
		renderer.value.render(scene.value, camera.value);
	};

	const animate = () => {
		requestAnimationFrame(animate);
		render();

		if (!isMoveMode.value && controls.value.enabled) {
			controls.value.update();
		}
	};

	const onResize = () => {
		camera.value.aspect = window.innerWidth / window.innerHeight;
		camera.value.updateProjectionMatrix();
		render();
		renderer.value.setSize(window.innerWidth, window.innerHeight);
	};

	const onMouseDown = (e: MouseEvent) => {
		if (!isMoveMode.value || e.button !== 0) return;
		isDragging = true;
		previousMousePosition = { x: e.clientX, y: e.clientY };
	};

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

	const onMouseUp = () => {
		isDragging = false;
	};

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

	const setMoveSpeed = (speed: number) => {
		moveSpeed.value = speed;
	};

	const init = async (container: HTMLElement, code: string) => {
		void code;
		const path = `${MODEL_PATH}export_convert_323248_151.glb`;
		const MIN_DISPLAY_TIME = 1500;

		containerElement = container;
		renderer.value = createRenderer(container);
		scene.value = createScene();

		loading.value = true;
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

		animate();
		window.addEventListener('resize', onResize);

		const elapsed = performance.now() - startTime;
		const remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);
		await new Promise((resolve) => setTimeout(resolve, remaining));

		loading.value = false;
	};

	const dispose = () => {
		window.removeEventListener('resize', onResize);
		containerElement?.removeEventListener('mousedown', onMouseDown);
		window.removeEventListener('mousemove', onMouseMove);
		window.removeEventListener('mouseup', onMouseUp);
		renderer.value.dispose();
	};

	return {
		init,
		dispose,
		loading,
		loadProgress,
		modelSize,
		isMoveMode,
		moveSpeed,
		setMoveMode,
		setMoveSpeed,
	};
}
