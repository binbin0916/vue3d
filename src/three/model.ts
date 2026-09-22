import type { GLBSceneUserData } from '@/types/userdata-types';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * TARGET_SIZE - 模型统一缩放目标尺寸
 *
 * @description 所有导入模型包围盒最大边将被缩放到该值（单位），
 * 使不同尺寸的模型在场景中呈现一致的视觉大小。
 * 基准值取 model/get/IPTH8-20.glb 在缩放值为 1（原始尺寸）时的
 * 包围盒最大边长，即 63。
 */
const TARGET_SIZE = 63;

/**
 * ModelResult - 模型加载结果
 *
 * @description 封装 GLTFLoader 加载完成后的模型数据
 */
export interface ModelResult {
	/** GLTF 场景根节点（已居中、已归一化缩放到 TARGET_SIZE） */
	scene: THREE.Object3D;
	/** 场景中所有 Mesh 对象的扁平数组 */
	meshes: THREE.Mesh[];
	/** 包裹场景的父级 Object3D，已设置旋转角度（PI/4, -PI/4, PI/4） */
	group: THREE.Object3D;
	/** 归一化后包围盒最大边长（≈ TARGET_SIZE），用于灯光、相机、控制器的尺寸基准 */
	modelSize: number;
	/** 模型局部坐标系 */
	axes: THREE.AxesHelper;
	/** 归一化缩放后的模型包围盒 */
	box: THREE.Box3;
	/** 模型级 userdata */
	sceneUserData: GLBSceneUserData;
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
 * 3. 归一化缩放包围盒最大边至 TARGET_SIZE，使不同模型显示大小一致
 * 4. 包裹在旋转 45° 的 Object3D 中以获得默认展示角度
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
				scene.renderOrder = 0;
				scene.matrixWorldAutoUpdate = true;
				scene.matrixWorldNeedsUpdate = true;
				scene.scale.set(1, 1, 1);

				const box = new THREE.Box3().setFromObject(scene);
				const center = new THREE.Vector3();
				box.getCenter(center);
				scene.position.sub(center);
				scene.name = 'modelGroup';

				const size = new THREE.Vector3();
				box.getSize(size);
				const rawModelSize = Math.max(size.x, size.y, size.z);

				// 归一化缩放：包围盒最大边缩放到 TARGET_SIZE（以 IPTH8-20.glb 原始尺寸为基准），
				// 使不同尺寸的模型在场景中显示大小一致
				const scaleFactor = rawModelSize > 0 ? TARGET_SIZE / rawModelSize : 1;
				scene.scale.setScalar(scaleFactor);

				// 缩放后重算包围盒与尺寸，保证 modelSize/box 与场景中的实际显示一致，
				// 进而使灯光、相机、控制器对所有模型采用同一尺寸基准
				const scaledBox = new THREE.Box3().setFromObject(scene);
				const scaledSize = new THREE.Vector3();
				scaledBox.getSize(scaledSize);
				const modelSize = Math.max(scaledSize.x, scaledSize.y, scaledSize.z);

				// 坐标轴长度：取模型尺寸的 20%，可按需要调整
				const axes = new THREE.AxesHelper(modelSize * 1.5);
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

				resolve({ scene, meshes, group, modelSize, axes, box: scaledBox, sceneUserData: scene.userData as GLBSceneUserData });
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
