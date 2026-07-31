<template>
	<svg
		class="svg-icon"
		:style="{
			width: size + 'px',
			height: size + 'px',
			color: color,
		}"
		aria-hidden="true"
	>
		<use :href="`#icon-${name}`" />
	</svg>
</template>

<script setup lang="ts">
/**
 * SvgIcon - SVG 图标组件
 *
 * @description 从 SVG sprite 中按名称加载并显示图标。
 * 配合 vite-plugin-svg-icons 使用，图标文件位于 src/assets/svgs/ 目录
 *
 * @example
 * ```vue
 * <SvgIcon name="move" :size="18" color="#333" />
 * ```
 */
interface Props {
	/** SVG 文件名（不含扩展名），对应 src/assets/svgs/ 下的文件 */
	name: string;
	/** 图标大小（px），默认 16 */
	size?: number;
	/** 图标颜色（CSS 颜色值），默认 '#303133' */
	color?: string;
}

withDefaults(defineProps<Props>(), {
	size: 16,
	color: '#303133',
});
</script>

<style scoped>
.svg-icon {
	display: inline-block;
	fill: currentColor; /* 继承父级颜色，与 color 联动 */
	stroke: currentColor; /* 如果 SVG 使用 stroke 也一样 */
	vertical-align: -0.1em;
	flex-shrink: 0;
}
</style>
