import type { ToolContext, ToolHandler } from './types';
import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { ref, shallowRef } from 'vue';
import { getBoundingBoxPoints, createLine2FromVertices } from '@/utils/common';

const planes = ref<THREE.Plane[]>([]);
const _planeObjects = ref<THREE.Mesh[]>([]);
const _sliceGroup = shallowRef<THREE.Group>({} as THREE.Group);
const _poGroup = shallowRef<THREE.Group>({} as THREE.Group);
const utilGroup = shallowRef<THREE.Group>({} as THREE.Group);
const transformControls = shallowRef<TransformControls | null>(null);
const transformHelper = shallowRef<THREE.Object3D | null>(null);

/**
 * sectionPlane - 平面剖切
 *
 * @description 沿 坐标轴 方向创建剖切平面，切除平面一侧的模型部分
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const sectionPlane: ToolHandler = (ctx: ToolContext) => {
	// TODO: 实现平面剖切

	// 创建包围盒
	initBoundBox(ctx);

	// 初始化控制器
	initControls(ctx);

	// 初始化切割面
	planes.value = [
		new THREE.Plane(new THREE.Vector3(-1, 0, 0), ctx.box.min.x), // -x
		new THREE.Plane(new THREE.Vector3(0, -1, 0), ctx.box.min.y), // -y
		new THREE.Plane(new THREE.Vector3(0, 0, -1), ctx.box.min.z), // -z

		new THREE.Plane(new THREE.Vector3(1, 0, 0), -ctx.box.max.x), // x
		new THREE.Plane(new THREE.Vector3(0, 1, 0), -ctx.box.max.y), // y
		new THREE.Plane(new THREE.Vector3(0, 0, 1), -ctx.box.max.z), // z
	];
	planes.value.forEach((item) => {
		item.applyMatrix4(new THREE.Matrix4().copy(ctx.modelGroup.matrixWorld));
	});
};

/**
 * sectionPlane - 球形剖切
 *
 * @description
 *
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const sectionSphere: ToolHandler = (ctx: ToolContext) => {
	void ctx;
	// TODO: 实现球形剖切
};

/**
 * sectionReset - 关闭剖切
 * @param {ToolContext} ctx - 工具执行上下文
 */
export const sectionReset: ToolHandler = (ctx: ToolContext) => {
	// TODO: 关闭剖切
	planesVisible.value = true;
	disposeControls(ctx);
};

/**
 * 反装剖面
 */
export const sectionInvert: ToolHandler = () => {
	planes.value.forEach((plane) => {
		plane.negate();
	});
};

// 剖切面可见状态：true=可见，false=隐藏
const planesVisible = ref(true);

/**
 * sectionVisible - 切换剖切面可见性
 *
 * @description 点击切换 utilGroup 中所有 plane-* 物体的透明度
 * - 可见→隐藏：透明度变为 0
 * - 隐藏→可见：透明度恢复为 0.05
 */
export const sectionVisible: ToolHandler = () => {
	const planeObjects = utilGroup.value.children.filter((item) => item.name.startsWith('plane-'));

	planeObjects.forEach((item) => {
		const mat = (item as THREE.Mesh).material as THREE.MeshBasicMaterial;
		if (planesVisible.value) {
			mat.opacity = 0;
		} else {
			mat.opacity = 0.05;
		}
	});

	planesVisible.value = !planesVisible.value;
};

// ======================================= 内部工具函数 =========================================================

// 初始化控制器
const initControls = (ctx: ToolContext) => {
	disposeControls(ctx);

	const control = new TransformControls(ctx.camera, ctx.renderer.domElement);
	const helper = control.getHelper();

	transformControls.value = control;
	transformHelper.value = helper;

	control.setSpace('local');
	control.setMode('translate'); // 也可为 'rotate' 或 'scale'
	control.attach(utilGroup.value);

	hideNegativeTranslateArrows(control);

	ctx.scene.add(helper);

	control.addEventListener('dragging-changed', (event) => {
		ctx.controls.enabled = !event.value;
	});
	control.addEventListener('change', () => { });
};

// 中止剖切
const disposeControls = (ctx: ToolContext) => {
	const control = transformControls.value;
	const helper = transformHelper.value;

	if (!control || !helper) return;

	control.detach();
	ctx.scene.remove(helper);
	control.dispose();

	transformControls.value = null;
	transformHelper.value = null;

	// 清空utilsGroup
	ctx.modelGroup.remove(utilGroup.value);
	utilGroup.value = {} as THREE.Group;

	planes.value.length = 0;
};

/**
 * 仅移除 translate gizmo 的 -X、-Y、-Z 可视箭头；不影响正轴和拖拽功能。
 */
const hideNegativeTranslateArrows = (control: TransformControls) => {
	type GizmoInternals = THREE.Object3D & {
		gizmo?: { translate?: THREE.Object3D };
	};

	const gizmo = control.getHelper().getObjectByProperty('isTransformControlsGizmo', true) as GizmoInternals | undefined;

	const translateGroup = gizmo?.gizmo?.translate;
	if (!translateGroup) {
		console.warn('未找到 TransformControls 的 translate gizmo。');
		return;
	}

	const center = new THREE.Vector3();

	for (const handle of translateGroup.children) {
		if (!(handle instanceof THREE.Mesh)) continue;
		if (handle.name !== 'X' && handle.name !== 'Y' && handle.name !== 'Z') continue;

		handle.geometry.computeBoundingBox();
		const box = handle.geometry.boundingBox;
		if (!box) continue;

		box.getCenter(center);
		const axis = handle.name.toLowerCase() as 'x' | 'y' | 'z';

		if (center[axis] < 0) {
			handle.removeFromParent();
		}
	}
};

/**
 * 初始化包围盒
 */
const initBoundBox = (ctx: ToolContext) => {
	utilGroup.value = new THREE.Group();

	// 轮廓
	const { vertices, edges } = getBoundingBoxPoints(ctx.box);
	const line2 = createLine2FromVertices(vertices, edges, {
		color: 0xffff00,
		lineWidth: 4,
		opacity: 1,
	});
	utilGroup.value.add(line2);

	const planeMeshs = createBoundPlane(ctx);
	utilGroup.value.add(...planeMeshs);

	ctx.modelGroup.add(utilGroup.value);
};

const createBoundPlane = (ctx: ToolContext): THREE.Mesh[] => {
	const size = new THREE.Vector3();
	ctx.box.getSize(size);

	const geoZ = new THREE.PlaneGeometry(size.x, size.y);
	const geoY = new THREE.PlaneGeometry(size.x, size.z);
	const geoX = new THREE.PlaneGeometry(size.z, size.y);

	const mat = new THREE.MeshBasicMaterial({
		color: 0xffff00,
		side: THREE.DoubleSide,
		transparent: true,
		opacity: 0.05,
		polygonOffset: true,
		polygonOffsetFactor: -1,
		polygonOffsetUnits: -1,
	});

	// 平面 Z
	const planeZ1 = new THREE.Mesh(geoZ, mat);
	planeZ1.name = 'plane-z1';
	planeZ1.position.z = size.z / 2;
	// 平面 -Z
	const planeZ2 = new THREE.Mesh(geoZ, mat);
	planeZ2.name = 'plane-z2';
	planeZ2.position.z = -size.z / 2;

	// 平面 Y
	const planeY1 = new THREE.Mesh(geoY, mat);
	planeY1.name = 'plane-y1';
	planeY1.position.y = size.y / 2;
	planeY1.rotation.set(Math.PI / 2, 0, 0);

	// 平面 -Y
	const planeY2 = new THREE.Mesh(geoY, mat);
	planeY2.name = 'plane-y2';
	planeY2.position.y = -size.y / 2;
	planeY2.rotation.set(Math.PI / 2, 0, 0);

	// 平面 X
	const planeX1 = new THREE.Mesh(geoX, mat);
	planeX1.name = 'plane-x1';
	planeX1.position.x = size.x / 2;
	planeX1.rotation.set(0, Math.PI / 2, 0);

	// 平面 -X
	const planeX2 = new THREE.Mesh(geoX, mat);
	planeX2.name = 'plane-x2';
	planeX2.position.x = -size.x / 2;
	planeX2.rotation.set(0, Math.PI / 2, 0);

	return [planeZ1, planeZ2, planeY1, planeY2, planeX1, planeX2];
};
