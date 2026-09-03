<script setup lang="ts">
/**
 * SectionDialog - 剖切设置弹窗内容
 *
 * @description 提供反转剖切和重置剖切两个操作按钮。
 * 作为 DraggableDialog 的内容插槽使用。
 *
 * @fires invert - 点击反转剖切按钮时触发
 * @fires reset - 点击重置剖切按钮时触发
 * @fires visible - 点击显示/隐藏按钮时触发
 */
const emit = defineEmits<{
	invert: [];
	reset: [];
	visible: [];
}>();
</script>

<template>
	<div class="section-dialog">
		<button class="section-btn invert-btn" @click="emit('visible')">
			<span class="btn-label">显示/隐藏</span>
			<span class="btn-desc">点击切换显示隐藏剖面</span>
		</button>

		<button class="section-btn invert-btn" @click="emit('invert')">
			<span class="btn-label">反转剖切</span>
			<span class="btn-desc">显示已切除部分，隐藏未切除部分</span>
		</button>

		<button class="section-btn reset-btn" @click="emit('reset')">
			<span class="btn-label">重置剖切</span>
			<span class="btn-desc">包围盒恢复初始位置</span>
		</button>
	</div>
</template>

<style lang="scss" scoped>
$primary: #409eff;
$text-primary: #303133;
$text-regular: #606266;
$text-secondary: #909399;
$border-color-light: #e4e7ed;
$fill-color-light: #f5f7fa;
$danger: #f56c6c;
$warning: #e6a23c;
$transition-duration: 0.2s;

.section-dialog {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.section-btn {
	display: flex;
	align-items: center;
	gap: 10px;
	width: 100%;
	padding: 10px 12px;
	border: 1px solid $border-color-light;
	border-radius: 8px;
	background: #fff;
	cursor: pointer;
	transition: all $transition-duration cubic-bezier(0.4, 0, 0.2, 1);
	text-align: left;

	&:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	&:active {
		transform: translateY(0) scale(0.98);
	}
}

.invert-btn {
	color: $primary;

	&:hover {
		border-color: rgba($primary, 0.3);
		background: rgba($primary, 0.02);
	}

	svg {
		flex-shrink: 0;
	}
}

.reset-btn {
	color: $warning;

	&:hover {
		border-color: rgba($warning, 0.3);
		background: rgba($warning, 0.02);
	}

	svg {
		flex-shrink: 0;
	}
}

.btn-label {
	font-size: 13px;
	font-weight: 600;
	color: $text-primary;
	line-height: 1;
}

.btn-desc {
	display: block;
	font-size: 11px;
	color: $text-secondary;
	font-weight: 400;
	margin-top: 2px;
	line-height: 1;
}
</style>
