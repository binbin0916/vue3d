<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import { findItemById } from '@/utils/tree';

/**
 * ToolItem - 工具栏菜单项数据结构
 *
 * @description 支持多级嵌套的树形菜单，叶子节点可触发工具动作
 */
interface ToolItem {
	/** 唯一标识符（如 'move', 'section-plane-x'） */
	id: string;
	/** 图标名称，对应 src/assets/svgs/ 下的文件名 */
	icon: string;
	/** 菜单项显示文本 */
	label: string;
	/** 是否为可切换激活状态的工具（点击后保持高亮） */
	activatable?: boolean;
	/** 子菜单项（存在则渲染为下一级菜单） */
	children?: ToolItem[];
	/** 是否显示颜色选择器（线框/纯色模式） */
	color?: boolean;
	/** 颜色选择器默认颜色 */
	defaultColor?: string;
	/** 共存组标识：同组工具效果可共存，不同组互斥。不设则默认互斥 */
	group?: string;
}

/**
 * Props - ToolBar 组件属性
 */
interface Props {
	/** 是否处于移动模式，影响移动按钮的激活高亮状态 */
	isMoveMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	isMoveMode: false,
});

/**
 * Emits - ToolBar 组件事件
 *
 * @fires tool-action - 工具菜单项被点击时触发
 */
const emit = defineEmits<{
	/** 工具动作事件，action 为动作标识（如 'move:toggle', 'section:plane-x'），payload 为可选参数 */
	'tool-action': [action: string, payload?: any];
}>();

const activeStack = ref<string[]>([]);
const activeTools = ref<Set<string>>(new Set());
const selectedColor = ref('#ffffff');
const colorMode = ref<'hex' | 'rgb'>('hex');

/**
 * showColorPicker - 是否显示颜色选择器
 *
 * @description 当前激活的菜单项支持 color 属性时显示
 */
const showColorPicker = computed(() => {
	if (activeTools.value.size === 0) return false;
	for (const id of activeTools.value) {
		const item = findItemById(tools, id);
		if (item?.color === true) return true;
	}
	return false;
});

/**
 * colorInputValue - 颜色输入框显示值
 *
 * @description 根据当前模式格式化颜色值：HEX 显示 #xxx，RGB 显示 R, G, B
 */
const colorInputValue = computed(() => {
	if (colorMode.value === 'rgb') {
		const hex = selectedColor.value.replace('#', '');
		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);
		return `${r}, ${g}, ${b}`;
	}
	return selectedColor.value.toUpperCase();
});

/**
 * parseHexColor - 解析 HEX 颜色字符串
 *
 * @description 支持 #RGB 和 #RRGGBB 格式，自动补全 #
 *
 * @param {string} input - 用户输入的颜色字符串
 * @returns {string | null} 标准化的 7 位 HEX 颜色（#rrggbb），无效返回 null
 */
function parseHexColor(input: string): string | null {
	const hex = input.startsWith('#') ? input : `#${input}`;
	const match = hex.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
	if (!match) return null;
	const group = match[1];
	if (!group) return null;
	const full =
		group.length === 3
			? group
					.split('')
					.map((c) => c + c)
					.join('')
			: group;
	return `#${full.toLowerCase()}`;
}

/**
 * parseRgbColor - 解析 RGB 颜色字符串
 *
 * @description 支持 "R, G, B"、"R G B"、"R,G,B" 等分隔格式，值范围 0-255
 *
 * @param {string} input - 用户输入的颜色字符串
 * @returns {string | null} 标准化的 7 位 HEX 颜色（#rrggbb），无效返回 null
 */
function parseRgbColor(input: string): string | null {
	const parts = input.split(/[\s,]+/).filter(Boolean);
	if (parts.length !== 3) return null;
	const r = Number(parts[0]);
	const g = Number(parts[1]);
	const b = Number(parts[2]);
	if ([r, g, b].some((n) => isNaN(n) || n < 0 || n > 255)) return null;
	const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * handleColorInput - 文本输入框颜色解析
 *
 * @description 根据当前模式（HEX/RGB）解析输入值，无效输入不更新颜色
 *
 * @param {Event} e - input 事件
 */
const handleColorInput = (e: Event) => {
	const raw = (e.target as HTMLInputElement).value;
	const hex = colorMode.value === 'hex' ? parseHexColor(raw) : parseRgbColor(raw);
	if (hex) {
		selectedColor.value = hex;
		for (const id of activeTools.value) {
			const item = findItemById(tools, id);
			if (item?.color) {
				emit('tool-action', id, hex);
			}
		}
	}
};

/**
 * handleSwatchInput - 原生色盘选择处理
 *
 * @description 直接使用 input[type=color] 返回的 HEX 值同步更新
 *
 * @param {Event} e - input 事件
 */
const handleSwatchInput = (e: Event) => {
	const color = (e.target as HTMLInputElement).value;
	selectedColor.value = color;
	for (const id of activeTools.value) {
		const item = findItemById(tools, id);
		if (item?.color) {
			emit('tool-action', id, color);
		}
	}
};

/**
 * toggleColorMode - 切换 HEX/RGB 输入模式
 *
 * @description 在 HEX 和 RGB 之间切换，输入框显示值自动同步
 */
const toggleColorMode = () => {
	colorMode.value = colorMode.value === 'hex' ? 'rgb' : 'hex';
};

watch(
	() => props.isMoveMode,
	(val) => {
		if (val) {
			activeTools.value.add('move');
		} else {
			activeTools.value.delete('move');
		}
		activeTools.value = new Set(activeTools.value);
	}
);

const tools: ToolItem[] = [
	{
		id: 'move',
		icon: 'move',
		label: '移动',
		activatable: true,
	},
	{
		id: 'view',
		icon: 'view',
		label: '视角',
		children: [
			{ id: 'view-front', icon: 'view', label: '正视图', activatable: true },
			{ id: 'view-back', icon: 'view', label: '后视图', activatable: true },
			{ id: 'view-left', icon: 'view', label: '左视图', activatable: true },
			{ id: 'view-right', icon: 'view', label: '右视图', activatable: true },
			{ id: 'view-top', icon: 'view', label: '俯视图', activatable: true },
			{ id: 'view-bottom', icon: 'view', label: '仰视图', activatable: true },
		],
	},
	{
		id: 'measure',
		icon: 'measure',
		label: '测量',
		children: [
			{ id: 'measure-distance', icon: 'measure', label: '距离测量', activatable: true },
			{ id: 'measure-angle', icon: 'measure', label: '角度测量', activatable: true },
			{ id: 'measure-area', icon: 'measure', label: '面积测量', activatable: true },
		],
	},
	{
		id: 'annotate',
		icon: 'annotate',
		label: '标注',
		children: [
			{ id: 'annotate-text', icon: 'annotate', label: '文字标注', activatable: true },
			{ id: 'annotate-pin', icon: 'annotate', label: '图钉标注', activatable: true },
		],
	},
	{
		id: 'section',
		icon: 'section',
		label: '剖切',
		children: [
			{
				id: 'section-plane',
				icon: 'section',
				label: '平面剖切',
				children: [
					{ id: 'section-plane-x', icon: 'section', label: 'X轴平面', activatable: true },
					{ id: 'section-plane-y', icon: 'section', label: 'Y轴平面', activatable: true },
					{ id: 'section-plane-z', icon: 'section', label: 'Z轴平面', activatable: true },
				],
			},
			{
				id: 'section-box',
				icon: 'section',
				label: '盒式剖切',
				children: [
					{ id: 'section-box-inner', icon: 'section', label: '内部剖切', activatable: true },
					{ id: 'section-box-outer', icon: 'section', label: '外部剖切', activatable: true },
				],
			},
			{ id: 'section-custom', icon: 'section', label: '自定义剖切', activatable: true },
		],
	},
	{
		id: 'material',
		icon: 'material',
		label: '材质',
		children: [
			{ id: 'material-wireframe', icon: 'material', label: '线框模式', activatable: true, color: true, defaultColor: '#ffffff', group: 'material' },
			{ id: 'material-xray', icon: 'material', label: 'X光模式', activatable: true, group: 'material' },
			{ id: 'material-normal', icon: 'material', label: '法线显示', activatable: true, group: 'material' },
			{ id: 'material-solid', icon: 'material', label: '纯色显示', activatable: true, color: true, defaultColor: '#999999', group: 'material' },
		],
	},
	{
		id: 'export',
		icon: 'export',
		label: '导出',
		children: [
			{ id: 'export-screenshot', icon: 'export', label: '截图' },
			{ id: 'export-glb', icon: 'export', label: '导出GLB' },
			{ id: 'export-gltf', icon: 'export', label: '导出GLTF' },
		],
	},
];

const currentItems = ref<ToolItem[]>(tools);
const direction = ref<'forward' | 'backward'>('forward');

const breadcrumbItems = computed(() => {
	return activeStack.value.map((id) => {
		const item = findItemById(tools, id);
		return { id, label: item?.label ?? id };
	});
});

/**
 * handleSelect - 菜单项点击处理
 *
 * @description 根据菜单项类型执行不同操作：
 * - 有子菜单：进入下一级菜单
 * - 移动工具：切换移动模式
 * - 可激活工具：切换高亮状态并触发 tool-action 事件
 * - 普通工具：直接触发 tool-action 事件
 *
 * @param {ToolItem} item - 被点击的菜单项
 */
/**
 * getActionId - 将菜单项 id 转换为 action id
 *
 * @description section-* 前缀转换为 section:* 格式，其余原样返回
 */
function getActionId(id: string): string {
	return id.startsWith('section-') ? `section:${id.replace('section-', '')}` : id;
}

/**
 * restoreTool - 恢复单个工具的原始状态
 *
 * @description 发送 restore 事件并从 activeTools 中移除
 */
function restoreTool(id: string): void {
	const actionId = getActionId(id);
	emit('tool-action', `${actionId}:restore`);
	activeTools.value.delete(id);
}

/**
 * restoreToolsInItems - 恢复列表中所有已激活的工具
 *
 * @description 遍历菜单项，找到 activeTools 中存在的项并逐一恢复
 */
function restoreToolsInItems(items: ToolItem[]): void {
	for (const item of items) {
		if (activeTools.value.has(item.id)) {
			restoreTool(item.id);
		}
	}
}

/**
 * handleSelect - 菜单项点击处理
 *
 * @description 根据菜单项类型执行不同操作：
 * - 有子菜单：进入下一级菜单
 * - 移动工具：切换移动模式
 * - 可激活工具（已激活）：取消激活，恢复原始效果
 * - 可激活工具（同组）：先恢复同组其他工具，再激活当前工具
 * - 可激活工具（新工具）：直接激活
 * - 普通工具：直接触发 tool-action 事件
 *
 * @param {ToolItem} item - 被点击的菜单项
 */
const handleSelect = (item: ToolItem) => {
	if (item.children && item.children.length > 0) {
		direction.value = 'forward';
		activeStack.value.push(item.id);
		currentItems.value = item.children;
	} else if (item.id === 'move') {
		emit('tool-action', 'move:toggle');
	} else if (item.activatable) {
		const actionId = getActionId(item.id);

		if (activeTools.value.has(item.id)) {
			// 已激活 → 取消激活，恢复原始效果
			restoreTool(item.id);
			if (item.color) {
				selectedColor.value = item.defaultColor ?? '#ffffff';
			}
		} else {
			// 未激活 → 检查同组工具，先恢复再激活
			if (item.group) {
				for (const otherId of activeTools.value) {
					const other = findItemById(tools, otherId);
					if (other?.group === item.group) {
						restoreTool(otherId);
					}
				}
			}
			activeTools.value.add(item.id);
			activeTools.value = new Set(activeTools.value);
			if (item.color) {
				selectedColor.value = item.defaultColor ?? '#ffffff';
				emit('tool-action', actionId, selectedColor.value);
			} else {
				emit('tool-action', actionId);
			}
		}
	} else {
		const actionId = getActionId(item.id);
		emit('tool-action', actionId);
	}
};

/**
 * handleClose - 关闭当前菜单层级
 *
 * @description 恢复当前子菜单中所有已激活的工具，然后退回上一级菜单
 */
const handleClose = () => {
	restoreToolsInItems(currentItems.value);
	direction.value = 'backward';
	activeStack.value.pop();
	if (activeStack.value.length === 0) {
		currentItems.value = tools;
	} else {
		const parentId = activeStack.value.at(-1);
		if (parentId) {
			const parent = findItemById(tools, parentId);
			currentItems.value = parent?.children ?? tools;
		}
	}
};

/**
 * handleBreadcrumbClick - 面包屑导航点击处理
 *
 * @description 恢复被跳过层级中所有已激活的工具，然后跳转到目标层级
 *
 * @param {number} index - 目标层级索引（0 = 根菜单）
 */
const handleBreadcrumbClick = (index: number) => {
	// 恢复被跳过的层级中所有已激活的工具
	const skippedStack = activeStack.value.slice(index);
	for (let i = skippedStack.length - 1; i >= 0; i--) {
		const parentId = skippedStack[i];
		if (parentId) {
			const parent = findItemById(tools, parentId);
			if (parent?.children) {
				restoreToolsInItems(parent.children);
			}
		}
	}

	direction.value = 'backward';
	activeStack.value = activeStack.value.slice(0, index);
	if (activeStack.value.length === 0) {
		currentItems.value = tools;
	} else {
		const parentId = activeStack.value.at(-1);
		if (parentId) {
			const parent = findItemById(tools, parentId);
			currentItems.value = parent?.children ?? tools;
		}
	}
};
</script>

<template>
	<div class="toolbar-wrapper">
		<Transition :name="direction === 'forward' ? 'slide-forward' : 'slide-backward'" mode="out-in">
			<div :key="activeStack.join('-') || 'root'" class="toolbar-level">
				<div class="toolbar-panel">
					<!-- 面包屑导航 -->
					<div v-if="activeStack.length > 0" class="breadcrumb-nav">
						<template v-for="(item, index) in breadcrumbItems" :key="item.id">
							<span class="breadcrumb-sep" v-if="index > 0">
								<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2">
									<polyline points="9 18 15 12 9 6" />
								</svg>
							</span>
							<span class="breadcrumb-item" :class="{ active: index === breadcrumbItems.length - 1 }" @click="handleBreadcrumbClick(index + 1)">
								{{ item.label }}
							</span>
						</template>
					</div>

					<!-- 工具按钮 -->
					<div class="toolbar-items">
						<button
							v-for="(item, index) in currentItems"
							:key="item.id"
							class="toolbar-item"
							:class="{ activated: activeTools.has(item.id) }"
							:style="{ '--delay': `${index * 40}ms` }"
							@click="handleSelect(item)"
						>
							<div class="item-icon">
								<SvgIcon :name="item.icon" :size="18" />
							</div>
							<span class="item-label">{{ item.label }}</span>
							<span v-if="item.children && item.children.length > 0" class="item-arrow">
								<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
									<polyline points="9 18 15 12 9 6" />
								</svg>
							</span>
						</button>
					</div>

					<!-- 关闭按钮 -->
					<button v-if="activeStack.length > 0" class="close-btn" @click="handleClose" title="关闭当前菜单">
						<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>

					<!-- 颜色选择器：线框/纯色模式 -->
					<template v-if="showColorPicker">
						<span class="color-divider"></span>
						<div class="color-swatch-wrap">
							<input type="color" class="color-swatch" :value="selectedColor" @input="handleSwatchInput" />
						</div>
						<button class="color-mode-btn" @click="toggleColorMode" :title="colorMode === 'hex' ? '切换为 RGB' : '切换为 HEX'">
							{{ colorMode === 'hex' ? 'HEX' : 'RGB' }}
						</button>
						<input
							type="text"
							class="color-text-input"
							:value="colorInputValue"
							@input="handleColorInput"
							:placeholder="colorMode === 'hex' ? '#000000' : '0, 0, 0'"
							spellcheck="false"
							autocomplete="off"
						/>
					</template>
				</div>
			</div>
		</Transition>
	</div>
</template>

<style lang="scss" scoped>
@use 'sass:color';

// 主题色
$primary: #2979ff;
$primary-light: #e3f2fd;
$primary-dark: #1565c0;

.toolbar-wrapper {
	position: fixed;
	bottom: 32px;
	left: 50%;
	transform: translateX(-50%);
	z-index: 1000;
	max-width: calc(100vw - 32px);
	overflow: hidden;
}

.toolbar-level {
	display: flex;
	flex-direction: column;
	gap: 8px;
	max-height: 60vh;
	overflow-y: auto;
	overflow-x: auto;
	scrollbar-width: none;

	&::-webkit-scrollbar {
		display: none;
	}
}

// 统一工具面板：面包屑 + 工具按钮 + 关闭按钮 + 颜色选择器
.toolbar-panel {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 8px 10px;
	background: rgba(255, 255, 255, 0.92);
	backdrop-filter: blur(20px) saturate(180%);
	border-radius: 16px;
	// box-shadow:
	// 	0 8px 40px rgba(0, 0, 0, 0.15),
	// 	0 2px 12px rgba(0, 0, 0, 0.08),
	// 	inset 0 1px 0 rgba(255, 255, 255, 0.8);
	border: 1px solid rgba(255, 255, 255, 0.6);
	flex-wrap: nowrap;
	overflow-x: auto;
	overflow-y: hidden;
	scrollbar-width: none;
	scroll-behavior: smooth;
	-webkit-overflow-scrolling: touch;

	&::-webkit-scrollbar {
		display: none;
	}
}

// 面包屑导航
.breadcrumb-nav {
	display: flex;
	align-items: center;
	gap: 2px;
	font-size: 12px;
	flex-shrink: 1;
	min-width: 0;
	padding: 4px 8px;
	border-radius: 8px;
	background: rgba(0, 0, 0, 0.03);
	overflow: hidden;
	justify-content: flex-end;
}

.breadcrumb-sep {
	display: flex;
	align-items: center;
	color: #ccc;
	flex-shrink: 0;
}

.breadcrumb-item {
	color: #999;
	cursor: pointer;
	padding: 2px 6px;
	border-radius: 5px;
	transition: all 0.2s;
	white-space: nowrap;
	flex-shrink: 0;

	&:hover {
		background: #f0f0f0;
		color: #555;
	}

	&.active {
		color: #333;
		font-weight: 600;
		background: #e8e8e8;
	}
}

// 工具按钮区（单行）
.toolbar-items {
	display: flex;
	gap: 4px;
	flex-shrink: 1;
	overflow-x: auto;
	overflow-y: hidden;
	scrollbar-width: none;
	min-width: 0;

	&::-webkit-scrollbar {
		display: none;
	}
}

.toolbar-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 14px;
	border: none;
	border-radius: 12px;
	background: transparent;
	color: #444;
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	white-space: nowrap;
	flex-shrink: 0;
	animation: itemFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
	animation-delay: var(--delay);

	&:hover {
		background: #f0f0f0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	}

	&:active {
		transform: scale(0.96);
		background: #e8e8e8;
	}

	&.activated {
		background: $primary-light;
		color: $primary-dark;
		box-shadow:
			inset 0 0 0 2px rgba($primary, 0.2),
			0 2px 8px rgba($primary, 0.15);

		.item-icon {
			color: $primary;
			box-shadow: 0 4px 14px rgba($primary, 0.4);
		}

		.item-label {
			color: $primary-dark;
			font-weight: 600;
		}
	}
}

@keyframes itemFadeIn {
	from {
		opacity: 0;
		transform: translateY(16px) scale(0.9);
	}
	to {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}

.item-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border-radius: 10px;
	background: $primary-light;
	color: $primary;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

	.toolbar-item:hover & {
		background: color.adjust($primary-light, $lightness: -3%);
		transform: scale(1.1) rotate(-5deg);
		box-shadow: 0 4px 16px rgba($primary, 0.3);
	}
}

.item-label {
	font-weight: 500;
	transition: all 0.2s;

	.toolbar-item:hover & {
		color: #222;
	}
}

.item-arrow {
	display: flex;
	align-items: center;
	color: #bbb;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

	.toolbar-item:hover & {
		color: $primary;
		transform: translateX(3px);
	}
}

// 关闭按钮（嵌入面板内）
.close-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	padding: 0;
	border: none;
	border-radius: 8px;
	background: #f5f5f5;
	color: #999;
	cursor: pointer;
	flex-shrink: 0;
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

	&:hover {
		background: #ff5252;
		color: #fff;
		transform: rotate(90deg);
		box-shadow: 0 4px 12px rgba(255, 82, 82, 0.35);
	}
}

// 分隔线
.color-divider {
	width: 1px;
	height: 20px;
	background: rgba(0, 0, 0, 0.08);
	flex-shrink: 0;
	margin: 0 2px;
}

// 颜色选择器（内联）
.color-swatch-wrap {
	position: relative;
	width: 28px;
	height: 28px;
	flex-shrink: 0;
}

.color-swatch {
	width: 28px;
	height: 28px;
	padding: 0;
	border: 2px solid #fff;
	border-radius: 7px;
	cursor: pointer;
	background: none;
	appearance: none;
	-webkit-appearance: none;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
	transition: all 0.2s;

	&::-webkit-color-swatch-wrapper {
		padding: 0;
	}

	&::-webkit-color-swatch {
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 5px;
	}

	&::-moz-color-swatch {
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 5px;
	}

	&:hover {
		transform: scale(1.08);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
	}
}

.color-mode-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 26px;
	padding: 0 6px;
	border: 1px solid rgba(0, 0, 0, 0.08);
	border-radius: 6px;
	background: #f5f5f5;
	color: #666;
	font-size: 10px;
	font-weight: 600;
	font-family: 'SF Mono', 'Consolas', monospace;
	letter-spacing: 0.5px;
	cursor: pointer;
	transition: all 0.2s;
	white-space: nowrap;
	flex-shrink: 0;

	&:hover {
		background: $primary-light;
		color: $primary;
		border-color: rgba($primary, 0.2);
	}

	&:active {
		transform: scale(0.95);
	}
}

.color-text-input {
	width: 88px;
	height: 26px;
	padding: 0 8px;
	border: 1px solid rgba(0, 0, 0, 0.08);
	border-radius: 6px;
	background: #f5f5f5;
	color: #333;
	font-size: 12px;
	font-family: 'SF Mono', 'Consolas', monospace;
	outline: none;
	transition: all 0.2s;
	flex-shrink: 0;

	&::placeholder {
		color: #bbb;
	}

	&:hover {
		border-color: rgba($primary, 0.3);
		background: #fafafa;
	}

	&:focus {
		border-color: $primary;
		background: #fff;
		box-shadow: 0 0 0 3px rgba($primary, 0.1);
	}
}

// 纵向动画
.slide-forward-enter-active {
	transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-forward-leave-active {
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-forward-enter-from {
	opacity: 0;
	transform: translateY(24px) scale(0.92);
}

.slide-forward-leave-to {
	opacity: 0;
	transform: translateY(-16px) scale(0.92);
}

.slide-backward-enter-active {
	transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-backward-leave-active {
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-backward-enter-from {
	opacity: 0;
	transform: translateY(-24px) scale(0.92);
}

.slide-backward-leave-to {
	opacity: 0;
	transform: translateY(24px) scale(0.92);
}
</style>
