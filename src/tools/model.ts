import type { ToolContext, ToolHandler, ToolDefinition } from './types';
import { defineTool } from './registry';
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

export const tools: ToolDefinition[] = [
	defineTool({ id: 'modelprop-pointLineFace', menu: { icon: 'export', label: '点线面属性', activatable: true, group: 'modelprop' }, activate: getPointLineFace }),
	defineTool({ id: 'modelprop-entity', menu: { icon: 'export', label: '实体属性', activatable: true, group: 'modelprop' }, activate: getEntity }),
	defineTool({ id: 'modelprop-overall', menu: { icon: 'export', label: '总属性', activatable: true, group: 'modelprop' }, activate: getOverall }),
];
