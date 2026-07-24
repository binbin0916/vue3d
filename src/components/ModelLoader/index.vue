<script setup lang="ts">
import { computed } from 'vue';

interface Props {
	loading: boolean;
	loaded: number;
	total: number;
	percent: number;
}

const props = defineProps<Props>();

const loadedSize = computed(() => formatSize(props.loaded));
const totalSize = computed(() => formatSize(props.total));

function formatSize(bytes: number): string {
	if (bytes === 0) return '0 B';
	const units = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	const size = (bytes / Math.pow(1024, i)).toFixed(2);
	return `${size} ${units[i]}`;
}
</script>

<template>
	<Transition name="fade">
		<div v-if="loading" class="loader-overlay">
			<div class="loader-content">
				<div class="loader-icon">
					<div class="spinner"></div>
				</div>

				<h2 class="loader-title">模型加载中</h2>

				<div class="loader-info">
					<span class="info-item">
						<span class="info-label">已加载</span>
						<span class="info-value">{{ loadedSize }}</span>
					</span>
					<span class="info-divider">/</span>
					<span class="info-item">
						<span class="info-label">总大小</span>
						<span class="info-value">{{ totalSize }}</span>
					</span>
				</div>

				<div class="progress-wrapper">
					<div class="progress-track">
						<div class="progress-fill" :style="{ width: `${percent}%` }">
							<div class="progress-glow"></div>
						</div>
					</div>
					<div class="progress-percent">{{ Math.round(percent) }}%</div>
				</div>

				<p class="loader-tip">首次加载可能需要较长时间，请耐心等待...</p>
			</div>
		</div>
	</Transition>
</template>

<style lang="scss" scoped>
.loader-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(8px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
	overflow: hidden;
}

.loader-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 24px;
	padding: 48px 56px;
	border-radius: 24px;
	background: rgba(255, 255, 255, 0.95);
	box-shadow:
		0 25px 50px -12px rgba(0, 0, 0, 0.25),
		0 0 0 1px rgba(255, 255, 255, 0.1);
	animation: floatIn 0.5s ease-out;
}

@keyframes floatIn {
	from {
		opacity: 0;
		transform: translateY(20px) scale(0.95);
	}
	to {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}

.loader-icon {
	width: 64px;
	height: 64px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.spinner {
	width: 48px;
	height: 48px;
	border: 4px solid #e5e7eb;
	border-top-color: #3b82f6;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.loader-title {
	margin: 0;
	font-size: 22px;
	font-weight: 600;
	color: #1f2937;
	letter-spacing: 0.5px;
}

.loader-info {
	display: flex;
	align-items: center;
	gap: 12px;
	font-size: 14px;
}

.info-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
}

.info-label {
	color: #6b7280;
	font-size: 12px;
}

.info-value {
	color: #1f2937;
	font-weight: 500;
	font-variant-numeric: tabular-nums;
}

.info-divider {
	color: #d1d5db;
	font-size: 18px;
}

.progress-wrapper {
	display: flex;
	align-items: center;
	gap: 16px;
	width: 100%;
}

.progress-track {
	flex: 1;
	height: 12px;
	background: #e5e7eb;
	border-radius: 9999px;
	overflow: hidden;
	box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #3b82f6, #60a5fa);
	border-radius: 9999px;
	transition: width 0.3s ease-out;
	position: relative;
	overflow: hidden;
}

.progress-glow {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
	animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
	from {
		transform: translateX(-100%);
	}
	to {
		transform: translateX(100%);
	}
}

.progress-percent {
	min-width: 50px;
	text-align: right;
	font-size: 16px;
	font-weight: 600;
	color: #3b82f6;
	font-variant-numeric: tabular-nums;
}

.loader-tip {
	margin: 0;
	font-size: 13px;
	color: #9ca3af;
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
