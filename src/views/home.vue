<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useThreeScene } from '@/composables/useThreeScene';
import { toolRegistry } from '@/tools';
import type { ToolContext } from '@/tools';
import { useToolStore } from '@/stores/tool';
import ModelLoader from '@/components/ModelLoader/index.vue';
import ToolBar from '@/components/ToolBar/index.vue';
import RadialMenu from '@/components/RadialMenu/index.vue';
import DraggableDialog from '@/components/DraggableDialog/index.vue';
import ColorPicker from '@/components/ColorPicker/index.vue';

const toolStore = useToolStore();

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
	moveSpeed,
	autoRotate,
	setMoveMode,
	setMoveSpeed,
	rotateToView,
	toggleAutoRotate,
	setAutoRotate,
	handleFaceClick,
	setAxesVisibe,
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
	get moveSpeed() {
		return moveSpeed.value;
	},
	get autoRotate() {
		return autoRotate.value;
	},
	setMoveMode,
	setMoveSpeed,
	rotateToView,
	toggleAutoRotate,
	setAutoRotate,
	handleFaceClick,
	setAxesVisibe,
};

// ---- 颜色弹窗状态 ----
const showColorDialog = ref(false);
const currentColor = ref('#ffffff');
const activeColorToolId = ref('');

/**
 * 检查是否有颜色工具激活，显示/隐藏颜色弹窗
 */
watch(
	() => toolStore.activeTools,
	() => {
		let foundColorTool = false;
		for (const id of toolStore.activeTools) {
			// 通过 toolRegistry 检查是否是材质工具（带颜色）
			if (id.startsWith('material-solid')) {
				foundColorTool = true;
				activeColorToolId.value = id;
				break;
			}
		}
		showColorDialog.value = foundColorTool;
		if (!foundColorTool) activeColorToolId.value = '';
	},
	{ deep: true }
);

/**
 * handleColorChange - 颜色选择器变化处理
 */
const handleColorChange = (color: string) => {
	currentColor.value = color;
	if (activeColorToolId.value) {
		handleToolAction(activeColorToolId.value, color);
	}
};

/**
 * handleToolAction - 统一处理工具动作
 */
const handleToolAction = (action: string, payload?: any) => {
	const handler = toolRegistry[action];
	if (handler) {
		handler(toolContext, payload);
	}
};

/**
 * handleRadialSelect - RadialMenu 非激活型菜单项点击处理
 */
const handleRadialSelect = (item: { id: string; label: string }) => {
	const actionId = item.id.startsWith('section-') ? `section:${item.id.replace('section-', '')}` : item.id;
	handleToolAction(actionId);
};

/**
 * handleRadialActivate - RadialMenu 激活型菜单项状态变化处理
 */
const handleRadialActivate = (id: string, activated: boolean) => {
	const actionId = id.startsWith('section-') ? `section:${id.replace('section-', '')}` : id;
	if (activated) {
		handleToolAction(actionId);
	} else {
		const restoreId = `${actionId}:restore`;
		if (toolRegistry[restoreId]) {
			handleToolAction(restoreId);
		}
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
		<RadialMenu @select="handleRadialSelect" @activate="handleRadialActivate" />
		<ToolBar @tool-action="handleToolAction" />

		<!-- 颜色选择弹窗 -->
		<DraggableDialog v-model="showColorDialog" title="颜色选择" width="320px" top="120px">
			<ColorPicker v-model="currentColor" @change="handleColorChange" />
		</DraggableDialog>
		<!--  -->
	</div>
</template>

<style lang="scss" scoped>
.container {
	position: relative;
	width: 100%;
	height: 100%;
}
</style>
