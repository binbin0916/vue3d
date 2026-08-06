import { ref } from 'vue';
import { defineStore } from 'pinia';

/**
 * useToolStore - 工具状态管理 Store
 *
 * @description 统一管理所有工具的激活状态，供 ToolBar 和 RadialMenu 共享。
 * 一个菜单激活/取消激活工具时，另一个菜单自动同步
 */
export const useToolStore = defineStore('tool', () => {
	/** 所有已激活的工具 ID 集合 */
	const activeTools = ref<Set<string>>(new Set());

	/**
	 * toggle - 切换工具激活状态
	 *
	 * @param {string} id - 工具 ID
	 * @returns {boolean} 切换后的激活状态
	 */
	function toggle(id: string): boolean {
		if (activeTools.value.has(id)) {
			activeTools.value.delete(id);
			activeTools.value = new Set(activeTools.value);
			return false;
		}
		activeTools.value.add(id);
		activeTools.value = new Set(activeTools.value);
		return true;
	}

	/**
	 * activate - 激活工具
	 *
	 * @param {string} id - 工具 ID
	 */
	function activate(id: string) {
		if (!activeTools.value.has(id)) {
			activeTools.value.add(id);
			activeTools.value = new Set(activeTools.value);
		}
	}

	/**
	 * deactivate - 取消激活工具
	 *
	 * @param {string} id - 工具 ID
	 */
	function deactivate(id: string) {
		if (activeTools.value.has(id)) {
			activeTools.value.delete(id);
			activeTools.value = new Set(activeTools.value);
		}
	}

	/**
	 * isActive - 检查工具是否激活
	 *
	 * @param {string} id - 工具 ID
	 * @returns {boolean} 是否激活
	 */
	function isActive(id: string): boolean {
		return activeTools.value.has(id);
	}

	/**
	 * clear - 清空所有激活状态
	 */
	function clear() {
		activeTools.value = new Set();
	}

	return {
		activeTools,
		toggle,
		activate,
		deactivate,
		isActive,
		clear,
	};
});
