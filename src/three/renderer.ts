import * as THREE from 'three';

export function createRenderer(domEl: HTMLElement): THREE.WebGLRenderer {
	const renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true,
		preserveDrawingBuffer: true,
	});

	renderer.setPixelRatio(window.devicePixelRatio * 2);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor('#ffffff');
	renderer.autoClear = false;
	renderer.localClippingEnabled = true;

	domEl.appendChild(renderer.domElement);

	return renderer;
}
