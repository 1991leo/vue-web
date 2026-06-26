<template>
	<div class="platform-page-root">
		<FormPageLayout
			v-loading="loading"
			class="platform-page"
			title="平台设置"
			desc="填写基础信息，统一配置平台运行参数"
		>
			<el-form ref="platformFormRef" :model="form" :rules="rules" class="platform-form" label-position="top">
				<el-form-item label="平台名称" prop="platformName">
					<el-input v-model="form.platformName" placeholder="请输入平台名称" maxlength="100" />
				</el-form-item>

				<el-form-item label="平台版本" prop="platformVersion">
					<el-input v-model="form.platformVersion" placeholder="请输入平台版本" maxlength="20" />
				</el-form-item>

				<el-form-item label="版权信息" prop="platformSupport">
					<el-input v-model="form.platformSupport" placeholder="请输入版权信息" maxlength="100" />
				</el-form-item>

				<el-form-item prop="platformLoginUrl">
					<template #label>
						<span class="form-label-with-tip">
							登录页logo
							<el-tooltip
								class="box-item"
								effect="dark"
								content="为了最佳效果，图片尺寸建议为200px*80px"
								placement="right"
							>
								<el-icon class="tip-icon">
									<InfoFilled />
								</el-icon>
							</el-tooltip>
						</span>
					</template>
					<div class="logo-upload-row">
						<el-upload
							ref="loginUploadRef"
							v-model:file-list="loginLogoFileList"
							:limit="1"
							:accept="imageAccept"
							:action="uploadImgUrl"
							:headers="headers"
							:class="{ hide: loginLogoFileList.length >= 1 }"
							list-type="picture-card"
							:on-preview="handlePictureCardPreview"
							:on-exceed="(files) => handleUploadExceed('platformLoginUrl', files)"
							:on-remove="(file, files) => handleUploadRemove('platformLoginUrl', file, files)"
							:before-upload="beforeImageUpload"
							:on-success="(res, file, files) => handleUploadSuccess('platformLoginUrl', res, file, files)"
						>
							<div class="upload-trigger">
								<el-icon><Plus /></el-icon>
								<span>点击上传</span>
							</div>
						</el-upload>
					</div>
				</el-form-item>

				<el-form-item prop="platformLogoUrl">
					<template #label>
						<span class="form-label-with-tip">
							平台logo
							<el-tooltip
								class="box-item"
								effect="dark"
								content="为了最佳效果，图片尺寸建议为80px*80px"
								placement="right"
							>
								<el-icon class="tip-icon">
									<InfoFilled />
								</el-icon>
							</el-tooltip>
						</span>
					</template>
					<div class="logo-upload-row">
						<el-upload
							ref="platformUploadRef"
							v-model:file-list="platformLogoFileList"
							:limit="1"
							:accept="imageAccept"
							:action="uploadImgUrl"
							:headers="headers"
							:class="{ hide: platformLogoFileList.length >= 1 }"
							list-type="picture-card"
							:on-preview="handlePictureCardPreview"
							:on-exceed="(files) => handleUploadExceed('platformLogoUrl', files)"
							:on-remove="(file, files) => handleUploadRemove('platformLogoUrl', file, files)"
							:before-upload="beforeImageUpload"
							:on-success="(res, file, files) => handleUploadSuccess('platformLogoUrl', res, file, files)"
						>
							<div class="upload-trigger">
								<el-icon><Plus /></el-icon>
								<span>点击上传</span>
							</div>
						</el-upload>
					</div>
				</el-form-item>
			</el-form>

			<template #actions>
				<el-button class="platform-action-button" @click="handleCancel">取消</el-button>
				<el-button class="platform-action-button" type="primary" :loading="submitting" @click="handleSubmit"
					>提交</el-button
				>
			</template>
		</FormPageLayout>

		<el-dialog v-model="previewVisible" title="图片预览" width="50%" append-to-body>
			<img class="preview-image" :src="previewUrl" alt="图片预览" />
		</el-dialog>
	</div>
</template>

<script setup name="Platform" lang="ts">
import { listPlatformInfo, savePlatformInfo } from "@/api/system/platform"
import { PlatformInfoForm } from "@/api/system/platform/types"
import FormPageLayout from "@/components/FormPageLayout/index.vue"
import { globalHeaders } from "@/utils/request"

import { InfoFilled, Plus } from "@element-plus/icons-vue"
import { genFileId } from "element-plus"
import type { UploadFile, UploadFiles, UploadInstance, UploadProps, UploadRawFile, UploadUserFile } from "element-plus"

const { proxy } = getCurrentInstance() as ComponentInternalInstance
const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const previewVisible = ref(false)
const previewUrl = ref("")
const loginLogoFileList = ref<UploadUserFile[]>([])
const platformLogoFileList = ref<UploadUserFile[]>([])
const loginUploadRef = ref<UploadInstance>()
const platformUploadRef = ref<UploadInstance>()
const platformFormRef = ref<ElFormInstance>()

const baseUrl = import.meta.env.VITE_APP_BASE_API
const uploadImgUrl = `${baseUrl}/resource/oss/upload`
const headers = ref(globalHeaders())
const imageAccept = ".png,.jpg,.jpeg,.webp,.gif,.bmp,.svg,.ico"
type PlatformLogoField = "platformLoginUrl" | "platformLogoUrl"

interface UploadResponse {
	code?: number
	msg?: string
	data?: {
		url?: string
	}
}

const form = reactive<PlatformInfoForm>({
	id: undefined,
	platformCode: "",
	platformName: "",
	platformIntroduce: "",
	platformLoginUrl: "",
	platformLogoUrl: "",
	platformVersion: "",
	platformSupport: "",
	params: {}
})

const rules = reactive<ElFormRules>({
	platformLoginUrl: [{ required: true, message: "请上传登录页logo", trigger: "change" }],
	platformName: [{ required: true, message: "请输入平台名称", trigger: "blur" }],
	platformLogoUrl: [{ required: true, message: "请上传平台logo", trigger: "change" }],
	platformVersion: [{ required: true, message: "请输入平台版本", trigger: "blur" }],
	platformSupport: [{ required: true, message: "请输入版权信息", trigger: "blur" }]
})

const getImageUrl = (url: string) => {
	if (!url) return ""
	if (/^(https?:|data:|blob:)/.test(url)) return url
	return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`
}

const normalizeUploadFiles = (files: UploadFiles): UploadUserFile[] =>
	files.map((item) => ({
		name: item.name,
		url: item.url,
		status: item.status,
		uid: item.uid
	}))

const getDetail = async () => {
	loading.value = true
	try {
		const res = await listPlatformInfo()
		const firstRow = res.rows?.[0]
		if (!firstRow) {
			loginLogoFileList.value = []
			platformLogoFileList.value = []
			return
		}
		Object.assign(form, {
			id: firstRow.id,
			platformCode: firstRow.platformCode || "",
			platformName: firstRow.platformName || "",
			platformIntroduce: firstRow.platformIntroduce || "",
			platformLoginUrl: firstRow.platformLoginLogoUrl || "",
			platformLogoUrl: firstRow.platformLogoUrl || "",
			platformVersion: firstRow.platformVersion || "",
			platformSupport: firstRow.platformItSupport || ""
		})
		loginLogoFileList.value = form.platformLoginUrl
			? [{ name: "登录页logo", url: getImageUrl(form.platformLoginUrl) }]
			: []
		platformLogoFileList.value = form.platformLogoUrl
			? [{ name: "平台logo", url: getImageUrl(form.platformLogoUrl) }]
			: []
	} finally {
		loading.value = false
	}
}

const beforeImageUpload = (file: UploadRawFile) => {
	const allowExtList = ["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg"]
	const ext = file.name?.split(".").pop()?.toLowerCase() || ""
	const isImage = file.type?.startsWith("image/") || allowExtList.includes(ext)
	if (!isImage) {
		proxy?.$modal.msgError("请上传图片文件，仅支持 png/jpg/jpeg/webp/gif/bmp/svg 格式")
		return false
	}
	const isLt5M = file.size / 1024 / 1024 < 5
	if (!isLt5M) {
		proxy?.$modal.msgError("上传图片大小不能超过 5MB")
		return false
	}
	return true
}

// 此接口保存图片 URL，保留原 el-upload 链路避免公共 ImageUpload 将值转换为 ossId。
const handleUploadSuccess = (field: PlatformLogoField, res: UploadResponse, file: UploadFile, files: UploadFiles) => {
	if (res?.code !== 200 || !res?.data?.url) {
		proxy?.$modal.msgError(res?.msg || "图片上传失败")
		return
	}
	form[field] = res.data.url
	file.url = getImageUrl(res.data.url)
	const nextFiles = normalizeUploadFiles(files)
	if (field === "platformLoginUrl") {
		loginLogoFileList.value = nextFiles
	} else {
		platformLogoFileList.value = nextFiles
	}
}

const handleUploadRemove = (field: PlatformLogoField, _file: UploadFile, files: UploadFiles) => {
	form[field] = ""
	const nextFiles = normalizeUploadFiles(files)
	if (field === "platformLoginUrl") {
		loginLogoFileList.value = nextFiles
	} else {
		platformLogoFileList.value = nextFiles
	}
}

const handleUploadExceed = (field: PlatformLogoField, files: File[]) => {
	const uploadRef = field === "platformLoginUrl" ? loginUploadRef.value : platformUploadRef.value
	const file = files[0] as UploadRawFile
	if (!uploadRef || !file) return
	uploadRef.clearFiles()
	file.uid = genFileId()
	uploadRef.handleStart(file)
	uploadRef.submit()
}

const handlePictureCardPreview: UploadProps["onPreview"] = (uploadFile) => {
	previewUrl.value = uploadFile.url || ""
	previewVisible.value = true
}

const handleCancel = () => {
	router.back()
}

const handleSubmit = () => {
	platformFormRef.value?.validate(async (valid: boolean) => {
		if (!valid) return
		submitting.value = true
		try {
			await savePlatformInfo({ ...form })
			proxy?.$modal.msgSuccess("保存成功")
			await getDetail()
		} finally {
			submitting.value = false
		}
	})
}

onMounted(() => {
	getDetail()
})
</script>

<style lang="scss" scoped>
.platform-page-root {
	height: 100%;
}

.platform-page {
	height: calc(100vh - 146px);
	overflow-y: auto;
	box-sizing: border-box;

	&.platform-layout {
		height: 100%;
		padding: 0 0 28px 0;
	}

	:deep(.create-card) {
		width: min(1000px, calc(100vw - 96px));
		box-sizing: border-box;
		padding: 4px 4px 0;
		border-radius: 20px;
		background: #ffffff;
		box-shadow: none;
	}

	:deep(.create-card-header h1) {
		margin-bottom: 8px;
		color: #142b4d;
		font-size: 20px;
		font-weight: 700;
		line-height: 28px;
	}

	:deep(.create-card-header p) {
		color: #7b879c;
		font-size: 14px;
		line-height: 20px;
	}

	:deep(.prototype-form) {
		position: relative;
		z-index: 2;
		padding: 30px 60px;
	}

	:deep(.form-actions) {
		gap: 12px;
		padding: 20px 64px 24px;
		border-top: 0;
	}

	.platform-header-icon {
		width: 54px;
		height: 54px;
		object-fit: contain;
	}

	.platform-form {
		width: 100%;

		:deep(.el-form-item) {
			margin-bottom: 24px;
		}

		:deep(.el-form-item__label) {
			display: inline-flex;
			align-items: center;
			height: 22px;
			margin-bottom: 8px;
			color: #263a59;
			font-size: 14px;
			font-weight: 400;
			line-height: 22px;
		}

		:deep(.el-input__wrapper) {
			min-height: 34px;
			border-radius: 8px;
			box-shadow: 0 0 0 1px #e6ebf2 inset;
		}

		:deep(.el-input__inner) {
			color: #344563;
			font-size: 14px;
		}
	}

	.form-label-with-tip {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}

	.tip-icon {
		color: #c0c6d1;
		font-size: 16px;
	}

	.logo-upload-row {
		display: flex;
		align-items: center;
	}

	.upload-trigger {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		color: #a8b1c2;
		font-size: 14px;
		line-height: 20px;

		.el-icon {
			font-size: 24px;
		}
	}

	:deep(.hide .el-upload--picture-card) {
		display: none;
	}

	:deep(.el-upload--picture-card),
	:deep(.el-upload-list--picture-card .el-upload-list__item) {
		width: 128px !important;
		height: 128px !important;
		border-color: #e3e8f0;
		border-radius: 0;
		background: #fbfcff;
	}

	:deep(.el-upload-list--picture-card),
	:deep(.el-upload--picture-card) {
		--el-upload-list-picture-card-size: 128px !important;
	}

	.platform-action-button {
		min-width: 82px;
		height: 34px;
		border-radius: 8px;
	}
}

.preview-image {
	display: block;
	max-width: 100%;
	margin: 0 auto;
	object-fit: contain;
}

@media (max-width: 768px) {
	.platform-page {
		height: auto;
		min-height: calc(100vh - 86px);
		padding: 20px 12px 32px;

		:deep(.create-card) {
			width: 100%;
		}

		:deep(.create-card-header),
		:deep(.prototype-form),
		:deep(.form-actions) {
			padding-right: 24px;
			padding-left: 24px;
		}
	}
}
</style>
