<template>
	<el-dialog
		v-model="dialogVisible"
		:title="previewTitle"
		width="76%"
		append-to-body
		destroy-on-close
		class="file-preview-dialog"
	>
		<div class="file-preview">
			<iframe v-if="previewType === 'pdf'" :src="fileUrl" :title="previewTitle" class="file-preview__frame"></iframe>

			<div v-else-if="previewType === 'docx'" v-loading="officeLoading" class="file-preview__office">
				<VueOfficeDocx
					:key="fileUrl"
					:src="fileUrl"
					:request-options="requestOptions"
					@rendered="handleOfficeRendered"
					@error="handleOfficeError"
				/>
			</div>

			<div v-else-if="previewType === 'excel'" v-loading="officeLoading" class="file-preview__office">
				<VueOfficeExcel
					:key="fileUrl"
					:src="fileUrl"
					:request-options="requestOptions"
					:options="excelOptions"
					@rendered="handleOfficeRendered"
					@error="handleOfficeError"
				/>
			</div>

			<el-empty v-else :description="emptyDescription" class="file-preview__empty" />
		</div>

		<template #footer>
			<el-button type="primary" @click="dialogVisible = false">关闭</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { ElButton, ElDialog, ElEmpty, ElMessage } from "element-plus"
import VueOfficeDocx from "@vue-office/docx/lib/v3/index.js"
import VueOfficeExcel from "@vue-office/excel/lib/v3/index.js"
import "@vue-office/docx/lib/v3/index.css"
import "@vue-office/excel/lib/v3/index.css"
import { globalHeaders } from "@/utils/request"

type PreviewType = "pdf" | "docx" | "excel" | "unsupported" | ""

const props = withDefaults(
	defineProps<{
		visible: boolean
		fileUrl?: string
		fileName?: string
	}>(),
	{
		fileUrl: "",
		fileName: ""
	}
)

const emit = defineEmits<{
	(e: "update:visible", value: boolean): void
}>()

const dialogVisible = computed({
	get: () => props.visible,
	set: (value) => emit("update:visible", value)
})

const fileExt = computed(() => getFileExtension(props.fileName) || getFileExtension(props.fileUrl))

const previewType = computed<PreviewType>(() => {
	if (!props.fileUrl) return ""
	if (fileExt.value === "pdf") return "pdf"
	if (fileExt.value === "docx") return "docx"
	if (["xls", "xlsx"].includes(fileExt.value)) return "excel"
	return "unsupported"
})

const previewTitle = computed(() => props.fileName || getFileNameByUrl(props.fileUrl) || "文件预览")

const officeLoading = ref(false)

const excelOptions = {
	showContextmenu: false
}

const emptyDescription = computed(() => {
	if (!props.fileUrl) return "暂无可预览文件"
	if (fileExt.value === "doc") return "doc 格式暂不支持在线预览，请转换为 docx 后查看"
	if (previewType.value === "unsupported") return "当前文件格式暂不支持在线预览"
	return "文件暂时无法预览"
})

const isSameOriginUrl = (url: string) => {
	if (!url || typeof window === "undefined") return false
	try {
		return new URL(url, window.location.origin).origin === window.location.origin
	} catch {
		return false
	}
}

const requestOptions = computed(() => ({
	cache: "no-store",
	// 同源接口补充系统鉴权头；外部 OSS/静态资源地址交给文件服务自身处理
	headers: isSameOriginUrl(props.fileUrl) ? globalHeaders() : undefined
}))

function handleOfficeRendered() {
	officeLoading.value = false
}

function handleOfficeError(error: unknown) {
	console.error("Office 文件预览失败:", error)
	officeLoading.value = false
	ElMessage.error("文件预览失败，请下载后查看")
}

function getFileExtension(value?: string) {
	const fileName = getFileNameByUrl(value || "")
	const match = /\.([a-z0-9]+)$/i.exec(fileName)
	return match?.[1]?.toLowerCase() || ""
}

function getFileNameByUrl(url?: string) {
	if (!url) return ""
	const cleanUrl = url.split("?")[0] || ""
	const name = cleanUrl.slice(cleanUrl.lastIndexOf("/") + 1)
	try {
		return decodeURIComponent(name)
	} catch {
		return name
	}
}

watch(
	() => [dialogVisible.value, props.fileUrl, previewType.value],
	([visible, url, type]) => {
		if (!visible || !url) {
			officeLoading.value = false
			return
		}
		officeLoading.value = ["docx", "excel"].includes(String(type))
	},
	{ immediate: true }
)
</script>

<style scoped lang="scss">
.file-preview {
	height: 68vh;
	overflow: hidden;
	border: 1px solid var(--el-border-color-light);
	border-radius: 4px;
	background: #ffffff;
}

.file-preview__frame {
	width: 100%;
	height: 100%;
	border: 0;
	background: #fff;
}

.file-preview__office {
	height: 100%;
	overflow: auto;
}

.file-preview__empty {
	height: 100%;
}

:deep(.vue-office-docx),
:deep(.vue-office-excel) {
	min-height: 100%;
}
</style>
