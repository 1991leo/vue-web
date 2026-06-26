<template>
	<FormPageLayout v-if="detail" class="archive-page" :title="archiveTitle" :desc="archiveDesc">
		<template #icon>
			<img class="header-icon" :src="formImg" alt="" />
		</template>

		<div class="summary-card">
			<div class="summary-card__title">{{ detail.projectName }}</div>
			<div class="summary-card__meta">
				<span>项目编号：{{ detail.projectNo }}</span>
				<span>负责业务单元：{{ detail.companyName }}</span>
				<span>大数据集团业务对接人：{{ detail.responsiblePerson }}</span>
			</div>
		</div>

		<section class="archive-section">
			<h3 class="archive-section__title">当前状态</h3>
			<div class="status-grid">
				<div class="status-item">
					<span>项目状态</span>
					<strong>{{ detail.projectStatusName }}</strong>
				</div>
				<div class="status-item">
					<span>周报状态</span>
					<strong>{{ detail.weeklyStatusName }}</strong>
				</div>
				<div class="status-item">
					<span>最新周报日期</span>
					<strong>{{ detail.latestReportDate || "-" }}</strong>
				</div>
				<div class="status-item">
					<span>历史停止时间</span>
					<strong>{{ detail.stopTime || "-" }}</strong>
				</div>
			</div>
		</section>

		<section class="archive-section">
			<h3 class="archive-section__title">
				{{ detail.projectStatusName.includes(projectFollowStatusLabels.ongoing) ? "停止原因" : "恢复确认" }}
			</h3>
			<el-form
				v-if="detail.projectStatusName.includes(projectFollowStatusLabels.ongoing)"
				ref="formRef"
				:model="formData"
				:rules="formRules"
				label-position="top"
			>
				<el-form-item label="停止原因" prop="reasonText" class="required-label archive-reason-item">
					<el-input
						v-model="formData.reasonText"
						type="textarea"
						:rows="7"
						resize="none"
						maxlength="300"
						show-word-limit
						placeholder="请输入停止跟进原因"
					/>
				</el-form-item>
			</el-form>
			<p v-if="!detail.projectStatusName.includes(projectFollowStatusLabels.ongoing)" class="archive-confirm-text">
				确认后项目状态恢复为进行中，可重新填报周报。
			</p>
			<div v-if="detail.stopReason" class="archive-history">
				<strong>历史记录</strong>
				<p>{{ detail.stopReason }}</p>
			</div>
		</section>

		<template #actions>
			<el-button @click="emit('back')">返回</el-button>
			<el-button type="primary" class="submit-button" @click="handleSubmit">
				{{ detail.projectStatusName.includes(projectFollowStatusLabels.ongoing) ? "确认停止" : "确认恢复" }}
			</el-button>
		</template>
	</FormPageLayout>
</template>

<script setup lang="ts">
import formImg from "@/assets/images/form_img.webp"
import FormPageLayout from "@/components/FormPageLayout/index.vue"
import type { FormInstance, FormRules } from "element-plus"
import { computed, reactive, ref, watch } from "vue"
import { projectFollowStatusLabels, type CooperationProjectItem } from "../config"

const props = defineProps({
	detail: {
		type: Object as () => CooperationProjectItem | null,
		default: null
	}
})

const emit = defineEmits<{
	(e: "back"): void
	(e: "submit", value: string): void
}>()

const formRef = ref<FormInstance>()
const formData = reactive({
	reasonText: ""
})
const formRules: FormRules = {
	reasonText: [{ required: true, message: "请输入停止跟进原因", trigger: "blur" }]
}

const archiveTitle = computed(() =>
	props.detail?.projectStatusName.includes(projectFollowStatusLabels.ongoing) ? "停止跟进项目" : "恢复跟进项目"
)
const archiveDesc = computed(() =>
	props.detail?.projectStatusName.includes(projectFollowStatusLabels.ongoing)
		? "填写停止原因后，项目将转入停止/归档页签。"
		: "确认恢复后，项目将重新回到推进中列表继续跟踪。"
)

const handleSubmit = async () => {
	if (!props.detail) return
	if (props.detail.projectStatusName.includes(projectFollowStatusLabels.ongoing)) {
		const valid = await formRef.value?.validate().catch(() => false)
		if (!valid) return
	}
	emit("submit", props.detail.projectStatusName.includes(projectFollowStatusLabels.ongoing) ? formData.reasonText : "")
}

watch(
	() => props.detail,
	(value) => {
		formData.reasonText = value?.projectStatusName.includes(projectFollowStatusLabels.ongoing)
			? value.stopReason || ""
			: ""
		formRef.value?.clearValidate()
	},
	{ immediate: true }
)
</script>

<style scoped lang="scss">
.archive-page {
	height: 100%;

	:deep(.create-card) {
		width: 62rem;
	}
}

.header-icon {
	width: 3.5rem;
	height: 3.5rem;
	flex-shrink: 0;
	object-fit: contain;
}

.summary-card,
.archive-section {
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

.archive-section__title {
	margin: 0 0 1rem;
	color: #172b4d;
	font-size: 1rem;
	font-weight: 600;
}

.status-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0.875rem;
}

.status-item {
	padding: 0.875rem 1rem;
	border-radius: 0.875rem;
	background: #fff;

	span {
		display: block;
		margin-bottom: 0.375rem;
		color: #6b7795;
		font-size: 0.8125rem;
	}

	strong {
		color: #172b4d;
		font-size: 0.9375rem;
		font-weight: 600;
	}
}

.archive-history {
	margin-top: 1rem;
	padding: 0.875rem 1rem;
	border-radius: 0.875rem;
	background: #fff;

	strong {
		color: #172b4d;
		font-size: 0.9375rem;
	}

	p {
		margin: 0.5rem 0 0;
		color: #344563;
		line-height: 1.7;
	}
}

.archive-confirm-text {
	margin: 0;
	color: #344563;
	line-height: 1.7;
}

.form-actions {
	display: flex;
	justify-content: flex-end;
	gap: 0.75rem;
	padding: 1rem 3.625rem;
	flex-shrink: 0;
	background: #fff;
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
	.status-grid {
		grid-template-columns: 1fr;
	}
}
</style>
