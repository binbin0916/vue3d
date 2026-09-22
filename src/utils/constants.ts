/**
 * 密度列表（单位：g/cm³）
 * @label 密度名称
 * @value 密度类型
 * @density 密度值
 */
export const density = [
	{ label: '铝合金(2.7g/cm³)', value: '铝合金', density: 2.7 },
	{ label: '碳钢(7.85g/cm³)', value: '碳钢', density: 7.85 },
	{ label: '不锈钢(7.93g/cm³)', value: '不锈钢', density: 7.93 },
	{ label: '铜材(8.9g/cm³)', value: '铜材', density: 8.9 },
	{ label: '黄铜(8.5g/cm³)', value: '黄铜', density: 8.5 },
	{ label: '工程塑料(ABS)(1.05g/cm³)', value: '工程塑料(ABS)', density: 1.05 },
	{ label: '尼龙(PA12)(1.02g/cm³)', value: '尼龙(PA12)', density: 1.02 },
	{ label: '光敏树脂9600(1.15g/cm³)', value: '光敏树脂9600', density: 1.15 },
	{ label: '自定义', value: 'custom', density: null },
];

/**
 * 面的类型
 */
export const surface_type = {
	Plane: '平面',
	Cylinder: '圆柱面',
	Cone: '圆锥面',
	Sphere: '球面',
	Torus: '圆环面',
	BezierSurface: '贝塞尔曲面',
	BSplineSurface: 'B样条曲面',
	SurfaceOfRevolution: '旋转曲面',
	SurfaceOfExtrusion: '拉伸曲面',
	OffsetSurface: '偏移曲面',
	OtherSurface: '其他自定义曲面类型',
};
