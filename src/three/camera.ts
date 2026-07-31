import * as THREE from 'three';

/**
 * createCamera - 创建透视相机
 *
 * @description 根据模型尺寸和观察目标创建透视相机，放置在模型右上方以获得良好的观察角度
 *
 * @param {number} modelSize - 模型的最大包围盒边长，用于计算相机的近远裁剪面和初始位置
 * @param {THREE.Vector3} lookAt - 相机的观察目标点（通常为模型中心）
 *
 * @returns {THREE.PerspectiveCamera} 配置好的透视相机实例
 */
export function createCamera(modelSize: number, lookAt: THREE.Vector3): THREE.PerspectiveCamera {
	const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, modelSize / 20, 1000);

	camera.position.set(0, modelSize, modelSize * 2);
	camera.lookAt(lookAt);

	return camera;
}
