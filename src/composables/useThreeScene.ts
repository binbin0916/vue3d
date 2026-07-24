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

	const render = () => {
		renderer.value.clear();
		renderer.value.setViewport(0, 0, window.innerWidth, window.innerHeight);
		renderer.value.render(scene.value, camera.value);
	};

	const animate = () => {
		requestAnimationFrame(animate);
		render();
		controls.value.update();
	};

	const onResize = () => {
		camera.value.aspect = window.innerWidth / window.innerHeight;
		camera.value.updateProjectionMatrix();
		render();
		renderer.value.setSize(window.innerWidth, window.innerHeight);
	};

	const init = async (container: HTMLElement, code: string) => {
		void code;
		const path = `${MODEL_PATH}export_convert_323248_151.glb`;
		const MIN_DISPLAY_TIME = 1500; // 进度条最小加载时间

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
		renderer.value.dispose();
	};

	return {
		init,
		dispose,
		loading,
		loadProgress,
		modelSize,
	};
}
