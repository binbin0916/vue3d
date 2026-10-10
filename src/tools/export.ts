import type { ToolContext, ToolHandler, ToolDefinition } from './types';
import { defineTool } from './registry';

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

export const tools: ToolDefinition[] = [
	defineTool({ id: 'export-screenshot', menu: { icon: 'icon-screenshot', label: '截图' }, activate: exportScreenshot }),
	defineTool({ id: 'export-glb', menu: { icon: 'icon-down', label: '导出GLB' }, activate: exportGlb }),
	defineTool({ id: 'export-gltf', menu: { icon: 'icon-downplugin', label: '导出GLTF' }, activate: exportGltf }),
];
