import * as THREE from 'three';
import type { ToolContext, ToolHandler } from './types';

/**
 * originalMaterialsStore - 按 modelGroup 实例存储原始材质
 *
 * @description 使用 WeakMap 以 modelGroup 为 key，确保每次加载新模型时
 * 旧的材质映射会被自动垃圾回收，不会出现跨模型材质混用
 */
const originalMaterialsStore = new WeakMap<THREE.Object3D, Map<string, THREE.Material | THREE.Material[]>>();

/**
 * getMaterialMap - 获取当前 modelGroup 的材质映射表
 *
 * @param {ToolContext} ctx - 工具执行上下文
 * @returns {Map<string, THREE.Material | THREE.Material[]>} 材质映射表
 */
function getMaterialMap(ctx: ToolContext): Map<string, THREE.Material | THREE.Material[]> {
	let map = originalMaterialsStore.get(ctx.modelGroup);
	if (!map) {
		map = new Map();
		originalMaterialsStore.set(ctx.modelGroup, map);
	}
	return map;
}

/**
 * forEachMesh - 遍历 modelGroup 下所有 Mesh
 *
 * @description 提取重复的 traverse + isMesh 模式
 *
 * @param {ToolContext} ctx - 工具执行上下文
 * @param {(mesh: THREE.Mesh) => void} callback - 对每个 Mesh 执行的操作
 */
function forEachMesh(ctx: ToolContext, callback: (_mesh: THREE.Mesh) => void): void {
	ctx.modelGroup.traverse((obj) => {
		if ((obj as THREE.Mesh).isMesh) {
			callback(obj as THREE.Mesh);
		}
	});
}

/**
 * saveOriginalMaterials - 保存模型原始材质
 *
 * @description 遍历 modelGroup 下所有 Mesh，将当前材质存入 Map（仅首次调用时保存）
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
function saveOriginalMaterials(ctx: ToolContext): void {
	const map = getMaterialMap(ctx);
	if (map.size > 0) return;
	forEachMesh(ctx, (mesh) => {
		map.set(mesh.uuid, mesh.material);
	});
}

/**
 * restoreOriginalMaterials - 恢复所有 Mesh 到原始材质
 *
 * @description 从 Map 中取出原始材质并还原，清空存储
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
function restoreOriginalMaterials(ctx: ToolContext): void {
	const map = getMaterialMap(ctx);
	forEachMesh(ctx, (mesh) => {
		const original = map.get(mesh.uuid);
		if (original !== undefined) {
			mesh.material = original;
		}
	});
	map.clear();
}

/**
 * applyMaterial - 统一的材质替换逻辑
 *
 * @description 保存原始材质后，为所有 Mesh 应用新材质
 *
 * @param {ToolContext} ctx - 工具执行上下文
 * @param {(color: string) => THREE.Material} makeMaterial - 根据颜色创建材质的工厂函数
 * @param {string} color - 颜色值
 */
function applyMaterial(ctx: ToolContext, makeMaterial: (_color: string) => THREE.Material, color: string): void {
	saveOriginalMaterials(ctx);
	forEachMesh(ctx, (mesh) => {
		mesh.material = makeMaterial(color);
	});
}

/**
 * materialWireframe - 线框模式
 *
 * @description 将模型所有 Mesh 切换为线框渲染模式，支持自定义线框颜色
 *
 * @param {ToolContext} ctx - 工具执行上下文
 * @param {string} [payload='#ffffff'] - 线框颜色（十六进制字符串）
 */
export const materialWireframe: ToolHandler = (ctx: ToolContext, payload?: string) => {
	const color = payload ?? '#ffffff';
	applyMaterial(ctx, (c) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c), wireframe: true }), color);
};

/**
 * materialXray - X 光模式（待实现）
 *
 * @description 将模型切换为半透明 X 光渲染模式
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const materialXray: ToolHandler = (ctx: ToolContext) => {
	void ctx;
	// TODO: 实现 X 光模式
};

/**
 * materialNormal - 法线显示（待实现）
 *
 * @description 将模型切换为法线颜色可视化模式
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const materialNormal: ToolHandler = (ctx: ToolContext) => {
	void ctx;
	// TODO: 实现法线显示
};

/**
 * materialSolid - 纯色显示
 *
 * @description 将模型所有 Mesh 切换为纯色 MeshStandardMaterial，支持自定义颜色
 *
 * @param {ToolContext} ctx - 工具执行上下文
 * @param {string} [payload='#999999'] - 纯色颜色（十六进制字符串）
 */
export const materialSolid: ToolHandler = (ctx: ToolContext, payload?: string) => {
	const color = payload ?? '#999999';
	applyMaterial(
		ctx,
		(c) => {
			const mat = new THREE.MeshStandardMaterial({
				color: new THREE.Color(c),
				roughness: 0.5,
				metalness: 0.0,
				flatShading: false,
			});
			mat.side = THREE.DoubleSide;
			return mat;
		},
		color
	);
};

/**
 * restoreMaterial - 恢复原始材质（由 ToolBar 切换模式时调用）
 *
 * @description 恢复所有 Mesh 到加载模型时保存的原始材质
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const restoreMaterial: ToolHandler = (ctx: ToolContext) => {
	restoreOriginalMaterials(ctx);
};
