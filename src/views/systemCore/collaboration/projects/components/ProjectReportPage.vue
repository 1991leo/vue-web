<template>
	<FormPageLayout
		v-if="detail"
		class="report-page"
		title="填写项目周报"
		desc="按周填报项目进展、现状标识和下一步计划，重复提交将覆盖本周最新内容。"
	>
		<template #icon>
			<img class="header-icon" :src="formImg" alt="" />
		</template>

		<div class="summary-card">
			<div class="summary-card__title">{{ detail.projectName }}</div>
			<div class="summary-card__meta">
				<span>项目编号：{{ detail.projectNo }}</span>
				<span>所属公司：{{ detail.companyName }}</span>
				<span>合作方：{{ detail.partnerName }}</span>
			</div>
		</div>

		<el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="report-form">
			<section class="report-section">
				<h3 class="report-section__title">
					<span>本周填报</span>
					<el-tooltip
						effect="light"
						:content="reportTipContent"
						placement="right"
						popper-class="project-report-tip-tooltip"
					>
						<span class="report-section__tip-trigger">?</span>
					</el-tooltip>
				</h3>
				<div class="report-grid">
					<el-form-item label="现状标识" prop="currentSituationTag">
						<el-select v-model="formData.currentSituationTag" placeholder="请选择现状标识">
							<el-option v-for="item in situationOptions" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
				</div>
				<el-form-item label="本周进展" prop="progressSummary">
					<el-input
						v-model="formData.progressSummary"
						type="textarea"
						:rows="8"
						resize="none"
						maxlength="500"
						show-word-limit
						placeholder="请描述本周项目推进成果、沟通事项和风险变化"
					/>
				</el-form-item>
				<el-form-item label="下一步计划" prop="nextPlan">
					<el-input
						v-model="formData.nextPlan"
						type="textarea"
						:rows="8"
						resize="none"
						maxlength="500"
						show-word-limit
						placeholder="请描述下周计划安排、关键里程碑和需协调事项"
					/>
				</el-form-item>
			</section>

			<section class="report-section">
				<h3 class="report-section__title">最近一次周报参考</h3>
				<div v-if="latestReport" class="history-card">
					<div class="history-card__top">
						<strong>{{ latestReport.weekLabel }}</strong>
						<span>{{ latestReport.reportDate }}</span>
					</div>
					<p>本周进展：{{ latestReport.progressSummary }}</p>
					<p>当前状态：{{ latestReport.currentStatus }}</p>
					<p>下一步计划：{{ latestReport.nextPlan }}</p>
				</div>
				<el-empty v-else description="暂无历史周报" />
			</section>
		</el-form>

		<template #actions>
			<el-button @click="emit('back')">返回</el-button>
			<el-button type="primary" class="submit-button" :loading="loading" @click="handleSubmit">提交周报</el-button>
		</template>
	</FormPageLayout>
</template>

<script setup lang="ts">
import formImg from "@/assets/images/form_img.webp"
import FormPageLayout from "@/components/FormPageLayout/index.vue"
import type { FormInstance, FormRules } from "element-plus"
import { computed, reactive, ref, watch } from "vue"
import {
	createProjectReportFormData,
	type CooperationProjectItem,
	type ProjectOption,
	type ProjectReportFormData
} from "../config"

const props = defineProps({
	detail: {
		type: Object as () => CooperationProjectItem | null,
		default: null
	},
	loading: {
		type: Boolean,
		default: false
	},
	situationOptions: {
		type: Array as () => ProjectOption[],
		default: () => []
	}
})

const emit = defineEmits<{
	(e: "back"): void
	(e: "submit", value: ProjectReportFormData): void
}>()

const formRef = ref<FormInstance>()
const formData = reactive<ProjectReportFormData>(createProjectReportFormData())
const reportTipContent = "系统按当前自然周覆盖最新一次填报内容，历史记录只保留该周最终提交版本。"

const latestReport = computed(() => props.detail?.reports?.[0] || null)

const formRules: FormRules = {
	currentSituationTag: [{ required: true, message: "请选择现状标识", trigger: "change" }],
	progressSummary: [{ required: true, message: "请输入本周进展", trigger: "blur" }],
	nextPlan: [{ required: true, message: "请输入下一步计划", trigger: "blur" }]
}

const syncFormData = (value: CooperationProjectItem | null) => {
	const nextFormData = createProjectReportFormData(value || undefined)
	nextFormData.currentSituationTag = nextFormData.currentSituationTag || props.situationOptions[0]?.value || ""
	Object.assign(formData, nextFormData)
}

const handleSubmit = async () => {
	const valid = await formRef.value?.validate().catch(() => false)
	if (!valid) return
	emit("submit", JSON.parse(JSON.stringify(formData)))
}

watch(
	() => [props.detail, props.situationOptions] as const,
	([detail]) => {
		syncFormData(detail)
		formRef.value?.clearValidate()
	},
	{ immediate: true }
)
</script>

<style scoped lang="scss">
.report-page {
	height: 100%;

	:deep(.create-card) {
		width: 68rem;
	}
}

.header-icon {
	width: 3.5rem;
	height: 3.5rem;
	flex-shrink: 0;
	object-fit: contain;
}

.summary-card,
.report-section {
	margin-bottom: 1rem;
	padding: 1.25rem;
	border-radius: 1rem;
	background: #f8fafc;
}

.summary-card__title {
	color: #172b4d;
	font-size: 1rem;
	font-weight: 700;
}

.summary-card__meta {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	margin-top: 0.75rem;
	color: #6b7795;
	font-size: 0.875rem;
}

.report-section__title {
	display: flex;
	align-items: center;
	gap: 0.375rem;
	margin: 0 0 1rem;
	color: #172b4d;
	font-size: 1rem;
	font-weight: 600;
}

.report-section__tip-trigger {
	display: inline-flex;
	width: 1rem;
	height: 1rem;
	cursor: help;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: rgba(22, 119, 255, 0.1);
	color: #1677ff;
	font-size: 0.75rem;
	font-weight: 700;
	line-height: 1;
}

.report-form {
	:deep(.el-form-item__label) {
		color: #0f2748;
	}
}

.report-grid {
	max-width: 18rem;
}

.history-card {
	padding: 1rem;
	border-radius: 0.875rem;
	background: #fff;

	p {
		margin: 0.75rem 0 0;
		color: #344563;
		line-height: 1.6;
	}
}

.history-card__top {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	color: #172b4d;
	font-size: 0.875rem;
}

.submit-button {
	min-width: 6.5rem;
	height: 2.125rem;
	border-radius: 0.5rem;
	--el-button-bg-color: #00b46e;
	--el-button-border-color: #00b46e;
	--el-button-hover-bg-color: #00a665;
	--el-button-hover-border-color: #00a665;
}

@media (max-width: 1200px) {
	.summary-card__meta,
	.history-card__top {
		flex-direction: column;
		align-items: flex-start;
	}
}

:global(.project-report-tip-tooltip) {
	max-width: 36rem;
	color: #1677ff;
	line-height: 1.6;
}
</style>
