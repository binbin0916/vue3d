import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';

/**
 * createControls - 创建轨道控制器
 *
 * @description 创建 TrackballControls 实例，支持旋转、缩放，禁用平移。缩放范围基于模型尺寸动态计算
 *
 * @param {THREE.PerspectiveCamera} camera - 要控制的透视相机
 * @param {HTMLElement} domElement - 绑定事件的 DOM 元素（通常为渲染器的 canvas）
 * @param {number} modelSize - 模型最大包围盒边长，用于计算最小/最大缩放距离
 *
 * @returns {TrackballControls} 配置好的轨道控制器实例
 */
export function createControls(camera: THREE.PerspectiveCamera, domElement: HTMLElement, modelSize: number): TrackballControls {
	const controls = new TrackballControls(camera, domElement);

	controls.rotateSpeed = 1.0;
	controls.noZoom = false;
	controls.minDistance = modelSize / 5;
	controls.maxDistance = modelSize * 5;
	controls.noPan = true;
	controls.noRotate = false;

	return controls;
}
