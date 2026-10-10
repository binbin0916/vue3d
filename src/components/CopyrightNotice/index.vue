<script setup lang="ts">
const year = new Date().getFullYear();
</script>

<template>
	<footer class="copyright" role="contentinfo">© {{ year }} vue-3d · All Rights Reserved</footer>
</template>

<style lang="scss" scoped>
.copyright {
	position: fixed;
	left: 50%;
	bottom: max(clamp(2px, 0.6vw, 8px), env(safe-area-inset-bottom, 0px));
	z-index: 900;
	transform: translateX(-50%);
	box-sizing: border-box;
	max-width: calc(100vw - clamp(16px, 3vw, 40px));
	padding: clamp(2px, 0.3vw, 4px) clamp(8px, 1vw, 12px);
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.72);
	border: 1px solid rgba(0, 0, 0, 0.06);
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
	backdrop-filter: blur(6px);
	-webkit-backdrop-filter: blur(6px);
	font-size: clamp(10px, 1vw, 12px);
	line-height: 1.4;
	letter-spacing: 0.02em;
	text-align: center;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	color: #909399;
	pointer-events: none;
	user-select: none;
}
</style>
