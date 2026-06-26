<template>
	<el-dialog
		v-model="visible"
		:title="isEdit ? '编辑里程碑' : '添加里程碑'"
		width="560px"
		class="tracking-dialog"
		:close-on-click-modal="false"
		@closed="resetForm"
	>
		<el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="dialog-form">
			<el-form-item label="里程碑名称" prop="milestoneName">
				<el-input v-model="form.milestoneName" :disabled="isEdit" placeholder="请输入里程碑名称" />
			</el-form-item>
			<el-form-item label="所属阶段" prop="stage">
				<el-select v-model="form.stage" placeholder="请选择所属阶段">
					<el-option v-for="item in stageOptions" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<el-form-item label="截止日期" prop="deadline">
				<el-date-picker v-model="form.deadline" type="date" value-format="YYYY-MM-DD" placeholder="请选择截止日期" />
			</el-form-item>
			<el-form-item label="状态" prop="status">
				<el-select v-model="form.status" placeholder="请选择状态">
					<el-option v-for="item in milestoneStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" @click="submitForm">提交</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import type { BizProjectMilestoneForm, BizProjectMilestoneVO } from "@/api/system/project/types"

interface SelectOption {
	label: string
	value: string | number
}

const props = withDefaults(
	defineProps<{
		modelValue: boolean
		currentStage?: string | number
		stageOptions?: SelectOption[]
		milestoneStatusOptions?: SelectOption[]
		milestoneData?: BizProjectMilestoneVO | null
	}>(),
	{
		currentStage: "",
		stageOptions: () => [],
		milestoneStatusOptions: () => [],
		milestoneData: null
	}
)

const emit = defineEmits<{
	(e: "update:modelValue", value: boolean): void
	(e: "submit", form: BizProjectMilestoneForm): void
}>()

const isEdit = computed(() => !!props.milestoneData?.id)

const visible = computed({
	get: () => props.modelValue,
	set: (value: boolean) => emit("update:modelValue", value)
})

const formRef = ref<FormInstance>()
const form = reactive<BizProjectMilestoneForm>({
	id: undefined,
	milestoneName: "",
	deadline: "",
	status: "1",
	stage: ""
})

const rules: FormRules = {
	milestoneName: [{ required: true, message: "请输入里程碑名称", trigger: "blur" }],
	deadline: [{ required: true, message: "请选择截止日期", trigger: "change" }],
	status: [{ required: true, message: "请选择状态", trigger: "change" }],
	stage: [{ required: true, message: "请选择所属阶段", trigger: "change" }]
}

watch(
	() => props.modelValue,
	(value) => {
		if (value) resetForm()
	}
)

function resetForm() {
	if (props.milestoneData?.id) {
		form.id = props.milestoneData.id
		form.milestoneName = props.milestoneData.milestoneName || ""
		form.deadline = props.milestoneData.deadline || ""
		form.status = String(props.milestoneData.status ?? "1")
		form.stage = String(props.milestoneData.stage || "")
	} else {
		form.id = undefined
		form.milestoneName = ""
		form.deadline = ""
		form.status = String(props.milestoneStatusOptions[1]?.value || "1")
		form.stage = String(props.currentStage || "")
	}
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
}
</style>
