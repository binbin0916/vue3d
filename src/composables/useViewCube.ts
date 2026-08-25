import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { cubeTextConfigs } from '@/utils/view';

/** cube 渲染区域尺寸（px） */
const CUBE_SIZE = 150;

export const useViewCube = (container: HTMLElement) => {
	// ---- 独立 DOM 容器 ----
	const cubeContainer = document.createElement('div');
	cubeContainer.style.cssText = `
		position: absolute;
		top: 10px;
		right: 10px;
		width: ${CUBE_SIZE}px;
		height: ${CUBE_SIZE}px;
		z-index: 100;
		pointer-events: auto;
	`;
	container.style.position = 'relative';
	container.appendChild(cubeContainer);

	// ---- 独立渲染器 ----
	const cubeRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
	cubeRenderer.setPixelRatio(window.devicePixelRatio * 2);
	cubeRenderer.setSize(CUBE_SIZE, CUBE_SIZE);
	cubeRenderer.setClearColor(0x000000, 0);
	cubeContainer.appendChild(cubeRenderer.domElement);

	// ---- 场景 & 相机 ----
	const cubeScene = new THREE.Scene();
	const cubeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
	cubeCamera.position.z = 60;

	const light = new THREE.HemisphereLight(0xffffff, 0xffffff, 3);
	light.position.copy(cubeCamera.position);
	cubeScene.add(light);

	// ---- Controls（同步主场景旋转） ----
	const cubeControls = new TrackballControls(cubeCamera, cubeRenderer.domElement);
	cubeControls.rotateSpeed = 1;
	cubeControls.noZoom = true;
	cubeControls.noPan = true;

	// ---- 加载 cube GLB 模型 ----
	const loader = new GLTFLoader();
	const textureLoader = new THREE.TextureLoader();
	const cubeGroup = new THREE.Group();
	const cubeMeshs: THREE.Mesh[] = [];

	loader.load('/cubeview_1.glb', (gltf) => {
		const scene = gltf.scene;
		[...scene.children].forEach((obj: any) => {
			if (obj.type === 'Mesh') {
				const config = cubeTextConfigs[obj.name];

				const material = new THREE.MeshStandardMaterial({
					side: THREE.DoubleSide,
					color: 0xffffff,
					flatShading: false,
					polygonOffset: true,
					polygonOffsetFactor: 1,
					polygonOffsetUnits: 1,
					roughness: 0.6,
					metalness: 0.1,
					opacity: 1,
				});

				if (config && config.src) {
					textureLoader.load(config.src, (texture) => {
						texture.colorSpace = THREE.SRGBColorSpace;
						texture.anisotropy = cubeRenderer.capabilities.getMaxAnisotropy();
						texture.wrapS = THREE.ClampToEdgeWrapping;
						texture.wrapT = THREE.ClampToEdgeWrapping;

						material.map = texture;
						material.color.setHex(0xffffff);
						material.needsUpdate = true;
					});
				}

				obj.material = material;
				material.needsUpdate = true;
				obj.castShadow = true;
				obj.receiveShadow = true;

				cubeMeshs.push(obj);
			} else if (obj.type === 'LineSegments') {
				obj.material = new THREE.LineBasicMaterial({
					side: THREE.DoubleSide,
					color: 0x000000,
					transparent: true,
					opacity: 0.5,
				});
			}

			cubeGroup.add(obj);
		});

		const box = new THREE.Box3().setFromObject(cubeGroup);
		const size = box.getSize(new THREE.Vector3());
		const center = box.getCenter(new THREE.Vector3());
		cubeGroup.position.sub(center);

		// 缩放到容器 1/2 大小（正交相机 frustum 为 ±1，目标占 1 个单位）
		const maxDim = Math.max(size.x, size.y, size.z);
		if (maxDim > 0) {
			cubeGroup.scale.setScalar(1 / maxDim);
		}

		cubeScene.add(cubeGroup);
	});

	// ---- Raycaster（基于独立 canvas，NDC 计算极简） ----
	let hoveredMesh: THREE.Mesh | null = null;
	const originalColors = new Map<THREE.Mesh, THREE.Color>();
	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();

	function getNDC(event: PointerEvent): THREE.Vector2 {
		const rect = cubeRenderer.domElement.getBoundingClientRect();
		return new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
	}

	function saveAndApplyColor(mesh: THREE.Mesh, hex: number) {
		if (!originalColors.has(mesh)) {
			const mat = mesh.material as THREE.MeshStandardMaterial;
			originalColors.set(mesh, mat.color.clone());
		}
		(mesh.material as THREE.MeshStandardMaterial).color.setHex(hex);
	}

	function restoreColor(mesh: THREE.Mesh) {
		const origColor = originalColors.get(mesh);
		if (origColor) {
			(mesh.material as THREE.MeshStandardMaterial).color.copy(origColor);
			originalColors.delete(mesh);
		}
	}

	const handleMouseMove = (event: PointerEvent) => {
		pointer.copy(getNDC(event));
		raycaster.setFromCamera(pointer, cubeCamera);
		const intersects = raycaster.intersectObjects(cubeMeshs, true);

		if (intersects.length === 0) {
			if (hoveredMesh) {
				restoreColor(hoveredMesh);
				hoveredMesh = null;
			}
			return;
		}

		const hit = intersects[0];
		if (!hit) return;
		const mesh = hit.object as THREE.Mesh;
		if (!mesh.isMesh) {
			if (hoveredMesh) {
				restoreColor(hoveredMesh);
				hoveredMesh = null;
			}
			return;
		}

		if (mesh === hoveredMesh) return;

		if (hoveredMesh) {
			restoreColor(hoveredMesh);
		}
		saveAndApplyColor(mesh, 0xe06c75);
		hoveredMesh = mesh;
	};

	const handleClick = (event: MouseEvent) => {
		pointer.copy(getNDC(event as unknown as PointerEvent));
		raycaster.setFromCamera(pointer, cubeCamera);
		raycaster.intersectObjects(cubeMeshs, true);
	};

	cubeRenderer.domElement.addEventListener('pointermove', handleMouseMove, false);
	cubeRenderer.domElement.addEventListener('click', handleClick, false);

	// ---- 对外暴露 ----
	return {
		cubeGroup,
		cubeScene,
		cubeCamera,
		cubeControls,
		cubeRenderer,
		cubeContainer,
		dispose: () => {
			cubeRenderer.domElement.removeEventListener('pointermove', handleMouseMove, false);
			cubeRenderer.domElement.removeEventListener('click', handleClick, false);
			cubeRenderer.dispose();
			cubeContainer.remove();
		},
	};
};
