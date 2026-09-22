import { reactive } from 'vue';
import type { VNode } from 'vue';

/**
 * FloatTooltip 控制器 - 跟随鼠标提示框
 *
 * @description 模块级单例 API，任意位置 import 后调用。
 * 类似 ElMessage 的使用体验，但打开后持续跟随鼠标移动。
 *
 * @example
 * ```ts
 * import { showTooltip, hideTooltip } from '@/components/FloatTooltip';
 *
 * // 显示纯文本（跟随鼠标）
 * showTooltip({ content: '模型体积: 1.2 m³' });
 *
 * // 显示 VNode 复杂内容，指定初始位置
 * showTooltip({ content: h('div', { style: { color: '#409eff' } }, '提示'), x: 100, y: 200 });
 *
 * // 手动关闭
 * hideTooltip();
 * ```
 */

export interface TooltipOptions {
	/** 内容：纯文本或 VNode */
	content: string | VNode;
	/** 初始横坐标（px，可选，缺省使用当前鼠标位置） */
	x?: number;
	/** 初始纵坐标（px，可选，缺省使用当前鼠标位置） */
	y?: number;
	/** 与光标的偏移距离（px），默认 12 */
	offset?: number;
}

interface TooltipState {
	/** 是否可见 */
	visible: boolean;
	/** 当前内容 */
	content: string | VNode | null;
	/** 提示框左上角横坐标 */
	x: number;
	/** 提示框左上角纵坐标 */
	y: number;
	/** 与光标偏移距离 */
	offset: number;
}

const state = reactive<TooltipState>({
	visible: false,
	content: null,
	x: 0,
	y: 0,
	offset: 16,
});

/** 最近一次鼠标位置（未显式传 x/y 时定位用） */
let lastMouseX = 0;
let lastMouseY = 0;

/**
 * 打开提示框并跟随鼠标
 * @param options 内容 + 可选初始位置/偏移
 */
export function showTooltip(options: TooltipOptions) {
	state.content = options.content;
	state.offset = options.offset ?? 16;
	state.x = options.x ?? lastMouseX;
	state.y = options.y ?? lastMouseY;
	state.visible = true;
}

/** 关闭提示框（唯一关闭方式） */
export function hideTooltip() {
	state.visible = false;
	state.content = null;
}

/** 记录鼠标坐标（组件内部使用） */
export function setLastMouse(x: number, y: number) {
	lastMouseX = x;
	lastMouseY = y;
}

export { state as tooltipState };
