import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { cubeTextConfigs } from '@/utils/view';

export const useViewCube = (renderer: THREE.WebGLRenderer) => {
	const loader = new GLTFLoader();

	const cubeGroup = new THREE.Group();
	const cubeSence = new THREE.Scene();
	const cubeMeshs = [] as THREE.Mesh[];

	loader.load('/cubeview.glb', (gltf) => {
		const scene = gltf.scene;
		[...scene.children].forEach(async (obj: any) => {
			if (obj.type === 'Mesh') {
				obj.material = new THREE.MeshStandardMaterial({
					side: THREE.DoubleSide,
					color: 0xffffff,
					flatShading: false,
					polygonOffset: true,
					polygonOffsetFactor: 1,
					polygonOffsetUnits: 1,
				});
				obj.castShadow = true;
				obj.receiveShadow = true;

				const config = cubeTextConfigs[obj.name];
				if (config) {
					try {
					} catch (error) {
						console.error(`error`, error);
					}
				}

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
		const center = box.getCenter(new THREE.Vector3());
		cubeGroup.position.sub(center);

		cubeSence.add(cubeGroup);
	});

	const cubeCamera = new THREE.OrthographicCamera(
		window.innerWidth / -60,
		window.innerWidth / 60,
		window.innerHeight / 60,
		window.innerHeight / -60,
		0.1,
		100
	);

	cubeCamera.position.z = 60;

	const cubeControls = new TrackballControls(cubeCamera, renderer.domElement);
	cubeControls.rotateSpeed = 1;
	cubeControls.noZoom = true;
	cubeControls.noPan = true;

	const light = new THREE.HemisphereLight(0xffffff, 0xffffff, 3);
	light.position.copy(cubeCamera.position);
	cubeSence.add(light);

	let hoveredMesh: THREE.Mesh | null = null;
	const originalColors = new Map<THREE.Mesh, THREE.Color>();
	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();

	const rect = renderer.domElement.getBoundingClientRect();
	const vpX = window.innerWidth / 2 - 120;
	const vpY = window.innerHeight / 2 - 120; // WebGL bottom-up
	const vpW = window.innerWidth;
	const vpH = window.innerHeight;

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
		const canvasX = event.clientX - rect.left;
		const canvasY = event.clientY - rect.top;

		// viewport bounds check (CSS coords)
		const inViewport = canvasX >= vpX && canvasX <= vpX + vpW && canvasY >= rect.height - vpY - vpH && canvasY <= rect.height - vpY;

		if (!inViewport) {
			if (hoveredMesh) {
				restoreColor(hoveredMesh);
				hoveredMesh = null;
			}
			return;
		}

		// corrected NDC
		pointer.x = ((canvasX - vpX) / vpW) * 2 - 1;
		pointer.y = (2 * (rect.height - canvasY - vpY)) / vpH - 1;

		raycaster.setFromCamera(pointer, cubeCamera);
		const intersects = raycaster.intersectObjects(cubeMeshs, true);

		// no hit → restore (else branch)
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

		// same face → no-op
		if (mesh === hoveredMesh) return;

		// different face → restore old, highlight new
		if (hoveredMesh) {
			restoreColor(hoveredMesh);
		}
		saveAndApplyColor(mesh, 0xe06c75);
		hoveredMesh = mesh;
	};

	const handleClick = (event: MouseEvent) => {
		const canvasX = event.clientX - rect.left;
		const canvasY = event.clientY - rect.top;
		pointer.x = ((canvasX - vpX) / vpW) * 2 - 1;
		pointer.y = (2 * (rect.height - canvasY - vpY)) / vpH - 1;

		raycaster.setFromCamera(pointer, cubeCamera);
		const intersects = raycaster.intersectObjects(cubeMeshs, true);
		if (intersects && intersects[0]) {
			//
		}
	};

	renderer.domElement.addEventListener('pointermove', handleMouseMove, false);
	renderer.domElement.addEventListener('click', handleClick, false);

	const dispose = () => {
		renderer.domElement.removeEventListener('pointermove', handleMouseMove, false);
		renderer.domElement.removeEventListener('click', handleClick, false);
	};

	return { cubeGroup, cubeSence, cubeCamera, cubeControls, dispose };
};
