<script setup lang="ts">
import { ref, watch } from 'vue';

/**
 * Props - ColorPicker 组件属性
 *
 * @description 颜色选择器组件，支持 HEX/RGB 双模式输入。
 * 可独立使用，也可嵌入 DraggableDialog 中
 */
interface Props {
	/** 当前颜色值（HEX 格式，如 #ffffff） */
	modelValue?: string;
	/** 默认显示模式 */
	mode?: 'hex' | 'rgb';
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: '#ffffff',
	mode: 'hex',
});

const emit = defineEmits<{
	'update:modelValue': [color: string];
	change: [color: string];
}>();

const colorMode = ref(props.mode);
const textValue = ref('');

/**
 * 同步外部值到输入框
 */
watch(
	() => props.modelValue,
	(val) => {
		textValue.value = colorMode.value === 'hex' ? val.toUpperCase() : hexToRgbDisplay(val);
	},
	{ immediate: true }
);

/**
 * hexToRgbDisplay - 将 HEX 转为 RGB 显示格式
 *
 * @param {string} hex - HEX 颜色值
 * @returns {string} 格式化的 RGB 字符串（如 "255, 128, 0"）
 */
function hexToRgbDisplay(hex: string): string {
	const h = hex.replace('#', '');
	const r = parseInt(h.substring(0, 2), 16);
	const g = parseInt(h.substring(2, 4), 16);
	const b = parseInt(h.substring(4, 6), 16);
	return `${r}, ${g}, ${b}`;
}

/**
 * parseHexColor - 解析 HEX 颜色字符串
 *
 * @description 支持 #RGB 和 #RRGGBB 格式，自动补全 #
 *
 * @param {string} input - 用户输入的颜色字符串
 * @returns {string | null} 标准化的 7 位 HEX 颜色（#rrggbb），无效返回 null
 */
function parseHexColor(input: string): string | null {
	const hex = input.startsWith('#') ? input : `#${input}`;
	const match = hex.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
	if (!match) return null;
	const group = match[1];
	if (!group) return null;
	const full =
		group.length === 3
			? group
					.split('')
					.map((c) => c + c)
					.join('')
			: group;
	return `#${full.toLowerCase()}`;
}

/**
 * parseRgbColor - 解析 RGB 颜色字符串
 *
 * @description 支持 "R, G, B"、"R G B"、"R,G,B" 等分隔格式，值范围 0-255
 *
 * @param {string} input - 用户输入的颜色字符串
 * @returns {string | null} 标准化的 7 位 HEX 颜色（#rrggbb），无效返回 null
 */
function parseRgbColor(input: string): string | null {
	const parts = input.split(/[\s,]+/).filter(Boolean);
	if (parts.length !== 3) return null;
	const r = Number(parts[0]);
	const g = Number(parts[1]);
	const b = Number(parts[2]);
	if ([r, g, b].some((n) => isNaN(n) || n < 0 || n > 255)) return null;
	const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * handleSwatchInput - 原生色盘选择处理
 *
 * @param {Event} e - input 事件
 */
function handleSwatchInput(e: Event) {
	const color = (e.target as HTMLInputElement).value;
	textValue.value = colorMode.value === 'hex' ? color.toUpperCase() : hexToRgbDisplay(color);
	emit('update:modelValue', color);
	emit('change', color);
}

/**
 * handleTextInput - 文本输入框颜色解析
 *
 * @param {Event} e - input 事件
 */
function handleTextInput(e: Event) {
	const raw = (e.target as HTMLInputElement).value;
	textValue.value = raw;
	const hex = colorMode.value === 'hex' ? parseHexColor(raw) : parseRgbColor(raw);
	if (hex) {
		emit('update:modelValue', hex);
		emit('change', hex);
	}
}

/**
 * toggleMode - 切换 HEX/RGB 输入模式
 */
function toggleMode() {
	colorMode.value = colorMode.value === 'hex' ? 'rgb' : 'hex';
	textValue.value = colorMode.value === 'hex' ? props.modelValue.toUpperCase() : hexToRgbDisplay(props.modelValue);
}
</script>

<template>
	<div class="color-picker">
		<!-- 模式切换 + 文本输入 -->
		<div class="picker-input-group">
			<!-- 色盘 -->
			<div class="picker-swatch-wrap">
				<input type="color" class="picker-swatch" :value="modelValue" @input="handleSwatchInput" />
			</div>
			<button class="picker-mode-btn" @click="toggleMode" :title="colorMode === 'hex' ? '切换为 RGB' : '切换为 HEX'">
				{{ colorMode === 'hex' ? 'HEX' : 'RGB' }}
			</button>
			<input
				type="text"
				class="picker-text-input"
				:value="textValue"
				@input="handleTextInput"
				:placeholder="colorMode === 'hex' ? '#000000' : '0, 0, 0'"
				spellcheck="false"
				autocomplete="off"
			/>
		</div>

		<!-- 预设颜色 -->
		<div class="picker-presets">
			<button
				v-for="preset in presets"
				:key="preset"
				class="preset-btn"
				:style="{ background: preset }"
				:class="{ active: modelValue === preset }"
				@click="
					emit('update:modelValue', preset);
					emit('change', preset);
				"
			/>
		</div>
	</div>
</template>

<script lang="ts">
/**
 * 预设颜色列表
 */
const presets = ['#ffffff', '#000000', '#f56c6c', '#e6a23c', '#67c23a', '#409eff', '#909399', '#303133'];
</script>

<style lang="scss" scoped>
$primary: #409eff;
$text-primary: #303133;
$text-regular: #606266;
$text-secondary: #909399;
$border-color: #dcdfe6;
$border-color-light: #e4e7ed;
$fill-color-light: #f5f7fa;
$bg-color: #ffffff;

.color-picker {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

// 色盘
.picker-swatch-wrap {
	position: relative;
	width: 46px;
	height: 34px;
	border-radius: 6px;
	overflow: hidden;
	border: 1px solid $border-color-light;
	cursor: pointer;

	&:hover {
		border-color: $border-color;
	}
}

.picker-swatch {
	width: 100%;
	height: 100%;
	padding: 0;
	border: none;
	cursor: pointer;
	background: none;
	appearance: none;
	-webkit-appearance: none;

	&::-webkit-color-swatch-wrapper {
		padding: 0;
	}

	&::-webkit-color-swatch {
		border: none;
		border-radius: 6px;
	}

	&::-moz-color-swatch {
		border: none;
		border-radius: 6px;
	}
}

// 输入组
.picker-input-group {
	display: flex;
	gap: 6px;
}

.picker-mode-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 34px;
	padding: 0 12px;
	border: 1px solid $border-color;
	border-radius: 6px;
	background: $fill-color-light;
	color: $text-regular;
	font-size: 12px;
	font-weight: 600;
	font-family: 'SF Mono', 'Consolas', monospace;
	letter-spacing: 0.5px;
	cursor: pointer;
	transition: all 0.2s;
	white-space: nowrap;
	flex-shrink: 0;

	&:hover {
		background: #ecf5ff;
		color: $primary;
		border-color: rgba($primary, 0.3);
	}
}

.picker-text-input {
	flex: 1;
	height: 34px;
	padding: 0 12px;
	border: 1px solid $border-color;
	border-radius: 6px;
	background: $fill-color-light;
	color: $text-primary;
	font-size: 13px;
	font-family: 'SF Mono', 'Consolas', monospace;
	outline: none;
	transition: all 0.2s;
	min-width: 0;

	&::placeholder {
		color: #bbb;
	}

	&:hover {
		border-color: #c0c4cc;
	}

	&:focus {
		border-color: $primary;
		background: $bg-color;
		box-shadow: 0 0 0 2px rgba($primary, 0.15);
	}
}

// 预设颜色
.picker-presets {
	display: flex;
	gap: 6px;
	flex-wrap: wrap;
}

.preset-btn {
	width: 24px;
	height: 24px;
	padding: 0;
	border: 2px solid transparent;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.2s;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

	&:hover {
		transform: scale(1.15);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	&.active {
		border-color: $primary;
		box-shadow: 0 0 0 2px rgba($primary, 0.2);
	}
}
</style>
