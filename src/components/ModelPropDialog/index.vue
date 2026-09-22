<script setup lang="ts">
import { computed, ref, toRefs, h, watch } from 'vue';
import { density } from '@/utils/constants';
import type { ToolContext } from '@/tools';
import SvgIcon from '@/components/SvgIcon/index.vue';
import { formatDecimal } from '@/utils/number';
import { copyText } from '@/utils/clipboard';
import { ElMessageBox, ElInput, ElMessage } from 'element-plus';

/**
 * ModelPropDialog - 模型总属性弹窗内容
 *
 * @description 分两大区块展示模型信息：
 * 1. 模型属性：名称 / 体积 / 表面积 / 包围盒子 / 包围盒体积 / 预设材料 / 重量
 * 2. 场景属性：实体数 / 顶点数 / 线条数 / 三角面数
 *
 * 当前为 UI 布局 + 占位数据，尚未接入真实计算逻辑。
 * ctx 已通过 props 注入，后续可直接读取场景/模型数据（如 props.ctx.meshes、props.ctx.box）。
 */
interface Props {
	/** 工具上下文，提供渲染器/场景/相机/模型网格/包围盒等数据 */
	ctx: ToolContext;
}
const props = defineProps<Props>();

const { ctx } = toRefs(props);

const userData = computed(() => ctx.value.sceneUserData);

const currDensity = ref([...density]);

const volume = computed(() => userData.value.totalVolume || userData.value.totalVolumeMesh || '--');

const surfaceArea = computed(() => userData.value.totalArea || userData.value.totalAreaMesh || '--');

const boxSize = computed(() => ({
	x: userData.value.modelSize[0] || '--',
	y: userData.value.modelSize[1] || '--',
	z: userData.value.modelSize[2] || '--',
}));

const boxVolume = computed(() => {
	if (userData.value.modelSize && userData.value.modelSize.length === 3) {
		return userData.value.modelSize[0] * userData.value.modelSize[1] * userData.value.modelSize[2];
	}
	return '--';
});
const selectedMaterial = ref('铝合金');
const customDensity = ref({
	label: '',
	value: '',
	density: '',
});

const entityCount = computed(() => userData.value.solids.length || 1);
const vertexCount = computed(() => userData.value.vertexCount || '--');
const lineCount = computed(() => userData.value.edgeCount || '--');
const triangleCount = computed(() => userData.value.triangleCount || '--');

const weight = ref({ value: 0, unit: 'g' });

watch(
	() => selectedMaterial.value,
	() => {
		const p = currDensity.value.find((item) => item.value === selectedMaterial.value)?.density || 0;
		const v = userData.value.totalVolume || userData.value.totalVolumeMesh;
		const w = ((v / 1000) * p) / 1000 || 0; // 单位：kg
		if (Math.abs(w) < 1) {
			weight.value = {
				value: w * 1000,
				unit: 'g',
			};
		} else {
			weight.value = {
				value: w,
				unit: 'Kg',
			};
		}
	},
	{
		immediate: true,
	}
);

const handleChange = async (v: string) => {
	// custom
	if (v === 'custom') {
		await ElMessageBox({
			title: '自定义预设材料',
			message: () =>
				h('div', { class: 'material-form' }, [
					// 材料名称
					h('div', { class: 'form-item' }, [
						h('label', { class: 'form-label' }, '材料名称'),
						h(ElInput, {
							modelValue: customDensity.value.value,
							'onUpdate:modelValue': (v: string) => (customDensity.value.value = v),
							placeholder: '请输入材料名称',
							clearable: true,
						}),
					]),
					// 密度（带单位后缀）
					h('div', { class: 'form-item' }, [
						h('label', { class: 'form-label' }, '密度'),
						h(
							ElInput,
							{
								modelValue: customDensity.value.density,
								'onUpdate:modelValue': (v: string) => (customDensity.value.density = v),
								placeholder: '请输入材料密度',
								clearable: true,
							},
							{
								append: () => h('span', 'g/cm³'),
							}
						),
					]),
				]),
			showCancelButton: true,
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			customClass: 'material-dialog',
			beforeClose: (action, inst, done) => {
				if (action !== 'confirm') {
					customDensity.value.value = '';
					customDensity.value.density = '';
					done();
					return;
				}
				if (!customDensity.value.value.trim()) {
					ElMessage.warning('请输入材料名称');
					return;
				}
				if (!customDensity.value.density.trim()) {
					ElMessage.warning('请输入材料密度');
					return;
				}

				customDensity.value.label = `${customDensity.value.value.trim()}(${customDensity.value.density}g/cm³)`;

				currDensity.value.splice(currDensity.value.length - 1, 0, {
					...customDensity.value,
					density: Number(customDensity.value.density),
				});

				selectedMaterial.value = customDensity.value.value.trim();
				done();
			},
		});
	}
};
</script>

<template>
	<div class="model-prop">
		<section class="mp-section">
			<h3 class="mp-section__title">模型属性</h3>
			<div class="mp-row">
				<span class="mp-row__label">模型名称</span>
				<span class="mp-row__value">{{ userData.source }}</span>
			</div>
			<div class="mp-row">
				<span class="mp-row__label">体积</span>
				<span class="mp-row__value">
					<span>{{ formatDecimal(volume) }}</span>
					<span class="mp-unit">{{ userData.units.volume }}</span>
					<svg-icon class="mp-icon" name="copy" :size="16" @click="copyText(formatDecimal(volume))" />
				</span>
			</div>
			<div class="mp-row">
				<span class="mp-row__label">表面积</span>
				<span class="mp-row__value">
					<span>{{ formatDecimal(surfaceArea) }}</span>
					<span class="mp-unit">{{ userData.units.area }}</span>
					<svg-icon class="mp-icon" name="copy" :size="16" @click="copyText(formatDecimal(surfaceArea))"></svg-icon>
				</span>
			</div>
			<div class="mp-row">
				<span class="mp-row__label">包围盒子</span>
				<span class="mp-row__value">
					<span>{{ formatDecimal(boxSize.x) }}*{{ formatDecimal(boxSize.y) }}*{{ formatDecimal(boxSize.z) }}</span>
					<span class="mp-unit">{{ userData.units.length }}</span>
					<svg-icon
						class="mp-icon"
						name="copy"
						:size="16"
						@click="copyText(`${formatDecimal(boxSize.x)}*${formatDecimal(boxSize.y)}*${formatDecimal(boxSize.z)}`)"
					></svg-icon>
				</span>
			</div>
			<div class="mp-row">
				<span class="mp-row__label">包围盒体积</span>
				<span class="mp-row__value">
					<span>{{ formatDecimal(boxVolume) }}</span>
					<span class="mp-unit">{{ userData.units.volume }}</span>
					<svg-icon class="mp-icon" name="copy" :size="16" @click="copyText(formatDecimal(boxVolume))"></svg-icon>
				</span>
			</div>
			<div class="mp-row">
				<span class="mp-row__label">
					<span>预设材料</span>
					<el-tooltip effect="dark" content="预设材料会改变属性面板中的重量" placement="top">
						<svg-icon class="mp-icon" name="question" :size="16"></svg-icon>
					</el-tooltip>
				</span>
				<span class="mp-row__value mp-row__value--control">
					<el-select v-model="selectedMaterial" placeholder="请选择" @change="handleChange">
						<el-option v-for="item in currDensity" :key="item.value" :label="item.label" :value="item.value" />
					</el-select>
				</span>
			</div>
			<div v-if="selectedMaterial === 'custom'" class="mp-row">
				<span class="mp-row__label">自定义密度</span>
				<span class="mp-row__value mp-row__value--control">
					<input v-model="customDensity" type="number" class="mp-input" placeholder="g/cm³" />
				</span>
			</div>
			<div class="mp-row">
				<span class="mp-row__label">重量</span>
				<span class="mp-row__value">
					<span>{{ formatDecimal(weight.value) }}</span>
					<span class="mp-unit">{{ weight.unit }}</span>
					<svg-icon class="mp-icon" name="copy" :size="16" @click="copyText(formatDecimal(weight.value))"></svg-icon>
				</span>
			</div>
		</section>

		<section class="mp-section">
			<h3 class="mp-section__title">场景属性</h3>
			<div class="mp-row">
				<span class="mp-row__label">实体数</span>
				<span class="mp-row__value">{{ entityCount }}</span>
			</div>
			<div class="mp-row">
				<span class="mp-row__label">顶点数</span>
				<span class="mp-row__value">{{ vertexCount }}</span>
			</div>
			<div class="mp-row">
				<span class="mp-row__label">线条数</span>
				<span class="mp-row__value">{{ lineCount }}</span>
			</div>
			<div class="mp-row">
				<span class="mp-row__label">三角面数</span>
				<span class="mp-row__value">{{ triangleCount }}</span>
			</div>
		</section>
	</div>
</template>

<style lang="scss" scoped>
// Element Plus Design Tokens
$primary: #409eff;
$text-primary: #303133;
$text-regular: #606266;
$text-secondary: #909399;
$border-color: #dcdfe6;
$border-color-light: #e4e7ed;

.model-prop {
	user-select: none;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.mp-section {
	& + & {
		padding-top: 12px;
		border-top: 1px solid $border-color-light;
	}
}

.mp-section__title {
	margin: 0 0 6px;
	font-size: 13px;
	font-weight: 600;
	color: $text-primary;
}

.mp-row {
	display: flex;
	align-items: center;
	// justify-content: space-between;
	gap: 12px;
	padding: 4px 0;
	line-height: 1.6;
}

.mp-row__label {
	display: flex;
	align-items: center;
	flex-shrink: 0;
	font-size: 13px;
	width: 100px;
	color: $text-secondary;
}

.mp-row__value {
	font-size: 13px;
	color: $text-primary;
	text-align: right;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	display: flex;
	align-items: center;

	&--control {
		width: 180px;
	}
}

.mp-unit {
	margin-left: 2px;
	font-size: 12px;
	color: $text-primary;
}
.mp-icon {
	margin-left: 4px;
	cursor: pointer;
	color: $text-secondary !important;
	&:hover {
		color: $primary !important;
	}
}

.mp-input {
	width: 100%;
	height: 28px;
	padding: 0 8px;
	border: 1px solid $border-color;
	border-radius: 4px;
	background: #fff;
	font-size: 13px;
	color: $text-regular;
	outline: none;
	transition: border-color 0.2s;

	&:hover {
		border-color: #c0c4cc;
	}

	&:focus {
		border-color: $primary;
	}
}
</style>
<style>
.material-form .form-item {
	display: flex;
	align-items: center;
	margin-bottom: 16px;
}
.material-form .form-label {
	width: 70px;
	flex-shrink: 0;
	color: #606266;
	font-size: 14px;
	text-align: right;
	margin-right: 14px;
}
.material-form .form-item .el-input {
	flex: 1;
}
.material-dialog .el-input-group__append {
	background: #f5f7fa;
	color: #909399;
	font-size: 13px;
	padding: 0 12px;
}
</style>
