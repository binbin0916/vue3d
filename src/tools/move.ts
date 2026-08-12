import type { ToolContext, ToolHandler } from './types';

/**
 * setMoveSpeed - 设置移动速度
 *
 * @description 设置鼠标拖拽平移模型时的速度倍率
 *
 * @param {ToolContext} ctx - 工具执行上下文
 * @param {number} [payload=1] - 速度倍率（建议范围 0.1-10）
 */
export const setMoveSpeed: ToolHandler = (ctx: ToolContext, payload?: number) => {
	ctx.setMoveSpeed(payload ?? 1);
};
