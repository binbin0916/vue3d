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
interface Props {
	/** SVG 文件名（不含扩展名） */
	name: string;
	/** 图标大小（px） */
	size?: number;
	/** 图标颜色（CSS 颜色值） */
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
