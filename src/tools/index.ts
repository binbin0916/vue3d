import type { ToolHandler } from './types';
import { setMoveSpeed } from './move';
import { viewFront, viewBack, viewLeft, viewRight, viewTop, viewBottom, viewOrigin, viewRotate, resetViewRotate } from './view';
import { measureDistance, measureAngle, measureArea } from './measure';
import { annotateText, annotatePin } from './annotate';
import { showAxes, hideAxes } from './axes';
import { sectionPlane, sectionSphere, sectionReset, sectionResetPosition, sectionInvert, sectionVisible } from './section';
import { materialWireframe, materialXray, materialNormal, materialSolid, restoreMaterial } from './material';
import { exportScreenshot, exportGlb, exportGltf } from './export';

/**
 * toolRegistry - 工具动作注册表
 *
 * @description 将 ToolBar 发出的 action 字符串映射到对应的处理器函数。
 * 新增工具时只需：1) 创建处理器文件  2) 在此注册
 */
export const toolRegistry: Record<string, ToolHandler> = {
	// 返回原点
	'return-origin': viewOrigin,
	// 移动
	'move:setSpeed': setMoveSpeed,

	// 旋转
	rotate: viewRotate,
	'rotate:restore': resetViewRotate,

	// 坐标系
	axes: showAxes,
	'axes:restore': hideAxes,

	// 视角
	'view-front': viewFront,
	'view-back': viewBack,
	'view-left': viewLeft,
	'view-right': viewRight,
	'view-top': viewTop,
	'view-bottom': viewBottom,

	// 测量
	'measure-distance': measureDistance,
	'measure-angle': measureAngle,
	'measure-area': measureArea,

	// 标注
	'annotate-text': annotateText,
	'annotate-pin': annotatePin,

	// 剖切
	'section-plane': sectionPlane,
	'section-plane:restore': sectionReset,
	'section-sphere': sectionSphere,
	'section-sphere:restore': sectionReset,
	'section-plane:invert': sectionInvert,
	'section-plane:visible': sectionVisible,
	'section-plane:reset': sectionResetPosition,

	// 材质
	'material-wireframe': materialWireframe,
	'material-wireframe:restore': restoreMaterial,
	'material-xray': materialXray,
	'material-xray:restore': restoreMaterial,
	'material-normal': materialNormal,
	'material-normal:restore': restoreMaterial,
	'material-solid': materialSolid,
	'material-solid:restore': restoreMaterial,
	'material:restore': restoreMaterial,

	// 导出
	'export-screenshot': exportScreenshot,
	'export-glb': exportGlb,
	'export-gltf': exportGltf,
};

export type { ToolContext, ToolHandler } from './types';
