<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';

/**
 * AnimatedSelect - 带动画的下拉选择组件
 *
 * @description 原生 <select> 的 <option> 由浏览器系统渲染，无法做打开/关闭动画。
 * 此组件使用自定义下拉列表 + Transition 实现：
 * - 打开：面板缩放淡入，选项逐个级联滑入
 * - 关闭：面板淡出
 * 列表通过 Teleport 挂载到 body，避免被弹窗的 overflow 裁剪。
 */
interface SelectOption {
	label: string;
	value: string;
}

interface Props {
	/** 当前选中值（v-model） */
	modelValue: string;
	/** 选项列表 */
	options: SelectOption[];
	/** 未选中时的占位文本 */
	placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
	placeholder: '请选择',
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
}>();

const isOpen = ref(false);
const rootRef = ref<HTMLDivElement | null>(null);
const optListRef = ref<HTMLUListElement | null>(null);
const activeIndex = ref(-1);
const listStyle = ref({ left: '0px', top: '0px', width: '0px' });

const selectedLabel = computed(() => {
	const hit = props.options.find((o) => o.value === props.modelValue);
	return hit ? hit.label : props.placeholder;
});

/**
 * toggle - 切换下拉开关
 *
 * @description 打开时定位到当前选中项，下一帧计算面板位置（基于触发按钮的视口坐标）
 */
function toggle() {
	isOpen.value = !isOpen.value;
	if (isOpen.value) {
		activeIndex.value = Math.max(
			0,
			props.options.findIndex((o) => o.value === props.modelValue)
		);
		nextTick(() => {
			updatePosition();
			optListRef.value?.scrollTo({ top: 0 });
		});
	} else {
		activeIndex.value = -1;
	}
}

/**
 * updatePosition - 计算面板 fixed 定位
 *
 * @description 空间不足时（下方放不下整列）自动改为向上展开
 */
function updatePosition() {
	const el = rootRef.value;
	if (!el) return;
	const rect = el.getBoundingClientRect();
	const rowHeight = 30;
	const estimatedHeight = Math.min(220, props.options.length * rowHeight + 8);
	const spaceBelow = window.innerHeight - rect.bottom - 8;
	const openUpward = spaceBelow < estimatedHeight && rect.top > spaceBelow;

	listStyle.value = {
		left: `${rect.left}px`,
		top: openUpward ? `${rect.top - estimatedHeight + 2}px` : `${rect.bottom + 4}px`,
		width: `${rect.width}px`,
	};
}

function select(value: string) {
	emit('update:modelValue', value);
	isOpen.value = false;
	activeIndex.value = -1;
}

/** 键盘操作：Enter/空格/方向键开合，↑↓ 切换选项，Enter 确认，Esc 关闭 */
function onKeydown(e: KeyboardEvent) {
	const len = props.options.length;
	if (!isOpen.value) {
		if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
			e.preventDefault();
			toggle();
		}
		return;
	}
	if (e.key === 'Escape') {
		isOpen.value = false;
		return;
	}
	if (len === 0) return;
	if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
		e.preventDefault();
		activeIndex.value = (activeIndex.value + (e.key === 'ArrowDown' ? 1 : -1) + len) % len;
		return;
	}
	if (e.key === 'Enter' && activeIndex.value >= 0) {
		e.preventDefault();
		const opt = props.options[activeIndex.value];
		if (opt) select(opt.value);
	}
}

/** 点击面板外部关闭 */
function onDocumentClick(e: MouseEvent) {
	const target = e.target as Node | null;
	const insideRoot = rootRef.value?.contains(target) ?? false;
	const insideList = optListRef.value?.contains(target) ?? false;
	if (!insideRoot && !insideList) {
		isOpen.value = false;
	}
}

/** 视口变化时跟随重定位 */
function onWindowChange() {
	if (isOpen.value) updatePosition();
}

onMounted(() => {
	document.addEventListener('click', onDocumentClick);
	window.addEventListener('resize', onWindowChange);
	window.addEventListener('scroll', onWindowChange, true);
});

onUnmounted(() => {
	document.removeEventListener('click', onDocumentClick);
	window.removeEventListener('resize', onWindowChange);
	window.removeEventListener('scroll', onWindowChange, true);
});
</script>

<template>
	<div ref="rootRef" class="as-select" @keydown="onKeydown">
		<!-- 触发器 -->
		<button type="button" class="as-trigger" :class="{ 'as-trigger--open': isOpen }" @click.stop="toggle">
			<span class="as-trigger__label">{{ selectedLabel }}</span>
			<svg class="as-trigger__arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
				<polyline points="6 9 12 15 18 9" />
			</svg>
		</button>

		<!-- 下拉面板（挂载到 body，避免被弹窗 overflow 裁剪） -->
		<Teleport to="body">
			<Transition name="as-drop">
				<ul v-if="isOpen" ref="optListRef" class="as-list" :style="listStyle">
					<li
						v-for="(opt, i) in options"
						:key="opt.value"
						class="as-item"
						:class="{ 'as-item--active': opt.value === modelValue, 'as-item--hover': i === activeIndex }"
						:style="{ '--i': i }"
						@click="select(opt.value)"
						@mouseenter="activeIndex = i"
					>
						{{ opt.label }}
					</li>
				</ul>
			</Transition>
		</Teleport>
	</div>
</template>

<style lang="scss" scoped>
// Element Plus Design Tokens
$primary: #409eff;
$text-primary: #303133;
$text-regular: #606266;
$text-secondary: #909399;
$border-color: #dcdfe6;
$border-color-light: #e4e7ed;
$fill-color-light: #f5f7fa;

.as-select {
	position: relative;
	width: 100%;
}

// ---- 触发器 ----
.as-trigger {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	width: 100%;
	height: 28px;
	padding: 0 8px;
	border: 1px solid $border-color;
	border-radius: 4px;
	background: #fff;
	font-size: 13px;
	color: $text-regular;
	text-align: left;
	cursor: pointer;
	outline: none;
	transition: border-color 0.2s;

	&:hover {
		border-color: #c0c4cc;
	}

	&--open {
		border-color: $primary;
	}
}

.as-trigger__label {
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.as-trigger__arrow {
	flex-shrink: 0;
	color: $text-secondary;
	transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

	.as-trigger--open & {
		transform: rotate(180deg);
	}
}

// ---- 下拉面板 ----
.as-list {
	position: fixed;
	margin: 0;
	padding: 4px;
	list-style: none;
	max-height: 220px;
	overflow-y: auto;
	background: #fff;
	border: 1px solid $border-color-light;
	border-radius: 6px;
	box-shadow:
		0 4px 12px rgba(0, 0, 0, 0.12),
		0 12px 28px rgba(0, 0, 0, 0.08);
	z-index: 2000;
	scrollbar-width: thin;
	scrollbar-color: rgba(0, 0, 0, 0.12) transparent;

	&::-webkit-scrollbar {
		width: 5px;
	}

	&::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.12);
		border-radius: 3px;
	}
}

// ---- 选项 ----
.as-item {
	padding: 5px 10px;
	border-radius: 4px;
	font-size: 13px;
	line-height: 1.6;
	color: $text-regular;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	cursor: pointer;
	animation: as-item-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both;
	animation-delay: calc(var(--i) * 20ms);

	&:hover,
	&--hover {
		background: $fill-color-light;
		color: $text-primary;
	}

	&--active {
		background: rgba($primary, 0.08);
		color: $primary;
		font-weight: 500;
	}
}

// ---- 面板开合动画 ----
.as-drop-enter-active {
	transition:
		opacity 0.22s ease,
		transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
	transform-origin: top center;
}

.as-drop-leave-active {
	transition:
		opacity 0.15s ease,
		transform 0.15s ease;
	transform-origin: top center;
}

.as-drop-enter-from,
.as-drop-leave-to {
	opacity: 0;
	transform: translateY(-6px) scale(0.98);
}

@keyframes as-item-in {
	from {
		opacity: 0;
		transform: translateY(-4px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
