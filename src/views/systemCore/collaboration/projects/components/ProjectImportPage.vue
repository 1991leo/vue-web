<template>
	<div class="import-page">
		<div class="create-card">
			<div class="create-card-header">
				<img class="header-icon" :src="formImg" alt="" />
				<div>
					<h1>批量导入合作项目</h1>
					<p>下载系统模板后上传 Excel，系统会校验数据并返回导入结果。</p>
				</div>
			</div>

			<div class="import-content">
				<section class="import-section">
					<h3 class="import-section__title">导入说明</h3>
					<div class="guide-list">
						<div class="guide-item">
							<strong>1. 下载模板</strong>
							<p>按照系统模板维护项目基本信息、完成时间模式和负责人信息。</p>
						</div>
						<div class="guide-item">
							<strong>2. 上传 Excel</strong>
							<p>仅支持 `.xlsx` 文件，上传后按接口返回展示导入结果。</p>
						</div>
						<div class="guide-item">
							<strong>3. 查看结果</strong>
							<p>导入成功后返回列表；如有异常，展示错误行和原因供修正。</p>
						</div>
					</div>
				</section>

				<section class="import-section">
					<h3 class="import-section__title">模板与文件</h3>
					<div class="upload-panel">
						<el-button :loading="templateLoading" @click="emit('download-template')">下载导入模板</el-button>
						<el-upload :show-file-list="false" accept=".xlsx" :http-request="handleUploadRequest">
							<el-button type="primary">选择 Excel 文件</el-button>
						</el-upload>
						<div class="upload-file-name">
							{{ fileName || "尚未选择文件" }}
						</div>
					</div>
				</section>

				<section class="import-section">
					<h3 class="import-section__title">错误明细</h3>
					<el-table :data="errorList" border>
						<el-table-column prop="rowIndex" label="行号" width="90" />
						<el-table-column prop="projectName" label="项目名称" min-width="220" />
						<el-table-column prop="reason" label="错误原因" min-width="320" />
					</el-table>
				</section>
			</div>

			<div class="form-actions">
				<el-button @click="emit('back')">返回</el-button>
				<el-button
					type="primary"
					class="submit-button"
					:loading="importLoading"
					:disabled="!selectedFile"
					@click="handleSubmit"
					>确认导入</el-button
				>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import formImg from "@/assets/images/form_img.webp"
import type { UploadRequestOptions } from "element-plus"
import { ref } from "vue"
import type { ProjectImportResultItem } from "../config"

defineProps({
	errorList: {
		type: Array as () => ProjectImportResultItem[],
		default: () => []
	},
	templateLoading: {
		type: Boolean,
		default: false
	},
	importLoading: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits<{
	(e: "back"): void
	(e: "download-template"): void
	(e: "submit-import", value: File): void
}>()

const fileName = ref("")
const selectedFile = ref<File | null>(null)

const handleUploadRequest = async (options: UploadRequestOptions) => {
	const file = options.file as File
	selectedFile.value = file
	fileName.value = file.name
	options.onSuccess?.({})
}

const handleSubmit = () => {
	if (!selectedFile.value) return
	emit("submit-import", selectedFile.value)
}
</script>

<style scoped lang="scss">
.import-page {
	display: flex;
	justify-content: center;
	height: 100%;
}

.create-card {
	display: flex;
	width: 66rem;
	height: 100%;
	flex-direction: column;
	overflow: hidden;
	border-radius: 1.125rem;
	background: #fff;
	box-shadow: 0 0 0 0.25rem rgba(255, 255, 255, 0.75);
}

.create-card-header {
	display: flex;
	height: 6.5rem;
	align-items: center;
	gap: 1.25rem;
	padding: 0 3.625rem;
	flex-shrink: 0;
	background: linear-gradient(180deg, rgba(229, 250, 239, 0.95) 0%, rgba(224, 247, 230, 0.9) 100%);

	h1 {
		margin: 0 0 0.375rem;
		color: #0f2748;
		font-size: 1.25rem;
		font-weight: 700;
	}

	p {
		margin: 0;
		color: #6b7795;
		font-size: 0.875rem;
	}
}

.header-icon {
	width: 3.5rem;
	height: 3.5rem;
	flex-shrink: 0;
	object-fit: contain;
}

.import-content {
	flex: 1;
	overflow-y: auto;
	padding: 1rem 3.625rem 0;
}

.import-section {
	margin-bottom: 1rem;
	padding: 1.25rem;
	border-radius: 1rem;
	background: #f8fafc;
}

.import-section__title {
	margin: 0 0 1rem;
	color: #172b4d;
	font-size: 1rem;
	font-weight: 600;
}

.guide-list {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 0.875rem;
}

.guide-item {
	padding: 0.875rem 1rem;
	border-radius: 0.875rem;
	background: #fff;

	strong {
		color: #172b4d;
		font-size: 0.9375rem;
	}

	p {
		margin: 0.625rem 0 0;
		color: #4e5969;
		line-height: 1.65;
	}
}

.upload-panel {
	display: flex;
	align-items: center;
	gap: 1rem;
	flex-wrap: wrap;
}

.upload-file-name {
	color: #6b7795;
	font-size: 0.875rem;
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
	.guide-list {
		grid-template-columns: 1fr;
	}
}
</style>
