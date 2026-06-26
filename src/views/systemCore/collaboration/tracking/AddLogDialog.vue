<template>
	<el-dialog
		v-model="visible"
		title="添加日志"
		width="560px"
		class="tracking-dialog"
		:close-on-click-modal="false"
		@closed="resetForm"
	>
		<el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="dialog-form">
			<el-form-item label="日志类型" prop="timelineType">
				<el-select v-model="form.timelineType" placeholder="请选择日志类型">
					<el-option v-for="item in timelineTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<el-form-item label="项目阶段" prop="stage">
				<el-select v-model="form.stage" placeholder="请选择项目阶段">
					<el-option v-for="item in stageOptions" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<el-form-item label="日志内容" prop="content">
				<el-input
					v-model="form.content"
					type="textarea"
					:rows="5"
					maxlength="500"
					show-word-limit
					placeholder="请输入日志内容"
				/>
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
import type { BizProjectTimelineForm } from "@/api/system/project/types"

interface SelectOption {
	label: string
	value: string | number
}

const props = withDefaults(
	defineProps<{
		modelValue: boolean
		currentStage?: string | number
		stageOptions?: SelectOption[]
		timelineTypeOptions?: SelectOption[]
	}>(),
	{
		currentStage: "",
		stageOptions: () => [],
		timelineTypeOptions: () => []
	}
)

const emit = defineEmits<{
	(e: "update:modelValue", value: boolean): void
	(e: "submit", form: BizProjectTimelineForm): void
}>()

const visible = computed({
	get: () => props.modelValue,
	set: (value: boolean) => emit("update:modelValue", value)
})

const formRef = ref<FormInstance>()
const form = reactive<BizProjectTimelineForm>({
	timelineType: "progress_update",
	content: "",
	stage: ""
})

const rules: FormRules = {
	timelineType: [{ required: true, message: "请选择日志类型", trigger: "change" }],
	stage: [{ required: true, message: "请选择项目阶段", trigger: "change" }],
	content: [{ required: true, message: "请输入日志内容", trigger: "blur" }]
}

watch(
	() => props.modelValue,
	(value) => {
		if (value) resetForm()
	}
)

function resetForm() {
	form.timelineType = String(props.timelineTypeOptions[0]?.value || "progress_update")
	form.stage = String(props.currentStage || "")
	form.content = ""
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
