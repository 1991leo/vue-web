<template>
	<FormPageLayout class="coordinate-create-layout" title="创建协调支持事项" desc="填写基础信息，创建后事项列表查看">
		<template #icon>
			<img :src="coordinationIcon" class="header-icon" alt="" />
		</template>

		<el-form ref="createFormRef" :model="createForm" :rules="createRules" label-position="top" class="coordinate-form">
			<el-form-item label="标题" prop="title">
				<el-input v-model="createForm.title" placeholder="请输入事项标题" />
			</el-form-item>
			<el-form-item label="详细描述" prop="description">
				<el-input v-model="createForm.description" type="textarea" :rows="6" resize="none" placeholder="请输入内容" />
			</el-form-item>
			<div class="form-grid">
				<el-form-item label="提报企业" prop="reportCompany">
					<el-select v-model="createForm.reportCompany" placeholder="请选择">
						<el-option
							v-for="dict in companyOptions"
							:key="dict.dictValue"
							:label="dict.dictLabel"
							:value="dict.dictValue"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="关联类型">
					<el-select
						v-model="createForm.relatedType"
						placeholder="请选择"
						:disabled="!!props.initialProjectName || !!props.initialRelatedType"
						@change="handleRelatedTypeChange"
					>
						<el-option label="不关联" value="不关联" />
						<el-option label="项目" value="项目" />
						<el-option label="任务" value="任务" />
					</el-select>
				</el-form-item>
			</div>
			<el-form-item label="关联项目/任务" prop="relatedName">
				<el-select
					v-model="createForm.relatedName"
					placeholder="请选择"
					filterable
					:loading="projectLoading || taskLoading"
					:disabled="createForm.relatedType === 'not_related' || createForm.relatedType === '不关联'"
				>
					<el-option v-if="createForm.relatedType === '不关联'" label="不选择" value="不选择" />
					<el-option v-for="item in relatedOptions" :key="item.key" :label="item.label" :value="item.value" />
				</el-select>
			</el-form-item>
			<el-form-item label="共享范围（可选择多个企业查看此事项）">
				<el-checkbox-group v-model="createForm.shareRange" class="checkbox-panel">
					<el-checkbox
						v-for="dict in companyOptions"
						:key="dict.dictValue"
						:label="dict.dictLabel"
						:value="dict.dictValue"
						:disabled="dict.dictValue === createForm.reportCompany"
					/>
				</el-checkbox-group>
			</el-form-item>
		</el-form>

		<template #actions>
			<el-button class="cancel-button" @click="emit('back')">取消</el-button>
			<el-button type="primary" class="submit-button" :loading="loading" @click="submitCreateForm">提交</el-button>
		</template>
	</FormPageLayout>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import { listProject } from "@/api/system/project"
import { listKeyTask } from "@/api/system/keyTask"
import FormPageLayout from "@/components/FormPageLayout/index.vue"
import coordinationIcon from "@/assets/collaboration/coordination.png"

// 声明接收 of Props 结构，共享提报公司字典与外部传入 of 初始值
const props = withDefaults(
	defineProps<{
		companyOptions?: Array<{
			dictValue: string
			dictLabel: string
			[key: string]: any
		}>
		initialProjectName?: string
		initialReportCompany?: string
		initialRelatedType?: string
		loading?: boolean
	}>(),
	{
		companyOptions: () => [],
		initialProjectName: "",
		initialReportCompany: "",
		initialRelatedType: "",
		loading: false
	}
)

// 声明自定义的 emits 事件，用于向父组件传递数据
const emit = defineEmits<{
	(e: "back"): void
	(
		e: "submit",
		form: {
			title: string
			description: string
			reportCompany: string
			relatedType: "不关联" | "项目" | "任务"
			relatedName: string
			shareRange: string[]
		}
	): void
}>()

interface RelatedOption {
	key: string
	label: string
	value: string
}

const createFormRef = ref<FormInstance>()
const createForm = reactive({
	title: "",
	description: "",
	reportCompany: props.initialReportCompany || "",
	relatedType: (props.initialRelatedType || (props.initialProjectName ? "项目" : "不关联")) as
		| "不关联"
		| "项目"
		| "任务",
	relatedName: props.initialProjectName || "不选择",
	shareRange: [] as string[]
})

// 当提报企业发生变更时，自动在共享范围中取消勾选该企业
watch(
	() => createForm.reportCompany,
	(newVal) => {
		if (newVal) {
			const targetLabel = props.companyOptions.find((item) => String(item.dictValue) === String(newVal))?.dictLabel
			createForm.shareRange = createForm.shareRange.filter(
				(val) => String(val) !== String(newVal) && String(val) !== String(targetLabel)
			)
		}
	}
)

// 关联的可选列表，根据类型动态变更
const relatedOptions = ref<RelatedOption[]>([])
const projectOptions = ref<RelatedOption[]>([])
const projectLoading = ref(false)
const taskOptions = ref<RelatedOption[]>([])
const taskLoading = ref(false)

onMounted(async () => {
	// 如果初始值中包含关联项目/任务名称，则自动加载对应的下拉选项并匹配
	if (props.initialProjectName) {
		if (createForm.relatedType === "任务") {
			const options = await getTaskOptions()
			relatedOptions.value = options
		} else {
			const options = await getProjectOptions()
			relatedOptions.value = options
		}
	}
})

// 表单验证规则
const createRules: FormRules = {
	title: [{ required: true, message: "请输入事项标题", trigger: "blur" }],
	// description: [{ required: true, message: '请输入详细描述', trigger: 'blur' }],
	reportCompany: [{ required: true, message: "请选择提报企业", trigger: "change" }],
	relatedName: [
		{
			trigger: "change",
			validator: (_rule, value, callback) => {
				if (createForm.relatedType !== "不关联" && !value) {
					callback(new Error("请选择关联项目/任务"))
					return
				}
				callback()
			}
		}
	]
}

// 获取项目下拉选项，pageSize 固定 100 以覆盖常用项目范围
const getProjectOptions = async () => {
	if (projectOptions.value.length > 0) return projectOptions.value

	projectLoading.value = true
	try {
		const res = (await listProject({ pageNum: 1, pageSize: 100 })) as any
		projectOptions.value = (res.rows || [])
			.map((item: any) => {
				const projectName = item.projectName || ""
				return {
					key: String(item.id ?? projectName),
					label: projectName,
					value: projectName
				}
			})
			.filter((item: RelatedOption) => item.label)
	} catch (error) {
		console.error(error)
		projectOptions.value = []
	} finally {
		projectLoading.value = false
	}

	return projectOptions.value
}

// 获取重点事项（任务）下拉选项，pageSize 设为 1000
const getTaskOptions = async () => {
	if (taskOptions.value.length > 0) return taskOptions.value

	taskLoading.value = true
	try {
		const res = (await listKeyTask({ pageNum: 1, pageSize: 1000 })) as any
		taskOptions.value = (res.rows || [])
			.map((item: any) => {
				const taskTitle = item.taskTitle || ""
				return {
					key: String(item.id ?? taskTitle),
					label: taskTitle,
					value: taskTitle
				}
			})
			.filter((item: RelatedOption) => item.label)
	} catch (error) {
		console.error("获取重点事项列表失败:", error)
		taskOptions.value = []
	} finally {
		taskLoading.value = false
	}

	return taskOptions.value
}

// 切换关联类型时的变更处理函数
const handleRelatedTypeChange = async (type: "不关联" | "项目" | "任务") => {
	createForm.relatedName = type === "不关联" ? "不选择" : ""

	if (type === "项目") {
		const options = await getProjectOptions()
		if (createForm.relatedType === "项目") {
			relatedOptions.value = options
		}
		return
	}

	if (type === "任务") {
		const options = await getTaskOptions()
		if (createForm.relatedType === "任务") {
			relatedOptions.value = options
		}
		return
	}

	relatedOptions.value = []
}

// 表单提交触发函数
const submitCreateForm = async () => {
	if (props.loading) return
	if (!createFormRef.value) return
	const valid = await createFormRef.value.validate().catch(() => false)
	if (!valid) return

	// 校验通过后将整个表单状态抛出给父组件处理
	emit("submit", { ...createForm })
}
</script>

<style scoped lang="scss">
.coordinate-create-layout {
	height: 100%;

	:deep(.create-card) {
		width: 970px;
	}
}

.header-icon {
	width: 54px;
	height: 54px;
	object-fit: contain;
}

.coordinate-form {
	:deep(.el-form-item) {
		margin-bottom: 20px;
	}
}

.form-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 40px;
}

.checkbox-panel {
	display: grid;
	width: 100%;
	grid-template-columns: repeat(3, 1fr);
	row-gap: 12px;
	column-gap: 10px;
	min-height: 74px;
	padding: 12px 12px 10px;
	border-radius: 8px;
	background: #fbfcfe;

	:deep(.el-checkbox) {
		height: 20px;
		margin-right: 0;
	}
}

.form-actions {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	padding: 28px 58px 24px;
}
.cancel-button,
.submit-button {
	min-width: 76px;
	height: 34px;
}

@media (max-width: 1200px) {
	.form-grid {
		grid-template-columns: 1fr;
	}
}
</style>
