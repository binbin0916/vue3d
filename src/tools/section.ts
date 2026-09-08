import type { ToolContext, ToolHandler } from './types';
import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { ref, shallowRef } from 'vue';
import { getBoundingBoxPoints, createLine2FromVertices } from '@/utils/common';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ======================================= 状态 =========================================================

const planes = ref<THREE.Plane[]>([]);
const utilGroup = shallowRef<THREE.Group>({} as THREE.Group);
const sliceObject = shallowRef<THREE.Group>({} as THREE.Group);
const poGroup = shallowRef<THREE.Group>({} as THREE.Group);
const transformControls = shallowRef<TransformControls | null>(null);
const transformHelper = shallowRef<THREE.Object3D | null>(null);

const stencilGroups = ref<THREE.Group[]>([]);
const planeObjects = ref<THREE.Mesh[]>([]);

// 保存上下文引用，供逐帧任务使用
let savedCtx: ToolContext | null = null;

/**
 * 逐帧同步任务 ID
 */
const PLANE_SYNC_TASK_ID = 'section-plane-sync';

/**
 * 视觉辅助面 name → planes 数组下标的映射
 *
 * planes 默认顺序：0:-x, 1:-y, 2:-z, 3:+x, 4:+y, 5:+z
 */
const VISUAL_PLANE_TO_INDEX: Record<string, number> = {
	'plane-x1': 3,
	'plane-x2': 0,
	'plane-y1': 4,
	'plane-y2': 1,
	'plane-z1': 5,
	'plane-z2': 2,
};

/**
 * 局部坐标系下各辅助面对应的轴对齐法线（指向盒内/模型中心）
 *
 * 1 = 正方向侧面（如 plane-x1 在 +x 处），法线指向 -x（朝内）
 * 2 = 负方向侧面（如 plane-x2 在 -x 处），法线指向 +x（朝内）
 *
 * three.js 裁剪保留 n·p + c > 0 的一侧。
 * 法线朝内 → 保留盒内（未切除部分）；反转后法线朝外 → 保留盒外（已切除部分）。
 */
const PLANE_LOCAL_NORMALS: Record<string, THREE.Vector3> = {
	'plane-x1': new THREE.Vector3(-1, 0, 0),
	'plane-x2': new THREE.Vector3(1, 0, 0),
	'plane-y1': new THREE.Vector3(0, -1, 0),
	'plane-y2': new THREE.Vector3(0, 1, 0),
	'plane-z1': new THREE.Vector3(0, 0, -1),
	'plane-z2': new THREE.Vector3(0, 0, 1),
};

// ======================================= 公开 API =========================================================

/**
 * sectionPlane - 平面剖切
 *
 * @description 沿坐标轴方向创建剖切平面，切除平面一侧的模型部分。
 * 使用 stencil 缓冲标记模型截面，在截面处绘制填充面（cut-face fill）。
 *
 * 平面（THREE.Plane）根据 utilGroup 中辅助面的位置实时生成，
 * 无论 TransformControls 将 utilGroup 移动到任意坐标或角度，平面始终保持一致。
 */
export const sectionPlane: ToolHandler = (ctx: ToolContext) => {
	savedCtx = ctx;

	// 创建包围盒（utilGroup + 辅助面）
	initBoundBox(ctx);

	// 初始化 TransformControls
	initControls(ctx);

	// 初始化6个裁剪平面
	// 初始法线和位置将在第一帧由 syncPlanesFromVisualPlanes 设置
	planes.value = Array.from({ length: 6 }, () => new THREE.Plane(new THREE.Vector3(0, 0, 0), 0));

	// 将裁剪平面应用到模型材质（真正的裁剪）
	applyClippingToModel(ctx);

	// stencil 初始化延迟到第一帧 plane 同步之后，
	// 避免 planes 全为 (0,0,0,0) 时创建错误的裁剪/stencil。
	let stencilReady = false;

	// 注册逐帧任务：每帧同步 planes → 辅助面位置 + 截面填充面定位
	ctx.addFrameTask(PLANE_SYNC_TASK_ID, () => {
		syncPlanesFromVisualPlanes();

		if (!stencilReady && planes.value[0] && planes.value[0].normal.lengthSq() > 0) {
			stencilReady = true;
			initStencilFills(ctx);
		}

		if (stencilReady) {
			updateStencilPolygonPositions();
		}
	});
};

/**
 * sectionResetPosition - 重置剖切位置
 */
export const sectionResetPosition: ToolHandler = (ctx: ToolContext) => {
	void ctx;
	utilGroup.value.position.set(0, 0, 0);
};

/**
 * sectionSphere - 球形剖切（未实现）
 */
export const sectionSphere: ToolHandler = (ctx: ToolContext) => {
	void ctx;
};

/**
 * sectionReset - 关闭剖切，恢复模型原始状态
 */
export const sectionReset: ToolHandler = (ctx: ToolContext) => {
	planesVisible.value = true;
	ctx.removeFrameTask(PLANE_SYNC_TASK_ID);
	savedCtx = null;
	removeClippingFromModel(ctx);
	disposeStencilFills();
	disposeControls(ctx);
};

/**
 * sectionInvert - 反转剖切方向（翻转所有平面法线）
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
 */
export const sectionVisible: ToolHandler = () => {
	// 切换截面填充面（po）可见性
	planeObjects.value.forEach((po) => {
		po.visible = planesVisible.value;
	});

	// 切换辅助面可见性
	utilGroup.value.children.forEach((child) => {
		if (child.name.startsWith('plane-') && child instanceof THREE.Mesh) {
			const mat = child.material as THREE.MeshBasicMaterial;
			mat.opacity = planesVisible.value ? 0 : 0.05;
		}
	});

	// 切换线框可见性
	utilGroup.value.children.forEach((child) => {
		if ((child as any).isLineSegments2 === true || child instanceof THREE.LineSegments) {
			child.visible = !planesVisible.value;
		}
	});

	planesVisible.value = !planesVisible.value;
};

// ======================================= 内部：材质裁剪 =========================================================

const applyClippingToModel = (ctx: ToolContext) => {
	ctx.meshes.forEach((child) => {
		if (child instanceof THREE.Mesh) {
			const materials = Array.isArray(child.material) ? child.material : [child.material];
			materials.forEach((mat) => {
				if (mat instanceof THREE.Material) {
					mat.clippingPlanes = planes.value;
					mat.clipShadows = true;
					mat.needsUpdate = true;
				}
			});
		}
	});

	// ctx.modelGroup.traverse((child) => {
	// 	if (child instanceof THREE.Mesh) {
	// 		const materials = Array.isArray(child.material) ? child.material : [child.material];
	// 		materials.forEach((mat) => {
	// 			if (mat instanceof THREE.Material) {
	// 				mat.clippingPlanes = planes.value;
	// 				mat.clipShadows = true;
	// 				mat.needsUpdate = true;
	// 			}
	// 		});
	// 	}
	// });
};

const removeClippingFromModel = (ctx: ToolContext) => {
	ctx.modelGroup.traverse((child) => {
		if (child instanceof THREE.Mesh) {
			const materials = Array.isArray(child.material) ? child.material : [child.material];
			materials.forEach((mat) => {
				if (mat instanceof THREE.Material) {
					mat.clippingPlanes = [];
					mat.clipShadows = false;
					mat.needsUpdate = true;
				}
			});
		}
	});
};

// ======================================= 内部：TransformControls =========================================================

const initControls = (ctx: ToolContext) => {
	disposeControls(ctx);

	const control = new TransformControls(ctx.camera, ctx.renderer.domElement);
	const helper = control.getHelper();

	transformControls.value = control;
	transformHelper.value = helper;

	control.setSpace('local');
	control.setMode('translate');
	control.attach(utilGroup.value);

	hideNegativeTranslateArrows(control);

	ctx.scene.add(helper);

	control.addEventListener('dragging-changed', (event) => {
		ctx.controls.enabled = !event.value;
	});
	control.addEventListener('change', () => { });
};

const disposeControls = (ctx: ToolContext) => {
	const control = transformControls.value;
	const helper = transformHelper.value;

	if (!control || !helper) return;

	control.detach();
	ctx.scene.remove(helper);
	control.dispose();

	transformControls.value = null;
	transformHelper.value = null;

	ctx.modelGroup.remove(utilGroup.value);
	utilGroup.value = {} as THREE.Group;

	ctx.modelGroup.remove(sliceObject.value);
	sliceObject.value = {} as THREE.Group;

	ctx.scene.remove(poGroup.value);
	poGroup.value = {} as THREE.Group;

	planes.value.length = 0;
};

const hideNegativeTranslateArrows = (control: TransformControls) => {
	type GizmoInternals = THREE.Object3D & {
		gizmo?: { translate?: THREE.Object3D };
	};

	const gizmo = control.getHelper().getObjectByProperty('isTransformControlsGizmo', true) as GizmoInternals | undefined;

	const translateGroup = gizmo?.gizmo?.translate;
	if (!translateGroup) return;

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

// ======================================= 内部：包围盒 + 辅助面 =========================================================

const initBoundBox = (ctx: ToolContext) => {
	utilGroup.value = new THREE.Group();

	// 轮廓线框
	const { vertices, edges } = getBoundingBoxPoints(ctx.box);
	const line2 = createLine2FromVertices(vertices, edges, {
		color: 0xffff00,
		lineWidth: 2,
		opacity: 1,
	});
	// 关闭深度测试/写入：Line2 使用 screen-space quad 渲染，
	// shader 会调整 gl_Position 深度（LineMaterial L190），
	// 与同位置的辅助面三角形产生 Z-Fighting。
	// 纯视觉引导层，无需参与深度比较。
	line2.material.depthTest = false;
	line2.material.depthWrite = false;
	line2.renderOrder = 1;
	utilGroup.value.add(line2);

	// 6个辅助面
	const planeMeshs = createBoundPlane(ctx);

	planeMeshs.forEach((item) => {
		item.renderOrder = 2;
	});
	utilGroup.value.add(...planeMeshs);

	// utilGroup 使用 modelGroup 的旋转，保持局部坐标系一致
	utilGroup.value.rotation.copy(ctx.modelGroup.rotation);
	ctx.modelGroup.attach(utilGroup.value);
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
		// 关闭深度测试/写入：纯视觉引导层，避免与 Line2 Z-Fighting。
		depthTest: false,
		depthWrite: false,
	});

	// +Z 面（plane-z1）
	const planeZ1 = new THREE.Mesh(geoZ, mat.clone());
	planeZ1.name = 'plane-z1';
	planeZ1.position.z = size.z / 2;

	// -Z 面（plane-z2）
	const planeZ2 = new THREE.Mesh(geoZ, mat.clone());
	planeZ2.name = 'plane-z2';
	planeZ2.position.z = -size.z / 2;

	// +Y 面（plane-y1）
	const planeY1 = new THREE.Mesh(geoY, mat.clone());
	planeY1.name = 'plane-y1';
	planeY1.position.y = size.y / 2;
	planeY1.rotation.set(Math.PI / 2, 0, 0);

	// -Y 面（plane-y2）
	const planeY2 = new THREE.Mesh(geoY, mat.clone());
	planeY2.name = 'plane-y2';
	planeY2.position.y = -size.y / 2;
	planeY2.rotation.set(Math.PI / 2, 0, 0);

	// +X 面（plane-x1）
	const planeX1 = new THREE.Mesh(geoX, mat.clone());
	planeX1.name = 'plane-x1';
	planeX1.position.x = size.x / 2;
	planeX1.rotation.set(0, Math.PI / 2, 0);

	// -X 面（plane-x2）
	const planeX2 = new THREE.Mesh(geoX, mat.clone());
	planeX2.name = 'plane-x2';
	planeX2.position.x = -size.x / 2;
	planeX2.rotation.set(0, Math.PI / 2, 0);

	return [planeZ1, planeZ2, planeY1, planeY2, planeX1, planeX2];
};

// ======================================= 内部：Stencil Fill =========================================================

/**
 * 创建 stencil 标记组：仅渲染 BackSide，在裁剪平面处标记模型截面。
 *
 * 原理：
 * - stencil 组使用 depthTest: true，因此只有通过深度测试的片段才写入 stencil
 * - 在截面处，模型被裁剪，无深度值 → 背面通过深度测试 → stencil +1
 * - 在模型表面，模型已有深度值 → 背面在模型后面 → 深度测试失败 → stencil 不变
 * - 这样 stencil 仅在截面处非零
 */
const createPlaneStencilGroup = (geometry: THREE.BufferGeometry, plane: THREE.Plane, renderOrder: number): THREE.Group => {
	const group = new THREE.Group();
	const baseMat = new THREE.MeshBasicMaterial();
	baseMat.depthWrite = false;
	baseMat.depthTest = false;
	baseMat.colorWrite = false;
	baseMat.stencilWrite = true;
	baseMat.stencilFunc = THREE.AlwaysStencilFunc;

	// back faces
	const mat0 = baseMat.clone();
	mat0.side = THREE.BackSide;
	mat0.clippingPlanes = [plane];
	mat0.stencilFail = THREE.IncrementWrapStencilOp;
	mat0.stencilZFail = THREE.IncrementWrapStencilOp;
	mat0.stencilZPass = THREE.IncrementWrapStencilOp;

	const mesh0 = new THREE.Mesh(geometry, mat0);
	mesh0.renderOrder = renderOrder;
	group.add(mesh0);

	// front faces
	const mat1 = baseMat.clone();
	mat1.side = THREE.FrontSide;
	mat1.clippingPlanes = [plane];
	mat1.stencilFail = THREE.DecrementWrapStencilOp;
	mat1.stencilZFail = THREE.DecrementWrapStencilOp;
	mat1.stencilZPass = THREE.DecrementWrapStencilOp;

	const mesh1 = new THREE.Mesh(geometry, mat1);
	mesh1.renderOrder = renderOrder;

	group.add(mesh1);

	return group;
};

/**
 * 初始化截面填充面（cut-face fill）
 *
 * 为每个裁剪平面创建：
 * 1. stencilGroup → sliceObject（modelGroup 子级，与模型同空间）
 *    不可见，用 stencil 缓冲标记模型截面区域
 * 2. po → poGroup（scene 子级，world 空间定位）
 *    截面填充面，使用 stencil ref 检测只在截面处绘制
 *
 * 使用包围盒对角线作为填充面尺寸。
 */
const initStencilFills = (ctx: ToolContext) => {
	disposeStencilFills();

	const geometries = ctx.meshes.map((item) => item.geometry);
	let geometry: THREE.BufferGeometry;
	if (geometries.length > 1) {
		geometry = mergeGeometries(geometries, false);
	} else {
		geometry = geometries[0] as THREE.BufferGeometry;
	}

	const firstMesh = ctx.meshes[0];
	if (!firstMesh) return;

	sliceObject.value = new THREE.Group();
	ctx.modelGroup.add(sliceObject.value);

	const stencilGroupArr: THREE.Group[] = [];
	const stencilPolygonArr: THREE.Mesh[] = [];

	// 使用包围盒对角线长度作为填充面尺寸，确保覆盖整个截面
	const size = new THREE.Vector3();
	ctx.box.getSize(size);
	const diag = size.length() * 1.5;
	const fillGeometry = new THREE.PlaneGeometry(diag, diag);

	poGroup.value = new THREE.Group();
	for (let i = 0; i < planes.value.length; i++) {
		const plane = planes.value[i]!;

		// 创建 stencil 标记组（仅 BackSide，depthTest: true）
		const stencilGrp = createPlaneStencilGroup(geometry.clone(), plane, i + 1);
		sliceObject.value.add(stencilGrp);
		stencilGroupArr.push(stencilGrp);

		// 创建填充面：被其余5个平面裁剪，stencil != 0 时绘制
		const otherPlanes = planes.value.filter((p) => p !== plane) as THREE.Plane[];
		const poMat = new THREE.MeshBasicMaterial({
			color: 0xb7b7b7,
			clippingPlanes: otherPlanes,
			stencilWrite: true,
			stencilRef: 0,
			stencilFunc: THREE.NotEqualStencilFunc,
			stencilFail: THREE.ReplaceStencilOp,
			stencilZFail: THREE.ReplaceStencilOp,
			stencilZPass: THREE.ReplaceStencilOp,
			// 使用 polygonOffset 避免 Z-fighting
			polygonOffset: true,
			polygonOffsetFactor: -1,
			polygonOffsetUnits: -1,
		});

		const po = new THREE.Mesh(fillGeometry, poMat);
		po.onAfterRender = function (renderer) {
			renderer.clearStencil();
		};
		po.renderOrder = i + 1.1;
		// po.visible = planesVisible.value;

		poGroup.value.add(po);
		stencilPolygonArr.push(po);
	}
	ctx.scene.add(poGroup.value);

	stencilGroups.value = stencilGroupArr;
	planeObjects.value = stencilPolygonArr;
};

const disposeStencilFills = () => {
	for (const grp of stencilGroups.value) {
		grp.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				child.geometry?.dispose();
				if (Array.isArray(child.material)) {
					child.material.forEach((m) => m.dispose());
				} else {
					child.material?.dispose();
				}
			}
		});
		sliceObject.value.remove(grp);
	}

	const fillGeometries = new Set<THREE.BufferGeometry>();

	for (const po of planeObjects.value) {
		fillGeometries.add(po.geometry);
		if (Array.isArray(po.material)) {
			po.material.forEach((m) => m.dispose());
		} else {
			po.material?.dispose();
		}
		poGroup.value.remove(po);
	}
	fillGeometries.forEach((g) => g.dispose());

	stencilGroups.value = [];
	planeObjects.value = [];

	if (sliceObject.value.parent) {
		sliceObject.value.parent.remove(sliceObject.value);
	}
	sliceObject.value = {} as THREE.Group;

	if (poGroup.value.parent) {
		poGroup.value.parent.remove(poGroup.value);
	}
	poGroup.value = {} as THREE.Group;
};

// ======================================= 逐帧同步 =========================================================

/**
 * 逐帧同步：从 utilGroup 中辅助面的位置/角度生成 THREE.Plane（world-space）
 *
 * 关键逻辑（参考 example/myview.js updateSlicePlaneX/_X/Z/_Z/Y/_Y）：
 *
 * ① 获取辅助面的 worldPosition
 * ② 获取 modelGroup 的 worldQuaternion（**不是**辅助面自身的 quaternion，
 *    因为辅助面 mesh 有几何旋转 PI/2，会污染法线方向）
 * ③ 用局部法线 × modelGroup 世界旋转 → world-space 法线
 * ④ constant = -worldNormal · worldPosition（确保平面方程一致）
 *
 * 这样无论 TransformControls 将 utilGroup 移动到任意坐标或旋转角度，
 * THREE.Plane 始终与辅助面保持一致。
 */
const syncPlanesFromVisualPlanes = () => {
	if (!savedCtx || !planes.value.length) return;

	// modelGroup 的世界旋转（只用这个，不用辅助面自身的 quaternion）
	const modelWorldQuat = new THREE.Quaternion();
	savedCtx.modelGroup.getWorldQuaternion(modelWorldQuat);

	const worldPosition = new THREE.Vector3();
	const worldNormal = new THREE.Vector3();

	// 遍历 utilGroup 中所有辅助面
	utilGroup.value.children.forEach((child) => {
		if (!child.name.startsWith('plane-')) return;

		const targetIndex = VISUAL_PLANE_TO_INDEX[child.name];
		if (targetIndex === undefined) return;

		const targetPlane = planes.value[targetIndex];
		if (!targetPlane) return;

		const localNormal = PLANE_LOCAL_NORMALS[child.name];
		if (!localNormal) return;

		// ① 辅助面的 world-space 位置
		child.getWorldPosition(worldPosition);

		// ② 局部法线 × modelGroup 世界旋转 → world-space 法线
		worldNormal.copy(localNormal).applyQuaternion(modelWorldQuat);

		// ③ 用 world-space 法线和位置构建平面
		//    constant = -normal · point（平面方程 n·p + c = 0）
		targetPlane.normal.copy(worldNormal);

		// targetPlane.constant = -worldNormal.dot(worldPosition);
		// 在法线方向移动距离，避免z-fighting
		const offsetPosition = worldPosition.clone().add(worldNormal.clone().multiplyScalar(-0.0001));
		targetPlane.constant = -worldNormal.dot(offsetPosition);
	});
};

/**
 * 逐帧定位截面填充面（po）到对应裁剪平面上
 *
 * 参考 example/myview.js updateSlicePlane()：
 * plane.coplanarPoint(po.position) → 将 po 定位到平面上的任意一点
 * po.lookAt(po.position - plane.normal) → 使 po 正对截面
 */
const updateStencilPolygonPositions = () => {
	for (let i = 0; i < planeObjects.value.length; i++) {
		const plane = planes.value[i];
		const po = planeObjects.value[i];
		if (!plane || !po) continue;

		// 定位到平面上
		plane.coplanarPoint(po.position);
		// 朝向法线反向（使 po 正对截面）
		po.lookAt(po.position.x - plane.normal.x, po.position.y - plane.normal.y, po.position.z - plane.normal.z);
	}
};
