/**
 * 真实尺寸换算工具
 *
 * @description 模型导入时会被归一化缩放到统一显示尺寸（TARGET_SIZE），
 * 场景中的几何尺寸是「显示尺寸」而非真实尺寸。此处提供由显示尺寸
 * 换算回真实尺寸（默认单位 mm）的纯函数，供测量、属性展示等场景使用。
 * 换算依据为 ToolContext.scaleFactor（= TARGET_SIZE / 原始包围盒最大边）。
 */

/**
 * 显示长度 → 真实长度
 *
 * @example
 * // 测量工具中把两点在场景坐标下的距离换算为真实长度（mm）
 * import { toRealLength } from '@/utils/measure';
 * const measureDistance: ToolHandler = (ctx, points: THREE.Vector3[]) => {
 * 	const sceneDistance = points[0].distanceTo(points[1]);
 * 	const realLength = toRealLength(sceneDistance, ctx.scaleFactor);
 * 	console.info('真实距离(mm):', realLength.toFixed(2));
 * };
 *
 * @param sceneLength 场景（显示）中的长度
 * @param scaleFactor 归一化缩放系数
 * @returns 真实长度
 */
export const toRealLength = (sceneLength: number, scaleFactor: number): number => sceneLength / scaleFactor;

/**
 * 显示面积 → 真实面积
 * @param sceneArea 场景（显示）中的面积
 * @param scaleFactor 归一化缩放系数
 * @returns 真实面积
 */
export const toRealArea = (sceneArea: number, scaleFactor: number): number => sceneArea / (scaleFactor * scaleFactor);

/**
 * 显示体积 → 真实体积
 * @param sceneVolume 场景（显示）中的体积
 * @param scaleFactor 归一化缩放系数
 * @returns 真实体积
 */
export const toRealVolume = (sceneVolume: number, scaleFactor: number): number => sceneVolume / (scaleFactor * scaleFactor * scaleFactor);
