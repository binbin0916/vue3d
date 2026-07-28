<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import SvgIcon from '@/components/SvgIcon/index.vue';

interface MenuItem {
	id: string;
	icon: string;
	label: string;
	activatable?: boolean;
	children?: MenuItem[];
}

const emit = defineEmits<{
	select: [item: MenuItem];
	activate: [id: string, activated: boolean];
}>();

const isOpen = ref(false);
const activeStack = ref<string[]>([]);
const activatedItemId = ref<string | null>(null);
const hoveredItem = ref<string | null>(null);
const menuRef = ref<HTMLDivElement>();

const menuItems: MenuItem[] = [
	{
		id: 'settings',
		icon: 'settings',
		label: '设置',
		children: [
			{ id: 'settings-grid', icon: 'grid', label: '网格显示', activatable: true },
			{ id: 'settings-axes', icon: 'axes', label: '坐标轴', activatable: true },
			{ id: 'settings-bg', icon: 'background', label: '背景色' },
		],
	},
	{
		id: 'camera',
		icon: 'camera',
		label: '相机',
		children: [
			{ id: 'camera-reset', icon: 'reset', label: '重置视角' },
			{ id: 'camera-front', icon: 'view', label: '正视图' },
			{ id: 'camera-perspective', icon: 'view', label: '透视图', activatable: true },
		],
	},
	{
		id: 'info',
		icon: 'info',
		label: '信息',
		children: [
			{ id: 'info-stats', icon: 'stats', label: '统计信息' },
			{ id: 'info-wireframe', icon: 'wireframe', label: '线框模式', activatable: true },
		],
	},
	{
		id: 'help',
		icon: 'help',
		label: '帮助',
		children: [
			{ id: 'help-shortcuts', icon: 'shortcuts', label: '快捷键' },
			{ id: 'help-about', icon: 'info', label: '关于' },
		],
	},
];

const currentItems = ref<MenuItem[]>(menuItems);

function findItemById(items: MenuItem[], id: string): MenuItem | undefined {
	for (const item of items) {
		if (item.id === id) return item;
		if (item.children) {
			const found = findItemById(item.children, id);
			if (found) return found;
		}
	}
	return undefined;
}

const currentParent = computed(() => {
	if (activeStack.value.length === 0) return null;
	const parentId = activeStack.value.at(-1);
	return parentId ? findItemById(menuItems, parentId) : null;
});

const menuLevel = computed(() => activeStack.value.length);

const handleToggle = () => {
	isOpen.value = !isOpen.value;
	if (!isOpen.value) {
		resetMenu();
	}
};

const resetMenu = () => {
	activeStack.value = [];
	currentItems.value = menuItems;
	activatedItemId.value = null;
	hoveredItem.value = null;
};

const handleSelect = (item: MenuItem) => {
	if (item.children && item.children.length > 0) {
		activeStack.value.push(item.id);
		currentItems.value = item.children;
		activatedItemId.value = null;
	} else if (item.activatable) {
		const isActivating = activatedItemId.value !== item.id;
		activatedItemId.value = isActivating ? item.id : null;
		emit('activate', item.id, isActivating);
	} else {
		emit('select', item);
	}
};

const handleBack = () => {
	activeStack.value.pop();
	activatedItemId.value = null;
	if (activeStack.value.length === 0) {
		currentItems.value = menuItems;
	} else {
		const parentId = activeStack.value.at(-1);
		if (parentId) {
			const parent = findItemById(menuItems, parentId);
			currentItems.value = parent?.children ?? menuItems;
		}
	}
};

const handleClickOutside = (e: MouseEvent) => {
	if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
		isOpen.value = false;
		resetMenu();
	}
};

onMounted(() => {
	document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside);
});

// 计算径向菜单项位置（第四象限扇形）
const getItemPosition = (index: number, total: number) => {
	const radius = 75;
	// 从 15° 到 75° 的扇形范围
	const startAngle = 15;
	const endAngle = 75;
	const angle = total === 1 ? 45 : startAngle + ((endAngle - startAngle) / (total - 1)) * index;
	const rad = (angle * Math.PI) / 180;

	return {
		x: Math.cos(rad) * radius,
		y: Math.sin(rad) * radius,
		angle,
	};
};
</script>

<template>
	<div ref="menuRef" class="radial-menu" :class="{ open: isOpen }">
		<!-- 主按钮 -->
		<button class="menu-trigger" @click.stop="handleToggle">
			<svg v-if="!isOpen" class="menu-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="3" y1="6" x2="21" y2="6" />
				<line x1="3" y1="12" x2="21" y2="12" />
				<line x1="3" y1="18" x2="21" y2="18" />
			</svg>
			<svg v-else class="close-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
			<span class="trigger-ring" />
		</button>

		<!-- 第一级：径向菜单 -->
		<Transition name="radial-expand">
			<div v-if="isOpen && menuLevel === 0" class="radial-container">
				<div
					v-for="(item, index) in currentItems"
					:key="item.id"
					class="radial-item"
					:style="{
						'--x': `${getItemPosition(index, currentItems.length).x}px`,
						'--y': `${getItemPosition(index, currentItems.length).y}px`,
						'--delay': `${index * 50}ms`,
					}"
				>
					<button
						class="radial-btn"
						@mouseenter="hoveredItem = item.id"
						@mouseleave="hoveredItem = null"
						@click.stop="handleSelect(item)"
					>
						<SvgIcon :name="item.icon" :size="18" />
					</button>
					<Transition name="tooltip">
						<span v-if="hoveredItem === item.id" class="tooltip right">{{ item.label }}</span>
					</Transition>
				</div>
			</div>
		</Transition>

		<!-- 第二/三级：列表菜单 -->
		<Transition name="list-expand">
			<div v-if="isOpen && menuLevel > 0" class="list-container">
				<div class="list-header">
					<button class="back-btn" @click="handleBack">
						<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="15 18 9 12 15 6" />
						</svg>
					</button>
					<span class="list-title">{{ currentParent?.label }}</span>
				</div>
				<div class="list-items">
					<button
						v-for="item in currentItems"
						:key="item.id"
						class="list-item"
						:class="{ activated: activatedItemId === item.id }"
						@click.stop="handleSelect(item)"
					>
						<SvgIcon :name="item.icon" :size="16" />
						<span class="item-label">{{ item.label }}</span>
						<span v-if="item.children" class="item-arrow">
							<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
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
$primary: #2979ff;
$primary-light: #e3f2fd;
$primary-dark: #1565c0;

.radial-menu {
	position: fixed;
	top: 24px;
	left: 24px;
	z-index: 1001;
}

// 主按钮
.menu-trigger {
	position: relative;
	width: 48px;
	height: 48px;
	border-radius: 50%;
	border: none;
	background: #fff;
	color: #333;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow:
		0 4px 16px rgba(0, 0, 0, 0.12),
		0 2px 4px rgba(0, 0, 0, 0.08);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

	&:hover {
		transform: scale(1.08);
		box-shadow: 0 6px 24px rgba(0, 0, 0, 0.16);

		.trigger-ring {
			opacity: 1;
			transform: scale(1);
		}
	}

	&:active {
		transform: scale(0.95);
	}

	.open & {
		background: $primary;
		color: #fff;
	}
}

.menu-icon,
.close-icon {
	transition: transform 0.3s ease;
}

.open .menu-icon {
	transform: rotate(90deg);
}

.trigger-ring {
	position: absolute;
	inset: -8px;
	border-radius: 50%;
	border: 2px solid $primary;
	opacity: 0;
	transform: scale(0.8);
	transition: all 0.3s ease;
	pointer-events: none;
}

// 径向菜单容器
.radial-container {
	position: absolute;
	top: 0;
	left: 0;
	width: 0;
	height: 0;
}

.radial-item {
	position: absolute;
	top: 0;
	left: 0;
	transform: translate(var(--x), var(--y));
	animation: radialPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
	animation-delay: var(--delay);
}

.radial-btn {
	width: 42px;
	height: 42px;
	border-radius: 50%;
	border: none;
	background: #fff;
	color: #444;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

	&:hover {
		transform: scale(1.15);
		box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
		background: $primary;
		color: #fff;
	}

	&:active {
		transform: scale(0.95);
	}
}

@keyframes radialPop {
	from {
		opacity: 0;
		transform: translate(var(--x), var(--y)) scale(0);
	}
	to {
		opacity: 1;
		transform: translate(var(--x), var(--y)) scale(1);
	}
}

// 列表菜单容器
.list-container {
	position: absolute;
	top: 56px;
	left: 0;
	min-width: 180px;
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20px) saturate(180%);
	border-radius: 16px;
	padding: 12px;
	box-shadow:
		0 8px 40px rgba(0, 0, 0, 0.15),
		0 2px 12px rgba(0, 0, 0, 0.08),
		inset 0 1px 0 rgba(255, 255, 255, 0.8);
	border: 1px solid rgba(255, 255, 255, 0.6);
}

.list-header {
	display: flex;
	align-items: center;
	gap: 10px;
	padding-bottom: 10px;
	margin-bottom: 8px;
	border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.back-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	border-radius: 8px;
	border: none;
	background: #f0f0f0;
	color: #666;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background: $primary-light;
		color: $primary;
		transform: translateX(-2px);
	}
}

.list-title {
	font-size: 13px;
	font-weight: 600;
	color: #333;
}

.list-items {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.list-item {
	display: flex;
	align-items: center;
	gap: 10px;
	width: 100%;
	padding: 10px 14px;
	border-radius: 10px;
	border: none;
	background: transparent;
	color: #444;
	font-size: 13px;
	cursor: pointer;
	transition: all 0.2s ease;
	text-align: left;

	&:hover {
		background: #f0f0f0;
	}

	&:active {
		transform: scale(0.98);
	}

	&.activated {
		background: $primary;
		color: #fff;

		:deep(.svg-icon) {
			color: #fff;
		}
	}
}

.item-label {
	flex: 1;
}

.item-arrow {
	color: #bbb;
	transition: transform 0.2s ease;

	.list-item:hover & {
		color: $primary;
		transform: translateX(2px);
	}
}

// Tooltip
.tooltip {
	position: absolute;
	left: calc(100% + 10px);
	top: 50%;
	transform: translateY(-50%);
	padding: 6px 12px;
	background: #1a1a1a;
	color: #fff;
	font-size: 12px;
	font-weight: 500;
	border-radius: 8px;
	white-space: nowrap;
	pointer-events: none;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

	&::before {
		content: '';
		position: absolute;
		left: -4px;
		top: 50%;
		transform: translateY(-50%) rotate(45deg);
		width: 8px;
		height: 8px;
		background: #1a1a1a;
	}
}

.tooltip-enter-active,
.tooltip-leave-active {
	transition: all 0.15s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
	opacity: 0;
	transform: translateY(-50%) translateX(-6px);
}

// 径向展开动画
.radial-expand-enter-active {
	transition: opacity 0.2s ease;
}

.radial-expand-leave-active {
	transition: opacity 0.15s ease;
}

.radial-expand-enter-from,
.radial-expand-leave-to {
	opacity: 0;
}

// 列表展开动画
.list-expand-enter-active {
	transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.list-expand-leave-active {
	transition: all 0.15s ease;
}

.list-expand-enter-from {
	opacity: 0;
	transform: translateY(-8px) scale(0.95);
}

.list-expand-leave-to {
	opacity: 0;
	transform: translateY(-4px) scale(0.98);
}
</style>
