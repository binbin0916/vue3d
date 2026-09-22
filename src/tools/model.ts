import type { ToolContext, ToolHandler } from './types';

/**
 * getPointLineFace - 点线面属性
 *
 * @description
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const getPointLineFace: ToolHandler = (ctx: ToolContext, payload?: number) => {
	console.info(`output->点线面属性`, ctx);
};

/**
 * getEntity - 实体属性
 *
 * @description
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const getEntity: ToolHandler = (ctx: ToolContext) => {
	console.info(`output->实体属性`, ctx.sceneUserData);
};

/**
 * getOverall - 总属性
 *
 * @description
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const getOverall: ToolHandler = (ctx: ToolContext) => {
	console.info(`output->总属性`, ctx);
};
