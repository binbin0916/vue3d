import type { ToolContext, ToolHandler, ToolDefinition, CustomAction } from './types';
import { defineTool, defineAction } from './registry';
import { showTooltip } from '@/components/FloatTooltip/controller';
import type { GLBSolidInfo } from '@/types/userdata-types';
import * as THREE from 'three';

/**
 * getPointLineFace - 点线面属性
 *
 * @description
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const getPointLineFace: ToolHandler = (_ctx: ToolContext) => {
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

/**
 * SolidOffset - 单个实体的偏移信息
 *
 * @description 描述一个实体在"模型分离(爆炸)"中的偏移方向、倍数与几何信息
 */
export interface SolidOffset {
	/** 实体序号（对应 GLBSolidInfo.index） */
	solidIndex: number;
	/** 单位偏移方向（模型局部坐标系；主实体为 [0, 0, 0]） */
	direction: [number, number, number];
	/** 偏移倍数（默认 1；相同方向的实体依次递增以错开） */
	multiplier: number;
	/** 是否为主实体（几何中心最接近整体中心，不偏移） */
	isMain: boolean;
	/** 该实体的几何中心（模型局部坐标系） */
	center: [number, number, number];
	/** 该实体包含的所有对象（面 Mesh + 边 LineSegments） */
	objects: THREE.Object3D[];
}

// ---- 模型分离(爆炸)动画状态 ----

/** 分离成员：对象与其原始位置配对 */
interface SplitMember {
	object: THREE.Object3D;
	origin: THREE.Vector3;
}

/** 参与偏移的一个实体：成员集合 + 方向/倍数 */
interface SplitGroup {
	members: SplitMember[];
	direction: THREE.Vector3;
	multiplier: number;
	isMain: boolean;
}

/** 分离会话：缓存成员与方向，会话期间不重算（避免已位移后污染包围盒/中心） */
interface SplitSession {
	groups: SplitGroup[];
	offsets: SolidOffset[];
	/** offset 每 1 个单位对应的模型局部位移 */
	unit: number;
}

const SPLIT_FRAME_TASK_ID = 'model-split:anim';
/** 指数缓动速度（越大越快贴合目标） */
const SPLIT_EASE_K = 12;
/** 贴合目标的快照阈值（offset 单位） */
const SPLIT_SNAP_EPS = 0.05;

let splitSession: SplitSession | null = null;
let splitCurrent = 0;
let splitTarget = 0;
let splitAnimating = false;

/**
 * applySolidOffset - 按给定 offset 值写入各对象位置
 *
 * @description 位置 = 原始位置 + 方向 × (单位位移 × offset × 倍数)；主实体方向为零故不动
 *
 * @param {number} value - 当前 offset（0-100）
 */
const applySolidOffset = (value: number) => {
	const active = splitSession;
	if (!active) return;
	active.groups.forEach((group) => {
		if (group.isMain) return;
		const distance = active.unit * value * group.multiplier;
		group.members.forEach(({ object, origin }) => {
			object.position.copy(origin).addScaledVector(group.direction, distance);
		});
	});
};

/**
 * resetSolidOffset - 立即还原所有被移动对象并清空会话
 *
 * @description 将缓存原点写回对象后清空会话；无会话时为空操作（幂等）
 */
export const resetSolidOffset = () => {
	const active = splitSession;
	if (active) {
		active.groups.forEach((group) => {
			group.members.forEach(({ object, origin }) => object.position.copy(origin));
		});
	}
	splitSession = null;
	splitCurrent = 0;
	splitTarget = 0;
	splitAnimating = false;
};

/**
 * resolveMembers - 解析实体包含的面与边对象
 *
 * @description 优先按 solid.meshIds 解析：meshIds 为 glTF 节点下标，
 * 面节点在下标 0..meshs.length-1，边节点在其后（对应 lines[id - meshs.length]）；
 * 无 meshIds 的旧模型回退为按 userData.solidIndex 归组
 *
 * @param {GLBSolidInfo} solid - 实体信息
 * @param {THREE.Mesh[]} meshs - 模型全部面网格
 * @param {THREE.LineSegments[]} lines - 模型全部边
 *
 * @returns {THREE.Object3D[]} 该实体包含的面与边对象
 */
const resolveMembers = (solid: GLBSolidInfo, meshs: THREE.Mesh[], lines: THREE.LineSegments[]): THREE.Object3D[] => {
	const ids = solid.meshIds;
	if (Array.isArray(ids) && ids.length > 0) {
		return ids
			.map((id): THREE.Object3D | undefined => (id < meshs.length ? meshs[id] : lines[id - meshs.length]))
			.filter((object): object is THREE.Object3D => Boolean(object));
	}
	return [...meshs, ...lines].filter((object) => (object.userData as { solidIndex?: number }).solidIndex === solid.index);
};

/**
 * coumputedSoildOffset - 计算各实体的偏移方向与偏移倍数
 *
 * @description
 * 1. 按 meshIds 解析每个实体包含的面/边，计算其实体包围盒
 * 2. 取整体包围盒中心为"整体中心"
 * 3. 几何中心最接近整体中心的实体作为主实体，不偏移；其余实体沿
 *    (实体中心 - 整体中心) 方向朝外散开
 * 4. 偏移方向相同的多个实体，按出现顺序递增偏移倍数（默认 1）以错开
 *
 * @param {GLBSolidInfo[]} solids - 模型中各实体集合
 * @param {THREE.Mesh[]} meshs - 模型中所有面网格
 * @param {THREE.LineSegments[]} lines - 模型中所有边
 *
 * @returns {SolidOffset[]} 各实体偏移明细数组
 */
const coumputedSoildOffset = (solids: GLBSolidInfo[], meshs: THREE.Mesh[], lines: THREE.LineSegments[]): SolidOffset[] => {
	if (solids.length === 0 || meshs.length === 0) return [];

	const first = meshs[0];
	if (!first) return [];
	const parent = first.parent ?? first;
	parent.updateWorldMatrix(true, true);

	// 1. 解析成员并计算各实体包围盒（世界坐标）
	const entries = solids.map((solid) => {
		const members = resolveMembers(solid, meshs, lines);
		const box = new THREE.Box3();
		members.forEach((member) => box.expandByObject(member));
		return { solid, members, box };
	});

	// 2. 整体包围盒中心（世界 → 模型局部）
	const overallBox = new THREE.Box3();
	entries.forEach(({ box }) => {
		if (!box.isEmpty()) overallBox.union(box);
	});
	if (overallBox.isEmpty()) return [];
	const overallCenter = parent.worldToLocal(overallBox.getCenter(new THREE.Vector3()));

	// 3. 各实体几何中心（模型局部）与到整体中心的距离
	const items = entries.map(({ solid, members, box }) => {
		const center = box.isEmpty() ? overallCenter.clone() : parent.worldToLocal(box.getCenter(new THREE.Vector3()));
		const delta = center.clone().sub(overallCenter);
		return { solid, members, center, delta, distance: delta.length(), direction: new THREE.Vector3(), multiplier: 1, isMain: false };
	});

	// 4. 主实体 = 几何中心最接近整体中心者
	let mainIndex = 0;
	items.forEach((item, index) => {
		const current = items[mainIndex];
		if (current && item.distance < current.distance) mainIndex = index;
	});

	// 5. 归一化偏移方向（主实体不偏移）
	items.forEach((item, index) => {
		item.isMain = index === mainIndex;
		if (!item.isMain && item.distance > 1e-9) item.direction.copy(item.delta).normalize();
	});

	// 6. 相同方向的实体按出现顺序递增偏移倍数以错开
	const groups = new Map<string, number[]>();
	items.forEach((item, index) => {
		if (item.isMain) return;
		const key = `${item.direction.x.toFixed(3)},${item.direction.y.toFixed(3)},${item.direction.z.toFixed(3)}`;
		const group = groups.get(key);
		if (group) group.push(index);
		else groups.set(key, [index]);
	});
	groups.forEach((indices) => {
		indices.forEach((itemIndex, order) => {
			const item = items[itemIndex];
			if (item) item.multiplier = order + 1;
		});
	});

	return items.map((item) => ({
		solidIndex: item.solid.index,
		direction: [item.direction.x, item.direction.y, item.direction.z] as [number, number, number],
		multiplier: item.multiplier,
		isMain: item.isMain,
		center: [item.center.x, item.center.y, item.center.z] as [number, number, number],
		objects: item.members,
	}));
};

/**
 * ensureSplitSession - 建立分离会话（仅一次）
 *
 * @description 首次分离时解析并缓存各成员原始位置与偏移组；
 * 会话期间不再重算，避免对象被位移后世界包围盒/中心失真、方向抖动
 *
 * @param {ToolContext} ctx - 工具执行上下文
 *
 * @returns {boolean} 是否具备可分离数据（构建成功或已存在）
 */
const ensureSplitSession = (ctx: ToolContext): boolean => {
	if (splitSession) return true;

	const solids = ctx.sceneUserData?.solids ?? [];
	if (solids.length === 0) return false;

	const offsets = coumputedSoildOffset(solids, ctx.meshes, ctx.lines);
	const groups = offsets
		.filter((item) => item.objects.length > 0)
		.map<SplitGroup>((item) => ({
			members: item.objects.map((object) => ({ object, origin: object.position.clone() })),
			direction: new THREE.Vector3(item.direction[0], item.direction[1], item.direction[2]),
			multiplier: item.multiplier,
			isMain: item.isMain,
		}));
	if (groups.length === 0) return false;

	// 位移在模型局部坐标下施加，需按父级缩放换算，保证世界空间位移等于 (offset/100)×modelSize
	const parentScale = ctx.meshes[0]?.parent?.scale.x || 1;
	const unit = ctx.modelSize / (100 * parentScale);

	splitSession = { groups, offsets, unit };
	splitCurrent = 0;
	splitTarget = 0;
	return true;
};

/** startSplitFrameTask - 启动(幂等)分离逐帧动画任务 */
const startSplitFrameTask = (ctx: ToolContext) => {
	if (splitAnimating) return;
	splitAnimating = true;
	ctx.addFrameTask(SPLIT_FRAME_TASK_ID, ({ delta }) => stepModelSplit(ctx, delta));
};

/**
 * stepModelSplit - 单帧缓动逼近目标并写入位置，归零后清理会话与任务
 *
 * @param {ToolContext} ctx - 工具执行上下文
 * @param {number} delta - 距上一帧的秒数
 */
const stepModelSplit = (ctx: ToolContext, delta: number) => {
	if (!splitSession) {
		splitAnimating = false;
		ctx.removeFrameTask(SPLIT_FRAME_TASK_ID);
		return;
	}

	const diff = splitTarget - splitCurrent;
	if (Math.abs(diff) < SPLIT_SNAP_EPS) splitCurrent = splitTarget;
	else splitCurrent += diff * (1 - Math.exp(-SPLIT_EASE_K * delta));
	applySolidOffset(splitCurrent);

	// 已完全还原：清理会话并注销逐帧任务
	if (splitTarget === 0 && Math.abs(splitCurrent) < 1e-4) {
		applySolidOffset(0);
		splitSession = null;
		splitCurrent = 0;
		splitTarget = 0;
		splitAnimating = false;
		ctx.removeFrameTask(SPLIT_FRAME_TASK_ID);
	}
};

/**
 * modelSplit - 模型分离(爆炸)
 *
 * @description 设定目标 offset(0-100)，由逐帧任务指数缓动逼近：
 * 位移距离 = (offset / 100) × 模型最大边长 × 偏移倍数；
 * offset 为 0(默认) 时缓动还原至原始位置
 *
 * @param {ToolContext} ctx - 工具执行上下文
 * @param {number} [offset=0] - 偏移量，区间 0-100，外部控制
 *
 * @returns {SolidOffset[]} 各实体偏移明细数组
 */
export const modelSplit = (ctx: ToolContext, offset = 0): SolidOffset[] => {
	const value = Math.min(100, Math.max(0, offset));

	// 目标为 0 且从未开始：无需处理
	if (value <= 0 && !splitSession) return [];

	if (!ensureSplitSession(ctx)) return [];
	const active = splitSession;
	if (!active) return [];

	splitTarget = value;

	// 目标与当前一致且静止：直接落位（无需逐帧）
	if (!splitAnimating && splitCurrent === splitTarget) {
		applySolidOffset(splitCurrent);
		if (splitTarget === 0) splitSession = null;
		return active.offsets;
	}

	startSplitFrameTask(ctx);
	return active.offsets;
};

/** restoreModelSplit - 关闭模型分离工具时缓动还原所有位移 */
export const restoreModelSplit: ToolHandler = (ctx: ToolContext) => {
	modelSplit(ctx, 0);
};

export const tools: ToolDefinition[] = [
	defineTool({
		id: 'modelprop-pointLineFace',
		menu: { icon: 'icon-mesh_attribute', label: '点线面属性', activatable: true, group: 'modelprop' },
		activate: getPointLineFace,
	}),
	defineTool({
		id: 'modelprop-entity',
		menu: { icon: 'icon-entity_attribute', label: '实体属性', activatable: true, group: 'modelprop' },
		activate: getEntity,
	}),
	defineTool({
		id: 'modelprop-overall',
		menu: { icon: 'icon-total_attribute', label: '总属性', activatable: true, group: 'modelprop' },
		activate: getOverall,
	}),
	defineTool({
		id: 'model-split',
		menu: { icon: 'icon-modelSplit', label: '爆炸', activatable: true, group: 'modelprop' },
		activate: modelSplit,
		deactivate: restoreModelSplit,
	}),
];

/** model-split:offset - 外部控件(如滑杆)传入 0-100 偏移量以实时分离/还原 */
export const actions: CustomAction[] = [defineAction({ id: 'model-split:offset', handler: modelSplit })];
