import type { ToolDefinition, CustomAction, ToolHandler } from './types';
import { buildRegistry, buildActionRegistry } from './registry';

/**
 * 自动发现所有工具定义文件
 *
 * @description 每个工具文件可导出：
 * - `tools: ToolDefinition[]` —— 参与菜单渲染的菜单工具
 * - `actions: CustomAction[]` —— 非菜单的自定义/传参动作
 * 新增文件即自动注册，无需手动维护注册表
 */
const modules = import.meta.glob<{ tools?: ToolDefinition[]; actions?: CustomAction[] }>(['./*.ts', '!./index.ts', '!./types.ts', '!./registry.ts', '!./menu.config.ts'], {
	eager: true,
});

/**
 * toolDefinitions - 全部菜单工具定义（按文件路径顺序扁平化）
 */
export const toolDefinitions: ToolDefinition[] = Object.values(modules).flatMap((mod) => mod.tools ?? []);

/**
 * customActions - 全部自定义/传参动作（非菜单）
 */
export const customActions: CustomAction[] = Object.values(modules).flatMap((mod) => mod.actions ?? []);

/**
 * definitionsById - 工具 id → 定义索引（供菜单解析）
 */
export const definitionsById = new Map(toolDefinitions.map((def) => [def.id, def]));

/**
 * toolRegistry - 菜单工具动作注册表（由定义自动构建，含 `${id}:restore`）
 */
export const toolRegistry = buildRegistry(toolDefinitions);

/**
 * actionRegistry - 自定义/传参动作注册表
 */
export const actionRegistry = buildActionRegistry(customActions);

/**
 * resolveToolAction - 统一解析动作处理器
 *
 * @description 依次在菜单工具注册表、自定义动作注册表中查找，供 home.vue 统一分发
 *
 * @param {string} action - 动作 id
 * @returns {ToolHandler | undefined} 命中的处理器
 */
export function resolveToolAction(action: string): ToolHandler | undefined {
	return toolRegistry[action] ?? actionRegistry[action];
}

export type { ToolContext, ToolHandler } from './types';
