<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useThreeScene } from '@/composables/useThreeScene';
import { toolRegistry } from '@/tools';
import type { ToolContext } from '@/tools';
import ModelLoader from '@/components/ModelLoader/index.vue';
import ToolBar from '@/components/ToolBar/index.vue';
import RadialMenu from '@/components/RadialMenu/index.vue';

const {
	init,
	dispose,
	loading,
	loadProgress,
	renderer,
	scene,
	camera,
	modelGroup,
	controls,
	modelSize,
	isMoveMode,
	moveSpeed,
	setMoveMode,
	setMoveSpeed,
} = useThreeScene();

const toolContext: ToolContext = {
	get renderer() {
		return renderer.value;
	},
	get scene() {
		return scene.value;
	},
	get camera() {
		return camera.value;
	},
	get modelGroup() {
		return modelGroup.value;
	},
	get controls() {
		return controls.value;
	},
	get modelSize() {
		return modelSize.value;
	},
	get isMoveMode() {
		return isMoveMode.value;
	},
	get moveSpeed() {
		return moveSpeed.value;
	},
	setMoveMode,
	setMoveSpeed,
};

const handleToolAction = (action: string, payload?: any) => {
	const handler = toolRegistry[action];
	if (handler) {
		handler(toolContext, payload);
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
	<div class="container">
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
