import type { ToolContext, ToolHandler } from './types';

/**
 * setViewAngle - 设置相机视角（待实现）
 *
 * @description 将相机移动到指定的标准视角位置（前/后/左/右/上/下）
 *
 * @param {ToolContext} ctx - 工具执行上下文
 * @param {'front' | 'back' | 'left' | 'right' | 'top' | 'bottom'} payload - 目标视角方向
 */
const setViewAngle: ToolHandler = (ctx: ToolContext, payload?: string) => {
	void ctx;
	void payload;
	// TODO: 根据 payload 设置相机位置
};

/** 正视图 */
export const viewFront: ToolHandler = (ctx) => setViewAngle(ctx, 'front');
/** 后视图 */
export const viewBack: ToolHandler = (ctx) => setViewAngle(ctx, 'back');
/** 左视图 */
export const viewLeft: ToolHandler = (ctx) => setViewAngle(ctx, 'left');
/** 右视图 */
export const viewRight: ToolHandler = (ctx) => setViewAngle(ctx, 'right');
/** 俯视图 */
export const viewTop: ToolHandler = (ctx) => setViewAngle(ctx, 'top');
/** 仰视图 */
export const viewBottom: ToolHandler = (ctx) => setViewAngle(ctx, 'bottom');
