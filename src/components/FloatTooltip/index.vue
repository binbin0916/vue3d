<template>
	<Teleport to="body">
		<Transition name="float-tooltip">
			<div
				v-if="tooltipState.visible"
				ref="tooltipRef"
				class="float-tooltip"
				:style="{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }"
			>
				<span v-if="isPlainText" class="float-tooltip__text">{{ tooltipState.content }}</span>
				<component :is="renderVNode" v-else />
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
/**
 * FloatTooltip - 跟随鼠标提示框（单实例）
 *
 * @description 配合 controller.ts 使用，通过 showTooltip/hideTooltip API 控制。
 * 打开后持续监听 mousemove 跟随光标，自动做视口边缘防溢出。
 * 需在 App 根节点挂载一次（unplugin-vue-components 自动注册）。
 */
import { computed, isVNode, nextTick, onBeforeUnmount, onMounted, ref, watch, type VNode } from 'vue';
import { setLastMouse, tooltipState } from './controller';

const tooltipRef = ref<HTMLDivElement | null>(null);

/** 渲染位置（左上角） */
const position = computed<{ x: number; y: number }>(() => ({ x: tooltipState.x, y: tooltipState.y }));

/** 内容是否为纯文本 */
const isPlainText = computed(() => typeof tooltipState.content === 'string');

/** VNode 内容包装为函数式组件渲染 */
const renderVNode = computed(() => {
	if (isVNode(tooltipState.content)) {
		return () => tooltipState.content as VNode;
	}
	return null;
});

/**
 * 视口边缘防溢出：将提示框 clamp 到可视区域内
 * 优先显示在光标右下，空间不足时翻到另一侧
 */
function clampToViewport() {
	const el = tooltipRef.value;
	if (!el) return;
	const { offsetWidth: w, offsetHeight: h } = el;
	const offset = tooltipState.offset;
	let { x, y } = position.value;

	if (x + w + offset > window.innerWidth) x = window.innerWidth - w - offset;
	if (y + h + offset > window.innerHeight) y = window.innerHeight - h - offset;
	if (x < offset) x = offset;
	if (y < offset) y = offset;

	tooltipState.x = x;
	tooltipState.y = y;
}

/** 鼠标移动：实时更新位置并 clamp */
function handleMouseMove(e: MouseEvent) {
	const offset = tooltipState.offset;
	const x = e.clientX + offset;
	const y = e.clientY + offset;

	setLastMouse(x, y);

	if (!tooltipState.visible) return;

	tooltipState.x = x;
	tooltipState.y = y;
	clampToViewport();
}

/** 打开后等首帧渲染完成，先做一次 clamp（内容尺寸未知） */
watch(
	() => tooltipState.visible,
	async (visible) => {
		if (!visible) return;
		await nextTick();
		clampToViewport();
	}
);

onMounted(() => {
	window.addEventListener('mousemove', handleMouseMove);
});

onBeforeUnmount(() => {
	window.removeEventListener('mousemove', handleMouseMove);
});
</script>

<style scoped lang="scss">
.float-tooltip {
	position: fixed;
	top: 0;
	left: 0;
	max-width: 320px;
	padding: 6px 10px;
	background: var(--el-bg-color-overlay);
	color: var(--el-text-color-primary);
	font-size: 12px;
	line-height: 1.4;
	border-radius: 4px;
	border: 1px solid var(--el-border-color-lighter);
	box-shadow: var(--el-box-shadow-light);
	pointer-events: none; /* 不拦截鼠标，保持跟随流畅 */
	z-index: 9999;
	will-change: transform;
	backface-visibility: hidden;
}

.float-tooltip__text {
	white-space: nowrap;
}

.float-tooltip-enter-active,
.float-tooltip-leave-active {
	transition: opacity 0.15s ease;
}

.float-tooltip-enter-from,
.float-tooltip-leave-to {
	opacity: 0;
}
</style>
