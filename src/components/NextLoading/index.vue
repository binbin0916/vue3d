<script setup lang="ts">
import { toRefs, ref, onMounted } from 'vue';
import { animationCount } from '@/utils/common';

const props = defineProps({
	progress: {
		type: Number,
		default: 0,
	},
});

const { progress } = toRefs(props);

const prcent = ref(0);

const isShow = ref(false);

onMounted(() => {
	animationCount(
		500,
		0,
		progress.value,
		(curr, originFrom) => {
			void originFrom;
			if (curr !== 0) {
				prcent.value = curr;
			}
			if (curr >= 100) {
			}

			if (curr >= 100) {
				setTimeout(() => {
					isShow.value = true;
					(document.getElementById('next-loading') as HTMLElement).style.opacity = '0';
					setTimeout(() => {
						(document.getElementById('next-loading') as HTMLElement).style.display = 'none';
					}, 300);
				}, 800);
			} else {
				isShow.value = false;
			}
		},
		2
	);
});
</script>

<template>
	<div class="next-loading" id="next-loading">
		<div class="next-loading-warp">
			<div clas="next-loading-title">模型文件首次加载可能时间较长，请耐心等待...</div>
			<div class="next-loading-bar">
				<div class="next-loading-bar-inner" :style="{ width: `${prcent}%` }"></div>
			</div>
			<div class="next-loading-text">
				<span> 当前模型已加载 {{ prcent }}%</span>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.next-loading {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgb(0, 0, 0, 80%);
	user-select: none;
	pointer-events: none;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	z-index: 2000;
	transition: opacity 0.3s;

	.next-loading-warp {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: 24px;
		padding: 24px;
		border-radius: 20px;
		background-color: rgb(255, 255, 255, 90%);
		backdrop-filter: blur(5px);
		box-shadow:
			0px 4px 6px -1px rgba(0, 0, 0, 0.1),
			0px 2px 4px -2px rgba(0, 0, 0, 0.1);
		transition: all 1s;
	}

	.next-loading-bar {
		height: 20px;
		width: 100%;
		border: 2px solid #dcdfe6;
		border-radius: 9999px;
		overflow: hidden;

		.next-loading-bar-inner {
			background-color: #409eff;
			width: 0%;
			height: 100%;
			transition: width 0.3s;
		}
	}

	.next-loading-text {
		font-size: 16px;
		color: #303133;
	}
}

.next-loading-title {
	font-size: 16px;
}
</style>
