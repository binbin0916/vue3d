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
		id: 'modelprop',
		icon: 'modelprop',
		label: '模型属性',
		children: ['modelprop-pointLineFace', 'modelprop-entity', 'modelprop-overall'],
	},
	'axes',
	{
		id: 'view',
		icon: 'view',
		label: '视角',
		children: ['view-front', 'view-back', 'view-left', 'view-right', 'view-top', 'view-bottom'],
	},
	{
		id: 'measure',
		icon: 'measure',
		label: '测量',
		children: ['measure-distance', 'measure-angle', 'measure-area'],
	},
	{
		id: 'annotate',
		icon: 'annotate',
		label: '标注',
		children: ['annotate-text', 'annotate-pin'],
	},
	{
		id: 'section',
		icon: 'section',
		label: '剖切',
		children: ['section-plane', 'section-sphere'],
	},
	{
		id: 'material',
		icon: 'material',
		label: '材质',
		children: ['material-wireframe', 'material-xray', 'material-normal', 'material-solid'],
	},
	{
		id: 'export',
		icon: 'export',
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
		icon: 'settings',
		label: '设置',
		children: [
			{ id: 'settings-grid', icon: 'grid', label: '网格显示', activatable: true },
			{ id: 'settings-axes', icon: 'axes', label: '坐标轴', activatable: true },
			{ id: 'settings-bg', icon: 'background', label: '背景色' },
		],
	},
	{
		id: 'camera',
		icon: 'camera',
		label: '相机',
		children: ['return-origin', 'view-front', 'view-back', 'view-left', 'view-right', 'view-top', 'view-bottom'],
	},
	{
		id: 'info',
		icon: 'info',
		label: '信息',
		children: [{ id: 'info-stats', icon: 'stats', label: '统计信息' }, 'material-wireframe'],
	},
	{
		id: 'help',
		icon: 'help',
		label: '帮助',
		children: [
			{ id: 'help-shortcuts', icon: 'shortcuts', label: '快捷键' },
			{ id: 'help-about', icon: 'info', label: '关于' },
		],
	},
];
