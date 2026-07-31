import type { ToolContext, ToolHandler } from './types';

/**
 * exportScreenshot - 截图导出（待实现）
 *
 * @description 将当前 3D 视口渲染结果导出为 PNG 图片
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const exportScreenshot: ToolHandler = (ctx: ToolContext) => {
	void ctx;
	// TODO: 实现截图导出
};

/**
 * exportGlb - 导出 GLB 文件（待实现）
 *
 * @description 将当前模型导出为 GLB 格式二进制文件并触发下载
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const exportGlb: ToolHandler = (ctx: ToolContext) => {
	void ctx;
	// TODO: 实现 GLB 导出
};

/**
 * exportGltf - 导出 GLTF 文件（待实现）
 *
 * @description 将当前模型导出为 GLTF 格式 JSON 文件并触发下载
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const exportGltf: ToolHandler = (ctx: ToolContext) => {
	void ctx;
	// TODO: 实现 GLTF 导出
};
