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
import SectionDialog from '@/components/SectionDialog/index.vue';
import ModelPropDialog from '@/components/ModelPropDialog/index.vue';

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
	meshes,
	box,
	sceneUserData,
	setMoveMode,
	setMoveSpeed,
	rotateToView,
	toggleAutoRotate,
	setAutoRotate,
	handleFaceClick,
	setAxesVisibe,
	addFrameTask,
	removeFrameTask,
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
	get meshes() {
		return meshes.value;
	},
	get box() {
		return box.value;
	},
	get sceneUserData() {
		return sceneUserData.value;
	},
	setMoveMode,
	setMoveSpeed,
	rotateToView,
	toggleAutoRotate,
	setAutoRotate,
	handleFaceClick,
	setAxesVisibe,
	addFrameTask,
	removeFrameTask,
};

const currentColor = ref('#ffffff');

/**
 * createDialogBinding - 创建工具弹窗的完整绑定
 *
 * 自动完成：工具激活 ↔ 弹窗显示同步、弹窗关闭时取消激活并恢复场景
 *
 * @param toolPrefix - 工具 ID 前缀（如 'material-solid'、'section-'）
 * @returns showDialog（弹窗显示状态）和 activeToolId（当前激活的工具 ID）
 */
function createDialogBinding(toolPrefix: string) {
	const showDialog = ref(false);
	const activeToolId = ref('');

	// 工具激活/取消 → 同步弹窗显示
	watch(
		() => toolStore.activeTools,
		() => {
			let found = false;
			for (const id of toolStore.activeTools) {
				if (id.startsWith(toolPrefix)) {
					found = true;
					activeToolId.value = id;
					break;
				}
			}
			showDialog.value = found;
			if (!found) activeToolId.value = '';
		},
		{ deep: true }
	);

	// 弹窗关闭 → 取消激活并恢复场景
	watch(showDialog, (visible) => {
		if (!visible && activeToolId.value) {
			const restoreId = `${activeToolId.value}:restore`;
			if (toolRegistry[restoreId]) {
				handleToolAction(restoreId);
			}
			toolStore.deactivate(activeToolId.value);
		}
	});

	return { showDialog, activeToolId };
}

const colorDialog = createDialogBinding('material-solid');
const sectionDialog = createDialogBinding('section-');
const modelPropDialog = createDialogBinding('modelprop-overall');

/**
 * handleColorChange - 颜色选择器变化处理
 */
const handleColorChange = (color: string) => {
	currentColor.value = color;
	if (colorDialog.activeToolId.value) {
		handleToolAction(colorDialog.activeToolId.value, color);
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
	const actionId = item.id;
	handleToolAction(actionId);
};

/**
 * handleRadialActivate - RadialMenu 激活型菜单项状态变化处理
 */
const handleRadialActivate = (id: string, activated: boolean) => {
	const actionId = id;
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
		<DraggableDialog v-model="colorDialog.showDialog.value" title="颜色选择" width="320px" top="120px">
			<ColorPicker v-model="currentColor" @change="handleColorChange" />
		</DraggableDialog>
		<!-- 剖切弹窗 -->
		<DraggableDialog v-model="sectionDialog.showDialog.value" title="剖切设置" width="320px" top="120px">
			<SectionDialog
				@invert="handleToolAction('section-plane:invert')"
				@reset="handleToolAction('section-plane:reset')"
				@visible="handleToolAction('section-plane:visible', 123)"
			/>
		</DraggableDialog>
		<DraggableDialog v-model="modelPropDialog.showDialog.value" title="模型总属性" width="360px" top="120px">
			<ModelPropDialog :ctx="toolContext" :sceneUserData="sceneUserData" />
		</DraggableDialog>
	</div>
</template>

<style lang="scss" scoped>
.container {
	position: relative;
	width: 100%;
	height: 100%;
}
</style>
