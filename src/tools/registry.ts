import type { ToolDefinition, CustomAction, ToolHandler, ToolItem } from './types';

/**
 * MenuGroup - 菜单分组节点
 *
 * @description 无行为，仅用于展开子菜单
 */
export interface MenuGroup {
	id: string;
	icon: string;
	label: string;
	children: MenuNode[];
}

/**
 * MenuLeaf - 叶子菜单节点
 *
 * @description 工具型叶子只写 id（元数据来自 ToolDefinition，禁止覆盖）；
 * 占位型叶子（暂无对应工具，供后续开发预留）需内联 icon/label
 */
export interface MenuLeaf {
	id: string;
	icon?: string;
	label?: string;
	activatable?: boolean;
}

/**
 * MenuNode - 菜单布局节点
 */
export type MenuNode = string | MenuLeaf | MenuGroup;

/**
 * isGroup - 判断是否为分组节点
 */
function isGroup(node: MenuNode): node is MenuGroup {
	return typeof node === 'object' && node !== null && 'children' in node && Array.isArray(node.children);
}

/**
 * defineTool - 工具定义辅助函数
 *
 * @description 提供类型推导，保证定义对象符合 ToolDefinition 约束
 *
 * @param {ToolDefinition} def - 工具定义
 * @returns {ToolDefinition} 原样返回，仅用于类型收窄
 */
export function defineTool(def: ToolDefinition): ToolDefinition {
	return def;
}

/**
 * buildRegistry - 由菜单工具定义数组构建 action → handler 注册表
 *
 * @description 自动登记 activate；当存在 deactivate 时自动派生 `${id}:restore`。
 * 仅处理菜单工具；非菜单的自定义/传参动作见 {@link buildActionRegistry}
 *
 * @param {ToolDefinition[]} defs - 菜单工具定义数组
 * @returns {Record<string, ToolHandler>} 菜单工具动作注册表
 */
export function buildRegistry(defs: ToolDefinition[]): Record<string, ToolHandler> {
	const registry: Record<string, ToolHandler> = {};
	for (const def of defs) {
		registry[def.id] = def.activate;
		if (def.deactivate) {
			registry[`${def.id}:restore`] = def.deactivate;
		}
	}
	return registry;
}

/**
 * defineAction - 自定义动作定义辅助函数
 *
 * @description 提供类型推导，保证定义对象符合 CustomAction 约束
 *
 * @param {CustomAction} action - 自定义动作定义
 * @returns {CustomAction} 原样返回，仅用于类型收窄
 */
export function defineAction(action: CustomAction): CustomAction {
	return action;
}

/**
 * buildActionRegistry - 由自定义动作数组构建 action → handler 注册表
 *
 * @description 仅登记非菜单的自定义/传参动作，与菜单工具注册表分离
 *
 * @param {CustomAction[]} actions - 自定义动作数组
 * @returns {Record<string, ToolHandler>} 自定义动作注册表
 */
export function buildActionRegistry(actions: CustomAction[]): Record<string, ToolHandler> {
	const registry: Record<string, ToolHandler> = {};
	for (const action of actions) {
		registry[action.id] = action.handler;
	}
	return registry;
}

/**
 * buildLeaf - 将叶子节点解析为 ToolItem
 *
 * @description 工具型叶子忽略菜单内覆盖，一律采用定义元数据；
 * 占位型叶子使用内联 icon/label；两者都不满足时告警并跳过
 *
 * @param {MenuLeaf} leaf - 叶子节点
 * @param {Map<string, ToolDefinition>} defs - 工具定义索引
 * @returns {ToolItem | null} 解析结果
 */
function buildLeaf(leaf: MenuLeaf, defs: Map<string, ToolDefinition>): ToolItem | null {
	const def = defs.get(leaf.id);
	if (def?.menu) {
		// 工具型：展示与行为一律来自定义，忽略菜单内覆盖，保证同 id 全局一致
		return { id: def.id, ...def.menu };
	}
	if (leaf.icon && leaf.label) {
		return { id: leaf.id, icon: leaf.icon, label: leaf.label, activatable: leaf.activatable };
	}
	if (import.meta.env.DEV) {
		console.warn(`[menu] 节点 "${leaf.id}" 缺少工具定义或 icon/label，已跳过`);
	}
	return null;
}

/**
 * resolveMenu - 解析菜单布局为 ToolItem 树
 *
 * @description 将声明式布局（id 字符串 / 叶子对象 / 分组对象）与工具定义合并，
 * 生成 ToolBar / RadialMenu 可直接渲染的菜单树
 *
 * @param {MenuNode[]} nodes - 菜单布局节点数组
 * @param {Map<string, ToolDefinition>} defs - 工具定义索引
 * @returns {ToolItem[]} 解析后的菜单项数组
 */
export function resolveMenu(nodes: MenuNode[], defs: Map<string, ToolDefinition>): ToolItem[] {
	const items: ToolItem[] = [];
	for (const node of nodes) {
		if (typeof node === 'string') {
			const item = buildLeaf({ id: node }, defs);
			if (item) items.push(item);
			continue;
		}
		if (isGroup(node)) {
			items.push({ id: node.id, icon: node.icon, label: node.label, children: resolveMenu(node.children, defs) });
			continue;
		}
		const item = buildLeaf(node, defs);
		if (item) items.push(item);
	}
	return items;
}
