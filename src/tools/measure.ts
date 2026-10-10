import type { ToolContext, ToolHandler, ToolDefinition } from './types';
import { defineTool } from './registry';

/** 激活组标识：同组互斥，保证同时只激活一种测量方式 */
const GROUP = 'measure';

/**
 * placeholderHandler - 测量占位处理器（空函数）
 *
 * @description 各测量子项的算法尚未实现，统一挂载空函数占位，
 * 后续按需替换为各自的距离 / 长度 / 角度 / 面积 / 体积等测量逻辑
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
const placeholderHandler: ToolHandler = (ctx: ToolContext) => {
	void ctx;
	// TODO: 实现对应测量
};

/**
 * clearDistance - 清空「测量 / 距离」
 *
 * @description 仅清空 测量 → 距离 分组内添加的测量结果
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
const clearDistance: ToolHandler = (ctx: ToolContext) => {
	void ctx;
	// TODO: 仅清空 测量/距离 分组内的结果
};

/**
 * clearLength - 清空「测量 / 长度」
 *
 * @description 仅清空 测量 → 长度 分组内添加的测量结果
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
const clearLength: ToolHandler = (ctx: ToolContext) => {
	void ctx;
	// TODO: 仅清空 测量/长度 分组内的结果
};

/**
 * clearAngle - 清空「测量 / 角度」
 *
 * @description 仅清空 测量 → 角度 分组内添加的测量结果
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
const clearAngle: ToolHandler = (ctx: ToolContext) => {
	void ctx;
	// TODO: 仅清空 测量/角度 分组内的结果
};

/**
 * clearMeasure - 清空「测量」全部结果
 *
 * @description 清空 测量 菜单下（含各分组）添加的全部测量结果
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
const clearMeasure: ToolHandler = (ctx: ToolContext) => {
	void ctx;
	// TODO: 清空 测量 下全部结果
};

/**
 * measureLeaf - 生成测量子项的工具定义
 *
 * @description 统一占位空函数与激活行为；子项算法待后续实现
 *
 * @param {string} id - 动作 id
 * @param {string} label - 菜单文案
 * @returns {ToolDefinition} 测量子项工具定义
 */
function measureLeaf(id: string, label: string, icon: string): ToolDefinition {
	return defineTool({ id, menu: { icon, label, activatable: true, group: GROUP }, activate: placeholderHandler });
}

/**
 * clearLeaf - 生成清空动作的工具定义
 *
 * @description 清空为一次性动作（不可激活）；handler 仅作用于其所处分组
 *
 * @param {string} id - 动作 id
 * @param {string} label - 菜单文案
 * @param {string} icon - 图标名
 * @param {ToolHandler} handler - 清空处理器
 * @returns {ToolDefinition} 清空工具定义
 */
function clearLeaf(id: string, label: string, icon: string, handler: ToolHandler): ToolDefinition {
	return defineTool({ id, menu: { icon, label }, activate: handler });
}

export const tools: ToolDefinition[] = [
	// 1.1 距离
	measureLeaf('distance-radius', '半径', 'icon-arc'),
	measureLeaf('distance-point-point', '点到点', 'icon-point_point'),
	measureLeaf('distance-point-line', '点到线', 'icon-point_line'),
	measureLeaf('distance-point-face', '点到面', 'icon-point_face'),
	measureLeaf('distance-line-line', '线到线', 'icon-line_line'),
	measureLeaf('distance-line-face', '线到面', 'icon-line_face'),
	measureLeaf('distance-face-face', '面到面', 'icon-face_face'),
	measureLeaf('distance-circle-center', '圆心距', 'icon-round_round'),
	measureLeaf('distance-axis-point', '孔轴到点', 'icon-hole_point'),
	measureLeaf('distance-axis-line', '孔轴到线', 'icon-hole_line'),
	measureLeaf('distance-axis-face', '孔轴到面', 'icon-hole_face'),
	clearLeaf('distance-clear', '清空', 'icon-clear', clearDistance),
	// 1.2 长度
	measureLeaf('length-line', '线测量', 'icon-length'),
	measureLeaf('length-perimeter', '周长', 'icon-perimeter'),
	clearLeaf('length-clear', '清空', 'icon-clear', clearLength),
	// 1.3 角度
	measureLeaf('angle-line', '线夹角', 'icon-line_angle'),
	measureLeaf('angle-face', '面夹角', 'icon-face_angle'),
	measureLeaf('angle-line-face', '线面夹角', 'icon-line_face_angle'),
	clearLeaf('angle-clear', '清空', 'icon-clear', clearAngle),
	// 1.4 半径
	measureLeaf('measure-radius', '半径', 'icon-arc'),
	// 1.5 连续测量
	measureLeaf('measure-continuous', '连续测量', 'icon-continue_distance'),
	// 1.6 壁厚
	measureLeaf('measure-thickness', '壁厚', 'icon-bihou'),
	// 1.7 面积
	measureLeaf('area-face', '指定面', 'icon-specific_face'),
	measureLeaf('area-solid', '指定实体', 'icon-specific_mesh'),
	measureLeaf('area-total', '总面积', 'icon-total_area'),
	// 1.8 体积
	measureLeaf('volume-solid', '指定实体', 'icon-specific_mesh'),
	measureLeaf('volume-total', '总体积', 'icon-total_volume'),
	// 1.9 清空
	clearLeaf('measure-clear', '清空', 'icon-clear', clearMeasure),
];
