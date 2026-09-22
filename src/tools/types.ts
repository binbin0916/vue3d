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
