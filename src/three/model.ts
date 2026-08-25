import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * TARGET_SIZE - 模型统一缩放目标尺寸
 *
 * @description 所有导入模型包围盒最大边将被缩放到该值（单位），
 * 使不同尺寸的模型在场景中呈现一致的视觉大小。
 * 缩放仅作用于 scene 根节点，不影响 modelSize 的原始尺寸语义。
 */
// const TARGET_SIZE = 50;

/**
 * ModelResult - 模型加载结果
 *
 * @description 封装 GLTFLoader 加载完成后的模型数据
 */
export interface ModelResult {
	/** GLTF 场景根节点（已居中、重置缩放） */
	scene: THREE.Object3D;
	/** 场景中所有 Mesh 对象的扁平数组 */
	meshes: THREE.Mesh[];
	/** 包裹场景的父级 Object3D，已设置旋转角度（PI/4, -PI/4, PI/4） */
	group: THREE.Object3D;
	/** 模型包围盒最大边长，用于灯光、相机、控制器的尺寸基准 */
	modelSize: number;
	/** 模型局部坐标系 */
	axes: THREE.AxesHelper;
}

/**
 * LoadProgress - 模型加载进度
 *
 * @description GLTFLoader 加载过程中的进度回调数据
 */
export interface LoadProgress {
	/** 已加载字节数 */
	loaded: number;
	/** 文件总字节数 */
	total: number;
	/** 加载百分比 (0-100) */
	percent: number;
}

/**
 * loadModel - 加载 GLB/GLTF 3D 模型
 *
 * @description 使用 Three.js GLTFLoader 加载远程 GLB 模型文件。加载完成后会：
 * 1. 将所有 Mesh 替换为 MeshStandardMaterial（支持双面渲染和阴影）
 * 2. 计算包围盒并将模型居中
 * 3. 包裹在旋转 45° 的 Object3D 中以获得默认展示角度
 *
 * @param {string} url - 模型文件的 URL 路径（如 '/model/get/xxx.glb'）
 * @param {(_progress: LoadProgress) => void} [onProgress] - 加载进度回调函数，每帧触发
 *
 * @returns {Promise<ModelResult>} 加载完成后返回模型数据（场景、网格、组、尺寸）
 */
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

				// 自适应缩放：将模型包围盒最大边统一缩放到 TARGET_SIZE，
				// 保持 modelSize 原始值不变，作为相机、灯光、控制器的尺寸基准
				// const scaleFactor = TARGET_SIZE / modelSize;
				// scene.scale.setScalar(scaleFactor);

				// 坐标轴长度：取模型尺寸的 20%，可按需要调整
				const axes = new THREE.AxesHelper(modelSize * 0.8);
				axes.name = 'modelLocalAxes';
				axes.position.set(0, 0, 0); // scene 已居中，原点即模型中心
				axes.renderOrder = 999;
				axes.traverse((object) => {
					if (object instanceof THREE.Line) {
						const material = object.material as THREE.LineBasicMaterial;
						material.depthTest = false;
						material.depthWrite = false;
						material.transparent = true;
						material.opacity = 1;
					}
				});

				(axes.material as any).opacity = 0;

				const group = new THREE.Object3D();
				group.rotation.set(Math.PI / 4, -Math.PI / 4, 0);

				group.add(axes, scene);

				resolve({ scene, meshes, group, modelSize, axes });
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
