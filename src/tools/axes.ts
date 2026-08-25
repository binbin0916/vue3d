import type { ToolContext, ToolHandler } from './types';

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
