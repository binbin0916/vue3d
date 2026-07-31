import * as THREE from 'three';

/**
 * createRenderer - 创建 WebGL 渲染器
 *
 * @description 创建并配置 Three.js WebGL 渲染器，启用抗锯齿、阴影贴图、局部裁剪，
 * 并将 canvas 元素追加到指定的 DOM 容器中
 *
 * @param {HTMLElement} domEl - 渲染器 canvas 要追加到的 DOM 容器元素
 *
 * @returns {THREE.WebGLRenderer} 配置好的渲染器实例
 */
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
