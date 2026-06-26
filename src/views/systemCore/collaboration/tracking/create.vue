<template>
	<FormPageLayout title="新增项目" desc="创建项目基础信息，进入项目全生命周期跟踪。">
		<el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="project-form">
			<div class="form-grid">
				<el-form-item label="项目名称" prop="projectName">
					<el-input v-model="form.projectName" placeholder="请输入项目名称" maxlength="80" clearable />
				</el-form-item>
				<el-form-item label="项目级别" prop="projectLevel">
					<el-select v-model="form.projectLevel" placeholder="请选择项目级别" clearable>
						<el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value" />
					</el-select>
				</el-form-item>
				<el-form-item label="当前阶段" prop="currentStage">
					<el-select v-model="form.currentStage" placeholder="请选择当前阶段" clearable>
						<el-option v-for="item in stageOptions" :key="item.value" :label="item.label" :value="item.value" />
					</el-select>
				</el-form-item>
				<el-form-item label="预估金额(万元)" prop="estimatedAmount">
					<el-input-number
						v-model="form.estimatedAmount"
						:min="0"
						:precision="2"
						:controls="false"
						placeholder="请输入预估金额"
					/>
				</el-form-item>
				<el-form-item label="牵头企业" prop="leadingEnterpriseId">
					<el-select v-model="form.leadingEnterpriseId" placeholder="请选择牵头企业" clearable filterable>
						<el-option
							v-for="item in companyOptions"
							:key="item.value"
							:label="item.label"
							:value="item.value"
							:disabled="form.collaborativeEnterprises.includes(item.value)"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="协同企业" prop="collaborativeEnterprises">
					<el-select v-model="form.collaborativeEnterprises" placeholder="请选择协同企业" multiple clearable filterable>
						<el-option
							v-for="item in companyOptions"
							:key="item.value"
							:label="item.label"
							:value="item.value"
							:disabled="item.value === form.leadingEnterpriseId"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="项目描述" prop="projectDesc" class="full-width">
					<el-input
						v-model="form.projectDesc"
						type="textarea"
						:rows="5"
						maxlength="500"
						show-word-limit
						placeholder="请输入项目描述"
					/>
				</el-form-item>
			</div>
		</el-form>

		<template #actions>
			<el-button @click="emit('back')">取消</el-button>
			<el-button type="primary" @click="submitForm">提交</el-button>
		</template>
	</FormPageLayout>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import FormPageLayout from "@/components/FormPageLayout/index.vue"

interface SelectOption {
	label: string
	value: string | number
}

interface ProjectForm {
	projectName: string
	projectDesc: string
	projectLevel: string | number
	currentStage: string | number
	estimatedAmount?: number
	leadingEnterpriseId: string | number
	collaborativeEnterprises: Array<string | number>
}

withDefaults(
	defineProps<{
		levelOptions?: SelectOption[]
		stageOptions?: SelectOption[]
		companyOptions?: SelectOption[]
	}>(),
	{
		levelOptions: () => [],
		stageOptions: () => [],
		companyOptions: () => []
	}
)

const emit = defineEmits<{
	(e: "back"): void
	(e: "submit", form: ProjectForm): void
}>()

const formRef = ref<FormInstance>()
const form = reactive<ProjectForm>({
	projectName: "",
	projectDesc: "",
	projectLevel: "",
	currentStage: "",
	estimatedAmount: undefined,
	leadingEnterpriseId: "",
	collaborativeEnterprises: []
})

const validateCollaborative = (rule: any, value: any, callback: any) => {
	if (value && value.includes(form.leadingEnterpriseId)) {
		callback(new Error("协同企业不能包含牵头企业"))
	} else {
		callback()
	}
}

const validateLeading = (rule: any, value: any, callback: any) => {
	if (value && form.collaborativeEnterprises.includes(value)) {
		callback(new Error("牵头企业不能与协同企业相同"))
	} else {
		callback()
	}
}

const rules: FormRules = {
	projectName: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
	projectDesc: [{ required: true, message: "请输入项目描述", trigger: "blur" }],
	projectLevel: [{ required: true, message: "请选择项目级别", trigger: "change" }],
	currentStage: [{ required: true, message: "请选择当前阶段", trigger: "change" }],
	estimatedAmount: [{ required: true, message: "请输入预估金额", trigger: "blur" }],
	leadingEnterpriseId: [
		{ required: true, message: "请选择牵头企业", trigger: "change" },
		{ validator: validateLeading, trigger: "change" }
	],
	collaborativeEnterprises: [
		{ type: "array", required: true, message: "请选择协同企业", trigger: "change" },
		{ validator: validateCollaborative, trigger: "change" }
	]
}

watch(
	() => form.leadingEnterpriseId,
	() => {
		formRef.value?.validateField("collaborativeEnterprises")
	}
)
watch(
	() => form.collaborativeEnterprises,
	() => {
		formRef.value?.validateField("leadingEnterpriseId")
	},
	{ deep: true }
)

async function submitForm() {
	const valid = await formRef.value?.validate().catch(() => false)
	if (!valid) return
	emit("submit", { ...form, collaborativeEnterprises: [...form.collaborativeEnterprises] })
}
</script>

<style scoped lang="scss">
.project-form {
	.form-grid {
		width: 800px;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0 40px;
	}

	.full-width {
		grid-column: 1 / -1;
	}

	:deep(.el-select),
	:deep(.el-input-number),
	:deep(.el-date-editor) {
		width: 100%;
	}

	:deep(.el-input-number .el-input__inner) {
		text-align: left;
	}
}

@media (max-width: 1200px) {
	.project-form .form-grid {
		grid-template-columns: 1fr;
	}
}
</style>
