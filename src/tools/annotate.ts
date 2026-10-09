import type { ToolContext, ToolHandler, ToolDefinition } from './types';
import { defineTool } from './registry';

/**
 * annotateText - 文字标注（待实现）
 *
 * @description 在 3D 模型表面选取位置，添加文字标注标签
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const annotateText: ToolHandler = (ctx: ToolContext) => {
	void ctx;
	// TODO: 实现文字标注
};

/**
 * annotatePin - 图钉标注（待实现）
 *
 * @description 在 3D 模型表面选取位置，放置图钉标记
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const annotatePin: ToolHandler = (ctx: ToolContext) => {
	void ctx;
	// TODO: 实现图钉标注
};

export const tools: ToolDefinition[] = [
	defineTool({ id: 'annotate-text', menu: { icon: 'annotate', label: '文字标注', activatable: true }, activate: annotateText }),
	defineTool({ id: 'annotate-pin', menu: { icon: 'annotate', label: '图钉标注', activatable: true }, activate: annotatePin }),
];
