<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';

/**
 * Props - DraggableDialog 组件属性
 *
 * @description 轻量级可拖拽浮层面板，用于展示模型信息、配置选项等。
 * 不含遮罩层，不阻断用户操作。
 */
interface Props {
	/** 控制显示/隐藏（v-model） */
	modelValue?: boolean;
	/** 标题文本 */
	title?: string;
	/** 初始宽度 */
	width?: string | number;
	/** 初始高度（0 = 自适应内容） */
	height?: number;
	/** 初始垂直位置 */
	top?: string;
	/** 是否可拖拽 */
	draggable?: boolean;
	/** 是否可缩放 */
	resizable?: boolean;
	/** 按 ESC 是否关闭 */
	closeOnPressEscape?: boolean;
	/** 是否显示关闭按钮 */
	showClose?: boolean;
	/** 关闭时销毁内容 */
	destroyOnClose?: boolean;
	/** 是否追加到 body */
	appendToBody?: boolean;
	/** 层级 */
	zIndex?: number;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: false,
	title: '',
	width: '400px',
	height: 0,
	top: '80px',
	draggable: true,
	resizable: true,
	closeOnPressEscape: true,
	showClose: true,
	destroyOnClose: false,
	appendToBody: true,
	zIndex: 1000,
});

const emit = defineEmits<{
	'update:modelValue': [value: boolean];
	open: [];
	opened: [];
	close: [];
	closed: [];
	dragStart: [position: { x: number; y: number }];
	dragEnd: [position: { x: number; y: number }];
	resize: [size: { width: number; height: number }];
}>();

// ---- 状态 ----
const dialogRef = ref<HTMLDivElement | null>(null);
const isVisible = ref(false);
const isMaximized = ref(false);
const isAnimating = ref(false);

// ---- 拖拽状态 ----
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const dialogLeft = ref(0);
const dialogTop = ref(0);

// ---- 缩放状态 ----
const isResizing = ref(false);
const resizeStartX = ref(0);
const resizeStartY = ref(0);
const resizeStartWidth = ref(0);
const resizeStartHeight = ref(0);
const dialogWidth = ref(0);
const dialogHeight = ref(0);

// ---- 保存还原状态 ----
const savedStyle = ref({ left: 0, top: 0, width: 0, height: 0 });

// ---- 计算属性 ----
const parsedWidth = computed(() => {
	const w = props.width;
	return typeof w === 'number' ? `${w}px` : w;
});

const dialogStyle = computed(() => {
	if (isMaximized.value) {
		return {
			left: '8px',
			top: '8px',
			width: 'calc(100vw - 16px)',
			height: 'calc(100vh - 16px)',
		};
	}
	return {
		left: `${dialogLeft.value}px`,
		top: `${dialogTop.value}px`,
		width: `${dialogWidth.value}px`,
		height: dialogHeight.value > 0 ? `${dialogHeight.value}px` : 'auto',
	};
});

// ---- 工具函数 ----
function clamp(val: number, min: number, max: number): number {
	return Math.min(Math.max(val, min), max);
}

function centerDialog() {
	const w = dialogWidth.value || 400;
	dialogLeft.value = (window.innerWidth - w) / 2;
	dialogTop.value = parseInt(props.top) || 80;
}

// ---- 打开/关闭 ----
function open() {
	isVisible.value = true;
	emit('open');
	nextTick(() => {
		const w = parseInt(parsedWidth.value) || 400;
		dialogWidth.value = w;
		dialogHeight.value = props.height;
		centerDialog();
		isAnimating.value = true;
		setTimeout(() => {
			isAnimating.value = false;
			emit('opened');
		}, 250);
	});
}

function close() {
	emit('close');
	isAnimating.value = true;
	setTimeout(() => {
		isVisible.value = false;
		isMaximized.value = false;
		isAnimating.value = false;
		emit('closed');
		if (props.destroyOnClose) {
			dialogWidth.value = 0;
			dialogHeight.value = 0;
		}
	}, 200);
}

function toggleMaximize() {
	if (isMaximized.value) {
		dialogLeft.value = savedStyle.value.left;
		dialogTop.value = savedStyle.value.top;
		dialogWidth.value = savedStyle.value.width;
		dialogHeight.value = savedStyle.value.height;
		isMaximized.value = false;
	} else {
		savedStyle.value = {
			left: dialogLeft.value,
			top: dialogTop.value,
			width: dialogWidth.value,
			height: dialogHeight.value,
		};
		isMaximized.value = true;
	}
}

// ---- 拖拽逻辑 ----
function onDragStart(e: MouseEvent) {
	if (!props.draggable || isMaximized.value) return;
	e.preventDefault();
	isDragging.value = true;
	dragStartX.value = e.clientX - dialogLeft.value;
	dragStartY.value = e.clientY - dialogTop.value;
	emit('dragStart', { x: dialogLeft.value, y: dialogTop.value });
}

function onDragMove(e: MouseEvent) {
	if (!isDragging.value) return;
	const x = e.clientX - dragStartX.value;
	const y = e.clientY - dragStartY.value;
	const maxLeft = window.innerWidth - dialogWidth.value - 8;
	const maxTop = window.innerHeight - 60;
	dialogLeft.value = clamp(x, 8, Math.max(8, maxLeft));
	dialogTop.value = clamp(y, 8, Math.max(8, maxTop));
}

function onDragEnd() {
	if (!isDragging.value) return;
	isDragging.value = false;
	emit('dragEnd', { x: dialogLeft.value, y: dialogTop.value });
}

// ---- 缩放逻辑 ----
function onResizeStart(e: MouseEvent) {
	if (!props.resizable || isMaximized.value) return;
	e.preventDefault();
	e.stopPropagation();
	isResizing.value = true;
	resizeStartX.value = e.clientX;
	resizeStartY.value = e.clientY;
	resizeStartWidth.value = dialogWidth.value;
	resizeStartHeight.value = dialogHeight.value || dialogRef.value?.offsetHeight || 300;
}

function onResizeMove(e: MouseEvent) {
	if (!isResizing.value) return;
	const deltaW = e.clientX - resizeStartX.value;
	const deltaH = e.clientY - resizeStartY.value;
	dialogWidth.value = clamp(resizeStartWidth.value + deltaW, 280, window.innerWidth - 32);
	dialogHeight.value = clamp(resizeStartHeight.value + deltaH, 150, window.innerHeight - 48);
	emit('resize', { width: dialogWidth.value, height: dialogHeight.value });
}

function onResizeEnd() {
	isResizing.value = false;
}

// ---- 全局事件 ----
function onKeydown(e: KeyboardEvent) {
	if (e.key === 'Escape' && props.closeOnPressEscape && isVisible.value) {
		close();
	}
}

function onGlobalMouseMove(e: MouseEvent) {
	if (isDragging.value) onDragMove(e);
	if (isResizing.value) onResizeMove(e);
}

function onGlobalMouseUp() {
	if (isDragging.value) onDragEnd();
	if (isResizing.value) onResizeEnd();
}

// ---- 监听 v-model ----
watch(
	() => props.modelValue,
	(val) => {
		if (val) open();
		else if (isVisible.value) close();
	}
);

onMounted(() => {
	window.addEventListener('mousemove', onGlobalMouseMove);
	window.addEventListener('mouseup', onGlobalMouseUp);
	window.addEventListener('keydown', onKeydown);
	if (props.modelValue) open();
});

onUnmounted(() => {
	window.removeEventListener('mousemove', onGlobalMouseMove);
	window.removeEventListener('mouseup', onGlobalMouseUp);
	window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
	<Teleport :to="appendToBody ? 'body' : undefined">
		<Transition name="dialog-scale">
			<div
				v-if="isVisible"
				ref="dialogRef"
				class="draggable-panel"
				:class="{ maximized: isMaximized, dragging: isDragging, resizing: isResizing }"
				:style="dialogStyle"
			>
				<!-- 标题栏（拖拽区域） -->
				<div class="panel-header" @mousedown="onDragStart" @dblclick="toggleMaximize">
					<slot name="header">
						<span class="panel-title">{{ title }}</span>
					</slot>
					<div class="panel-actions">
						<button class="action-btn" @click.stop="toggleMaximize" :title="isMaximized ? '还原' : '最大化'">
							<svg v-if="!isMaximized" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="3" y="3" width="18" height="18" rx="2" />
							</svg>
							<svg v-else viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="8" y="3" width="13" height="13" rx="2" />
								<polyline points="3 8 3 21 16 21" />
							</svg>
						</button>
						<button v-if="showClose" class="action-btn action-close" @click.stop="close" title="关闭">
							<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>
					</div>
				</div>

				<!-- 内容区域 -->
				<div class="panel-body">
					<slot />
				</div>

				<!-- 底部操作栏 -->
				<div v-if="$slots.footer" class="panel-footer">
					<slot name="footer" />
				</div>

				<!-- 缩放手柄 -->
				<div v-if="resizable && !isMaximized" class="panel-resize" @mousedown="onResizeStart" />
			</div>
		</Transition>
	</Teleport>
</template>

<style lang="scss" scoped>
// Element Plus Design Tokens
$primary: #409eff;
$text-primary: #303133;
$text-regular: #606266;
$text-secondary: #909399;
$border-color: #dcdfe6;
$border-color-light: #e4e7ed;
$bg-color: #ffffff;
$fill-color-light: #f5f7fa;
$transition-duration: 0.2s;

// ---- 浮层面板 ----
.draggable-panel {
	position: fixed;
	background: linear-gradient(145deg, #ffffff 0%, #fafbfc 100%);
	border-radius: 8px;
	box-shadow:
		0 2px 4px rgba(0, 0, 0, 0.04),
		0 8px 24px rgba(0, 0, 0, 0.08),
		0 24px 48px rgba(0, 0, 0, 0.06),
		inset 0 1px 0 rgba(255, 255, 255, 0.9);
	border: 1px solid rgba(0, 0, 0, 0.06);
	display: flex;
	flex-direction: column;
	overflow: hidden;
	min-width: 280px;
	min-height: 120px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	backdrop-filter: blur(8px);
	-webkit-backdrop-filter: blur(8px);
	z-index: 1001;

	&:hover {
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.04),
			0 12px 32px rgba(0, 0, 0, 0.1),
			0 32px 64px rgba(0, 0, 0, 0.08),
			inset 0 1px 0 rgba(255, 255, 255, 0.95);
	}

	&.dragging,
	&.resizing {
		transition:
			box-shadow 0.2s,
			border-color 0.2s !important;
		user-select: none;
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.04),
			0 16px 40px rgba(0, 0, 0, 0.12),
			0 40px 80px rgba(0, 0, 0, 0.08),
			inset 0 1px 0 rgba(255, 255, 255, 0.9);
		border-color: rgba($primary, 1);
	}

	&.maximized {
		border-radius: 0;
		transform: none;
	}
}

// ---- 标题栏 ----
.panel-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px 14px;
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	background: linear-gradient(180deg, rgba(0, 0, 0, 0.01) 0%, rgba(0, 0, 0, 0.025) 100%);
	cursor: move;
	flex-shrink: 0;
	user-select: none;
	gap: 8px;
}

.panel-title {
	font-size: 13px;
	font-weight: 600;
	color: $text-primary;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	flex: 1;
	min-width: 0;
}

.panel-actions {
	display: flex;
	align-items: center;
	gap: 2px;
	flex-shrink: 0;
}

.action-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 26px;
	height: 26px;
	padding: 0;
	border: none;
	border-radius: 6px;
	background: transparent;
	color: $text-secondary;
	cursor: pointer;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

	&:hover {
		background: rgba(0, 0, 0, 0.06);
		color: $text-primary;
		transform: scale(1.1);
	}

	&:active {
		transform: scale(0.9);
		background: rgba(0, 0, 0, 0.1);
	}
}

.action-close:hover {
	background: #fef0f0;
	color: #f56c6c;
	transform: scale(1.1) rotate(90deg);
}

// ---- 内容区域 ----
.panel-body {
	flex: 1;
	padding: 14px;
	overflow-y: auto;
	color: $text-regular;
	font-size: 13px;
	line-height: 1.6;
	min-height: 60px;
	scrollbar-width: thin;
	scrollbar-color: rgba(0, 0, 0, 0.12) transparent;

	&::-webkit-scrollbar {
		width: 5px;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
	}

	&::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.12);
		border-radius: 3px;

		&:hover {
			background: rgba(0, 0, 0, 0.2);
		}
	}
}

// ---- 底部操作栏 ----
.panel-footer {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 8px;
	padding: 10px 14px;
	border-top: 1px solid rgba(0, 0, 0, 0.05);
	background: linear-gradient(0deg, rgba(0, 0, 0, 0.015) 0%, rgba(0, 0, 0, 0.005) 100%);
	flex-shrink: 0;
}

// ---- 底部按钮样式 ----
:deep(.panel-footer) {
	button,
	.el-button {
		padding: 6px 16px;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		border: 1px solid $border-color;
		background: $bg-color;
		color: $text-regular;

		&:hover {
			color: $text-primary;
			border-color: #c0c4cc;
			transform: translateY(-1px);
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		}

		&:active {
			transform: translateY(0) scale(0.97);
		}
	}

	// 主按钮
	button.primary,
	.el-button--primary {
		background: $primary;
		border-color: $primary;
		color: #fff;

		&:hover {
			background: #66b1ff;
			border-color: #66b1ff;
			color: #fff;
			box-shadow: 0 2px 12px rgba($primary, 0.3);
		}
	}

	// 危险按钮
	button.danger,
	.el-button--danger {
		background: #fff;
		border-color: #f56c6c;
		color: #f56c6c;

		&:hover {
			background: #fef0f0;
			border-color: #f56c6c;
			color: #f56c6c;
		}
	}
}

// ---- 缩放手柄 ----
.panel-resize {
	position: absolute;
	right: 0;
	bottom: 0;
	width: 16px;
	height: 16px;
	cursor: nwse-resize;
	z-index: 1;
	border-radius: 0 0 8px 0;

	&::after {
		content: '';
		position: absolute;
		right: 3px;
		bottom: 3px;
		width: 7px;
		height: 7px;
		border-right: 2px solid rgba(0, 0, 0, 0.15);
		border-bottom: 2px solid rgba(0, 0, 0, 0.15);
		border-radius: 0 0 2px 0;
		transition: all 0.2s;
	}

	&:hover::after {
		border-color: $primary;
		transform: scale(1.1);
	}
}

// ---- 动效 ----
.dialog-scale-enter-active {
	transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dialog-scale-leave-active {
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-scale-enter-from {
	opacity: 0;
	transform: scale(0.85) translateY(-16px);
}

.dialog-scale-leave-to {
	opacity: 0;
	transform: scale(0.9) translateY(-8px);
}
</style>
