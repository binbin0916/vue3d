<script setup lang="ts">
import { ref, computed } from 'vue';
import SvgIcon from '@/components/SvgIcon/index.vue';

interface ToolItem {
	id: string;
	icon: string;
	label: string;
	activatable?: boolean;
	children?: ToolItem[];
}

const activeStack = ref<string[]>([]);
const activatedItemId = ref<string | null>(null);

const tools: ToolItem[] = [
	{
		id: 'move',
		icon: 'move',
		label: '移动',
		activatable: true,
	},
	{
		id: 'view',
		icon: 'view',
		label: '视角',
		children: [
			{ id: 'view-front', icon: 'view', label: '正视图', activatable: true },
			{ id: 'view-back', icon: 'view', label: '后视图', activatable: true },
			{ id: 'view-left', icon: 'view', label: '左视图', activatable: true },
			{ id: 'view-right', icon: 'view', label: '右视图', activatable: true },
			{ id: 'view-top', icon: 'view', label: '俯视图', activatable: true },
			{ id: 'view-bottom', icon: 'view', label: '仰视图', activatable: true },
		],
	},
	{
		id: 'measure',
		icon: 'measure',
		label: '测量',
		children: [
			{ id: 'measure-distance', icon: 'measure', label: '距离测量', activatable: true },
			{ id: 'measure-angle', icon: 'measure', label: '角度测量', activatable: true },
			{ id: 'measure-area', icon: 'measure', label: '面积测量', activatable: true },
		],
	},
	{
		id: 'annotate',
		icon: 'annotate',
		label: '标注',
		children: [
			{ id: 'annotate-text', icon: 'annotate', label: '文字标注', activatable: true },
			{ id: 'annotate-pin', icon: 'annotate', label: '图钉标注', activatable: true },
		],
	},
	{
		id: 'section',
		icon: 'section',
		label: '剖切',
		children: [
			{
				id: 'section-plane',
				icon: 'section',
				label: '平面剖切',
				children: [
					{ id: 'section-plane-x', icon: 'section', label: 'X轴平面', activatable: true },
					{ id: 'section-plane-y', icon: 'section', label: 'Y轴平面', activatable: true },
					{ id: 'section-plane-z', icon: 'section', label: 'Z轴平面', activatable: true },
				],
			},
			{
				id: 'section-box',
				icon: 'section',
				label: '盒式剖切',
				children: [
					{ id: 'section-box-inner', icon: 'section', label: '内部剖切', activatable: true },
					{ id: 'section-box-outer', icon: 'section', label: '外部剖切', activatable: true },
				],
			},
			{ id: 'section-custom', icon: 'section', label: '自定义剖切', activatable: true },
		],
	},
	{
		id: 'material',
		icon: 'material',
		label: '材质',
		children: [
			{ id: 'material-wireframe', icon: 'material', label: '线框模式', activatable: true },
			{ id: 'material-xray', icon: 'material', label: 'X光模式', activatable: true },
			{ id: 'material-normal', icon: 'material', label: '法线显示', activatable: true },
			{ id: 'material-solid', icon: 'material', label: '纯色显示', activatable: true },
		],
	},
	{
		id: 'export',
		icon: 'export',
		label: '导出',
		children: [
			{ id: 'export-screenshot', icon: 'export', label: '截图' },
			{ id: 'export-glb', icon: 'export', label: '导出GLB' },
			{ id: 'export-gltf', icon: 'export', label: '导出GLTF' },
		],
	},
];

const currentItems = ref<ToolItem[]>(tools);
const direction = ref<'forward' | 'backward'>('forward');

function findItemById(items: ToolItem[], id: string): ToolItem | undefined {
	for (const item of items) {
		if (item.id === id) return item;
		if (item.children) {
			const found = findItemById(item.children, id);
			if (found) return found;
		}
	}
	return undefined;
}

const breadcrumbItems = computed(() => {
	return activeStack.value.map((id) => {
		const item = findItemById(tools, id);
		return { id, label: item?.label ?? id };
	});
});

const handleSelect = (item: ToolItem) => {
	if (item.children && item.children.length > 0) {
		direction.value = 'forward';
		activeStack.value.push(item.id);
		currentItems.value = item.children;
		activatedItemId.value = null;
	} else if (item.activatable) {
		if (activatedItemId.value === item.id) {
			activatedItemId.value = null;
			console.log('Deactivated:', item.id);
		} else {
			activatedItemId.value = item.id;
			console.log('Activated:', item.id);
		}
	} else {
		console.log('Selected:', item.id);
	}
};

const handleClose = () => {
	direction.value = 'backward';
	activatedItemId.value = null;
	activeStack.value.pop();
	if (activeStack.value.length === 0) {
		currentItems.value = tools;
	} else {
		const parentId = activeStack.value.at(-1);
		if (parentId) {
			const parent = findItemById(tools, parentId);
			currentItems.value = parent?.children ?? tools;
		}
	}
};

const handleBreadcrumbClick = (index: number) => {
	direction.value = 'backward';
	activatedItemId.value = null;
	activeStack.value = activeStack.value.slice(0, index);
	if (activeStack.value.length === 0) {
		currentItems.value = tools;
	} else {
		const parentId = activeStack.value.at(-1);
		if (parentId) {
			const parent = findItemById(tools, parentId);
			currentItems.value = parent?.children ?? tools;
		}
	}
};
</script>

<template>
	<div class="toolbar-wrapper">
		<Transition :name="direction === 'forward' ? 'slide-forward' : 'slide-backward'" mode="out-in">
			<div :key="activeStack.join('-') || 'root'" class="toolbar-level">
				<div class="toolbar-header" v-if="activeStack.length > 0">
					<div class="breadcrumb-nav">
						<span class="breadcrumb-root" @click="handleBreadcrumbClick(0)">菜单</span>
						<template v-for="(item, index) in breadcrumbItems" :key="item.id">
							<span class="breadcrumb-sep">
								<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
									<polyline points="9 18 15 12 9 6" />
								</svg>
							</span>
							<span class="breadcrumb-item" :class="{ active: index === breadcrumbItems.length - 1 }" @click="handleBreadcrumbClick(index + 1)">
								{{ item.label }}
							</span>
						</template>
					</div>
					<button class="close-btn" @click="handleClose" title="关闭当前菜单">
						<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				</div>

				<div class="toolbar-items">
					<button
						v-for="(item, index) in currentItems"
						:key="item.id"
						class="toolbar-item"
						:class="{ activated: activatedItemId === item.id }"
						:style="{ '--delay': `${index * 40}ms` }"
						@click="handleSelect(item)"
					>
						<div class="item-icon">
							<SvgIcon :name="item.icon" :size="18" />
						</div>
						<span class="item-label">{{ item.label }}</span>
						<span v-if="item.children && item.children.length > 0" class="item-arrow">
							<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
								<polyline points="9 18 15 12 9 6" />
							</svg>
						</span>
					</button>
				</div>
			</div>
		</Transition>
	</div>
</template>

<style lang="scss" scoped>
// 主题色
$primary: #2979ff;
$primary-light: #e3f2fd;
$primary-dark: #1565c0;

.toolbar-wrapper {
	position: fixed;
	bottom: 32px;
	left: 50%;
	transform: translateX(-50%);
	z-index: 1000;
}

.toolbar-level {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

// 模态风格容器
.toolbar-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	padding: 12px 20px;
	background: rgba(255, 255, 255, 0.92);
	backdrop-filter: blur(20px) saturate(180%);
	border-radius: 20px;
	box-shadow:
		0 8px 32px rgba(0, 0, 0, 0.12),
		0 2px 8px rgba(0, 0, 0, 0.06),
		inset 0 1px 0 rgba(255, 255, 255, 0.8);
	border: 1px solid rgba(255, 255, 255, 0.6);
}

.breadcrumb-nav {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 13px;
}

.breadcrumb-root {
	color: $primary;
	cursor: pointer;
	font-weight: 600;
	transition: all 0.2s;
	padding: 6px 10px;
	border-radius: 8px;
	letter-spacing: 0.3px;

	&:hover {
		background: $primary-light;
	}
}

.breadcrumb-sep {
	display: flex;
	align-items: center;
	color: #c0c0c0;
}

.breadcrumb-item {
	color: #888;
	cursor: pointer;
	padding: 6px 10px;
	border-radius: 8px;
	transition: all 0.2s;

	&:hover {
		background: #f5f5f5;
		color: #333;
	}

	&.active {
		color: #222;
		font-weight: 600;
		background: #f8f8f8;
	}
}

.close-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	padding: 0;
	border: none;
	border-radius: 10px;
	background: #f5f5f5;
	color: #999;
	cursor: pointer;
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

	&:hover {
		background: #ff5252;
		color: #fff;
		transform: rotate(90deg);
		box-shadow: 0 4px 12px rgba(255, 82, 82, 0.35);
	}
}

// 模态风格菜单容器
.toolbar-items {
	display: flex;
	gap: 6px;
	padding: 10px 14px;
	background: rgba(255, 255, 255, 0.92);
	backdrop-filter: blur(20px) saturate(180%);
	border-radius: 20px;
	box-shadow:
		0 8px 40px rgba(0, 0, 0, 0.15),
		0 2px 12px rgba(0, 0, 0, 0.08),
		inset 0 1px 0 rgba(255, 255, 255, 0.8);
	border: 1px solid rgba(255, 255, 255, 0.6);
}

.toolbar-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 12px 18px;
	border: none;
	border-radius: 14px;
	background: transparent;
	color: #444;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	white-space: nowrap;
	animation: itemFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
	animation-delay: var(--delay);

	&:hover {
		background: #f0f0f0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	}

	&:active {
		transform: scale(0.96);
		background: #e8e8e8;
	}

	&.activated {
		background: $primary-light;
		color: $primary-dark;
		box-shadow:
			inset 0 0 0 2px rgba($primary, 0.2),
			0 2px 8px rgba($primary, 0.15);

		.item-icon {
			color: $primary;
			box-shadow: 0 4px 14px rgba($primary, 0.4);
		}

		.item-label {
			color: $primary-dark;
			font-weight: 600;
		}
	}
}

@keyframes itemFadeIn {
	from {
		opacity: 0;
		transform: translateY(16px) scale(0.9);
	}
	to {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}

.item-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border-radius: 12px;
	background: $primary-light;
	color: $primary;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

	.toolbar-item:hover & {
		background: darken($primary-light, 3%);
		transform: scale(1.1) rotate(-5deg);
		box-shadow: 0 4px 16px rgba($primary, 0.3);
	}
}

.item-label {
	font-weight: 500;
	transition: all 0.2s;

	.toolbar-item:hover & {
		color: #222;
	}
}

.item-arrow {
	display: flex;
	align-items: center;
	color: #bbb;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

	.toolbar-item:hover & {
		color: $primary;
		transform: translateX(3px);
	}
}

// 纵向动画
.slide-forward-enter-active {
	transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-forward-leave-active {
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-forward-enter-from {
	opacity: 0;
	transform: translateY(24px) scale(0.92);
}

.slide-forward-leave-to {
	opacity: 0;
	transform: translateY(-16px) scale(0.92);
}

.slide-backward-enter-active {
	transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-backward-leave-active {
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-backward-enter-from {
	opacity: 0;
	transform: translateY(-24px) scale(0.92);
}

.slide-backward-leave-to {
	opacity: 0;
	transform: translateY(24px) scale(0.92);
}
</style>
