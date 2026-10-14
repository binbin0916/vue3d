// import * as THREE from 'three';
import { Object3D, PerspectiveCamera } from 'three';
import { ModelControls } from '@/utils/ModelControls';

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
export function createControls(model: Object3D, camera: PerspectiveCamera, domElement: HTMLElement, modelSize: number): ModelControls {
	const controls = new ModelControls(model, camera, domElement);

	controls.rotateSpeed = 1.0;
	// 与原 TrackballControls 配置保持一致：禁用平移（平移交由「移动模式」处理）
	// controls.enablePan = false;
	controls.minDistance = modelSize / 5;
	controls.maxDistance = modelSize * 5;

	return controls;
}
