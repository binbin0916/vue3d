// import * as THREE from 'three';
import type { ToolContext, ToolHandler, ToolDefinition } from './types';
import { defineTool } from './registry';
// import { FACES, getFaceConfigs } from '@/utils/cube';

/**
 * setViewAngle - 设置相机视角
 *
 * @description 将相机移动到指定的标准视角位置（前/后/左/右/上/下）
 *
 * @param {ToolContext} ctx - 工具执行上下文
 * @param {'front' | 'back' | 'left' | 'right' | 'top' | 'bottom'} payload - 目标视角方向
 */
const setViewAngle: ToolHandler = (ctx: ToolContext, payload?: string) => {
	if (!payload) return;
	if (payload === 'rotate') {
		ctx.setAutoRotate(true);
	} else if (payload === 'rotate:reset') {
		ctx.setAutoRotate(false);
	}

	switch (payload) {
		case 'rotate':
			ctx.setAutoRotate(true);
			break;
		case 'rotate:reset':
			ctx.setAutoRotate(false);
			break;
		case 'top_front_right_corner':
			ctx.setAutoRotate(false);
			break;
		default:
			ctx.handleFaceClick(payload);
			break;
	}

	// const faceConfigs = getFaceConfigs('Y-up');
	// const faceId = (FACES as any)[payload.toLocaleUpperCase()] as number;
	// const config = faceConfigs[faceId];

	// if (config) {
	// 	const targetPos = new THREE.Vector3(config.position.x, config.position.y, config.position.z);
	// 	const targetUp = new THREE.Vector3(config.up.x, config.up.y, config.up.z);
	// 	ctx.rotateToView(targetPos, targetUp);
	// }
};

/** 正视图 */
export const viewFront: ToolHandler = (ctx) => setViewAngle(ctx, 'Square_Face_18');
/** 后视图 */
export const viewBack: ToolHandler = (ctx) => setViewAngle(ctx, 'Square_Face_20');
/** 左视图 */
export const viewLeft: ToolHandler = (ctx) => setViewAngle(ctx, 'Square_Face_26');
/** 右视图 */
export const viewRight: ToolHandler = (ctx) => setViewAngle(ctx, 'Square_Face_11');
/** 俯视图 */
export const viewTop: ToolHandler = (ctx) => setViewAngle(ctx, 'Square_Face_14');
/** 仰视图 */
export const viewBottom: ToolHandler = (ctx) => setViewAngle(ctx, 'Square_Face_13');
/** 返回原点 */
export const viewOrigin: ToolHandler = (ctx) => setViewAngle(ctx, 'Triangle_Face_1');

/** 旋转 */
export const viewRotate: ToolHandler = (ctx) => setViewAngle(ctx, 'rotate');
/** 停止旋转 */
export const resetViewRotate: ToolHandler = (ctx) => setViewAngle(ctx, 'rotate:reset');

export const tools: ToolDefinition[] = [
	defineTool({ id: 'return-origin', menu: { icon: 'home', label: '返回原点' }, activate: viewOrigin }),
	defineTool({ id: 'view-front', menu: { icon: 'view-front', label: '正视图', group: 'view' }, activate: viewFront }),
	defineTool({ id: 'view-back', menu: { icon: 'view-back', label: '后视图', group: 'view' }, activate: viewBack }),
	defineTool({ id: 'view-left', menu: { icon: 'view-left', label: '左视图', group: 'view' }, activate: viewLeft }),
	defineTool({ id: 'view-right', menu: { icon: 'view-right', label: '右视图', group: 'view' }, activate: viewRight }),
	defineTool({ id: 'view-top', menu: { icon: 'view-top', label: '俯视图', group: 'view' }, activate: viewTop }),
	defineTool({ id: 'view-bottom', menu: { icon: 'view-bottom', label: '仰视图', group: 'view' }, activate: viewBottom }),
	defineTool({ id: 'rotate', menu: { icon: 'rotate', label: '旋转', activatable: true }, activate: viewRotate, deactivate: resetViewRotate }),
];
