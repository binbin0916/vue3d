import * as THREE from 'three';

export function createCamera(modelSize: number, lookAt: THREE.Vector3): THREE.PerspectiveCamera {
	const camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		modelSize / 20,
		1000
	);

	camera.position.set(0, modelSize, modelSize * 2);
	camera.lookAt(lookAt);

	return camera;
}
