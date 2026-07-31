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
	/** 是否处于移动模式 */
	isMoveMode: boolean;
	/** 移动速度倍率 */
	moveSpeed: number;
	/** 切换移动模式 */
	setMoveMode: (_enabled: boolean) => void;
	/** 设置移动速度 */
	setMoveSpeed: (_speed: number) => void;
}

/**
 * ToolHandler - 工具处理器函数签名
 *
 * @description 每个工具动作对应一个处理器函数，接收上下文和可选参数
 */
export type ToolHandler = (_ctx: ToolContext, _payload?: any) => void;
