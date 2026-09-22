/**
 * GLB UserData 类型定义(scene 级 + mesh 级)
 *
 * 对应文档: `docs/glb-userdata-fields.md`
 * 适用范围: `export_glb.py`(commit `d1d68be` 起)导出的 GLB。
 *
 * three.js GLTFLoader 加载后:
 *   glTF scene 级 extras  -> THREE.Group.userData   (GLBSceneUserData)
 *   glTF mesh 级 extras   -> THREE.Mesh.userData    (GLBMeshUserData)
 *   每 STEP 面 = 一个独立 glTF Mesh, 面级数据全部在 mesh.userData。
 *
 * 口径约定(两套数值相差约 0.1%~0.3%, 不可混用):
 *   - BRep 精确(几何真值):  scene.totalArea/totalVolume, mesh.areaExact/mesh.volume
 *   - 渲染网格(前端/参考 GLB 同口径): scene.totalAreaMesh/totalVolumeMesh, mesh.area/mesh.volumeMesh
 *
 * 单位: 长度 mm, 面积 mm², 体积 mm³; 角度 弧度。
 */

/** 3D 坐标(value: [x, y, z], 均为相对模型中心的偏移量) */
export type Vec3 = [number, number, number];

/** 线性 RGBA(value: [r, g, b, a], 各通道 0–1, 线性空间非 sRGB) */
export type Vec4 = [number, number, number, number];

/** 包围盒(value: minimum/maximum 均为 [x, y, z]) */
export interface BBox3 {
	/** value: [x, y, z] — 最小角点坐标 */
	minimum: Vec3;
	/** value: [x, y, z] — 最大角点坐标 */
	maximum: Vec3;
}

/** 4x3 行主序矩阵(value: 4 行 × 3 列, 来自 OCC gp_Trsf; 3 行为旋转缩放, 末行为位移) */
export type Matrix4x3 = [Vec3, Vec3, Vec3, Vec3];

/** 曲面类型(value 取值, 来自 OCC GeomAbs_* 映射) */
export type ShapeType =
	| 'Plane' // 平面
	| 'Cylinder' // 圆柱面
	| 'Cone' // 圆锥面
	| 'Sphere' // 球面
	| 'Torus' // 圆环面
	| 'BezierSurface' // 贝塞尔曲面
	| 'BSplineSurface' // B 样条曲面
	| 'SurfaceOfRevolution' // 旋转曲面
	| 'SurfaceOfExtrusion' // 拉伸曲面
	| 'OffsetSurface' // 偏移曲面
	| 'OtherSurface'; // 其他自定义曲面类型

/** 面拓扑方向(value 取值; REVERSED 的面导出时已翻转三角形绕序, 渲染法线朝外) */
export type FaceOrientation =
	| 'FORWARD' // 正向
	| 'REVERSED' // 反向
	| 'INTERNAL'; // 内部

/** 面积/体积来源标记(value 取值) */
export type BRepSource =
	| 'brep_exact' // BRep 精确积分(自适应 Gauss, 几何真值)
	| 'brep_repaired' // 经 ShapeFix 修复后的精确值(仅在 BRepCheck 判定无效时触发)
	| 'mesh' // 网格兜底(三角化反算, 仅闭合实体可用)
	| 'unavailable'; // 无法测量(开放壳/游离面/计算失败)

/** 面积计算口径(value 取值, scene.areaMethod) */
export type AreaMethod =
	| 'brep_exact' // 所有面均为 BRep 精确积分
	| 'brep_exact+mesh_fallback' // 含退化面/发散面回退到三角化面积
	| 'mesh'; // BRep 计算全部失败, 总面积 = Σ三角化面积

/** 体积计算口径(value 取值, scene.volumeMethod) */
export type VolumeMethod =
	| 'brep_exact' // 所有 solid 均为 BRep 精确积分
	| 'brep_exact+repaired' // 含经 ShapeFix 修复后计算的 solid
	| 'brep_exact+mesh_fallback' // 含用网格四面体法兜底的 solid
	| 'unavailable'; // 无有效闭合实体, 体积不可测

// ---------------------------------------------------------------------------
// mesh 级 (THREE.Mesh.userData, 每个 STEP 面 = 一个独立 Mesh)
// ---------------------------------------------------------------------------

/**
 * 曲面几何参数(字段按 mesh.shapeType 取用):
 *   Plane → location/normal/diameter/diameter2
 *   Cylinder → length/diameter/sweepAngle
 *   Cone → length/diameter(锥顶)/diameter2(锥底)/sweepAngle
 *   Sphere → diameter/sweepAngle/latitudinalAngle/latitudinalMinAngle
 *   Torus → diameter(小圆)/diameter2(大圆)/sweepAngle/latitudinalAngle/latitudinalMinAngle
 *   SurfaceOfRevolution → sweepAngle
 *   SurfaceOfExtrusion → length
 *   OffsetSurface → offsetValue
 */
export interface GLBGeometryParams {
	/** value: true/false — 是否为外表面(本工具恒 true) */
	outer?: boolean;
	/** value: 4x3 矩阵 — 局部曲面坐标系变换(来自 BRepAdaptor_Surface.Trsf) */
	surfaceMatrix?: Matrix4x3;
	/** value: [x, y, z] — 平面位置点(仅 Plane) */
	location?: Vec3;
	/** value: [x, y, z], 单位向量 — 平面法向(仅 Plane) */
	normal?: Vec3;
	/** value: ≥0 mm — 平面: 外接圆直径; 圆柱/球/圆锥: 直径(2r); 环面: 小圆直径 */
	diameter?: number;
	/** value: ≥0 mm — 平面: 与 diameter 相同; 圆锥: 锥底直径; 环面: 大圆直径 */
	diameter2?: number;
	/** value: ≥0 mm — 圆柱/圆锥高度(V 方向跨度); 拉伸曲面: 拉伸长度 */
	length?: number;
	/** value: 0–2π 弧度 — U 方向扫掠角度(圆柱整圈为 2π, 球/环面为经向范围) */
	sweepAngle?: number;
	/** value: 0–π 弧度 — 纬度范围上限(球/环面) */
	latitudinalAngle?: number;
	/** value: 0–π 弧度 — 纬度范围下限(球/环面) */
	latitudinalMinAngle?: number;
	/** value: ≥0 mm — 偏移曲面偏移量(仅 OffsetSurface) */
	offsetValue?: number;
	/** value: 异常消息字符串 — 参数提取失败时存在(暂未观测到实际触发) */
	_extractError?: string;
}

/** 面级数据(THREE.Mesh.userData; Mesh.name = `_<源文件名>_<面序号>`) */
export interface GLBMeshUserData {
	/** value: 见 ShapeType — 曲面类型 */
	shapeType: ShapeType;
	/** value: 见 GLBGeometryParams — 曲面几何参数 */
	geometryParams: GLBGeometryParams;
	/** value: [x, y, z], 相对模型中心 — 该面三角化网格顶点质心 */
	position: Vec3;
	/** value: {minimum, maximum} — 该面网格顶点包围盒(相对模型中心) */
	bbox: BBox3;
	/** value: ≥0 mm² — 该面渲染网格面积(三角化口径, 随 scene.deflection 变化) */
	area: number;
	/** value: ≥0 mm² — 该面 BRep 精确面积(真值; 退化面时为三角化兜底值, 计入 scene.areaFallbackFaces) */
	areaExact: number;
	/** value: "FORWARD" | "REVERSED" | "INTERNAL" — 面拓扑方向 */
	orientation: FaceOrientation;
	/** value: 4x3 矩阵或 null(单位变换) — 面 Location 的局部→世界变换 */
	matrix: Matrix4x3 | null;
	/** value: [r, g, b, a], 各通道 0–1, 线性空间 — 面颜色(与 material.baseColorFactor 同源) */
	color: Vec4;
	/** value: 0–1 — 不透明度(与 color[3] 相同) */
	opacity: number;
	/** value: 字符串或 null(无法解析时) — STEP/XCAF 面名 */
	name: string | null;
	/** value: ≥1 的整数 — STEP 面序号, 1-based(BRep 遍历顺序) */
	index: number;
	/** value: ≥0 mm³ — 所属 solid 的 BRep 精确体积(同 solid 所有面共享; 面本身无体积) */
	volume: number;
	/** value: ≥0 mm³ — 所属 solid 的网格反算体积(口径同 scene.totalVolumeMesh) */
	volumeMesh: number;
	/** value: 见 BRepSource — 体积实际来源 */
	volumeSource: BRepSource;
	/** value: ≥0 或 null(不可测) — 该 solid 体积相对误差估计 */
	volumeRelError: number | null;
	/** value: ≥0 的整数, 0-based; 游离面为 -1 — 所属 solid 序号(对应 scene.solids[].index) */
	solidIndex: number;
}

// ---------------------------------------------------------------------------
// scene 级 (THREE.Group.userData, 即 gltf.scene.userData)
// ---------------------------------------------------------------------------

/** per-solid 明细(value: scene.userData.solids[] 的元素; 仅闭合 solid 实体才有体积) */
export interface GLBSolidInfo {
	/** value: ≥0 的整数, 0-based — solid 序号(对应 mesh.solidIndex) */
	index: number;
	/** value: ≥0 mm² — 该 solid BRep 精确面积 */
	area: number;
	/** value: ≥0 mm² — 该 solid 网格三角化面积 */
	areaMesh: number;
	/** value: "brep_exact" | "mesh" — 面积来源 */
	areaSource: 'brep_exact' | 'mesh';
	/** value: ≥0 mm³ — 该 solid BRep 精确体积 */
	volume: number;
	/** value: ≥0 mm³ — 该 solid 网格反算体积 */
	volumeMesh: number;
	/** value: 见 BRepSource — 体积来源 */
	volumeSource: BRepSource;
	/** value: ≥0 或 null(不可测) — 体积相对误差估计 */
	volumeRelError: number | null;
	/** value: ≥0 的整数 — 属于该 solid 的面数 */
	faceCount: number;
	/** value: true/false — 该 solid 是否 BRep 拓扑闭合 */
	isWatertight: boolean;
}

/** 单位声明(value 恒为固定值) */
export interface GLBUnits {
	/** value: "mm" — 长度单位 */
	length: 'mm';
	/** value: "mm2" — 面积单位 */
	area: 'mm2';
	/** value: "mm3" — 体积单位 */
	volume: 'mm3';
}

/** 模型级数据(THREE.Group.userData, 即 gltf.scene.userData) */
export interface GLBSceneUserData {
	/** value: 字符串 — 源 STEP 文件名(不含扩展名), 如 "IPTH8-20" */
	source: string;
	/** value: [x, y, z] — BRep 几何包围盒中心; 所有顶点坐标已相对此点偏移(原点即此点) */
	modelCenter: Vec3;
	/** value: [dx, dy, dz], mm — 模型三向尺寸(三角化网格顶点包围盒跨度) */
	modelSize: Vec3;
	/** value: ≥0 的整数 — 面数(同时等于 GLB mesh 数与 node 数) */
	faceCount: number;
	/** value: ≥0 的整数 — 顶点数 */
	vertexCount: number;
	/** value: ≥0 的整数 — 线条数 */
	edgeCount: number;
	/** value: ≥0 的整数 — 三角面数 */
	triangleCount: number;
	/** value: ≥0 mm² — 总面积, BRep 精确; 全失败时为 Σ三角化面积(见 areaMethod) */
	totalArea: number;
	/** value: ≥0 mm³ — 总体积, BRep 精确(OnlyClosed + SkipShared; 开放面模型为 0) */
	totalVolume: number;
	/** value: 见 AreaMethod — 面积计算口径 */
	areaMethod: AreaMethod;
	/** value: 见 VolumeMethod — 体积计算口径 */
	volumeMethod: VolumeMethod;
	/** value: ≥0, 通常 1e-12 ~ 1e-3 — 所有面中最大面积相对误差估计 */
	areaRelError: number;
	/** value: ≥0 的整数 — 回退到三角化面积的面数(退化面/发散积分被拦截数) */
	areaFallbackFaces: number;
	/** value: ≥0 mm² — 渲染网格三角化总面积(与前端/参考 GLB 反算同口径) */
	totalAreaMesh: number;
	/** value: ≥0 mm³ — 渲染网格散度定理体积(仅闭合实体参与; 开放面模型为 0) */
	totalVolumeMesh: number;
	/** value: ≥0 或 null(任何 solid 均不可测) — 所有 solid 中最大体积相对误差估计 */
	volumeRelError: number | null;
	/** value: ≥0 的整数 — 体积不可测的 solid 数 */
	volumeUnavailableCount: number;
	/** value: {minimum, maximum}, mm — 整个模型包围盒(网格顶点坐标范围) */
	boundingBox: BBox3;
	/** value: 固定 {length:"mm", area:"mm2", volume:"mm3"} — 数值单位声明 */
	units: GLBUnits;
	/** value: GLBSolidInfo[] — per-solid 明细(数组长度 = solid 数) */
	solids: GLBSolidInfo[];
	/** value: true/false — 所有 solid 是否 BRep 拓扑闭合(非逐面网格闭合判定) */
	isWatertight: boolean;
	/** value: >0 mm — 最终三角化精度(微小模型 1.0 / 中型 0.1 / 大型取输入值; 超 10MB 自动增大重试 ×1.5) */
	deflection: number;
}
