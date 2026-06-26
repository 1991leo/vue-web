<template>
	<div class="form-page">
		<div class="create-card">
			<div class="create-card-header">
				<img class="header-icon" :src="formImg" alt="" />
				<div>
					<h1>{{ headerTitle }}</h1>
					<p>{{ headerDesc }}</p>
				</div>
			</div>

			<el-form ref="createFormRef" :model="createForm" :rules="createRules" label-position="top" class="prototype-form">
				<el-form-item label="任务标题" prop="taskTitle" class="required-label">
					<el-input v-model="createForm.taskTitle" maxlength="100" show-word-limit placeholder="请输入任务标题" />
				</el-form-item>

				<el-form-item label="任务描述" prop="taskDescription">
					<el-input
						v-model="createForm.taskDescription"
						type="textarea"
						:rows="6"
						resize="none"
						placeholder="请输入详细的任务描述信息"
					/>
				</el-form-item>

				<div class="form-grid">
					<el-form-item label="负责人" prop="assigneeId" class="required-label">
						<el-select v-model="createForm.assigneeId" placeholder="请选择负责人" @change="handleAssigneeChange">
							<el-option v-for="user in userOptions" :key="user.value" :label="user.label" :value="user.value" />
						</el-select>
					</el-form-item>

					<el-form-item label="协同负责人" prop="collaboratorNames">
						<el-input v-model="createForm.collaboratorNames" placeholder="多个姓名请用逗号分隔" />
					</el-form-item>
				</div>

				<div class="form-grid">
					<el-form-item label="任务类别" prop="taskCategory" class="required-label">
						<el-select v-model="createForm.taskCategory" placeholder="请选择任务类别">
							<el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>

					<el-form-item label="优先级" prop="taskPriority" class="required-label">
						<el-select v-model="createForm.taskPriority" placeholder="请选择优先级">
							<el-option v-for="item in priorityOptions" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
				</div>

				<div class="form-grid">
					<el-form-item label="计划开始日期" prop="planStartTime" class="required-label">
						<el-date-picker
							v-model="createForm.planStartTime"
							type="date"
							value-format="YYYY-MM-DD"
							placeholder="请选择计划开始日期"
						/>
					</el-form-item>

					<el-form-item label="计划截止日期" prop="planEndTime" class="required-label">
						<el-date-picker
							v-model="createForm.planEndTime"
							type="date"
							value-format="YYYY-MM-DD"
							placeholder="请选择计划截止日期"
						/>
					</el-form-item>
				</div>
				<div class="form-grid">
					<el-form-item label="任务类型" prop="taskPlanType" class="required-label">
						<el-radio-group v-model="createForm.taskPlanType">
							<el-radio v-for="item in typeOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
						</el-radio-group>
					</el-form-item>
					<div v-if="mode === 'edit'">
						<el-form-item label="任务状态" prop="taskStatus" class="required-label">
							<el-select v-model="createForm.taskStatus" placeholder="请选择任务状态" @change="handleStatusChange">
								<el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</div>
				</div>
			</el-form>

			<div class="form-actions">
				<el-button @click="emit('back')">取消</el-button>
				<el-button type="primary" class="submit-button" :loading="loading" @click="submitCreateForm">{{
					submitButtonText
				}}</el-button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import formImg from "@/assets/images/form_img.webp"
import type { FormInstance, FormRules } from "element-plus"
import { computed, reactive, ref, watch } from "vue"
import { createDeptTaskFormData, type DeptTaskFormData } from "../config"

interface AssigneeOption {
	label: string
	value: string | number
}

const props = defineProps({
	mode: {
		type: String as () => "create" | "edit",
		default: "create"
	},
	headerTitle: {
		type: String,
		default: ""
	},
	headerDesc: {
		type: String,
		default: ""
	},
	categoryOptions: {
		type: Array as () => DictDataOption[],
		default: () => []
	},
	priorityOptions: {
		type: Array as () => DictDataOption[],
		default: () => []
	},
	statusOptions: {
		type: Array as () => Array<{ label: string; value: string }>,
		default: () => []
	},
	typeOptions: {
		type: Array as () => DictDataOption[],
		default: () => []
	},
	userOptions: {
		type: Array as () => AssigneeOption[],
		default: () => []
	},
	initialForm: {
		type: Object as () => DeptTaskFormData | null,
		default: null
	},
	loading: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits<{
	(e: "back"): void
	(e: "submit", form: DeptTaskFormData): void
}>()

const createFormRef = ref<FormInstance>()
const createForm = reactive<DeptTaskFormData>(createDeptTaskFormData())
const submitButtonText = computed(() => (props.mode === "edit" ? "保存" : "提交"))

const syncForm = (formValue: DeptTaskFormData | null) => {
	const nextForm = formValue === null ? createDeptTaskFormData() : formValue

	createForm.id = nextForm.id
	createForm.taskTitle = nextForm.taskTitle
	createForm.taskDescription = nextForm.taskDescription
	createForm.assigneeId = nextForm.assigneeId
	createForm.assigneeName = nextForm.assigneeName
	createForm.collaboratorIds = nextForm.collaboratorIds
	createForm.collaboratorNames = nextForm.collaboratorNames
	createForm.taskCategory = nextForm.taskCategory
	createForm.taskPlanType = nextForm.taskPlanType
	createForm.taskStatus = nextForm.taskStatus
	createForm.taskStatusName = nextForm.taskStatusName
	createForm.taskPriority = nextForm.taskPriority
	createForm.planStartTime = nextForm.planStartTime
	createForm.planEndTime = nextForm.planEndTime
	createForm.actualStartTime = nextForm.actualStartTime
	createForm.actualEndTime = nextForm.actualEndTime
	createForm.deptId = nextForm.deptId
	createForm.deptName = nextForm.deptName
	createForm.remark = nextForm.remark
	createForm.taskProgress = nextForm.taskProgress
	createForm.taskProblem = nextForm.taskProblem
}

const handleAssigneeChange = (value: string | number) => {
	const selectedUser = props.userOptions.find((item) => item.value === value)
	createForm.assigneeId = value
	createForm.assigneeName = selectedUser ? selectedUser.label : ""
}

const handleStatusChange = (value: string) => {
	const selectedStatus = props.statusOptions.find((item) => item.value === value)
	createForm.taskStatus = value
	createForm.taskStatusName = selectedStatus ? selectedStatus.label : ""
}

watch(
	() => props.initialForm,
	(value) => {
		syncForm(value)
		createFormRef.value?.clearValidate()
	},
	{ immediate: true }
)

const createRules: FormRules = {
	taskTitle: [{ required: true, message: "请输入任务标题", trigger: "blur" }],
	assigneeId: [{ required: true, message: "请选择负责人", trigger: "change" }],
	taskCategory: [{ required: true, message: "请选择任务类别", trigger: "change" }],
	taskPriority: [{ required: true, message: "请选择优先级", trigger: "change" }],
	taskStatus: [
		{
			validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
				if (props.mode === "edit" && value === "") {
					callback(new Error("请选择任务状态"))
					return
				}
				callback()
			},
			trigger: "change"
		}
	],
	taskPlanType: [{ required: true, message: "请选择任务类型", trigger: "change" }],
	planStartTime: [{ required: true, message: "请选择计划开始时间", trigger: "change" }],
	planEndTime: [
		{ required: true, message: "请选择截止时间", trigger: "change" },
		{
			validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
				if (createForm.planStartTime !== "" && value !== "" && value < createForm.planStartTime) {
					callback(new Error("截止时间不能早于开始时间"))
					return
				}
				callback()
			},
			trigger: "change"
		}
	]
}

const submitCreateForm = async () => {
	if (props.loading) return
	if (!createFormRef.value) return
	const valid = await createFormRef.value.validate().catch(() => false)
	if (!valid) return
	emit("submit", {
		...createForm,
		collaboratorNames: createForm.collaboratorNames
	})
}
</script>

<style scoped lang="scss">
.form-page {
	display: flex;
	justify-content: center;
	height: 100%;
	// min-height: 0;
}

.create-card {
	display: flex;
	height: 100%;
	// min-height: 0;
	flex-direction: column;
	width: 60.625rem;
	overflow: hidden;
	border-radius: 1.125rem;
	background: #fff;
	box-shadow: 0 0 0 0.25rem rgba(255, 255, 255, 0.75);
}

.create-card-header {
	display: flex;
	align-items: center;
	flex-shrink: 0;
	gap: 1.25rem;
	height: 6.5rem;
	padding: 0 3.625rem;
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

.prototype-form {
	flex: 1;
	// min-height: 0;
	overflow-y: auto;
	padding: 0.5rem 3.625rem 0;

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

	:deep(.el-textarea__inner) {
		height: 9.125rem;
		padding: 0.75rem 0.625rem;
	}
}

.required-label {
	:deep(.el-form-item__label::after) {
		margin-left: 0.0625rem;
		color: #ff4d4f;
		content: "*";
	}
}

.form-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 2.5rem;
}

.form-actions {
	display: flex;
	justify-content: flex-end;
	flex-shrink: 0;
	gap: 0.75rem;
	padding: 1rem 3.625rem;
	// padding-top: 0;
	background: #fff;
}

.submit-button {
	min-width: 5.375rem;
	height: 2.125rem;
	border-radius: 0.5rem;
	--el-button-bg-color: #00b46e;
	--el-button-border-color: #00b46e;
	--el-button-hover-bg-color: #00a665;
	--el-button-hover-border-color: #00a665;
}

@media (max-width: 75rem) {
	.form-grid {
		grid-template-columns: 1fr;
		gap: 0;
	}
}
</style>
