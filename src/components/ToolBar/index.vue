<script setup lang="ts">
import { ref, computed } from 'vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import { findItemById } from '@/utils/tree';
import { useToolStore } from '@/stores/tool';

/**
 * ToolItem - 工具栏菜单项数据结构
 *
 * @description 支持多级嵌套的树形菜单，叶子节点可触发工具动作
 */
interface ToolItem {
	/** 唯一标识符（如 'section-plane-x'） */
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
 * Emits - ToolBar 组件事件
 *
 * @fires tool-action - 工具菜单项被点击时触发
 */
const emit = defineEmits<{
	/** 工具动作事件，action 为动作标识（如 'section:plane-x'），payload 为可选参数 */
	'tool-action': [action: string, payload?: any];
}>();

const activeStack = ref<string[]>([]);
const toolStore = useToolStore();

const tools: ToolItem[] = [
	{
		id: 'return-origin',
		icon: 'home',
		label: '返回原点',
	},
	{
		id: 'rotate',
		icon: 'rotate',
		label: '旋转',
		activatable: true,
	},
	{
		id: 'axes',
		icon: 'axes',
		label: '坐标系',
		activatable: true,
	},
	{
		id: 'view',
		icon: 'view',
		label: '视角',
		children: [
			{ id: 'view-front', icon: 'view-front', label: '正视图', group: 'view' },
			{ id: 'view-back', icon: 'view-back', label: '后视图', group: 'view' },
			{ id: 'view-left', icon: 'view-left', label: '左视图', group: 'view' },
			{ id: 'view-right', icon: 'view-right', label: '右视图', group: 'view' },
			{ id: 'view-top', icon: 'view-top', label: '俯视图', group: 'view' },
			{ id: 'view-bottom', icon: 'view-bottom', label: '仰视图', group: 'view' },
		],
	},
	{
		id: 'measure',
		icon: 'measure',
		label: '测量',
		children: [
			{ id: 'measure-distance', icon: 'measure', label: '距离测量', activatable: true, group: 'measure' },
			{ id: 'measure-angle', icon: 'measure', label: '角度测量', activatable: true, group: 'measure' },
			{ id: 'measure-area', icon: 'measure', label: '面积测量', activatable: true, group: 'measure' },
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
			{ id: 'section-plane', icon: 'section', label: '平面剖切', activatable: true, group: 'section' },
			{ id: 'section-sphere', icon: 'section', label: '球形剖切', activatable: true, group: 'section' },
		],
	},
	{
		id: 'material',
		icon: 'material',
		label: '材质',
		children: [
			{ id: 'material-wireframe', icon: 'material', label: '线框模式', activatable: true, group: 'material' },
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

// ---- 拖拽滚动逻辑 ----
const itemsRef = ref<HTMLDivElement | null>(null);
let isDragging = false;
let didDrag = false;
let startX = 0;
let scrollLeftStart = 0;
let velocity = 0;
let lastX = 0;
let lastTime = 0;
let rafId = 0;
const DRAG_THRESHOLD = 5;

function onDragStart(e: MouseEvent) {
	const el = itemsRef.value;
	if (!el || e.button !== 0) return;
	if (el.scrollWidth <= el.clientWidth) return;
	isDragging = true;
	didDrag = false;
	startX = e.pageX;
	scrollLeftStart = el.scrollLeft;
	lastX = e.pageX;
	lastTime = Date.now();
	velocity = 0;
	cancelAnimationFrame(rafId);
	el.style.cursor = 'grabbing';
	el.style.userSelect = 'none';
}

function onDragMove(e: MouseEvent) {
	if (!isDragging) return;
	e.preventDefault();
	const el = itemsRef.value;
	if (!el) return;
	const x = e.pageX;
	const moved = Math.abs(x - startX);
	if (moved > DRAG_THRESHOLD) didDrag = true;
	const now = Date.now();
	const dt = now - lastTime;
	if (dt > 0) velocity = (x - lastX) / dt;
	lastX = x;
	lastTime = now;
	el.scrollLeft = scrollLeftStart - (x - startX);
}

function onDragEnd() {
	if (!isDragging) return;
	isDragging = false;
	const el = itemsRef.value;
	if (!el) return;
	el.style.cursor = '';
	el.style.userSelect = '';
	const decay = 0.95;
	const minVelocity = 0.1;
	function momentumStep() {
		if (!el || Math.abs(velocity) < minVelocity) return;
		velocity *= decay;
		el.scrollLeft -= velocity * 16;
		rafId = requestAnimationFrame(momentumStep);
	}
	momentumStep();
	// 150ms 后重置 didDrag，防止触发 click
	if (didDrag) {
		setTimeout(() => {
			didDrag = false;
		}, 150);
	}
}

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
	return id;
}

/**
 * restoreTool - 恢复单个工具的原始状态
 *
 * @description 发送 restore 事件并从 activeTools 中移除
 */
function restoreTool(id: string): void {
	const actionId = getActionId(id);
	emit('tool-action', `${actionId}:restore`);
	toolStore.deactivate(id);
}

/**
 * restoreToolsInItems - 恢复列表中所有已激活的工具
 *
 * @description 遍历菜单项，找到 activeTools 中存在的项并逐一恢复
 */
function restoreToolsInItems(items: ToolItem[]): void {
	for (const item of items) {
		if (toolStore.isActive(item.id)) {
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
	} else if (item.activatable) {
		const actionId = getActionId(item.id);

		if (toolStore.isActive(item.id)) {
			// 已激活 → 取消激活，恢复原始效果
			restoreTool(item.id);
		} else {
			// 未激活 → 检查同组工具，先恢复再激活
			if (item.group) {
				for (const otherId of toolStore.activeTools) {
					const other = findItemById(tools, otherId);
					if (other?.group === item.group) {
						restoreTool(otherId);
					}
				}
			}
			toolStore.activate(item.id);
			if (item.color) {
				emit('tool-action', actionId, item.defaultColor ?? '#ffffff');
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
					<div class="toolbar-items-wrap">
						<div class="toolbar-items-scroll">
							<div ref="itemsRef" class="toolbar-items" @mousedown="onDragStart" @mousemove="onDragMove" @mouseup="onDragEnd" @mouseleave="onDragEnd">
								<button
									v-for="(item, index) in currentItems"
									:key="item.id"
									class="toolbar-item"
									:class="{ activated: toolStore.isActive(item.id) }"
									:style="{ '--delay': `${index * 40}ms` }"
									@click.stop="!didDrag && handleSelect(item)"
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
						</div>
					</div>

					<!-- 关闭按钮 -->
					<button v-if="activeStack.length > 0" class="close-btn" @click="handleClose" title="关闭当前菜单">
						<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				</div>
			</div>
		</Transition>
	</div>
</template>

<style lang="scss" scoped>
// Element Plus Design Tokens
$primary: #409eff;
$primary-light-9: #ecf5ff;
$primary-light-8: #d9ecff;
$text-primary: #303133;
$text-regular: #606266;
$text-secondary: #909399;
$text-placeholder: #c0c4cc;
$bg-color: #ffffff;
$fill-color: #f0f2f5;
$fill-color-light: #f5f7fa;
$border-color: #dcdfe6;
$border-color-light: #e4e7ed;
$border-color-hover: #c0c4cc;
$danger: #f56c6c;
$font-weight-primary: 500;
$box-shadow-light: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
$transition-duration: 0.2s;

// 响应式断点
$bp-xs: 360px;
$bp-sm: 480px;
$bp-md: 640px;
$bp-lg: 1024px;
$bp-xl: 1440px;

.toolbar-wrapper {
	position: fixed;
	bottom: clamp(12px, 2vw, 32px);
	left: 50%;
	transform: translateX(-50%);
	z-index: 1000;
	max-width: calc(100vw - clamp(16px, 3vw, 32px));
	overflow: hidden;
}

.toolbar-level {
	display: flex;
	flex-direction: column;
	gap: clamp(4px, 0.8vw, 8px);
	max-height: 60vh;
	overflow-y: auto;
	overflow-x: auto;
	scrollbar-width: none;

	&::-webkit-scrollbar {
		display: none;
	}
}

// 统一工具面板
.toolbar-panel {
	display: flex;
	align-items: center;
	gap: clamp(3px, 0.5vw, 6px);
	padding: clamp(5px, 0.8vw, 8px) clamp(6px, 1vw, 12px);
	background: $bg-color;
	box-shadow: $box-shadow-light;
	border-radius: clamp(6px, 0.8vw, 8px);
	border: 1px solid $border-color-light;
	flex-wrap: nowrap;
	overflow-x: auto;
	overflow-y: hidden;
	scroll-behavior: smooth;
	-webkit-overflow-scrolling: touch;
	position: relative;

	// 移动端隐藏滚动条
	scrollbar-width: thin;
	scrollbar-color: rgba(0, 0, 0, 0.15) transparent;

	// Webkit 自定义滚动条（PC 端显示）
	&::-webkit-scrollbar {
		height: 6px;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
	}

	&::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.15);
		border-radius: 3px;

		&:hover {
			background: rgba(0, 0, 0, 0.25);
		}
	}

	// 触摸设备隐藏滚动条
	@media (pointer: coarse) {
		scrollbar-width: none;

		&::-webkit-scrollbar {
			display: none;
		}
	}
}

// 面包屑导航
.breadcrumb-nav {
	display: flex;
	align-items: center;
	gap: 2px;
	font-size: clamp(10px, 1.2vw, 12px);
	flex-shrink: 1;
	min-width: 0;
	padding: clamp(3px, 0.5vw, 4px) clamp(6px, 0.8vw, 10px);
	border-radius: clamp(3px, 0.5vw, 4px);
	background: $fill-color-light;
	overflow: hidden;
	justify-content: flex-end;

	@media (max-width: $bp-xs) {
		max-width: 80px;
		padding: 3px 5px;
		gap: 1px;
	}

	@media (min-width: $bp-lg) {
		padding: 5px 12px;
	}
}

.breadcrumb-sep {
	display: flex;
	align-items: center;
	color: $text-placeholder;
	flex-shrink: 0;
}

.breadcrumb-item {
	color: $text-secondary;
	cursor: pointer;
	padding: clamp(2px, 0.3vw, 3px) clamp(4px, 0.6vw, 8px);
	border-radius: clamp(3px, 0.4vw, 4px);
	transition: all $transition-duration;
	white-space: nowrap;
	flex-shrink: 0;

	&:hover {
		background: $fill-color;
		color: $text-regular;
	}

	&.active {
		color: $text-primary;
		font-weight: $font-weight-primary;
		background: $fill-color;
	}
}

// 工具按钮区（外层容器，含渐变遮罩）
.toolbar-items-wrap {
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 0;
	position: relative;
}

// 渐变遮罩容器
.toolbar-items-scroll {
	position: relative;
	flex: 1;
	min-width: 0;
	overflow: hidden;

	// 左侧渐变遮罩
	&::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 16px;
		background: linear-gradient(to right, $bg-color, transparent);
		z-index: 2;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.2s;
		border-radius: 4px 0 0 4px;
	}

	// 右侧渐变遮罩
	&::after {
		content: '';
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		width: 16px;
		background: linear-gradient(to left, $bg-color, transparent);
		z-index: 2;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.2s;
		border-radius: 0 4px 4px 0;
	}
}

// 工具按钮区（可滚动内容，支持拖拽）
.toolbar-items {
	display: flex;
	gap: clamp(2px, 0.4vw, 4px);
	overflow-x: auto;
	overflow-y: hidden;
	scroll-behavior: auto;
	scrollbar-width: none;
	cursor: grab;

	&::-webkit-scrollbar {
		display: none;
	}

	&.dragging {
		cursor: grabbing;
		scroll-behavior: auto;
	}
}

.toolbar-item {
	display: flex;
	align-items: center;
	gap: clamp(4px, 0.6vw, 8px);
	padding: clamp(5px, 0.7vw, 8px) clamp(8px, 1.2vw, 14px);
	border: none;
	border-radius: clamp(4px, 0.5vw, 6px);
	background: transparent;
	color: $text-regular;
	font-size: clamp(11px, 1.3vw, 14px);
	font-weight: $font-weight-primary;
	cursor: pointer;
	transition: all $transition-duration;
	white-space: nowrap;
	flex-shrink: 0;
	animation: itemFadeIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
	animation-delay: var(--delay);

	// 极小屏幕 (<360px)
	@media (max-width: $bp-xs) {
		padding: 4px 6px;
		gap: 3px;
		font-size: 10px;
	}

	// 小屏幕手机 (360-480px)
	@media (min-width: $bp-xs) and (max-width: $bp-sm) {
		padding: 5px 8px;
		gap: 4px;
		font-size: 11px;
	}

	// 中等屏幕 (480-640px)
	@media (min-width: $bp-sm) and (max-width: $bp-md) {
		padding: 6px 10px;
		font-size: 12px;
	}

	// 大屏幕 (1024px+)
	@media (min-width: $bp-lg) {
		padding: 9px 16px;
		font-size: 15px;
	}

	// 超大屏幕 (1440px+)
	@media (min-width: $bp-xl) {
		padding: 10px 18px;
		font-size: 16px;
		gap: 10px;
	}

	&:hover {
		background: $fill-color-light;
	}

	&:active {
		transform: scale(0.97);
		background: $fill-color;
		color: $text-secondary;
	}

	&.activated {
		background: $primary-light-9;
		color: $primary;
		box-shadow: inset 0 0 0 1px rgba($primary, 0.2);

		.item-icon {
			background: $primary-light-8;
			color: $primary;
		}

		.item-label {
			color: $primary;
			font-weight: 600;
		}
	}
}

@keyframes itemFadeIn {
	from {
		opacity: 0;
		transform: translateY(8px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.item-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: clamp(22px, 2.5vw, 30px);
	height: clamp(22px, 2.5vw, 30px);
	border-radius: clamp(4px, 0.5vw, 6px);
	background: $primary-light-9;
	color: $primary;
	transition: all $transition-duration;

	@media (max-width: $bp-xs) {
		width: 20px;
		height: 20px;
	}

	@media (min-width: $bp-lg) {
		width: 32px;
		height: 32px;
	}

	.toolbar-item:hover & {
		background: $primary-light-8;
		transform: scale(1.05);
	}
}

.item-label {
	font-weight: $font-weight-primary;
	transition: color $transition-duration;

	.toolbar-item:hover & {
		color: $text-primary;
	}
}

.item-arrow {
	display: flex;
	align-items: center;
	color: $text-placeholder;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

	.toolbar-item:hover & {
		color: $primary;
		transform: translateX(2px);
	}
}

// 关闭按钮
.close-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: clamp(20px, 2vw, 24px);
	height: clamp(20px, 2vw, 24px);
	padding: 0;
	border: none;
	border-radius: clamp(3px, 0.4vw, 4px);
	background: $fill-color-light;
	color: $text-secondary;
	cursor: pointer;
	flex-shrink: 0;
	transition: all $transition-duration;

	@media (max-width: $bp-xs) {
		width: 18px;
		height: 18px;
	}

	@media (min-width: $bp-lg) {
		width: 28px;
		height: 28px;
	}

	&:hover {
		background: $danger;
		color: #fff;
		transform: rotate(90deg);
	}
}

// 分隔线
.color-divider {
	width: 1px;
	height: clamp(16px, 1.8vw, 20px);
	background: $border-color-light;
	flex-shrink: 0;
	margin: 0 clamp(2px, 0.3vw, 4px);
}

// 颜色选择器
.color-swatch-wrap {
	position: relative;
	width: clamp(20px, 2vw, 24px);
	height: clamp(20px, 2vw, 24px);
	flex-shrink: 0;

	@media (max-width: $bp-xs) {
		width: 18px;
		height: 18px;
	}
}

.color-swatch {
	width: 100%;
	height: 100%;
	padding: 0;
	border: 1px solid $border-color;
	border-radius: clamp(3px, 0.4vw, 4px);
	cursor: pointer;
	background: none;
	appearance: none;
	-webkit-appearance: none;
	transition: all $transition-duration;

	&::-webkit-color-swatch-wrapper {
		padding: 0;
	}

	&::-webkit-color-swatch {
		border: none;
		border-radius: 2px;
	}

	&::-moz-color-swatch {
		border: none;
		border-radius: 2px;
	}

	&:hover {
		border-color: $border-color-hover;
	}
}

.color-mode-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	height: clamp(20px, 2vw, 24px);
	padding: 0 clamp(4px, 0.6vw, 8px);
	border: 1px solid $border-color;
	border-radius: clamp(3px, 0.4vw, 4px);
	background: $fill-color-light;
	color: $text-regular;
	font-size: clamp(9px, 1vw, 12px);
	font-weight: $font-weight-primary;
	font-family: 'SF Mono', 'Consolas', monospace;
	letter-spacing: 0.3px;
	cursor: pointer;
	transition: all $transition-duration;
	white-space: nowrap;
	flex-shrink: 0;

	@media (max-width: $bp-xs) {
		padding: 0 4px;
		font-size: 9px;
	}

	@media (min-width: $bp-lg) {
		height: 28px;
		font-size: 13px;
	}

	&:hover {
		background: $primary-light-9;
		color: $primary;
		border-color: rgba($primary, 0.3);
	}

	&:active {
		transform: scale(0.95);
	}
}

.color-text-input {
	width: clamp(56px, 7vw, 80px);
	height: clamp(20px, 2vw, 24px);
	padding: 0 clamp(4px, 0.6vw, 8px);
	border: 1px solid $border-color;
	border-radius: clamp(3px, 0.4vw, 4px);
	background: $fill-color-light;
	color: $text-primary;
	font-size: clamp(10px, 1.2vw, 14px);
	font-family: 'SF Mono', 'Consolas', monospace;
	outline: none;
	transition: all $transition-duration;
	flex-shrink: 0;

	@media (max-width: $bp-xs) {
		width: 50px;
		font-size: 10px;
		padding: 0 4px;
	}

	@media (min-width: $bp-lg) {
		width: 90px;
		font-size: 15px;
	}

	&::placeholder {
		color: $text-placeholder;
	}

	&:hover {
		border-color: $border-color-hover;
	}

	&:focus {
		border-color: $primary;
		background: $bg-color;
		box-shadow: 0 0 0 2px rgba($primary, 0.2);
	}
}

// 纵向动画
.slide-forward-enter-active {
	transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-forward-leave-active {
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-forward-enter-from {
	opacity: 0;
	transform: translateY(12px) scale(0.96);
}

.slide-forward-leave-to {
	opacity: 0;
	transform: translateY(-8px) scale(0.96);
}

.slide-backward-enter-active {
	transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-backward-leave-active {
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-backward-enter-from {
	opacity: 0;
	transform: translateY(-12px) scale(0.96);
}

.slide-backward-leave-to {
	opacity: 0;
	transform: translateY(12px) scale(0.96);
}
</style>
