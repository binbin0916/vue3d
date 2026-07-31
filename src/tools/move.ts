import type { ToolContext, ToolHandler } from './types';

/**
 * toggleMove - 切换移动模式
 *
 * @description 反转当前移动模式状态（开启/关闭）
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const toggleMove: ToolHandler = (ctx: ToolContext) => {
	ctx.setMoveMode(!ctx.isMoveMode);
};

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
