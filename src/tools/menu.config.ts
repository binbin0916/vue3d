import type { MenuNode } from './registry';

/**
 * toolbarMenu - 底部工具栏菜单布局
 *
 * @description 仅声明"出现在哪、顺序、分组"，叶子直接引用工具 id，
 * 图标/文案等元数据由工具定义提供
 */
export const toolbarMenu: MenuNode[] = [
	'return-origin',
	'rotate',
	{
		id: 'measure',
		icon: 'icon-measure',
		label: '测量',
		children: [
			{
				id: 'measure-distance',
				icon: 'icon-distance',
				label: '距离',
				children: [
					'distance-radius',
					'distance-point-point',
					'distance-point-line',
					'distance-point-face',
					'distance-line-line',
					'distance-line-face',
					'distance-face-face',
					'distance-circle-center',
					'distance-axis-point',
					'distance-axis-line',
					'distance-axis-face',
					'distance-clear',
				],
			},
			{
				id: 'measure-length',
				icon: 'icon-length',
				label: '长度',
				children: ['length-line', 'length-perimeter', 'length-clear'],
			},
			{
				id: 'measure-angle',
				icon: 'icon-angle',
				label: '角度',
				children: ['angle-line', 'angle-face', 'angle-line-face', 'angle-clear'],
			},
			'measure-radius',
			'measure-continuous',
			'measure-thickness',
			{
				id: 'measure-area',
				icon: 'icon-area',
				label: '面积',
				children: ['area-face', 'area-solid', 'area-total'],
			},
			{
				id: 'measure-volume',
				icon: 'icon-volume',
				label: '体积',
				children: ['volume-solid', 'volume-total'],
			},
			'measure-clear',
		],
	},
	{
		id: 'modelprop',
		icon: 'icon-moxingjibenxinxi',
		label: '模型属性',
		children: ['modelprop-pointLineFace', 'modelprop-entity', 'modelprop-overall'],
	},
	{
		id: 'section',
		icon: 'icon-parting',
		label: '剖切',
		children: ['section-plane', 'section-sphere'],
	},
	// 包围盒
	// 拖动
	// 局部放大
	// 实时位置
	// 坐标轴
	// 基本信息
	// 模型效果
	// 模型效果
	// 显示隐藏
	// 截图
	// 全屏
	// 设置
	// 分享
	'model-split',
	{
		id: 'modelffect',
		icon: 'icon-showSwitch',
		label: '模型效果',
		children: ['modelelffect-transparent', 'modelelffect-outline', 'modelelffect-wireframe', 'modelelffect-shadow'],
	},

	'axes',
	{
		id: 'view',
		icon: 'icon-viewer3d',
		label: '视角',
		children: ['view-front', 'view-back', 'view-left', 'view-right', 'view-top', 'view-bottom'],
	},

	{
		id: 'annotate',
		icon: 'icon-annotation',
		label: '标注',
		children: ['annotate-text', 'annotate-pin'],
	},
	{
		id: 'material',
		icon: 'icon-moxingxiaoguo',
		label: '材质',
		children: ['material-wireframe', 'material-xray', 'material-normal', 'material-solid'],
	},
	{
		id: 'export',
		icon: 'icon-down',
		label: '导出',
		children: ['export-screenshot', 'export-glb', 'export-gltf'],
	},
];

/**
 * radialMenu - 右下角径向菜单布局
 *
 * @description 部分菜单项为后续开发预留（暂无对应工具 handler），
 * 以占位叶子形式声明，点击行为与现状一致（不触发逻辑）
 */
export const radialMenu: MenuNode[] = [
	{
		id: 'settings',
		icon: 'icon-setting',
		label: '设置',
		children: [
			{ id: 'settings-grid', icon: 'icon-mesh', label: '网格显示', activatable: true },
			{ id: 'settings-axes', icon: 'icon-axis', label: '坐标轴', activatable: true },
			{ id: 'settings-bg', icon: 'icon-changeBackground', label: '背景色' },
			'shadow-ground',
		],
	},
	{
		id: 'camera',
		icon: 'icon-viewer3d',
		label: '相机',
		children: ['return-origin', 'view-front', 'view-back', 'view-left', 'view-right', 'view-top', 'view-bottom'],
	},
	{
		id: 'info',
		icon: 'icon-info',
		label: '信息',
		children: [{ id: 'info-stats', icon: 'icon-structureTree', label: '统计信息' }, 'material-wireframe'],
	},
	{
		id: 'help',
		icon: 'icon-help',
		label: '帮助',
		children: [
			{ id: 'help-shortcuts', icon: 'icon-menu', label: '快捷键' },
			{ id: 'help-about', icon: 'icon-info', label: '关于' },
		],
	},
];
