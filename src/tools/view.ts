import * as THREE from 'three';
import type { ToolContext, ToolHandler } from './types';
import { FACES, getFaceConfigs } from '@/utils/cube';

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

	const faceConfigs = getFaceConfigs('Y-up');
	const faceId = (FACES as any)[payload.toLocaleUpperCase()] as number;
	const config = faceConfigs[faceId];

	if (config) {
		const targetPos = new THREE.Vector3(config.position.x, config.position.y, config.position.z);
		const targetUp = new THREE.Vector3(config.up.x, config.up.y, config.up.z);
		ctx.rotateToView(targetPos, targetUp);
	}
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

export const viewOrigin: ToolHandler = (ctx) => setViewAngle(ctx, 'top_front_right_corner');
