<template>
	<div class="knowledge-container">
		<div class="knowledge-main-card">
			<div class="knowledge-header">
				<PageTitle title="知识库管理" />
			</div>

			<SearchHeader
				:form-items="searchFields"
				theme="card"
				@form-data-change="handleSearch"
				@form-data-reset="handleReset"
			/>

			<CommonDivider :offset="30" :vertical-margin="20" />

			<div class="table-toolbar">
				<el-button v-hasPermi="['base:knowledgeOss:add']" type="primary" :icon="Upload" @click="handleOpenUpload"
					>上传文档</el-button
				>
			</div>

			<CommonTable :data="tableData" :columns="columns" :loading="loading" row-key="id">
				<template #fileTitleSlot="{ row }">
					<div class="file-title-cell">
						<el-icon class="file-title-icon"><Document /></el-icon>
						<div class="file-title-content">
							<span class="file-title">{{ row.fileTitle || row.originalName || "-" }}</span>
							<span class="file-name">{{ row.originalName || row.fileName || "-" }}</span>
						</div>
					</div>
				</template>

				<template #fileTypeSlot="{ row }">
					<el-tag effect="plain" type="success">{{ getFileTypeLabel(row.fileType) }}</el-tag>
				</template>

				<template #fileSuffixSlot="{ row }">
					<span class="suffix-text">{{ formatSuffix(row.fileSuffix) }}</span>
				</template>

				<template #createBySlot="{ row }">
					<span>{{ row.createBy || "-" }}</span>
				</template>

				<template #createTimeSlot="{ row }">
					<span>{{ row.createTime || "-" }}</span>
				</template>

				<template #actionsSlot="{ row }">
					<div class="table-actions">
						<el-button link type="primary" v-hasPermi="['base:knowledgeOss:query']" @click="handlePreview(row)"
							>预览</el-button
						>
						<el-button link type="primary" v-hasPermi="['base:knowledgeOss:download']" @click="handleDownload(row)"
							>下载</el-button
						>
						<el-button link type="danger" v-hasPermi="['base:knowledgeOss:remove']" @click="handleDelete(row)"
							>删除</el-button
						>
					</div>
				</template>
			</CommonTable>

			<Pagination
				v-show="total > 0"
				v-model:current-page="currentPage"
				v-model:page-size="pageSize"
				:total="total"
				pagination-type="success"
			/>
		</div>

		<el-dialog
			v-model="uploadDialogVisible"
			title="上传知识库文档"
			width="560px"
			append-to-body
			@closed="resetUploadForm"
		>
			<el-form ref="uploadFormRef" :model="uploadForm" :rules="uploadRules" label-width="90px">
				<el-form-item label="文档标题" prop="fileTitle">
					<el-input v-model="uploadForm.fileTitle" placeholder="请输入文档标题" maxlength="100" clearable />
				</el-form-item>
				<el-form-item label="文档类别" prop="fileType">
					<el-select v-model="uploadForm.fileType" placeholder="请选择文档类别" class="w-full">
						<el-option v-for="item in fileTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
					</el-select>
				</el-form-item>
				<el-form-item label="知识文件" prop="file">
					<el-upload
						ref="uploadRef"
						drag
						action="#"
						:auto-upload="false"
						:limit="1"
						:file-list="selectedFiles"
						:accept="fileAccept"
						:on-change="handleFileChange"
						:on-remove="handleFileRemove"
						:on-exceed="handleFileExceed"
					>
						<el-icon class="upload-icon"><UploadFilled /></el-icon>
						<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
						<template #tip>
							<div class="el-upload__tip">当前仅支持 PDF 文件，单次上传 1 个文件</div>
						</template>
					</el-upload>
				</el-form-item>
			</el-form>
			<template #footer>
				<div class="dialog-footer">
					<el-button @click="uploadDialogVisible = false">取消</el-button>
					<el-button type="primary" :loading="submitLoading" @click="handleSubmitUpload">确定</el-button>
				</div>
			</template>
		</el-dialog>

		<el-dialog v-model="previewDialogVisible" :title="previewTitle" width="76%" append-to-body>
			<div class="pdf-preview-wrapper">
				<iframe v-if="previewUrl" :src="previewUrl" title="PDF 预览" class="pdf-preview-frame"></iframe>
				<el-empty v-else description="暂无可预览文件" />
			</div>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { Delete, Document, Download, Upload, UploadFilled, View } from "@element-plus/icons-vue"
import type {
	FormInstance,
	FormRules,
	UploadFile,
	UploadFiles,
	UploadInstance,
	UploadRawFile,
	UploadUserFile
} from "element-plus"
import { ElMessage, ElMessageBox } from "element-plus"
import PageTitle from "@/components/PageTitle/index.vue"
import SearchHeader from "@/components/SearchHeader/index.vue"
import CommonDivider from "@/components/CommonDivider/index.vue"
import CommonTable from "@/components/CommonTable/index.vue"
import Pagination from "@/components/Pagination/index.vue"
import { usePagination } from "@/hooks/usePagination"
import { addKnowledgeOss, delKnowledgeOss, listKnowledgeOss, uploadKnowledgeFile } from "@/api/system/knowledgeOss"
import type { KnowledgeOssForm, KnowledgeOssQuery, KnowledgeOssVO } from "@/api/system/knowledgeOss/types"
import { getDicts } from "@/api/system/dict/data"
import { useDictStore } from "@/store/modules/dict"

interface SearchFormData {
	fileTitle?: string
	fileType?: string
	originalName?: string
	fileSuffix?: string
}

interface UploadFormState {
	fileTitle: string
	fileType: string
	file?: UploadRawFile
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance
const dictStore = useDictStore()

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<KnowledgeOssVO[]>([])
const queryParams = reactive<KnowledgeOssQuery>({
	pageNum: 1,
	pageSize: 10,
	fileTitle: "",
	fileType: "",
	originalName: "",
	fileSuffix: "",
	orderByColumn: "createTime",
	isAsc: "descending"
})

const fileTypeOptions = ref<DictDataOption[]>([])

const columns: Array<{
	prop?: string
	label: string
	minWidth?: string | number
	width?: string | number
	slotName?: string
	showOverflowTooltip?: boolean
	fixed?: boolean | "left" | "right"
}> = [
	{ label: "文档信息", slotName: "fileTitleSlot", minWidth: 260 },
	{ label: "文档类别", slotName: "fileTypeSlot", width: 150 },
	// { label: '文件格式', slotName: 'fileSuffixSlot', width: 120 },
	{ label: "上传人", slotName: "createBySlot", width: 120 },
	{ label: "上传时间", slotName: "createTimeSlot", width: 180 },
	// { label: '服务商', prop: 'service', minWidth: 120, showOverflowTooltip: true },
	{ label: "操作", slotName: "actionsSlot", width: 210, fixed: "right" }
]

const searchFields = computed(() => [
	{ key: "fileTitle", label: "文档标题", type: "input", placeholder: "请输入文档标题", width: "180px" },
	// { key: 'originalName', label: '原文件名', type: 'input', placeholder: '请输入原文件名', width: '180px' },
	{
		key: "fileType",
		label: "文档类别",
		type: "select",
		placeholder: "请选择文档类别",
		width: "160px",
		options: fileTypeOptions.value
	}
	// { key: 'fileSuffix', label: '文件格式', type: 'input', placeholder: '请输入文件格式', width: '150px' }
])

const uploadDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const previewTitle = ref("PDF 预览")
const previewUrl = ref("")
const uploadRef = ref<UploadInstance>()
const uploadFormRef = ref<FormInstance>()
const selectedFiles = ref<UploadUserFile[]>([])
const uploadForm = reactive<UploadFormState>({
	fileTitle: "",
	fileType: "",
	file: undefined
})

const uploadRules: FormRules<UploadFormState> = {
	fileTitle: [{ required: true, message: "请输入文档标题", trigger: "blur" }],
	fileType: [{ required: true, message: "请选择文档类别", trigger: "change" }],
	file: [{ required: true, message: "请上传知识文件", trigger: "change" }]
}

const supportFileTypes = ["pdf"]
const fileAccept = supportFileTypes.map((item) => `.${item}`).join(",")

const { currentPage, pageSize, total } = usePagination(() => getList(), 10)

// 列表参数与分页状态保持同步，避免 SearchHeader 和 Pagination 各自维护请求状态
async function getList() {
	loading.value = true
	try {
		queryParams.pageNum = currentPage.value
		queryParams.pageSize = pageSize.value
		const res = await listKnowledgeOss(queryParams)
		tableData.value = res.rows || []
		total.value = res.total || 0
	} finally {
		loading.value = false
	}
}

function handleSearch(formData: SearchFormData) {
	Object.assign(queryParams, {
		fileTitle: formData.fileTitle || "",
		fileType: formData.fileType || "",
		originalName: formData.originalName || "",
		fileSuffix: formData.fileSuffix || ""
	})
	reloadFirstPage()
}

function handleReset() {
	Object.assign(queryParams, {
		fileTitle: "",
		fileType: "",
		originalName: "",
		fileSuffix: ""
	})
	reloadFirstPage()
}

function reloadFirstPage() {
	if (currentPage.value === 1) {
		getList()
		return
	}
	currentPage.value = 1
}

function handleOpenUpload() {
	uploadForm.fileType = uploadForm.fileType || String(fileTypeOptions.value[0]?.value || "")
	uploadDialogVisible.value = true
}

function handleFileChange(file: UploadFile, files: UploadFiles) {
	const rawFile = file.raw
	if (!rawFile || !validateFile(rawFile)) {
		uploadRef.value?.clearFiles()
		selectedFiles.value = []
		uploadForm.file = undefined
		return
	}
	selectedFiles.value = files.slice(-1)
	uploadForm.file = rawFile
	uploadFormRef.value?.validateField("file")
}

function handleFileRemove() {
	selectedFiles.value = []
	uploadForm.file = undefined
	uploadFormRef.value?.validateField("file")
}

function handleFileExceed(files: File[]) {
	uploadRef.value?.clearFiles()
	const file = files[0] as UploadRawFile
	if (!validateFile(file)) {
		selectedFiles.value = []
		uploadForm.file = undefined
		return
	}
	uploadRef.value?.handleStart(file)
	uploadForm.file = file
}

function validateFile(file: File) {
	const fileExt = file.name.split(".").pop()?.toLowerCase() || ""
	if (!supportFileTypes.includes(fileExt)) {
		ElMessage.error("文件格式不正确，请上传 PDF 格式文件")
		return false
	}
	if (file.name.includes(",")) {
		ElMessage.error("文件名不能包含英文逗号")
		return false
	}
	return true
}

async function handleSubmitUpload() {
	await uploadFormRef.value?.validate()
	if (!uploadForm.file) {
		ElMessage.warning("请上传知识文件")
		return
	}

	submitLoading.value = true
	try {
		// 接口要求先上传 OSS 文件，再用返回信息创建知识库记录
		const formData = new FormData()
		formData.append("file", uploadForm.file)
		const uploadRes = await uploadKnowledgeFile(formData)
		const uploadData = uploadRes.data
		const fileSuffix = getSuffix(uploadData.fileName)
		const payload: KnowledgeOssForm = {
			fileTitle: uploadForm.fileTitle,
			fileType: uploadForm.fileType,
			ossId: uploadData.ossId,
			fileName: uploadData.fileName,
			originalName: uploadData.fileName,
			fileSuffix,
			url: uploadData.url
		}
		await addKnowledgeOss(payload)
		ElMessage.success("上传成功")
		uploadDialogVisible.value = false
		reloadFirstPage()
	} finally {
		submitLoading.value = false
	}
}

function resetUploadForm() {
	uploadRef.value?.clearFiles()
	uploadFormRef.value?.resetFields()
	selectedFiles.value = []
	uploadForm.fileTitle = ""
	uploadForm.fileType = String(fileTypeOptions.value[0]?.value || "")
	uploadForm.file = undefined
}

function handlePreview(row: KnowledgeOssVO) {
	if (!isPdfFile(row)) {
		ElMessage.warning("当前仅支持 PDF 文件预览")
		return
	}
	if (!row.url) {
		ElMessage.warning("缺少文件地址，无法预览")
		return
	}
	previewTitle.value = row.fileTitle || row.originalName || "PDF 预览"
	previewUrl.value = row.url
	previewDialogVisible.value = true
}

function handleDownload(row: KnowledgeOssVO) {
	if (!row.ossId) {
		ElMessage.warning("缺少 OSS 文件主键，无法下载")
		return
	}
	// 下载接口需要 OSS 文件主键，不能使用知识库业务记录 id
	proxy?.$download.oss(row.ossId)
}

async function handleDelete(row: KnowledgeOssVO) {
	if (!row.id) {
		ElMessage.warning("缺少文件主键，无法删除")
		return
	}
	await ElMessageBox.confirm(
		`确定要删除文档“${row.fileTitle || row.originalName || row.fileName || row.id}”吗？`,
		"提示",
		{ type: "warning" }
	)
	await delKnowledgeOss(row.id)
	ElMessage.success("删除成功")
	reloadFirstPage()
}

function getFileTypeLabel(fileType?: string) {
	return fileTypeOptions.value.find((item) => item.value === fileType)?.label || fileType || "未分类"
}

function getSuffix(fileName?: string) {
	const suffix = fileName?.split(".").pop()
	return suffix ? `.${suffix}` : ""
}

function formatSuffix(fileSuffix?: string) {
	return fileSuffix || "-"
}

function isPdfFile(row: KnowledgeOssVO) {
	const fileSuffix = formatSuffix(row.fileSuffix).toLowerCase().replace(/^\./, "")
	return (
		fileSuffix === "pdf" || row.url?.toLowerCase().includes(".pdf") || row.originalName?.toLowerCase().endsWith(".pdf")
	)
}

async function getCachedDictOptions(dictType: string): Promise<DictDataOption[]> {
	const cached = dictStore.getDict(dictType)
	if (cached) return cached
	const res = await getDicts(dictType)
	const options = (res.data || []).map((item) => ({
		label: item.dictLabel,
		value: item.dictValue,
		elTagType: item.listClass,
		elTagClass: item.cssClass
	}))
	dictStore.setDict(dictType, options)
	return options
}

onMounted(async () => {
	fileTypeOptions.value = await getCachedDictOptions("file_type")
	uploadForm.fileType = String(fileTypeOptions.value[0]?.value || "")
	getList()
})
</script>

<style scoped lang="scss">
.knowledge-container {
	height: 100%;
	overflow: hidden;
}

.knowledge-main-card {
	height: 100%;
	background: #ffffff;
	border-radius: 20px;
	padding: 30px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.knowledge-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	margin-bottom: 18px;
}

.file-title-cell {
	display: flex;
	align-items: center;
	min-width: 0;
	gap: 12px;
}

.file-title-icon {
	flex: 0 0 auto;
	width: 36px;
	height: 36px;
	border-radius: 8px;
	color: var(--el-color-primary);
	background: rgba(var(--el-color-primary-rgb), 0.1);
}

.file-title-content {
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 4px;
}
.table-toolbar {
	display: flex;
	margin-bottom: 20px;
}
.file-title {
	color: var(--el-text-color-primary);
	font-weight: 600;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.file-name {
	color: var(--el-text-color-secondary);
	font-size: 13px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.suffix-text {
	color: var(--el-text-color-regular);
}

.table-actions {
	display: flex;
	align-items: center;
	gap: 6px;
}

.upload-icon {
	color: var(--el-color-primary);
}

/* 让拖拽上传区内容垂直+水平居中 */
:deep(.el-upload-dragger) {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.pdf-preview-wrapper {
	height: 72vh;
	overflow: hidden;
	border: 1px solid var(--el-border-color-lighter);
	border-radius: 8px;
}

.pdf-preview-frame {
	width: 100%;
	height: 100%;
	border: 0;
}

.w-full {
	width: 100%;
}

@media (max-width: 1200px) {
	.knowledge-main-card {
		padding: 24px;
	}

	.knowledge-header {
		align-items: flex-start;
		flex-direction: column;
	}
}
</style>
