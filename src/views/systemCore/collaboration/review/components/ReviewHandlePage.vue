<template>
	<FormPageLayout
		v-if="detail"
		class="review-handle-layout"
		title="处理经营事项评审"
		:desc="headerDesc"
		:icon="formImg"
	>
		<div class="handle-content">
			<div class="summary-card">
				<div class="summary-card__title">{{ detail.projectName }}</div>
				<div class="summary-card__meta">
					<span>申请单号：{{ detail.applicationNo }}</span>
					<span>申请单位：{{ detail.applicantEnterpriseIdName || "-" }}</span>
					<span>申请日期：{{ detail.applicationDate || "-" }}</span>
				</div>
			</div>

			<section class="handle-section">
				<h3 class="handle-section__title">关键信息</h3>
				<div class="info-grid">
					<div class="info-item">
						<span>事项类型</span>
						<strong>{{ detail.matterTypeName || "-" }}</strong>
					</div>
					<div class="info-item">
						<span>流程实例ID</span>
						<strong>{{ detail.processInstanceId || "-" }}</strong>
					</div>
					<div class="info-item">
						<span>当前状态</span>
						<strong>{{ detail.statusName }}</strong>
					</div>
					<div class="info-item">
						<span>更新时间</span>
						<strong>{{ detail.updateTime || "-" }}</strong>
					</div>
				</div>
			</section>

			<section class="handle-section">
				<h3 class="handle-section__title">项目说明</h3>
				<div class="desc-card-list">
					<div class="desc-card">
						<h4>项目背景</h4>
						<p>{{ detail.projectBackground }}</p>
					</div>
					<div class="desc-card">
						<h4>项目目标</h4>
						<p>{{ detail.projectGoal }}</p>
					</div>
					<div class="desc-card">
						<h4>核心内容</h4>
						<p>{{ detail.coreContent }}</p>
					</div>
					<div class="desc-card">
						<h4>触发集团审议说明</h4>
						<p>{{ detail.triggerDescription || "-" }}</p>
					</div>
				</div>
			</section>

			<section class="handle-section">
				<h3 class="handle-section__title">附件材料</h3>
				<div class="attachment-panel">
					<div v-for="item in attachmentList" :key="item.key" class="attachment-card">
						<div>
							<strong>{{ item.label }}</strong>
							<div v-if="getAttachmentFiles(item).length" class="attachment-card__files">
								<p v-for="(file, index) in getAttachmentFiles(item)" :key="`${item.key}-${file.value}-${index}`">
									{{ file.name || "未命名附件" }}
								</p>
							</div>
							<p v-else>暂未上传附件</p>
						</div>
						<div v-if="getAttachmentFiles(item).length" class="attachment-card__files">
							<div
								v-for="(file, index) in getAttachmentFiles(item)"
								:key="`${item.key}-action-${file.value}-${index}`"
								class="attachment-card__actions"
							>
								<!-- <span>{{ file.sizeText || '-' }}</span> -->
								<el-button link type="primary" :disabled="!file.value" @click="openFile(item, file)">预览</el-button>
								<el-button link :disabled="!file.value" @click="downloadFile(file.value, file.name)">下载</el-button>
							</div>
						</div>
						<div v-else class="attachment-card__actions">
							<span>-</span>
							<el-button link type="primary" disabled>预览</el-button>
							<el-button link disabled>下载</el-button>
						</div>
					</div>
				</div>
			</section>

			<section class="handle-section">
				<h3 class="handle-section__title">流程记录</h3>
				<CommonTimeline v-if="timelineData.length" :data="timelineData">
					<template #item="{ item }">
						<div class="timeline-box">
							<div class="timeline-title">{{ item.raw.typeName || "-" }}</div>
							<p>{{ item.raw.message || "-" }}</p>
							<div class="timeline-center">
								<el-tooltip :content="`审批人：${item.raw.createByName ?? '-'}`" placement="top">
									<span>审批人：{{ item.raw.createByName ?? "-" }}</span>
								</el-tooltip>
							</div>
							<div class="timeline-bottom">
								<el-tooltip :content="`操作类型：${item.raw.operateName ?? '-'}`" placement="top">
									<span class="timeline-bottom__primary">操作类型：{{ item.raw.operateName ?? "-" }}</span>
								</el-tooltip>
								<el-tooltip
									:content="`创建部门：${item.raw.createDeptName ?? '-'}/${item.raw.createByName ?? '-'}`"
									placement="top"
								>
									<span class="timeline-bottom__secondary">创建部门：{{ item.raw.createDeptName ?? "-" }}</span>
								</el-tooltip>
							</div>
							<div class="timeline-time">{{ item.raw.updateTime || "-" }}</div>
						</div>
					</template>
				</CommonTimeline>
				<div v-else class="timeline-empty">暂无流程记录</div>
			</section>

			<section class="handle-section">
				<h3 class="handle-section__title">审批处理</h3>
				<template v-if="isMaterialConfirmStage">
					<el-form label-position="top">
						<el-form-item label="审批结果">
							<el-radio-group v-model="specialistForm.result">
								<el-radio label="agree">通过</el-radio>
								<el-radio label="reject">驳回</el-radio>
							</el-radio-group>
						</el-form-item>
						<el-form-item label="会签部门选择">
							<el-checkbox-group v-model="specialistForm.selectedDepts" :disabled="isMaterialRejecting">
								<div class="check-grid">
									<el-checkbox
										v-for="item in specialistDeptOptions"
										:key="item.deptId"
										:label="item.deptId"
										:disabled="isMaterialRejecting || item.requiredCoSignDept"
									>
										{{ item.deptName }}
									</el-checkbox>
								</div>
							</el-checkbox-group>
						</el-form-item>

						<el-form-item label="驳回原因">
							<el-input
								v-model="specialistForm.rejectReason"
								:disabled="!isMaterialRejecting"
								type="textarea"
								:rows="5"
								maxlength="200"
								show-word-limit
								resize="none"
							/>
						</el-form-item>
					</el-form>
				</template>

				<template v-else>
					<el-form label-position="top">
						<el-form-item :label="isDeptSignStage ? '会签结果' : '确认结果'">
							<el-radio-group v-model="approvalForm.result">
								<el-radio label="agree">同意</el-radio>
								<el-radio label="reject">驳回</el-radio>
							</el-radio-group>
						</el-form-item>
						<el-alert
							v-if="[2, 4, 6].includes(detail.status || -1)"
							title="上次意见已自动带入，可在当前页面调整后重新提交"
							type="warning"
							:closable="false"
							class="handle-alert"
						/>
						<el-form-item :label="isDeptSignStage ? '意见及建议' : '评审意见'">
							<el-input
								v-model="approvalForm.opinion"
								type="textarea"
								:rows="6"
								:maxlength="500"
								show-word-limit
								resize="none"
							/>
						</el-form-item>
					</el-form>
				</template>
			</section>
		</div>

		<template #actions>
			<el-button @click="emit('back')">返回</el-button>
			<el-button
				v-hasPermi="['base:businessMatters:handle']"
				v-if="isMaterialConfirmStage"
				type="primary"
				class="submit-button"
				:loading="loading"
				@click="
					emit('submit-material', {
						result: specialistForm.result,
						selectedDepts: specialistForm.selectedDepts,
						reason: specialistForm.rejectReason
					})
				"
			>
				提交
			</el-button>
			<el-button
				v-hasPermi="['base:businessMatters:handle']"
				v-else
				type="primary"
				class="submit-button"
				:loading="loading"
				@click="emit('submit-opinion', { result: approvalForm.result, opinion: approvalForm.opinion })"
			>
				提交处理
			</el-button>
		</template>
	</FormPageLayout>

	<FilePreview v-model:visible="previewDialogVisible" :file-url="previewUrl" :file-name="previewFileName" />
</template>

<script setup lang="ts">
import { getReviewLeafDeptList } from "@/api/system/review"
import type { BizBusinessMattersProcessLogVo, BizBusinessMattersVo, ReviewLeafDeptVo } from "@/api/system/review/types"
import formImg from "@/assets/images/form_img.webp"
import CommonTimeline from "@/components/CommonTimeline/index.vue"
import FilePreview from "@/components/FilePreview/index.vue"
import FormPageLayout from "@/components/FormPageLayout/index.vue"
import FileSaver from "file-saver"
import { ElMessage } from "element-plus"
import { computed, reactive, ref, watch } from "vue"
import { buildReviewAttachmentListFromDetail, buildReviewTimelineData, getReviewBusinessTypeValue } from "../config"

interface SpecialistDeptOption {
	deptName: string
	deptId: number | string
	requiredCoSignDept: boolean
}

const props = defineProps({
	detail: {
		type: Object as () => BizBusinessMattersVo | null,
		default: null
	},
	loading: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits<{
	(e: "back"): void
	(
		e: "submit-material",
		value: { result: "agree" | "reject"; selectedDepts: Array<string | number>; reason: string }
	): void
	(e: "submit-opinion", value: { result: "agree" | "reject"; opinion: string }): void
}>()

const specialistDeptOptions = ref<SpecialistDeptOption[]>([])
const deptOptionsLoading = ref(false)

const specialistForm = reactive({
	result: "agree" as "agree" | "reject",
	selectedDepts: [] as Array<string | number>,
	rejectReason: ""
})

const approvalForm = reactive<{
	result: "agree" | "reject"
	opinion: string
}>({
	result: "agree",
	opinion: ""
})

const isMaterialConfirmStage = computed(() => props.detail?.status === 1)
const isDeptSignStage = computed(() => props.detail?.status === 3)
const isMaterialRejecting = computed(() => specialistForm.result === "reject")
const businessType = computed(() => getReviewBusinessTypeValue(props.detail))
const attachmentList = computed(() => buildReviewAttachmentListFromDetail(props.detail, businessType.value))
const processLogList = computed<BizBusinessMattersProcessLogVo[]>(() =>
	Array.isArray(props.detail?.processLogList) ? props.detail.processLogList : []
)
const timelineData = computed(() => buildReviewTimelineData(processLogList.value))
const previewDialogVisible = ref(false)
const previewUrl = ref("")
const previewFileName = ref("PDF 预览")
const headerDesc = computed(() => `当前环节：${props.detail?.statusName || "-"}，请完成当前节点处理`)

const getFixedDeptIds = (options: SpecialistDeptOption[]) =>
	options.filter((item) => item.requiredCoSignDept).map((item) => item.deptId)

const syncSelectedDeptIds = (options: SpecialistDeptOption[]) => {
	const currentIds = String(props.detail?.coSignDeptIds || "")
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean)
	const availableIds = new Set(options.map((item) => String(item.deptId)))
	const mergedIds = [...getFixedDeptIds(options), ...currentIds.filter((item) => availableIds.has(String(item)))]
	specialistForm.selectedDepts = Array.from(new Set(mergedIds.map((item) => String(item)))).map((item) => {
		const matchedOption = options.find((option) => String(option.deptId) === item)
		return matchedOption?.deptId ?? item
	})
}

// const buildSpecialistDeptOptions = (list: ReviewLeafDeptVo[]) =>
//   list
//     .filter((item) => item.deptId !== undefined && item.deptId !== null && item.deptName)
//     .map((item) => ({
//       label: String(item.deptName),
//       value: item.deptId as string | number,
//       requiredCoSignDept: !!item.requiredCoSignDept
//     }));

const fetchSpecialistDeptOptions = async () => {
	if (!isMaterialConfirmStage.value) return
	deptOptionsLoading.value = true
	try {
		const res = await getReviewLeafDeptList()
		specialistDeptOptions.value = (Array.isArray(res.data) ? res.data : [])
			.filter((item): item is ReviewLeafDeptVo & { deptId: string | number; deptName: string } =>
				Boolean(item?.deptId !== undefined && item?.deptName)
			)
			.map((item) => ({
				deptName: String(item.deptName),
				deptId: item.deptId,
				requiredCoSignDept: !!item.requiredCoSignDept
			}))
		syncSelectedDeptIds(specialistDeptOptions.value)
	} catch (error) {
		console.error(error)
		ElMessage.error("获取会签部门失败")
	} finally {
		deptOptionsLoading.value = false
	}
}

const resetHandleForm = (_detail: BizBusinessMattersVo | null) => {
	specialistForm.result = "agree"
	specialistForm.selectedDepts = getFixedDeptIds(specialistDeptOptions.value)
	specialistForm.rejectReason = ""
	approvalForm.result = "agree"
	approvalForm.opinion = ""
}

const getAttachmentFiles = (item: { files?: Array<{ name?: string; sizeText?: string; value?: string }> }) =>
	Array.isArray(item.files) ? item.files : []

const openFile = (item: { label?: string }, file: { value?: string; sizeText?: string }) => {
	if (!file.value) return
	previewFileName.value = file.sizeText || item.label || "PDF 预览"
	previewUrl.value = file.value
	previewDialogVisible.value = true
}

const downloadFile = (url?: string, fileName?: string) => {
	if (!url) return
	FileSaver.saveAs(url, fileName || "经营事项评审附件.pdf")
}

watch(
	() => specialistForm.result,
	(value) => {
		if (value === "reject") {
			specialistForm.selectedDepts = []
			return
		}
		specialistForm.rejectReason = ""
		syncSelectedDeptIds(specialistDeptOptions.value)
	}
)

watch(
	() => props.detail,
	async (value) => {
		resetHandleForm(value)
		await fetchSpecialistDeptOptions()
	},
	{ immediate: true }
)
</script>

<style scoped lang="scss">
.review-handle-layout {
	height: 100%;
}

.handle-content {
	min-height: 0;
}

.summary-card,
.handle-section {
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
	gap: 1rem;
	flex-wrap: wrap;
	margin-top: 0.75rem;
	color: #6b7795;
	font-size: 0.875rem;
}

.handle-section__title {
	margin: 0 0 1rem;
	color: #172b4d;
	font-size: 1rem;
	font-weight: 600;
}

.info-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0.875rem;
}

.info-item,
.desc-card {
	padding: 0.875rem 1rem;
	border-radius: 0.875rem;
	background: #fff;
}

.info-item {
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
		line-height: 1.6;
	}
}

.desc-card-list {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0.875rem;
}

.desc-card {
	h4 {
		margin: 0 0 0.625rem;
		color: #172b4d;
		font-size: 0.9375rem;
		font-weight: 600;
	}

	p {
		margin: 0;
		color: #344563;
		line-height: 1.75;
	}
}

.check-grid {
	display: grid;
	grid-template-columns: repeat(5, minmax(0, 1fr));
	gap: 0.75rem 1rem;
}

.attachment-panel {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 0.75rem;
}

.attachment-card {
	display: flex;
	min-width: 0;
	flex-direction: column;
	align-items: flex-start;
	gap: 1rem;
	padding: 0.875rem 1rem;
	border-radius: 0.875rem;
	background: #fff;

	strong {
		color: #172b4d;
		font-size: 0.9375rem;
	}

	p {
		margin: 0.375rem 0 0;
		color: #6b7795;
		font-size: 0.8125rem;
	}
}

.attachment-card__actions {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 0.625rem;
	color: #6b7795;
	font-size: 0.8125rem;
}

.attachment-card__files {
	display: flex;
	width: 100%;
	min-width: 0;
	flex-direction: column;
	gap: 0.5rem;
}

.timeline-box {
	padding: 1rem 1.125rem;
	border: 1px solid #dbe4f0;
	border-radius: 1rem;
	background: #fff;

	p {
		margin: 0;
		color: #4e5969;
		line-height: 1.75;
	}
}

.timeline-title {
	color: #0f2748;
	font-size: 1.125rem;
	font-weight: 700;
	line-height: 1.4;
}

.timeline-center {
	color: #4e5969;
	font-size: 0.875rem;
}

.timeline-bottom {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	color: #5f6f8c;
	font-size: 0.8125rem;

	:deep(.el-tooltip__trigger) {
		min-width: 0;
	}
}

.timeline-bottom__primary {
	width: 35%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.timeline-bottom__secondary {
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.timeline-time {
	color: #6b7795;
	font-size: 0.8125rem;
}

.timeline-empty {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 7rem;
	border-radius: 0.875rem;
	background: #fff;
	color: #86909c;
	font-size: 0.875rem;
}

.handle-alert {
	margin-bottom: 1rem;
}

.handle-section__tips {
	margin: -0.25rem 0 1rem;
	color: #6b7795;
	font-size: 0.8125rem;
	line-height: 1.7;

	p {
		margin: 0;
	}
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
	.info-grid,
	.desc-card-list,
	.check-grid,
	.attachment-panel {
		grid-template-columns: 1fr;
	}

	.attachment-card {
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>
