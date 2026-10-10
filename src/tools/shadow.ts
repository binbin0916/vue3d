import * as THREE from 'three';
import type { ToolContext, ToolHandler, ToolDefinition } from './types';
import { defineTool } from './registry';

/**
 * SHADOW_GROUND_KEY - scene.userData 上存放地面阴影资源的键名
 */
const SHADOW_GROUND_KEY = 'shadowGround';

/**
 * SHADOW_GROUND_TASK - 逐帧跟随任务的 id
 */
// const SHADOW_GROUND_TASK = 'shadow-ground-follow';

/**
 * GroundShadowResource - 地面阴影占用的可释放资源
 */
interface GroundShadowResource {
	/** 接收阴影的地面网格 */
	mesh: THREE.Mesh;
	/** 地面几何体 */
	geometry: THREE.PlaneGeometry;
	/** 仅显示阴影的材质 */
	material: THREE.ShadowMaterial;
}

/**
 * showGroundShadow - 显示地面接触阴影
 *
 * @description 在模型正下方添加一块仅显示投影的半透明地面（ShadowMaterial），
 * 由主光把模型投影到该平面上。平面始终保持「世界空间」水平，逐帧贴合模型的世界包围盒：
 * XZ 对齐包围盒中心、Y 取包围盒最低点（与模型距离恒为 0），从而跟随模型的旋转与平移。
 * 默认不显示，需由「阴影」工具激活
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const showGroundShadow: ToolHandler = (ctx: ToolContext) => {
	if (ctx.scene.userData[SHADOW_GROUND_KEY]) return;

	const radius = ctx.box.getBoundingSphere(new THREE.Sphere()).radius || ctx.modelSize * 0.5;
	const planeSize = radius * 6;

	const geometry = new THREE.PlaneGeometry(planeSize, planeSize);
	geometry.rotateX(-Math.PI / 4);

	const material = new THREE.ShadowMaterial({ color: 0x11161d, opacity: 0.3, transparent: true });

	const mesh = new THREE.Mesh(geometry, material);
	mesh.name = 'groundShadowPlane';
	mesh.receiveShadow = true;
	mesh.castShadow = false;
	mesh.renderOrder = -1;

	mesh.quaternion.copy(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 4, -Math.PI / 4, 0)).invert());
	mesh.position.set(0, ctx.box.min.y - 20, 0);

	ctx.scene.userData[SHADOW_GROUND_KEY] = {
		mesh,
		geometry,
		material,
	};

	ctx.scene.add(mesh);
};

/**
 * restoreGroundShadow - 取消地面接触阴影、移除逐帧任务并释放资源
 *
 * @description 注销逐帧跟随任务，从场景中移除阴影平面并释放其几何体与材质
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const restoreGroundShadow: ToolHandler = (ctx: ToolContext) => {
	const resource = ctx.scene.userData[SHADOW_GROUND_KEY] as GroundShadowResource | undefined;
	if (!resource) return;

	ctx.scene.remove(resource.mesh);
	resource.geometry.dispose();
	resource.material.dispose();
	delete ctx.scene.userData[SHADOW_GROUND_KEY];
};

export const tools: ToolDefinition[] = [
	defineTool({
		id: 'shadow-ground',
		menu: { icon: 'icon-shadow', label: '阴影', activatable: true },
		activate: showGroundShadow,
		deactivate: restoreGroundShadow,
	}),
];
