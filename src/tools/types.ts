import type { GLBSceneUserData } from '@/types/userdata-types';
import type * as THREE from 'three';
import type { TrackballControls } from 'three/addons/controls/TrackballControls.js';

/**
 * ToolContext - 工具执行上下文
 *
 * @description 提供工具处理器访问 3D 场景状态和操作方法的统一接口。
 * 所有字段均为 unwrapped 值，处理器无需关心 Ref 解包
 */
export interface ToolContext {
	/** Three.js 渲染器 */
	renderer: THREE.WebGLRenderer;
	/** Three.js 场景 */
	scene: THREE.Scene;
	/** Three.js 透视相机 */
	camera: THREE.PerspectiveCamera;
	/** 模型根组（已旋转 45°） */
	modelGroup: THREE.Object3D;
	/** 轨道控制器 */
	controls: TrackballControls;
	/** 模型包围盒最大边长 */
	modelSize: number;
	/** 移动速度倍率 */
	moveSpeed: number;
	/** 模型中所有 Mesh 对象的扁平数组 */
	meshes: THREE.Mesh[];
	/** 模型中所有 Mesh 对象的扁平数组 */
	lines: THREE.LineSegments[];
	/** model 包围盒 */
	box: THREE.Box3;
	/** 模型总属性 */
	sceneUserData: GLBSceneUserData;
	/** 切换移动模式 */
	setMoveMode: (_enabled: boolean) => void;
	/** 设置移动速度 */
	setMoveSpeed: (_speed: number) => void;
	/** 旋转相机到指定视角 */
	rotateToView: (_targetPosition: THREE.Vector3, _targetUp: THREE.Vector3, _duration?: number) => void;
	/** 是否开启自转 */
	autoRotate: boolean;
	/** 切换旋转状态 */
	toggleAutoRotate: () => void;
	/** 设置旋转状态 */
	setAutoRotate: (_enabled: boolean) => void;
	handleFaceClick: (_meshname: string) => void;
	/** 切换坐标系显示状态 */
	setAxesVisibe: (_meshname: boolean) => void;
	/** 插入动画 */
	addFrameTask: (_id: string, _task: FrameTask) => void;
	/** 结束动画 */
	removeFrameTask: (_id: string) => void;
	/** 临时隐藏全部线条（与 showLines 配对使用，引用计数） */
	hideLines: () => void;
	/** 撤销一次线条隐藏，计数归零时恢复原始可见性 */
	showLines: () => void;
}

/**
 * ToolHandler - 工具处理器函数签名
 *
 * @description 每个工具动作对应一个处理器函数，接收上下文和可选参数
 */
export type ToolHandler = (_ctx: ToolContext, _payload?: any) => void;

export type FrameTask = (_context: {
	delta: number; // 两帧间隔，单位：秒
	elapsed: number; // 从场景动画启动起的累计时间，单位：秒
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	modelGroup: THREE.Object3D;
}) => void;

/**
 * 模型级自定义属性
 * @description 模型级自定义属性, 包括面积、体积等基础信息
 */
export interface MeshUserData {
	/** 源 STEP 文件名(不含扩展名) */
	source: string;
	/** 模型包围盒中心 */
	modelCenter: [number, number, number];
	/** 模型三向尺寸 */
	modelSize: [number, number, number];
}

/**
 * ToolMenuMeta - 工具默认菜单元数据
 *
 * @description 工具在菜单中的默认展示与行为标记。菜单布局只引用工具 id，
 * 展示元数据以此处为唯一来源，禁止跨菜单覆盖，保证同 id 全局一致
 */
export interface ToolMenuMeta {
	/** 图标名：以 'icon-' 开头使用 iconfont 字体（public/iconfont），否则使用 SVG sprite（src/assets/svgs/） */
	icon: string;
	/** 菜单显示文本 */
	label: string;
	/** 是否为可切换激活状态的工具（点击后保持高亮） */
	activatable?: boolean;
	/** 共存组标识：同组工具效果可共存，不同组互斥。不设则默认互斥 */
	group?: string;
}

/**
 * ToolDefinition - 菜单工具定义（单一数据源）
 *
 * @description 一个菜单工具 = 一个定义对象，聚合菜单元数据、激活/恢复生命周期。
 * 注册表由定义数组自动构建，`${id}:restore` 由 deactivate 自动派生。
 * 仅描述"出现在菜单中的工具"；非菜单的自定义/传参动作见 {@link CustomAction}
 */
export interface ToolDefinition {
	/** 工具动作 id */
	id: string;
	/** 菜单展示元数据（菜单工具的展示与行为标识唯一来源） */
	menu: ToolMenuMeta;
	/** 该工具的默认颜色（供颜色选择器等 UI 初始化；可选） */
	defaultColor?: string;
	/** 激活/执行处理器 */
	activate: ToolHandler;
	/** 关闭/恢复处理器；存在时自动注册 `${id}:restore` */
	deactivate?: ToolHandler;
}

/**
 * CustomAction - 自定义动作（非菜单、可传参）
 *
 * @description 不参与菜单渲染、由业务代码直接调用的动作，例如
 * `section-plane:invert`、`section-plane:visible`、`move:setSpeed`。
 * 与菜单工具彻底分离，独立注册到动作注册表
 */
export interface CustomAction {
	/** 动作 id（业务调用标识） */
	id: string;
	/** 动作处理器（可接收 payload 传参） */
	handler: ToolHandler;
}

/**
 * ToolItem - 解析后的菜单项（供 ToolBar / RadialMenu 渲染）
 *
 * @description 展示元数据复用 {@link ToolMenuMeta}，额外携带子菜单
 */
export interface ToolItem extends ToolMenuMeta {
	/** 唯一标识符（resolveToolAction 的动作 id） */
	id: string;
	/** 子菜单项 */
	children?: ToolItem[];
}
