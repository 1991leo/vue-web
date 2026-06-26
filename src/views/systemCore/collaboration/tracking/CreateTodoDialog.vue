<template>
	<el-dialog
		v-model="visible"
		title="创建待办事项"
		width="600px"
		class="tracking-dialog"
		:close-on-click-modal="false"
		@closed="resetForm"
	>
		<el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="dialog-form">
			<el-form-item label="关联项目">
				<el-input :model-value="projectName" disabled />
			</el-form-item>
			<el-form-item label="事项标题" prop="title">
				<el-input v-model="form.title" placeholder="请输入事项标题" />
			</el-form-item>
			<el-form-item label="事项描述" prop="description">
				<el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入事项描述" />
			</el-form-item>
			<div class="form-grid">
				<el-form-item label="提出部门" prop="department">
					<el-select v-model="form.department" placeholder="请选择提出部门">
						<el-option v-for="item in companyOptions" :key="item.value" :label="item.label" :value="item.label" />
					</el-select>
				</el-form-item>
				<el-form-item label="优先级" prop="priority">
					<el-select v-model="form.priority" placeholder="请选择优先级">
						<el-option label="高" value="高" />
						<el-option label="中" value="中" />
						<el-option label="低" value="低" />
					</el-select>
				</el-form-item>
				<el-form-item label="状态" prop="status" class="full-width">
					<el-select v-model="form.status" placeholder="请选择状态">
						<el-option label="待处理" value="待处理" />
						<el-option label="处理中" value="处理中" />
						<el-option label="已解决" value="已解决" />
					</el-select>
				</el-form-item>
			</div>
		</el-form>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" @click="submitForm">创建</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"
import type { FormInstance, FormRules } from "element-plus"

interface SelectOption {
	label: string
	value: string | number
}

interface TodoForm {
	title: string
	description: string
	department: string
	priority: string
	status: string
}

const props = withDefaults(
	defineProps<{
		modelValue: boolean
		projectName?: string
		defaultDepartment?: string
		companyOptions?: SelectOption[]
	}>(),
	{
		projectName: "",
		defaultDepartment: "",
		companyOptions: () => []
	}
)

const emit = defineEmits<{
	(e: "update:modelValue", value: boolean): void
	(e: "submit", form: TodoForm): void
}>()

const visible = computed({
	get: () => props.modelValue,
	set: (value: boolean) => emit("update:modelValue", value)
})

const formRef = ref<FormInstance>()
const form = reactive<TodoForm>({
	title: "",
	description: "",
	department: "",
	priority: "",
	status: "待处理"
})

const rules: FormRules = {
	title: [{ required: true, message: "请输入事项标题", trigger: "blur" }],
	description: [{ required: true, message: "请输入事项描述", trigger: "blur" }],
	department: [{ required: true, message: "请选择提出部门", trigger: "change" }],
	priority: [{ required: true, message: "请选择优先级", trigger: "change" }],
	status: [{ required: true, message: "请选择状态", trigger: "change" }]
}

watch(
	() => props.modelValue,
	(value) => {
		if (value) resetForm()
	}
)

function resetForm() {
	form.title = ""
	form.description = ""
	form.department = props.defaultDepartment || ""
	form.priority = ""
	form.status = "待处理"
	formRef.value?.clearValidate()
}

async function submitForm() {
	const valid = await formRef.value?.validate().catch(() => false)
	if (!valid) return
	emit("submit", { ...form })
}
</script>

<style scoped lang="scss">
.tracking-dialog {
	:deep(.el-dialog) {
		border-radius: 12px;
	}

	:deep(.el-dialog__header),
	:deep(.el-dialog__footer) {
		margin: 0;
		padding: 22px 28px;
	}

	:deep(.el-dialog__header) {
		border-bottom: 1px solid #edf0f5;
	}

	:deep(.el-dialog__footer) {
		border-top: 1px solid #edf0f5;
	}

	:deep(.el-dialog__body) {
		padding: 24px 28px;
	}
}

.dialog-form {
	:deep(.el-select),
	:deep(.el-date-editor),
	:deep(.el-input-number) {
		width: 100%;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0 20px;
	}

	.full-width {
		grid-column: 1 / -1;
	}
}

@media (max-width: 1200px) {
	.dialog-form .form-grid {
		grid-template-columns: 1fr;
	}
}
</style>
