import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useCommonStore } from '@/stores/common';

const { isMobile } = useCommonStore();

/**
 * LightingResult - addLights 返回的资源句柄
 *
 * @description 封装灯光系统占用的可释放资源。环境贴图（PMREM RenderTarget）
 * 在场景销毁时需调用 dispose() 释放，否则会泄漏 GPU 资源
 */
export interface LightingResult {
	/** 释放环境贴图等 GPU 资源（场景销毁时调用） */
	dispose: () => void;
	/** 每帧调用：让主光与阴影相机跟随模型世界坐标平移，保证投影实时跟随 */
	update: (_origin: THREE.Vector3) => void;
}

/**
 * addLights - 向场景中添加专业级布光系统
 *
 * @description 面向 PBR（金属度/粗糙度）材质的「摄影棚」级照明方案，由两部分组成：
 *
 * 1. 基于图像的环境光照（IBL）：用 RoomEnvironment 生成一张程序化的 PMREM
 *    环境贴图并挂到 `scene.environment`，为所有 PBR 材质提供全局漫反射照明与
 *    镜面反射。这是专业质感的关键——缺少环境贴图时 metalness > 0 的材质会发黑、
 *    没有环境反射，高光也显得死板。
 *
 * 2. 三点布光 + 半球天光：主光（带软阴影）塑造明暗关系，补光提亮阴影侧，
 *    轮廓光勾勒边缘，半球光与底部反弹光柔和补足暗部。相比堆叠多盏方向光，
 *    少量高质量灯光在 IBL 之上能保留体积感、避免过曝。
 *
 * @param {THREE.Scene} scene - 要添加灯光的 Three.js 场景
 * @param {number} modelSize - 模型最大包围盒边长，用于计算灯光位置与阴影范围
 * @param {THREE.WebGLRenderer} renderer - WebGL 渲染器（生成 PMREM 环境贴图所需）
 *
 * @returns {LightingResult} 资源释放句柄
 */
export function addLights(scene: THREE.Scene, modelSize: number, renderer: THREE.WebGLRenderer): LightingResult {
	const s = modelSize;

	// ==== 1. 基于图像的环境光照（IBL）====
	const pmrem = new THREE.PMREMGenerator(renderer);
	const roomEnvironment = new RoomEnvironment();
	const envRenderTarget = pmrem.fromScene(roomEnvironment, 0.04);
	scene.environment = envRenderTarget.texture;
	// 环境光强度：太高会冲淡主光的明暗对比，太低则金属反射偏暗
	scene.environmentIntensity = 0.5;
	roomEnvironment.dispose();
	pmrem.dispose();

	// ==== 2. 三点布光 + 半球天光 ====

	// 半球光：天空冷光 + 地面暖反射，柔和补足整体暗部
	const hemisphereLight = new THREE.HemisphereLight('#cfe2ff', '#3d3226', 0.3);
	hemisphereLight.position.set(0, s * 3, 0);
	scene.add(hemisphereLight);

	// 主光（Key）：右上前方，提供主要明暗关系与投影
	const keyLight = new THREE.DirectionalLight('#fff4e6', 1.0);
	const keyOffset = new THREE.Vector3(s * 2, s * 2, s * 2.5);
	keyLight.position.copy(keyOffset);
	keyLight.castShadow = true;
	keyLight.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
	// 阴影相机紧贴模型包围球（半径 ≈ 0.866s），在完整覆盖的前提下最大化阴影分辨率
	keyLight.shadow.camera.left = -s;
	keyLight.shadow.camera.right = s;
	keyLight.shadow.camera.top = s;
	keyLight.shadow.camera.bottom = -s;
	keyLight.shadow.camera.near = s / 20;
	keyLight.shadow.camera.far = s * 30;
	// 阴影相机边界变更后立即重算投影矩阵，保证首帧起即生效
	keyLight.shadow.camera.updateProjectionMatrix();
	keyLight.shadow.bias = -0.0005;
	keyLight.shadow.normalBias = s * 0.01;
	// 阴影目标跟随模型平移：主光与阴影相机同步平移，投影方向不变、覆盖始终跟随
	const shadowTarget = new THREE.Object3D();
	keyLight.target = shadowTarget;
	scene.add(shadowTarget);
	scene.add(keyLight);

	// 补光（Fill）：左前方冷光，提亮主光的阴影侧，降低明暗反差
	const fillLight = new THREE.DirectionalLight('#dcebff', 0.35);
	fillLight.position.set(-s * 2.5, s * 1.2, s * 1.5);
	scene.add(fillLight);

	// 轮廓光（Rim）：后方，勾勒模型边缘，增强立体感与材质层次
	const rimLight = new THREE.DirectionalLight('#ffffff', 0.6);
	rimLight.position.set(-s * 1.5, s * 1.5, -s * 3);
	scene.add(rimLight);

	// 底部反弹光：极弱的冷色向上补光，避免底面死黑
	const bounceLight = new THREE.DirectionalLight('#cfe0ff', 0.12);
	bounceLight.position.set(0, -s * 2.5, s * 1.5);
	scene.add(bounceLight);

	const update = (origin: THREE.Vector3) => {
		shadowTarget.position.copy(origin);
		keyLight.position.copy(origin).add(keyOffset);
	};

	return {
		dispose: () => {
			scene.environment = null;
			envRenderTarget.dispose();
		},
		update,
	};
}
