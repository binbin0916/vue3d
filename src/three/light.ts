import * as THREE from 'three';

export function addLights(scene: THREE.Scene, modelSize: number): void {
	const s = modelSize;

	// 环境光：基础亮度
	const ambientLight = new THREE.AmbientLight('#ffffff', 0.6);
	scene.add(ambientLight);

	// 半球光：天光偏冷，地面偏暖
	const hemisphereLight = new THREE.HemisphereLight('#c8e0ff', '#5a4a3a', 0.8);
	hemisphereLight.position.set(0, s * 3, 0);
	scene.add(hemisphereLight);

	// 主光（上前方）：主要照明，带阴影
	const mainLight = new THREE.DirectionalLight('#fff8f0', 1.8);
	mainLight.position.set(0, s * 1.5, s * 2);
	mainLight.castShadow = true;
	mainLight.shadow.camera.left = -s * 3;
	mainLight.shadow.camera.right = s * 3;
	mainLight.shadow.camera.top = s * 3;
	mainLight.shadow.camera.bottom = -s * 3;
	mainLight.shadow.camera.near = s / 20;
	mainLight.shadow.camera.far = s * 30;
	mainLight.shadow.mapSize.width = 2048;
	mainLight.shadow.mapSize.height = 2048;
	mainLight.shadow.bias = -0.0001;
	scene.add(mainLight);

	// 补光（左前方）
	const fillLight = new THREE.DirectionalLight('#e8f2ff', 1.2);
	fillLight.position.set(-s * 2, s * 1, s * 1.5);
	scene.add(fillLight);

	// 背光（后方）
	const backLight = new THREE.DirectionalLight('#ffffff', 1.0);
	backLight.position.set(0, s * 0.5, -s * 3);
	scene.add(backLight);

	// 底部补光
	const bottomLight = new THREE.DirectionalLight('#dce8ff', 0.7);
	bottomLight.position.set(0, -s * 2, s);
	scene.add(bottomLight);

	// Z轴正方向光
	const frontLight = new THREE.DirectionalLight('#ffffff', 1.5);
	frontLight.position.set(0, 0, s * 3);
	scene.add(frontLight);

	// 侧面光（右侧）
	const sideLight = new THREE.DirectionalLight('#fff0dd', 0.8);
	sideLight.position.set(s * 3, s * 0.5, 0);
	scene.add(sideLight);

	// 侧面光（左侧）
	const sideLight2 = new THREE.DirectionalLight('#e8f0ff', 0.7);
	sideLight2.position.set(-s * 3, s * 0.5, 0);
	scene.add(sideLight2);

	// 轮廓光（后上方）
	const rimLight = new THREE.DirectionalLight('#ffffff', 0.8);
	rimLight.position.set(0, s * 2, -s * 2);
	scene.add(rimLight);
}
