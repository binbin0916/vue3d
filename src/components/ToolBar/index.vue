<script setup lang="ts">
import SvgIcon from '@/components/SvgIcon/index.vue';
</script>

<template>
	<div class="toolbar-container">
		<SvgIcon name="home"></SvgIcon>
	</div>
</template>

<style lang="scss" scoped>
.toolbar-container {
	position: absolute;
	bottom: 50px;
	left: 50%;
	transform: translateX(-50%);
	padding: 6px 24px;
	border-radius: 8px;
	backdrop-filter: blur(10px) brightness(100%);
	background-color: rgba(255, 255, 255, 0.5);
	z-index: 999;
}
</style>
