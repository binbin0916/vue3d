import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface ModelResult {
	scene: THREE.Object3D;
	meshes: THREE.Mesh[];
	group: THREE.Object3D;
	modelSize: number;
}

export interface LoadProgress {
	loaded: number;
	total: number;
	percent: number;
}

export function loadModel(url: string, onProgress?: (_progress: LoadProgress) => void): Promise<ModelResult> {
	return new Promise((resolve, reject) => {
		const loader = new GLTFLoader();

		loader.load(
			url,
			(gltf) => {
				const scene = gltf.scene;
				const meshes: THREE.Mesh[] = [];

				scene.traverse((obj: any) => {
					if (obj.isMesh && obj.type === 'Mesh') {
						const src = obj.material;
						obj.material = new THREE.MeshStandardMaterial({
							map: src.map,
							color: src.color,
							normalMap: src.normalMap,
							roughnessMap: src.roughnessMap,
							metalnessMap: src.metalnessMap,
							aoMap: src.aoMap,
							emissiveMap: src.emissiveMap,
							roughness: src.roughness ?? 0.5,
							metalness: src.metalness ?? 0.0,
							envMapIntensity: 1.0,
							flatShading: false,
						});
						obj.material.side = THREE.DoubleSide;
						obj.castShadow = true;
						obj.receiveShadow = true;
						meshes.push(obj);
					}
				});

				scene.matrixWorldAutoUpdate = true;
				scene.matrixWorldNeedsUpdate = true;
				scene.scale.set(1, 1, 1);

				const box = new THREE.Box3().setFromObject(scene);
				const center = new THREE.Vector3();
				box.getCenter(center);
				scene.position.sub(center);

				const size = new THREE.Vector3();
				box.getSize(size);
				const modelSize = Math.max(size.x, size.y, size.z);

				const group = new THREE.Object3D();
				group.rotation.set(Math.PI / 4, -Math.PI / 4, Math.PI / 4);
				group.add(scene);

				resolve({ scene, meshes, group, modelSize });
			},
			(xhr) => {
				if (xhr.lengthComputable && onProgress) {
					onProgress({
						loaded: xhr.loaded,
						total: xhr.total,
						percent: (xhr.loaded / xhr.total) * 100,
					});
				}
			},
			(error) => {
				console.error('loadModel', error);
				reject(error);
			}
		);
	});
}
