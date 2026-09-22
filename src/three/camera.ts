import * as THREE from 'three';

/**
 * createCamera - 创建透视相机
 *
 * @description 根据模型尺寸和观察目标创建透视相机，放置在模型右上方以获得良好的观察角度
 *
 * @param {number} modelSize - 模型归一化后的最大包围盒边长（≈ TARGET_SIZE），用于计算相机位置
 * @param {THREE.Vector3} lookAt - 相机的观察目标点（通常为模型中心）
 *
 * @returns {THREE.PerspectiveCamera} 配置好的透视相机实例
 */
export function createCamera(modelSize: number, lookAt: THREE.Vector3): THREE.PerspectiveCamera {
	const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

	// 相机距离随模型尺寸缩放（modelSize 已统一为 TARGET_SIZE），保证所有模型完整入镜且显示大小一致
	const distance = modelSize * 2;
	// const theta = Math.PI / 4; // 水平角 (绕Y轴)
	// const phi = Math.PI / 4; // 俯仰角 (从Y轴向下)

	// const x = distance * Math.sin(theta) * Math.cos(phi);
	// const y = distance * Math.sin(phi);
	// const z = distance * Math.cos(theta) * Math.cos(phi);

	// camera.position.set(x, y, z);
	camera.position.set(0, 0, distance);

	camera.lookAt(lookAt);

	return camera;
}
