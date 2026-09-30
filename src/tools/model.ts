import type { ToolContext, ToolHandler } from './types';
import { showTooltip } from '@/components/FloatTooltip/controller';
/**
 * getPointLineFace - 点线面属性
 *
 * @description
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const getPointLineFace: ToolHandler = (ctx: ToolContext) => {
	// 拾取;
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
	showTooltip({
		content: '选择实体',
	});
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
