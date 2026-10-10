import type { ToolContext, ToolHandler, ToolDefinition } from './types';
import { defineTool } from './registry';

/**
 * showAxes - 显示坐标系
 *
 * @param {ToolContext} ctx - 工具执行上下文
 * @param {boolean} payload - 工具执行上下文
 */
export const showAxes: ToolHandler = (ctx: ToolContext) => {
	ctx.setAxesVisibe(true);
};

/**
 * hideAxes - 隐藏坐标系
 *
 * @param {ToolContext} ctx - 工具执行上下文
 * @param {boolean} payload - 工具执行上下文
 */
export const hideAxes: ToolHandler = (ctx: ToolContext) => {
	ctx.setAxesVisibe(false);
};

export const tools: ToolDefinition[] = [
	defineTool({ id: 'axes', menu: { icon: 'icon-axis', label: '坐标系', activatable: true }, activate: showAxes, deactivate: hideAxes }),
];
