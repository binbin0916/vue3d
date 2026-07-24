import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';

export function createControls(
	camera: THREE.PerspectiveCamera,
	domElement: HTMLElement,
	modelSize: number
): TrackballControls {
	const controls = new TrackballControls(camera, domElement);

	controls.rotateSpeed = 1.0;
	controls.noZoom = false;
	controls.minDistance = modelSize / 5;
	controls.maxDistance = modelSize * 5;
	controls.noPan = true;
	controls.noRotate = false;

	return controls;
}
