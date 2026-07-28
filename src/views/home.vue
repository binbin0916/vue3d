<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useThreeScene } from '@/composables/useThreeScene';
import ModelLoader from '@/components/ModelLoader/index.vue';
import ToolBar from '@/components/ToolBar/index.vue';
import RadialMenu from '@/components/RadialMenu/index.vue';

const containerRef = ref<HTMLDivElement>();
const {
	init,
	dispose,
	loading,
	loadProgress,
	isMoveMode,
	setMoveMode,
	setMoveSpeed,
} = useThreeScene();

const handleToolAction = (action: string, payload?: any) => {
	switch (action) {
		case 'move:toggle':
			setMoveMode(!isMoveMode.value);
			break;
		case 'move:setSpeed':
			setMoveSpeed(payload);
			break;
	}
};

onMounted(() => {
	const v = document.getElementById('v') as HTMLElement;
	const script = document.querySelector('script#code');
	if (!v || !script) return;
	const code = script.getAttribute('data-code') || '';
	if (!code) return;
	init(v, code);
});

onUnmounted(() => {
	dispose();
});
</script>

<template>
	<div class="container" ref="containerRef">
		<div id="v"></div>
		<ModelLoader :loading="loading" :loaded="loadProgress.loaded" :total="loadProgress.total" :percent="loadProgress.percent" />
		<RadialMenu />
		<ToolBar :is-move-mode="isMoveMode" @tool-action="handleToolAction" />
	</div>
</template>

<style lang="scss" scoped>
.container {
	position: relative;
	width: 100%;
	height: 100%;
}
</style>
