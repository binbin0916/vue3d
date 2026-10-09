import type { ToolContext, ToolHandler, ToolDefinition } from './types';
import { defineTool } from './registry';

/**
 * measureDistance - 距离测量（待实现）
 *
 * @description 在 3D 场景中选取两点，计算并显示实际距离
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const measureDistance: ToolHandler = (ctx: ToolContext) => {
	void ctx;
	// TODO: 实现距离测量
};

/**
 * measureAngle - 角度测量（待实现）
 *
 * @description 在 3D 场景中选取三点，计算并显示夹角
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const measureAngle: ToolHandler = (ctx: ToolContext) => {
	void ctx;
	// TODO: 实现角度测量
};

/**
 * measureArea - 面积测量（待实现）
 *
 * @description 在 3D 场景中选取多个点，计算并显示围成区域的面积
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const measureArea: ToolHandler = (ctx: ToolContext) => {
	void ctx;
	// TODO: 实现面积测量
};

export const tools: ToolDefinition[] = [
	defineTool({ id: 'measure-distance', menu: { icon: 'measure', label: '距离测量', activatable: true, group: 'measure' }, activate: measureDistance }),
	defineTool({ id: 'measure-angle', menu: { icon: 'measure', label: '角度测量', activatable: true, group: 'measure' }, activate: measureAngle }),
	defineTool({ id: 'measure-area', menu: { icon: 'measure', label: '面积测量', activatable: true, group: 'measure' }, activate: measureArea }),
];
