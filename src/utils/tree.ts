/**
 * TreeNode - 具有 id 和可选 children 的树节点接口
 *
 * @description 用于 findItemById 的泛型约束
 */
interface TreeNode {
	id: string;
	children?: TreeNode[];
}

/**
 * findItemById - 递归查找树节点
 *
 * @description 在嵌套的树形结构中按 id 查找目标节点
 *
 * @param {T[]} items - 节点数组
 * @param {string} id - 要查找的节点 id
 *
 * @returns {T | undefined} 找到的节点，未找到返回 undefined
 */
export function findItemById<T extends TreeNode>(items: T[], id: string): T | undefined {
	for (const item of items) {
		if (item.id === id) return item;
		if (item.children) {
			const found = findItemById(item.children as T[], id);
			if (found) return found;
		}
	}
	return undefined;
}
