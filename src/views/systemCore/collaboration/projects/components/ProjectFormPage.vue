<template>
	<FormPageLayout class="project-form-layout" :title="headerTitle" :desc="headerDesc">
		<template #icon>
			<img class="header-icon" :src="formImg" alt="" />
		</template>

		<el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="project-form">
			<section class="form-section">
				<h3 class="form-section__title">基础信息</h3>
				<div class="form-grid form-grid--base">
					<el-form-item label="合作企业" prop="partnerName">
						<el-input v-model="formData.partnerName" placeholder="请输入合作企业名称" />
					</el-form-item>
					<el-form-item label="合作方向" prop="cooperationDirection">
						<el-select v-model="formData.cooperationDirection" filterable placeholder="请选择合作方向">
							<el-option v-for="item in directionOptions" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
					<el-form-item label="战略合作落地项目" prop="projectName">
						<el-input
							v-model="formData.projectName"
							maxlength="60"
							show-word-limit
							placeholder="请输入战略合作落地项目"
						/>
					</el-form-item>
					<el-form-item label="合作类别" prop="projectType">
						<el-select v-model="formData.projectType" placeholder="请选择合作类别">
							<el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
					<el-form-item label="负责业务单元" prop="businessUnitId">
						<el-select
							v-model="formData.businessUnitId"
							filterable
							placeholder="请选择负责业务单元"
							@change="handleCompanyChange"
						>
							<el-option v-for="item in companyOptions" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
					<el-form-item label="大数据集团业务对接人" prop="responsiblePersonId">
						<el-select
							v-model="formData.responsiblePersonId"
							filterable
							:loading="userLoading"
							:disabled="!formData.businessUnitId"
							placeholder="请选择大数据集团业务对接人"
							@change="handleResponsiblePersonChange"
						>
							<el-option v-for="item in userOptions" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
					<el-form-item label="企业对接人" prop="liaisonName">
						<el-input v-model="formData.liaisonName" placeholder="请输入企业对接人" />
					</el-form-item>
				</div>
			</section>

			<section class="form-section">
				<h3 class="form-section__title">完成时间设置</h3>
				<el-form-item label="完成时间模式" prop="completionMode" class="completion-mode-group">
					<el-radio-group v-model="formData.completionMode" @change="handleCompletionModeChange">
						<el-radio v-for="item in finishTimeOptions" :key="item.value" :label="item.value">{{
							item.label
						}}</el-radio>
					</el-radio-group>
				</el-form-item>

				<div class="form-grid">
					<el-form-item v-if="formData.completionMode === 'date'" label="计划完成日期" prop="finishTimeValue">
						<el-date-picker
							v-model="formData.finishTimeValue"
							type="date"
							value-format="YYYY-MM-DD"
							placeholder="请选择计划完成日期"
						/>
					</el-form-item>

					<el-form-item v-if="formData.completionMode === 'month'" label="里程碑节点" prop="finishTimeValue">
						<el-input v-model="formData.finishTimeValue" placeholder="平台上线:2026-06|项目终验:2026-12" />
					</el-form-item>

					<div v-if="formData.completionMode === 'quarter'" class="form-tip">
						持续型项目无需填写额外完成时间，提交时将按“持续型”保存。
					</div>
				</div>
			</section>

			<section class="form-section">
				<h3 class="form-section__title">合作内容</h3>
				<div class="form-grid">
					<el-form-item label="合作内容及目标" prop="contentGoal">
						<el-input
							v-model="formData.contentGoal"
							type="textarea"
							:rows="7"
							resize="none"
							placeholder="请输入合作内容及目标"
						/>
					</el-form-item>
					<el-form-item label="备注" prop="remark">
						<el-input v-model="formData.remark" type="textarea" :rows="7" resize="none" placeholder="请输入补充说明" />
					</el-form-item>
				</div>
			</section>
		</el-form>

		<template #actions>
			<el-button @click="emit('back')">取消</el-button>
			<el-button v-if="mode === 'create'" @click="handleSaveDraft">保存草稿</el-button>
			<el-button type="primary" class="submit-button" :loading="loading" @click="handleSubmit">
				{{ mode === "edit" ? "保存项目" : "创建项目" }}
			</el-button>
		</template>
	</FormPageLayout>
</template>

<script setup lang="ts">
import formImg from "@/assets/images/form_img.webp"
import FormPageLayout from "@/components/FormPageLayout/index.vue"
import { ElMessage, type FormInstance, type FormRules } from "element-plus"
import { computed, reactive, ref, watch } from "vue"
import { createProjectFormData, projectFollowStatusLabels, type ProjectFormData, type ProjectOption } from "../config"

const props = defineProps({
	mode: {
		type: String as () => "create" | "edit",
		default: "create"
	},
	initialData: {
		type: Object as () => ProjectFormData | null,
		default: null
	},
	loading: {
		type: Boolean,
		default: false
	},
	categoryOptions: {
		type: Array as () => ProjectOption[],
		default: () => []
	},
	directionOptions: {
		type: Array as () => ProjectOption[],
		default: () => []
	},
	finishTimeOptions: {
		type: Array as () => ProjectOption[],
		default: () => []
	},
	companyOptions: {
		type: Array as () => ProjectOption[],
		default: () => []
	},
	userOptions: {
		type: Array as () => ProjectOption[],
		default: () => []
	},
	userLoading: {
		type: Boolean,
		default: false
	},
	projectStatusOptions: {
		type: Array as () => ProjectOption[],
		default: () => []
	}
})

const emit = defineEmits<{
	(e: "back"): void
	(e: "save-draft", value: ProjectFormData): void
	(e: "submit", value: ProjectFormData): void
	(e: "business-unit-change", value: string): void
}>()

const formRef = ref<FormInstance>()
const formData = reactive<ProjectFormData>(createProjectFormData())

const headerTitle = computed(() => (props.mode === "edit" ? "编辑合作项目" : "新建合作项目"))
const headerDesc = computed(() =>
	props.mode === "edit"
		? "请按项目最新推进情况调整基础信息和合作计划。"
		: "请完整填写合作项目台账信息，创建后可由业务对接人持续填报周报。"
)

const syncFormData = (value: ProjectFormData | null) => {
	const nextValue = value ? JSON.parse(JSON.stringify(value)) : createProjectFormData()
	Object.assign(formData, nextValue)
}

const formRules: FormRules = {
	projectName: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
	businessUnitId: [{ required: true, message: "请选择负责业务单元", trigger: "change" }],
	partnerName: [{ required: true, message: "请输入合作企业", trigger: "blur" }],
	cooperationDirection: [{ required: true, message: "请选择合作方向", trigger: "change" }],
	projectType: [{ required: true, message: "请选择合作类别", trigger: "change" }],
	responsiblePersonId: [{ required: true, message: "请选择大数据集团业务对接人", trigger: "change" }],
	completionMode: [{ required: true, message: "请选择完成时间模式", trigger: "change" }],
	finishTimeValue: [
		{
			validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
				if (formData.completionMode === "date" && !value) {
					callback(new Error("请选择计划完成日期"))
					return
				}
				if (formData.completionMode === "month" && !value) {
					callback(new Error("请输入计划完成里程碑节点"))
					return
				}
				callback()
			},
			trigger: "change"
		}
	],
	contentGoal: [{ required: true, message: "请输入合作内容及目标", trigger: "blur" }]
}

const buildSubmitData = (followStatus: string): ProjectFormData => {
	formData.followStatus = followStatus
	return JSON.parse(JSON.stringify(formData))
}

const getFollowStatusValue = (labelKeyword: string) => {
	return (props.projectStatusOptions || []).find((item) => item.label.includes(labelKeyword))?.value || ""
}

const handleCompanyChange = (value?: string | number) => {
	const selectedCompany = props.companyOptions.find((item) => String(item.value) === String(value))
	formData.companyName = selectedCompany?.label || ""
	formData.responsiblePersonId = ""
	formData.responsiblePerson = ""
	emit("business-unit-change", value ? String(value) : "")
	formRef.value?.clearValidate("responsiblePersonId")
}

const handleResponsiblePersonChange = (value?: string | number) => {
	const selectedUser = props.userOptions.find((item) => String(item.value) === String(value))
	formData.responsiblePerson = selectedUser?.label || ""
}

const handleCompletionModeChange = () => {
	formData.finishTimeValue = formData.completionMode === "quarter" ? "持续型" : ""
	formRef.value?.clearValidate("finishTimeValue")
}

const handleSaveDraft = () => {
	const draftStatus = getFollowStatusValue(projectFollowStatusLabels.draft)
	if (!draftStatus) {
		ElMessage.warning("跟进状态字典未加载，请稍后重试")
		return
	}
	emit("save-draft", buildSubmitData(draftStatus))
}

const handleSubmit = async () => {
	const valid = await formRef.value?.validate().catch(() => false)
	if (!valid) return
	const ongoingStatus = getFollowStatusValue(projectFollowStatusLabels.ongoing)
	if (!ongoingStatus) {
		ElMessage.warning("跟进状态字典未加载，请稍后重试")
		return
	}
	emit("submit", buildSubmitData(ongoingStatus))
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
.project-form-layout {
	height: 100%;

	:deep(.create-card) {
		width: 76rem;
	}
}

.header-icon {
	width: 3.5rem;
	height: 3.5rem;
	flex-shrink: 0;
	object-fit: contain;
}

.project-form {
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

.form-section {
	margin-bottom: 1rem;
	padding: 1.25rem 1.25rem 0.5rem;
	border-radius: 1rem;
	background: #f8fafc;
}

.form-section__title {
	margin: 0 0 1rem;
	color: #172b4d;
	font-size: 1rem;
	font-weight: 600;
}

.form-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0 1.5rem;
}

.form-grid--base {
	grid-template-columns: repeat(3, minmax(0, 1fr));
}

.completion-mode-group {
	margin-bottom: 0.5rem;
}

.form-tip {
	display: flex;
	min-height: 2rem;
	align-items: center;
	color: #6b7795;
	font-size: 0.875rem;
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

@media (max-width: 1200px) {
	.form-grid,
	.form-grid--base {
		grid-template-columns: 1fr;
	}
}
</style>
