import * as THREE from 'three';

/**
 * createScene - 创建 3D 场景
 *
 * @description 创建 Three.js 场景并设置背景色为浅灰蓝色 (#d6e3ed)
 *
 * @returns {THREE.Scene} 配置好背景色的场景实例
 */
export function createScene(): THREE.Scene {
	const scene = new THREE.Scene();
	scene.background = new THREE.Color('#d6e3ed');
	return scene;
}
