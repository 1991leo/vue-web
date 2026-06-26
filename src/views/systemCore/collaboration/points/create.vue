<template>
	<FormPageLayout :title="isEdit ? '编辑任务' : '下发新任务'" desc="请填写任务的基础配置和承办单位，提交后下发执行。">
		<el-form ref="formRef" :model="form" :rules="rules" label-position="top" label-width="110px" class="publish-form">
			<div class="form-grid">
				<el-form-item label="任务标题" prop="taskTitle">
					<el-input v-model="form.taskTitle" placeholder="请输入任务标题" />
				</el-form-item>

				<el-form-item label="任务来源" prop="taskSource">
					<el-select v-model="form.taskSource" placeholder="请选择任务来源">
						<el-option v-for="dict in sourceOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
					</el-select>
				</el-form-item>

				<el-form-item label="责任人" prop="assigneeId">
					<el-select
						v-model="form.assigneeId"
						placeholder="请选择责任人"
						filterable
						clearable
						@change="handleLeaderChange"
					>
						<el-option v-for="user in leaderOptions" :key="user.value" :label="user.label" :value="user.value" />
					</el-select>
				</el-form-item>

				<el-form-item label="等级" prop="taskLevel">
					<el-select v-model="form.taskLevel" placeholder="请选择等级">
						<el-option v-for="dict in levelOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
					</el-select>
				</el-form-item>

				<el-form-item label="类别" prop="taskCategory">
					<el-select v-model="form.taskCategory" placeholder="请选择类别">
						<el-option v-for="dict in categoryOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
					</el-select>
				</el-form-item>

				<el-form-item label="优先级" prop="priority">
					<el-select v-model="form.priority" placeholder="请选择优先级">
						<el-option v-for="dict in priorityOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
					</el-select>
				</el-form-item>
			</div>

			<el-form-item label="所属专项" prop="specialProject">
				<el-input v-model="form.specialProject" placeholder="输入专项名称" />
				<!-- <div class="special-tags">
          <el-tag v-for="item in specialProjectOptions" :key="item.label" :type="item.type" effect="plain" @click="form.specialProject = item.label">
            {{ item.label }}
          </el-tag>
        </div> -->
			</el-form-item>

			<div class="form-grid" style="margin-top: 20px">
				<el-form-item label="计划开始日期" prop="planStartTime">
					<el-date-picker
						v-model="form.planStartTime"
						type="date"
						value-format="YYYY-MM-DD"
						placeholder="请选择开始日期"
					/>
				</el-form-item>
				<el-form-item label="截止日期" prop="planEndTime">
					<el-date-picker
						v-model="form.planEndTime"
						type="date"
						value-format="YYYY-MM-DD"
						placeholder="请选择截止日期"
					/>
				</el-form-item>
			</div>

			<el-form-item label="预期成果" prop="expectedResult">
				<el-input v-model="form.expectedResult" type="textarea" :rows="3" placeholder="请描述预期成果..." />
			</el-form-item>

			<el-form-item label="任务要求与说明" prop="taskRequirement">
				<el-input v-model="form.taskRequirement" type="textarea" :rows="3" placeholder="请填写任务详细要求..." />
			</el-form-item>

			<div class="form-grid org-grid">
				<el-form-item label="主办单位" prop="hostDeptId">
					<el-select v-model="form.hostDeptId" placeholder="请选择主办单位" filterable clearable>
						<el-option
							v-for="item in companyOptions"
							:key="item.value"
							:label="item.label"
							:value="item.value"
							:disabled="form.coDeptIds.map(String).includes(String(item.value))"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="协办单位（多选）" prop="coDeptIds">
					<el-select v-model="form.coDeptIds" multiple placeholder="请选择协办单位" filterable clearable>
						<el-option
							v-for="item in companyOptions"
							:key="item.value"
							:label="item.label"
							:value="item.value"
							:disabled="String(form.hostDeptId || '') === String(item.value)"
						/>
					</el-select>
				</el-form-item>
			</div>
		</el-form>

		<template #actions>
			<el-button class="publish-cancel" @click="emit('back')">取消</el-button>
			<el-button type="primary" class="publish-submit" :loading="loading" @click="handleSubmit">提交</el-button>
		</template>
	</FormPageLayout>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { ElTag, ElInput, ElSelect, ElOption, ElButton, ElForm, ElFormItem, ElDatePicker, ElMessage } from "element-plus"
import FormPageLayout from "@/components/FormPageLayout/index.vue"

// 声明 Props & Emits
const props = defineProps<{
	isEdit: boolean
	row: any
	sourceOptions: any[]
	priorityOptions: any[]
	categoryOptions: any[]
	levelOptions: any[]
	companyOptions: any[]
	leaderOptions: any[]
	loading?: boolean
}>()

const emit = defineEmits<{
	(e: "back"): void
	(e: "submit", data: any): void
}>()

// ==================== 选项配置 ====================
const specialProjectOptions = [
	{ label: "数据要素专项", type: "" },
	{ label: "AI专项", type: "success" },
	{ label: "国资监管专项", type: "warning" },
	{ label: "数字化转型专项", type: "success" }
]

// ==================== 响应式表单数据 ====================
const formRef = ref()
const form = ref({
	taskTitle: "",
	taskSource: "",
	// 责任人ID（大整数雪花 ID 声明为 string，防止在 JS 中丢失精度且便于对比）
	assigneeId: undefined as string | undefined,
	assigneeName: "",
	taskLevel: "",
	taskCategory: "",
	priority: "",
	specialProject: "",
	planStartTime: "",
	planEndTime: "",
	expectedResult: "",
	taskRequirement: "",
	// 主办单位ID（字典项值为 string，故声明为 string | undefined 以防回显失败）
	hostDeptId: undefined as string | undefined,
	// 协办单位ID列表（字典项值为 string，故声明为 string[]）
	coDeptIds: [] as string[]
})

// 表单校验规则
const rules = {
	taskTitle: [{ required: true, message: "请输入任务标题", trigger: "blur" }],
	taskSource: [{ required: true, message: "请选择任务来源", trigger: "change" }],
	assigneeId: [{ required: true, message: "请选择责任人", trigger: "change" }],
	taskLevel: [{ required: true, message: "请选择等级", trigger: "change" }],
	taskCategory: [{ required: true, message: "请选择类别", trigger: "change" }],
	priority: [{ required: true, message: "请选择优先级", trigger: "change" }],
	planStartTime: [{ required: true, message: "请选择开始日期", trigger: "change" }],
	planEndTime: [{ required: true, message: "请选择截止日期", trigger: "change" }],
	hostDeptId: [{ required: true, message: "请选择主办单位", trigger: "change" }]
}

const handleLeaderChange = (value?: string | number) => {
	// 安全转换为 string 匹配，避免类型不匹配或雪花 ID 匹配失败
	const selected = props.leaderOptions.find((item) => String(item.value) === String(value || ""))
	form.value.assigneeName = selected?.label || ""
}

// 重置表单值
const resetForm = () => {
	form.value = {
		taskTitle: "",
		taskSource: "",
		assigneeId: undefined,
		assigneeName: "",
		taskLevel: "",
		taskCategory: "",
		priority: "",
		specialProject: "",
		planStartTime: "",
		planEndTime: "",
		expectedResult: "",
		taskRequirement: "",
		hostDeptId: undefined,
		coDeptIds: []
	}
}

// 监听编辑行数据的传入，用深度复制完成回显
watch(
	() => props.row,
	(newRow) => {
		if (newRow && props.isEdit) {
			// 协办单位 ID 字符串转为 string[]，对应字典值的类型
			let coIds: string[] = []
			if (newRow.coDeptIds) {
				coIds = String(newRow.coDeptIds)
					.split(",")
					.map((id) => String(id).trim())
					.filter((id) => id !== "")
			}
			const startTime = newRow.planStartTime ? newRow.planStartTime.slice(0, 10) : ""
			const endTime = newRow.planEndTime ? newRow.planEndTime.slice(0, 10) : ""

			form.value = {
				taskTitle: newRow.taskTitle || "",
				taskSource: newRow.taskSource || "",
				// 责任人 ID 转换为 string 以配合 string 类型定义，防止精度溢出
				assigneeId: newRow.assigneeId ? String(newRow.assigneeId) : undefined,
				assigneeName: newRow.assigneeName || "",
				taskLevel: newRow.taskLevel || "",
				taskCategory: newRow.taskCategory || "",
				priority: newRow.priority || "",
				specialProject: newRow.specialProject || "",
				planStartTime: startTime,
				planEndTime: endTime,
				expectedResult: newRow.expectedResult || "",
				taskRequirement: newRow.taskRequirement || "",
				// 主办单位 ID 转为 string，对应字典值的类型
				hostDeptId: newRow.hostDeptId ? String(newRow.hostDeptId) : undefined,
				coDeptIds: coIds
			}
		} else {
			resetForm()
		}
	},
	{ immediate: true, deep: true }
)

// 提交表单前进行合法性校验
const handleSubmit = async () => {
	if (props.loading) return
	if (!formRef.value) return
	await formRef.value.validate((valid: boolean) => {
		if (valid) {
			emit("submit", { ...form.value })
		} else {
			ElMessage.warning("请将表单必填信息填写完整")
		}
	})
}
</script>

<style scoped lang="scss">
/* 设计变量 */
$border-color: rgba(228, 231, 237, 0.7);

.publish-form {
	.form-grid {
		display: grid;
		max-width: 1080px;
		width: 100%; // 宽度自适应容器宽度，避免固定宽度导致溢出
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		column-gap: 40px;
	}

	.el-form-item {
		margin-bottom: 24px;
	}

	// 确保下拉选择框与日期选择组件宽度 100% 填满 grid 单元格
	:deep(.el-select),
	:deep(.el-date-editor) {
		width: 100%;
	}

	.special-tags {
		width: 100%;
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		margin-top: 10px;

		.el-tag {
			height: 28px;
			padding: 0 10px;
			border-radius: 5px;
			font-size: 13px;
			cursor: pointer;
		}
	}

	.org-grid {
		align-items: start;
		margin-top: 20px;
	}
}

.publish-cancel,
.publish-submit {
	min-width: 84px;
	height: 40px;
	border-radius: 8px;
	font-size: 15px;
	font-weight: 700;
}

.publish-cancel {
	color: #1f2a44;
	border-color: #d4dae4;
}

.publish-submit {
	background: var(--el-color-primary, #00b46e);
	border-color: var(--el-color-primary, #00b46e);
	color: #fff;
}

// 屏幕宽度小于等于 992px 时切换为两列布局
@media (max-width: 992px) {
	.publish-form {
		.form-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
}

// 屏幕宽度小于等于 768px 时切换为单列布局
@media (max-width: 768px) {
	.publish-form {
		.form-grid {
			grid-template-columns: 1fr;
		}
	}
}
</style>
