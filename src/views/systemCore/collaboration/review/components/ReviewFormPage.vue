<template>
	<FormPageLayout class="review-form-layout" :title="headerTitle" :desc="headerDesc" :icon="formImg">
		<el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="review-form">
			<section class="review-section">
				<h3 class="review-section__title">基础信息</h3>
				<div class="review-grid review-grid--base">
					<el-form-item label="申请企业" prop="applicantEnterpriseIdName">
						<el-input v-model="formData.applicantEnterpriseIdName" disabled />
					</el-form-item>
					<el-form-item label="申请日期" prop="applicationDate">
						<el-date-picker v-model="formData.applicationDate" type="date" value-format="YYYY-MM-DD" disabled />
					</el-form-item>
					<el-form-item label="项目名称" prop="projectName" class="required-label">
						<el-input v-model="formData.projectName" maxlength="50" show-word-limit placeholder="项目名称" />
					</el-form-item>
					<el-form-item label="事项类型" prop="matterType" class="required-label">
						<el-select v-model="formData.matterType" placeholder="事项类型" @change="handleBusinessTypeChange">
							<el-option
								v-for="item in reviewBusinessTypeOptions"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							/>
						</el-select>
					</el-form-item>
				</div>
			</section>

			<section class="review-section">
				<h3 class="review-section__title">项目基本情况</h3>
				<div class="review-grid">
					<el-form-item label="项目背景" prop="projectBackground" class="required-label">
						<el-input
							v-model="formData.projectBackground"
							type="textarea"
							:rows="4"
							resize="none"
							placeholder="项目背景"
						/>
					</el-form-item>
					<el-form-item label="项目目标" prop="projectGoal" class="required-label">
						<el-input v-model="formData.projectGoal" type="textarea" :rows="4" resize="none" placeholder="项目目标" />
					</el-form-item>
					<el-form-item label="交易对手方" prop="counterparty" class="required-label">
						<el-input
							v-model="formData.counterparty"
							type="textarea"
							:rows="4"
							resize="none"
							placeholder="交易对手方信息"
						/>
					</el-form-item>
					<el-form-item label="核心内容" prop="coreContent" class="required-label">
						<el-input v-model="formData.coreContent" type="textarea" :rows="4" resize="none" placeholder="核心内容" />
					</el-form-item>
				</div>
			</section>

			<section class="review-section">
				<h3 class="review-section__title">触发集团审议说明</h3>
				<el-form-item label="审议说明" prop="triggerDescription" class="required-label">
					<el-input
						v-model="formData.triggerDescription"
						type="textarea"
						:rows="6"
						resize="none"
						placeholder="审议说明"
					/>
				</el-form-item>
			</section>

			<section class="review-section">
				<h3 class="review-section__title">核心经营与财务指标分析</h3>
				<div class="review-grid">
					<el-form-item label="利润情况" prop="profitSituation">
						<el-input
							v-model="formData.profitSituation"
							type="textarea"
							:rows="4"
							resize="none"
							placeholder="利润情况分析"
						/>
					</el-form-item>
					<el-form-item label="资金安排" prop="fundArrangement">
						<el-input
							v-model="formData.fundArrangement"
							type="textarea"
							:rows="4"
							resize="none"
							placeholder="资金安排"
						/>
					</el-form-item>
					<el-form-item label="合同金额（万元）" prop="contractAmount">
						<el-input-number
							v-model="formData.contractAmount"
							:min="0"
							:precision="2"
							:controls="false"
							class="full-width"
						/>
					</el-form-item>
				</div>
			</section>

			<section class="review-section">
				<h3 class="review-section__title">风险评估与合规性说明</h3>
				<div class="review-grid">
					<el-form-item label="法律合规" prop="legalCompliance" class="required-label">
						<el-input
							v-model="formData.legalCompliance"
							type="textarea"
							:rows="4"
							resize="none"
							placeholder="法律合规说明"
						/>
					</el-form-item>
					<el-form-item label="技术与安全" prop="techAndSafety" class="required-label">
						<el-input
							v-model="formData.techAndSafety"
							type="textarea"
							:rows="4"
							resize="none"
							placeholder="技术与安全说明"
						/>
					</el-form-item>
					<el-form-item label="履约风险" prop="performanceRisk" class="required-label">
						<el-input
							v-model="formData.performanceRisk"
							type="textarea"
							:rows="4"
							resize="none"
							placeholder="履约风险说明"
						/>
					</el-form-item>
				</div>
			</section>

			<section class="review-section">
				<h3 class="review-section__title">备注说明</h3>
				<el-form-item prop="remark">
					<el-input v-model="formData.remark" type="textarea" :rows="4" resize="none" />
				</el-form-item>
			</section>

			<section class="review-section">
				<h3 class="review-section__title">附件上传</h3>
				<div class="attachment-list">
					<div v-for="item in formData.attachments" :key="item.key" class="attachment-item">
						<div class="attachment-item__header">
							<span :class="{ 'required': item.required }">{{ item.required ? "*" : "" }}</span>
							<span>{{ item.label }}</span>
						</div>
						<div class="attachment-item__body">
							<el-upload
								drag
								action="#"
								:auto-upload="true"
								:show-file-list="false"
								accept=".pdf"
								:http-request="(options) => handleUploadRequest(options, item.key)"
								:before-upload="handleBeforeUpload"
								:disabled="uploadLoadingKey === item.key"
							>
								<el-icon class="attachment-upload__icon"><UploadFilled /></el-icon>
								<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
								<template #tip>
									<div class="el-upload__tip">
										{{
											item.multiple
												? `当前仅支持 PDF 文件，最多上传 ${item.maxCount || 3} 个文件，单文件不超过 10MB`
												: "当前仅支持 PDF 文件，单文件不超过 10MB"
										}}
									</div>
								</template>
							</el-upload>
							<div v-if="hasAttachmentFiles(item)" class="attachment-item__files">
								<div
									v-for="(file, index) in getAttachmentFiles(item)"
									:key="`${item.key}-${file.value}-${index}`"
									class="attachment-item__file"
								>
									<span>{{ file.name || item.name }}</span>
									<!-- <span>{{ file.sizeText || item.sizeText || '-' }}</span> -->
									<el-button link type="primary" @click="previewFile(item, file)">预览</el-button>
									<el-button link @click="downloadFile(item, file)">下载</el-button>
									<el-button link type="danger" @click="removeFile(item.key, index)">删除</el-button>
								</div>
							</div>
							<!-- <div v-else class="attachment-item__empty">请上传 PDF 文件，单文件不超过 10MB</div> -->
						</div>
					</div>
				</div>
			</section>

			<section v-if="isEditMode" class="review-section">
				<h3 class="review-section__title">流程记录</h3>
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
		</el-form>

		<template #actions>
			<el-button @click="emit('back')">取消</el-button>
			<el-button
				v-hasPermi="['base:businessMatters:remove']"
				v-if="showDeleteButton"
				type="danger"
				plain
				@click="emit('delete')"
				>删除</el-button
			>
			<el-button v-hasPermi="['base:businessMatters:add']" @click="handleSaveDraft">保存草稿</el-button>
			<el-button
				v-hasPermi="['base:businessMatters:submit']"
				type="primary"
				class="submit-button"
				:loading="loading"
				@click="handleSubmit"
			>
				{{ mode === "edit" ? "保存并提交" : "提交申请" }}
			</el-button>
		</template>
	</FormPageLayout>

	<FilePreview v-model:visible="previewDialogVisible" :file-url="previewUrl" :file-name="previewFileName" />
</template>

<script setup lang="ts">
import type { BizBusinessMattersProcessLogVo, BizBusinessMattersVo } from "@/api/system/review/types"
import { uploadReviewFile } from "@/api/system/review"
import formImg from "@/assets/images/form_img.webp"
import CommonTimeline from "@/components/CommonTimeline/index.vue"
import FilePreview from "@/components/FilePreview/index.vue"
import FormPageLayout from "@/components/FormPageLayout/index.vue"
import FileSaver from "file-saver"
import { UploadFilled } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadRequestOptions } from "element-plus"
import { computed, reactive, ref, watch } from "vue"
import {
	buildAttachmentTemplate,
	buildInstructionText,
	buildReviewTimelineData,
	createReviewFormData,
	reviewBusinessTypeOptions,
	type ReviewAttachmentItem,
	type ReviewAttachmentFileItem,
	type ReviewBusinessType,
	type ReviewFormData
} from "../config"

const props = defineProps({
	mode: {
		type: String as () => "create" | "edit",
		default: "create"
	},
	initialData: {
		type: Object as () => ReviewFormData | null,
		default: null
	},
	detail: {
		type: Object as () => BizBusinessMattersVo | null,
		default: null
	},
	loading: {
		type: Boolean,
		default: false
	},
	showDeleteButton: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits<{
	(e: "back"): void
	(e: "delete"): void
	(e: "save-draft", value: ReviewFormData): void
	(e: "submit", value: ReviewFormData): void
}>()

const formRef = ref<FormInstance>()
const formData = reactive<ReviewFormData>(createReviewFormData())
const uploadLoadingKey = ref<ReviewAttachmentItem["key"] | "">("")
const previewDialogVisible = ref(false)
const previewUrl = ref("")
const previewFileName = ref("PDF 预览")

const isEditMode = computed(() => props.mode === "edit")
const headerTitle = computed(() => (props.mode === "edit" ? "编辑经营事项评审申请" : "新建经营事项评审申请"))
const headerDesc = computed(() =>
	props.mode === "edit"
		? "请核对驳回意见和材料内容，完善后重新提交审批流程。"
		: "请完整填写经营事项信息、专项说明与附件材料后发起审批流程。"
)
const processLogList = computed<BizBusinessMattersProcessLogVo[]>(() =>
	Array.isArray(props.detail?.processLogList) ? props.detail.processLogList : []
)
const timelineData = computed(() => buildReviewTimelineData(processLogList.value))

const cloneReviewAttachment = (item: ReviewAttachmentItem): ReviewAttachmentItem => ({
	...item,
	files: Array.isArray(item.files) ? item.files.map((file) => ({ ...file })) : []
})

const cloneReviewFormData = (value: ReviewFormData | null): ReviewFormData => {
	const nextValue = value || createReviewFormData()
	return {
		...nextValue,
		attachments: Array.isArray(nextValue.attachments) ? nextValue.attachments.map(cloneReviewAttachment) : []
	}
}

const syncFormData = (value: ReviewFormData | null) => {
	const nextValue = cloneReviewFormData(value)
	Object.assign(formData, nextValue)
	formData.attachments = Array.isArray(nextValue.attachments)
		? nextValue.attachments
		: buildAttachmentTemplate(formData.matterType)
}

type UploadError = Parameters<NonNullable<UploadRequestOptions["onError"]>>[0]

const createUploadAjaxError = (message: string) => new Error(message) as UploadError

const formRules: FormRules = {
	projectName: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
	matterType: [{ required: true, message: "请选择事项类型", trigger: "change" }],
	projectBackground: [{ required: true, message: "请输入项目背景", trigger: "blur" }],
	projectGoal: [{ required: true, message: "请输入项目目标", trigger: "blur" }],
	counterparty: [{ required: true, message: "请输入交易对手方", trigger: "blur" }],
	coreContent: [{ required: true, message: "请输入核心内容", trigger: "blur" }],
	triggerDescription: [{ required: true, message: "请输入审议说明", trigger: "blur" }],
	legalCompliance: [{ required: true, message: "请输入法律合规说明", trigger: "blur" }],
	techAndSafety: [{ required: true, message: "请输入技术与安全说明", trigger: "blur" }],
	performanceRisk: [{ required: true, message: "请输入履约风险说明", trigger: "blur" }]
}

const handleBusinessTypeChange = (value: ReviewBusinessType) => {
	formData.remark = buildInstructionText(value)
	formData.attachments = buildAttachmentTemplate(value).map((templateItem, index) => {
		const currentItem = formData.attachments[index]
		return currentItem && currentItem.name
			? {
					...templateItem,
					name: currentItem.name,
					sizeText: currentItem.sizeText,
					value: currentItem.value,
					files: Array.isArray(currentItem.files) ? currentItem.files.map((file) => ({ ...file })) : []
				}
			: templateItem
	})
}

const handleBeforeUpload = (file: File) => {
	if (file.type !== "application/pdf") {
		ElMessage.error("仅支持上传 PDF 文件")
		return false
	}
	if (file.size / 1024 / 1024 > 10) {
		ElMessage.error("单个附件大小不能超过 10MB")
		return false
	}
	return true
}

const handleUploadRequest = async (options: UploadRequestOptions, attachmentKey: ReviewAttachmentItem["key"]) => {
	const file = options.file as File
	const matchedItem = formData.attachments.find((item) => item.key === attachmentKey)
	if (!matchedItem) return
	if (matchedItem.multiple && (matchedItem.files?.length || 0) >= (matchedItem.maxCount || 3)) {
		ElMessage.warning(`“${matchedItem.label}”最多上传 ${matchedItem.maxCount || 3} 个文件`)
		options.onError?.(createUploadAjaxError("attachment count limit exceeded"))
		return
	}
	uploadLoadingKey.value = attachmentKey
	try {
		const form = new FormData()
		form.append("file", file)
		const uploadRes = await uploadReviewFile(form)
		const uploadData = uploadRes.data
		const nextFile: ReviewAttachmentFileItem = {
			fileName: uploadData?.fileName || file.name,
			url: uploadData?.url || "",
			name: uploadData?.fileName || file.name,
			sizeText: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
			value: uploadData?.url || ""
		}
		if (matchedItem.multiple) {
			matchedItem.files = [...(matchedItem.files || []), nextFile]
			matchedItem.name = `已上传 ${matchedItem.files.length} 个文件`
			matchedItem.sizeText = `${matchedItem.files.length} 个文件`
			matchedItem.value = JSON.stringify(matchedItem.files.map((item) => ({ fileName: item.fileName, url: item.url })))
		} else {
			matchedItem.name = nextFile.name
			matchedItem.sizeText = nextFile.sizeText
			matchedItem.value = nextFile.value
			matchedItem.files = [nextFile]
		}
		options.onSuccess?.(uploadData)
		ElMessage.success("附件上传成功")
	} catch (error) {
		options.onError?.(createUploadAjaxError(error instanceof Error ? error.message : "upload failed"))
		throw error
	} finally {
		uploadLoadingKey.value = ""
	}
}

const getAttachmentFiles = (item: ReviewAttachmentItem) => (Array.isArray(item.files) ? item.files : [])

const hasAttachmentFiles = (item: ReviewAttachmentItem) => getAttachmentFiles(item).length > 0

const previewFile = (item: ReviewAttachmentItem, file?: ReviewAttachmentFileItem) => {
	const currentFile = file || getAttachmentFiles(item)[0]
	if (!currentFile?.value) return
	previewFileName.value = currentFile.sizeText || item.label || "PDF 预览"
	previewUrl.value = currentFile.value
	previewDialogVisible.value = true
}

const downloadFile = (item: ReviewAttachmentItem, file?: ReviewAttachmentFileItem) => {
	const currentFile = file || getAttachmentFiles(item)[0]
	if (!currentFile?.value) return
	FileSaver.saveAs(currentFile.value, currentFile.name || `${item.label}.pdf`)
}

const removeFile = async (key: ReviewAttachmentItem["key"], fileIndex?: number) => {
	const matchedItem = formData.attachments.find((item) => item.key === key)
	if (!matchedItem) return
	const currentFiles = getAttachmentFiles(matchedItem)
	const currentFile = typeof fileIndex === "number" ? currentFiles[fileIndex] : currentFiles[0]
	await ElMessageBox.confirm(
		`确定要删除附件“${currentFile?.name || matchedItem.name || matchedItem.label}”吗？`,
		"提示",
		{ type: "warning" }
	)
	if (matchedItem.multiple) {
		matchedItem.files = currentFiles.filter((_, index) => index !== fileIndex)
		matchedItem.name = matchedItem.files.length ? `已上传 ${matchedItem.files.length} 个文件` : ""
		matchedItem.sizeText = matchedItem.files.length ? `${matchedItem.files.length} 个文件` : ""
		matchedItem.value = matchedItem.files.length
			? JSON.stringify(matchedItem.files.map((item) => ({ fileName: item.fileName, url: item.url })))
			: ""
		return
	}
	matchedItem.name = ""
	matchedItem.sizeText = ""
	matchedItem.value = ""
	matchedItem.files = []
}

const validateAttachments = () => {
	const invalidItem = formData.attachments.find((item) => item.required && !hasAttachmentFiles(item))
	if (invalidItem) {
		ElMessage.error(`请上传“${invalidItem.label}”分类下的 PDF 附件`)
		return false
	}
	return true
}

const buildSubmitData = (): ReviewFormData => cloneReviewFormData(formData)

const handleSaveDraft = () => {
	emit("save-draft", buildSubmitData())
}

const handleSubmit = async () => {
	const valid = await formRef.value?.validate().catch(() => false)
	if (!valid) return
	if (!validateAttachments()) return
	emit("submit", buildSubmitData())
}

watch(
	() => props.initialData,
	(value) => {
		syncFormData(value)
		formRef.value?.clearValidate()
	},
	{ immediate: true }
)
</script>

<style scoped lang="scss">
.review-form-layout {
	height: 100%;
}

.review-form {
	min-height: 0;

	:deep(.el-form-item) {
		margin-bottom: 1.25rem;
	}

	:deep(.el-form-item__label) {
		color: #0f2748;
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	:deep(.el-input),
	:deep(.el-select),
	:deep(.el-date-editor.el-input),
	:deep(.el-date-editor.el-input__wrapper) {
		width: 100%;
	}
}

.review-section {
	margin-bottom: 1rem;
	padding: 1.25rem 1.25rem 0.5rem;
	border-radius: 1rem;
	background: #f8fafc;
}

.review-section__title {
	margin: 0 0 1rem;
	color: #172b4d;
	font-size: 1rem;
	font-weight: 600;
}

.review-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0 1.5rem;
}

.review-grid--base {
	grid-template-columns: repeat(3, minmax(0, 1fr));
}

.attachment-list {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 0.875rem;
}

.attachment-item {
	padding: 0.875rem 1rem;
	border: 1px solid #dfe7f1;
	border-radius: 0.875rem;
	background: #fff;
}

.attachment-item__header {
	display: flex;
	align-items: center;
	justify-content: flex-start;
	margin-bottom: 0.75rem;
	color: #172b4d;
	font-size: 0.875rem;
	font-weight: 600;
	.required {
		color: #f53f3f;
		margin-right: 0.125rem;
		content: "*";
	}
}

// .attachment-item__header {
//   margin-left: 0.125rem;
//   color: #f53f3f;
//   content: '*';
// }
.attachment-item__required {
	color: #6b7795;
	font-size: 0.75rem;
	font-weight: 400;
}

.attachment-item__body {
	display: flex;
	min-height: 100%;
	flex-direction: column;
	align-items: stretch;
	gap: 0.75rem;
}

.attachment-upload__icon {
	margin-bottom: 0.5rem;
	color: var(--el-color-primary);
}

.attachment-item__file {
	display: flex;
	min-width: 0;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.75rem;
	color: #4e5969;
	font-size: 0.875rem;
}

.attachment-item__files {
	display: flex;
	width: 100%;
	flex-direction: column;
	gap: 0.75rem;
}

.attachment-item__empty {
	color: #86909c;
	font-size: 0.8125rem;
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

:deep(.attachment-item .el-upload),
:deep(.attachment-item .el-upload-dragger) {
	width: 100%;
}

:deep(.attachment-item .el-upload-dragger) {
	display: flex;
	min-height: 120px;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.submit-button {
	min-width: 7rem;
	height: 2.125rem;
	border-radius: 0.5rem;
	--el-button-bg-color: #00b46e;
	--el-button-border-color: #00b46e;
	--el-button-hover-bg-color: #00a665;
	--el-button-hover-border-color: #00a665;
}

.full-width {
	width: 100%;
}

@media (max-width: 1200px) {
	.attachment-list,
	.review-grid,
	.review-grid--base {
		grid-template-columns: 1fr;
	}
}
</style>
