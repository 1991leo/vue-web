<template>
	<FormPageLayout
		:title="isEdit ? '编辑年度重点任务' : '创建年度重点任务'"
		:desc="isEdit ? '修改重点任务信息后提交保存' : '填写基础信息，创建后在重点任务列表查看'"
	>
		<!-- 表单主体 -->
		<el-form ref="createFormRef" :model="createForm" :rules="createRules" label-position="top" class="business-form">
			<!-- 任务名称 -->
			<el-form-item label="任务名称" prop="title">
				<el-input v-model="createForm.title" placeholder="请输入任务名称" />
			</el-form-item>

			<!-- 任务描述 -->
			<el-form-item label="任务描述" prop="desc">
				<el-input v-model="createForm.desc" type="textarea" :rows="4" resize="none" placeholder="请输入任务详细描述" />
			</el-form-item>

			<!-- 表单两列网格布局 -->
			<div class="form-grid">
				<!-- 任务来源 -->
				<el-form-item label="任务来源" prop="source">
					<el-select v-model="createForm.source" placeholder="请选择任务来源">
						<el-option
							v-for="option in sourceOptions"
							:key="option.value"
							:label="option.label"
							:value="option.value"
						/>
					</el-select>
				</el-form-item>

				<!-- 优先级 -->
				<el-form-item label="优先级" prop="priority">
					<el-select v-model="createForm.priority" placeholder="请选择优先级">
						<el-option
							v-for="option in priorityOptions"
							:key="option.value"
							:label="option.label"
							:value="option.value"
						/>
					</el-select>
				</el-form-item>
			</div>

			<div class="form-grid">
				<!-- 任务状态 -->
				<el-form-item label="任务状态" prop="status">
					<el-select v-model="createForm.status" placeholder="请选择任务状态">
						<el-option
							v-for="option in statusOptions"
							:key="option.value"
							:label="option.label"
							:value="option.value"
						/>
					</el-select>
				</el-form-item>

				<!-- 截止日期 -->
				<el-form-item label="截止日期" prop="deadline">
					<el-date-picker
						v-model="createForm.deadline"
						type="date"
						placeholder="选择截止日期"
						value-format="YYYY-MM-DD"
						style="width: 100%"
					/>
				</el-form-item>
			</div>

			<div class="form-grid">
				<!-- 被投企业 -->
				<el-form-item label="被投企业" prop="companyValue">
					<el-select
						v-model="createForm.companyValue"
						placeholder="请选择或输入被投企业"
						filterable
						allow-create
						@change="handleCompanyChange"
					>
						<el-option
							v-for="option in companyOptions"
							:key="option.value"
							:label="option.label"
							:value="option.value"
						/>
					</el-select>
				</el-form-item>

				<!-- 任务部门 -->
				<el-form-item label="任务部门" prop="department">
					<el-input v-model="createForm.department" placeholder="请输入任务部门" />
				</el-form-item>
			</div>

			<div class="form-grid">
				<!-- 主办部门 -->
				<el-form-item label="主办部门" prop="hostDept">
					<el-input v-model="createForm.hostDept" placeholder="请输入主办部门" />
				</el-form-item>

				<!-- 协办部门 -->
				<el-form-item label="协办部门" prop="coDept">
					<el-input v-model="createForm.coDept" placeholder="多个部门请用逗号分隔" />
				</el-form-item>
			</div>

			<div class="form-grid">
				<!-- 负责人 -->
				<el-form-item label="负责人" prop="assigneeId">
					<el-select
						v-model="createForm.assigneeId"
						placeholder="请选择负责人"
						filterable
						clearable
						@change="handleLeaderChange"
					>
						<el-option
							v-for="option in leaderOptions"
							:key="option.value"
							:label="option.label"
							:value="option.value"
						/>
					</el-select>
				</el-form-item>

				<!-- 协同负责人 -->
				<el-form-item label="协同负责人" prop="assistant">
					<el-input v-model="createForm.assistant" placeholder="多个姓名请用逗号分隔" />
				</el-form-item>
			</div>

			<!-- 备注 -->
			<el-form-item label="备注" prop="remark">
				<el-input v-model="createForm.remark" type="textarea" :rows="3" resize="none" placeholder="请输入备注" />
			</el-form-item>
		</el-form>

		<!-- 操作按钮槽 -->
		<template #actions>
			<el-button @click="emit('back')" class="cancel-button">取消</el-button>
			<el-button type="primary" class="submit-button" :loading="loading" @click="submitCreateForm">提交</el-button>
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

// 声明接收 props 结构
const props = withDefaults(
	defineProps<{
		isEdit?: boolean
		row?: {
			id?: number | string
			title: string
			desc: string
			source?: string
			sourceName?: string
			company: string
			companyValue?: string
			department: string
			hostDept?: string
			coDept?: string
			assigneeId?: number | string
			leader: string
			collaboratorIds?: string
			assistant: string
			deadline: string
			status: string
			statusValue?: string
			priority: string
			priorityValue?: string
			deptId?: number | string
			deptName?: string
			remark?: string
		}
		leaderOptions?: SelectOption[]
		companyOptions?: SelectOption[]
		sourceOptions?: SelectOption[]
		priorityOptions?: SelectOption[]
		statusOptions?: SelectOption[]
		loading?: boolean
	}>(),
	{
		isEdit: false,
		row: () => ({
			title: "",
			desc: "",
			source: "",
			company: "",
			companyValue: "",
			department: "",
			hostDept: "",
			coDept: "",
			assigneeId: undefined,
			leader: "",
			collaboratorIds: "",
			assistant: "",
			deadline: "",
			status: "",
			statusValue: "",
			priority: "",
			priorityValue: "",
			remark: ""
		}),
		leaderOptions: () => [],
		companyOptions: () => [],
		sourceOptions: () => [],
		priorityOptions: () => [],
		statusOptions: () => [],
		loading: false
	}
)

// 声明自定义的 emits 事件，用于向父组件传递数据
const emit = defineEmits<{
	(e: "back"): void
	(
		e: "submit",
		form: {
			id?: number | string
			title: string
			desc: string
			source: string
			sourceName: string
			company: string
			companyValue: string
			department: string
			hostDept: string
			coDept: string
			assigneeId?: number | string
			leader: string
			collaboratorIds: string
			assistant: string
			deadline: string
			status: string
			statusValue: string
			priority: string
			priorityValue: string
			deptId?: number | string
			deptName?: string
			remark: string
		}
	): void
}>()

const createFormRef = ref<FormInstance>()

// 初始化表单响应式状态
const createForm = reactive({
	id: undefined as number | string | undefined,
	title: "",
	desc: "",
	source: "",
	sourceName: "",
	company: "",
	companyValue: "",
	department: "",
	hostDept: "",
	coDept: "",
	assigneeId: undefined as number | string | undefined,
	leader: "",
	collaboratorIds: "",
	assistant: "",
	deadline: "",
	status: "",
	statusValue: "",
	priority: "",
	priorityValue: "",
	deptId: undefined as number | string | undefined,
	deptName: "",
	remark: ""
})

// 表单验证规则
const createRules: FormRules = {
	title: [{ required: true, message: "请输入任务名称", trigger: "blur" }],
	source: [{ required: true, message: "请选择任务来源", trigger: "change" }],
	priority: [{ required: true, message: "请选择优先级", trigger: "change" }],
	status: [{ required: true, message: "请选择任务状态", trigger: "change" }],
	deadline: [{ required: true, message: "请选择截止日期", trigger: "change" }],
	companyValue: [{ required: true, message: "请选择或输入被投企业", trigger: "change" }],
	department: [{ required: true, message: "请输入任务部门", trigger: "blur" }]
}

// 初始化表单数据
const initForm = () => {
	if (props.row) {
		createForm.id = props.row.id
		createForm.title = props.row.title || ""
		createForm.desc = props.row.desc || ""
		createForm.source = props.row.source || ""
		createForm.sourceName = props.row.sourceName || ""
		createForm.company = props.row.company || ""
		createForm.companyValue = props.row.companyValue || props.row.company || ""
		createForm.department = props.row.department || ""
		createForm.hostDept = props.row.hostDept || ""
		createForm.coDept = props.row.coDept || ""
		createForm.assigneeId = props.row.assigneeId
		createForm.leader = props.row.leader || ""
		createForm.collaboratorIds = props.row.collaboratorIds || ""
		createForm.assistant = props.row.assistant || ""
		createForm.deadline = props.row.deadline || ""
		createForm.status = props.row.statusValue || props.row.status || ""
		createForm.statusValue = props.row.statusValue || props.row.status || ""
		createForm.priority = props.row.priorityValue || props.row.priority || ""
		createForm.priorityValue = props.row.priorityValue || props.row.priority || ""
		createForm.deptId = props.row.deptId
		createForm.deptName = props.row.deptName || ""
		createForm.remark = props.row.remark || ""
	}
}

// 监听 row 传入，以便在编辑态下回显数据
watch(() => props.row, initForm, { immediate: true })

const handleLeaderChange = (value?: string | number) => {
	const selected = props.leaderOptions.find((item) => item.value === value)
	createForm.leader = selected?.label || ""
}

const handleCompanyChange = (value?: string | number) => {
	const selected = props.companyOptions.find((item) => item.value === value)
	createForm.company = selected?.label || String(value || "")
}

const syncDictValueFields = () => {
	createForm.statusValue = createForm.status
	createForm.priorityValue = createForm.priority
}

// 表单提交触发函数
const submitCreateForm = async () => {
	if (props.loading) return
	if (!createFormRef.value) return
	const valid = await createFormRef.value.validate().catch(() => false)
	if (!valid) return

	// 校验通过后将整个表单状态抛出给父组件处理
	syncDictValueFields()
	emit("submit", { ...createForm })
}
</script>

<style scoped lang="scss">
.business-form {
	:deep(.el-form-item) {
		margin-bottom: 20px;
	}

	:deep(.el-select) {
		width: 100%;
	}
}

.form-grid {
	display: grid;
	width: 800px;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 40px;
}

.cancel-button,
.submit-button {
	min-width: 76px;
	height: 34px;
}

@media (max-width: 1200px) {
	.form-grid {
		grid-template-columns: 1fr;
		gap: 0;
	}
}
</style>
