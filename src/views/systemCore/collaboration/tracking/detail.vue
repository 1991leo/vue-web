<template>
	<DetailPageLayout
		:title="project.projectName || '项目详情'"
		:status-label="getStageLabel(project.currentStage, project.currentStageName)"
		:status-class="getStageStatusClassForTop(project.currentStage)"
		@back="emit('back')"
	>
		<!-- 顶部副标题插槽：适配原型截图布局 -->
		<template #subline>
			<div class="subline-wrapper">
				<span class="level-badge" :class="getLevelBadgeClass(project.projectLevel)">
					{{ getLevelLabel(project.projectLevel, project.projectLevelName) }}
				</span>
				<span class="meta-item" :title="project.projectDesc">
					{{ project.projectDesc || "暂无项目描述" }}
				</span>
				<span class="sep-line">|</span>
				<span class="meta-item">
					预估金额(万元)：<b class="amount-val">¥ {{ formatAmount(project.estimatedAmount) }} 万元</b>
				</span>
				<span class="sep-line">|</span>
				<span class="meta-item"> 牵头企业：{{ project.leadingEnterpriseName || "-" }} </span>
				<span class="sep-line">|</span>
				<span class="meta-item"> 协同企业：{{ project.collaborativeEnterpriseNames || "-" }} </span>
			</div>
		</template>

		<!-- 左右大分栏主布局 -->
		<div class="detail-main-layout">
			<!-- 左栏：占大半，用 tab 承载基本信息、阶段进度、里程碑管理、协调事项 -->
			<div class="detail-left-section">
				<el-tabs v-model="activeTab" class="detail-tabs">
					<!-- 1. 项目基本信息 -->
					<el-tab-pane label="项目基本信息" name="info">
						<div v-if="!isInfoEditing" class="tab-action-bar">
							<el-button type="primary" link class="soft-button" @click="handleEditInfo">编辑</el-button>
						</div>

						<div v-if="!isInfoEditing" class="info-grid">
							<div class="info-item">
								<span>项目级别:</span>
								<span>{{ getLevelLabel(project.projectLevel, project.projectLevelName) }}</span>
							</div>
							<div class="info-item">
								<span>当前阶段:</span>
								<span>{{ getStageLabel(project.currentStage, project.currentStageName) }}</span>
							</div>
							<div class="info-item">
								<span>预估金额:</span>
								<span>{{ formatAmount(project.estimatedAmount) }} 万元</span>
							</div>
							<div class="info-item">
								<span>协同企业:</span>
								<span>{{ project.collaborativeEnterpriseNames || "-" }}</span>
							</div>
							<div class="info-item full-width">
								<span>项目描述:</span>
								<span>{{ project.projectDesc || "暂无项目描述" }}</span>
							</div>
						</div>

						<el-form
							v-else
							ref="infoFormRef"
							:model="infoForm"
							:rules="projectRules"
							label-position="left"
							class="project-form inline-info-form"
						>
							<div class="form-grid">
								<el-form-item label="项目名称" prop="projectName">
									<el-input v-model="infoForm.projectName" placeholder="请输入项目名称" />
								</el-form-item>
								<el-form-item label="项目级别" prop="projectLevel">
									<el-select v-model="infoForm.projectLevel" placeholder="请选择项目级别">
										<el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value" />
									</el-select>
								</el-form-item>
								<el-form-item label="当前阶段" prop="currentStage">
									<el-select v-model="infoForm.currentStage" placeholder="请选择当前阶段">
										<el-option v-for="item in stageOptions" :key="item.value" :label="item.label" :value="item.value" />
									</el-select>
								</el-form-item>
								<el-form-item label="预估金额(万元)" prop="estimatedAmount">
									<el-input-number v-model="infoForm.estimatedAmount" :min="0" :precision="2" :controls="false" />
								</el-form-item>
								<el-form-item label="牵头企业" prop="leadingEnterpriseId">
									<el-select v-model="infoForm.leadingEnterpriseId" placeholder="请选择牵头企业" filterable>
										<el-option
											v-for="item in companyOptions"
											:key="item.value"
											:label="item.label"
											:value="item.value"
											:disabled="infoForm.collaborativeEnterprises.includes(item.value)"
										/>
									</el-select>
								</el-form-item>
								<el-form-item label="协同企业" prop="collaborativeEnterprises">
									<el-select
										v-model="infoForm.collaborativeEnterprises"
										multiple
										placeholder="请选择协同企业"
										filterable
									>
										<el-option
											v-for="item in companyOptions"
											:key="item.value"
											:label="item.label"
											:value="item.value"
											:disabled="item.value === infoForm.leadingEnterpriseId"
										/>
									</el-select>
								</el-form-item>
								<el-form-item label="项目描述" prop="projectDesc" class="full-width">
									<el-input v-model="infoForm.projectDesc" type="textarea" :rows="4" placeholder="请输入项目描述" />
								</el-form-item>
							</div>
							<div class="inline-form-actions">
								<el-button @click="cancelEditInfo">取消</el-button>
								<el-button type="primary" @click="submitInfoForm">保存</el-button>
							</div>
						</el-form>
					</el-tab-pane>

					<!-- 2. 项目阶段进度 -->
					<el-tab-pane label="阶段进度" name="stage">
						<div v-if="nextStage" class="tab-action-bar">
							<el-button
								type="primary"
								class="soft-button"
								v-hasPermi="['base:project:edit']"
								link
								@click="emit('advanceStage', nextStage.value)"
							>
								推进至{{ nextStage.label }}
							</el-button>
						</div>
						<div class="stage-progress">
							<div
								v-for="(stage, index) in stageOptions"
								:key="stage.value"
								class="stage-node"
								:class="getStageNodeClass(index)"
							>
								<span class="stage-name">{{ stage.label }}</span>
								<div class="stage-dot-wrapper">
									<span v-if="index > 0" class="stage-line"></span>
									<span class="stage-dot">
										<el-icon v-if="index < stageActiveIndex"><Check /></el-icon>
										<i v-else-if="index === stageActiveIndex" class="active-icon"></i>
									</span>
								</div>
							</div>
						</div>
					</el-tab-pane>

					<!-- 3. 里程碑管理 (平铺白盒网格样式) -->
					<el-tab-pane label="里程碑管理" name="milestone">
						<div class="tab-action-bar">
							<el-button type="primary" class="soft-button" link @click="emit('addMilestone')"> 添加里程碑 </el-button>
						</div>
						<div v-if="project.milestones?.length" class="milestone-grid">
							<div v-for="item in project.milestones" :key="item.id" class="milestone-card">
								<!-- 里程碑顶部：标题 + 状态（带小图标） -->
								<div class="milestone-card-top">
									<strong class="milestone-name" :title="item.milestoneName">{{ item.milestoneName }}</strong>
									<span class="milestone-status-text" :class="getMilestoneStatusClass(item.status)">
										<img :src="getMilestoneStatusIcon(item.status)" class="state-icon" />
										{{ getMilestoneStatusLabel(item.status, item.statusName) }}
									</span>
								</div>
								<!-- 截止时间及延期警示 -->
								<div class="milestone-card-middle">
									<span>截止：{{ item.deadline || "-" }}</span>
									<span v-if="Number(item.delayDays) > 0" class="delay-text">延期 {{ item.delayDays }} 天</span>
								</div>
								<!-- 里程碑操作 -->
								<div class="milestone-card-actions">
									<!-- <el-button v-if="item.status !== '2'" type="primary" link @click="emit('completeMilestone', item)">完成</el-button> -->
									<el-button type="primary" v-hasPermi="['base:project:edit']" link @click="emit('editMilestone', item)"
										>编辑</el-button
									>
									<el-button
										type="danger"
										v-hasPermi="['base:project:edit']"
										link
										@click="emit('deleteMilestone', item)"
										>删除</el-button
									>
								</div>
							</div>
						</div>
						<el-empty v-else class="empty-milestone" description="暂无里程碑" />
					</el-tab-pane>

					<!-- 4. 协调事项 (状态匹配 coordinate 样式) -->
					<el-tab-pane label="协调事项" name="coordination">
						<div class="tab-action-bar">
							<el-button type="primary" class="soft-button" link @click="emit('createTodo')"> 创建协调事项 </el-button>
						</div>
						<CommonTable :data="coordinationItems" :columns="coordinationColumns">
							<template #titleSlot="{ row }">
								<span class="item-title" :title="row.title">{{ row.title }}</span>
							</template>
							<template #prioritySlot="{ row }">
								<span class="coordination-priority-tag" :class="getPriorityClass(row.priority)">
									{{ row.priority }}
								</span>
							</template>
							<template #statusSlot="{ row }">
								<span class="coordination-state-text" :class="getCoordinationStatusClass(row.status)">
									<img :src="getCoordinationStatusIcon(row.status)" class="state-icon" />
									{{ row.status }}
								</span>
							</template>
						</CommonTable>
					</el-tab-pane>
				</el-tabs>
			</div>

			<!-- 中间分割线 -->
			<CommonDivider direction="vertical" :vertical-offset="24" :horizontal-margin="0" />

			<!-- 右栏：占小半，放项目动态时间线 -->
			<div class="detail-right-section">
				<section class="detail-section timeline-card-section">
					<div class="section-header">
						<h2>项目动态时间线</h2>
						<el-button
							type="primary"
							v-hasPermi="['base:project:edit']"
							class="soft-button"
							link
							@click="emit('addLog')"
						>
							添加日志
						</el-button>
					</div>
					<CommonTimeline v-if="timelineData.length" :data="timelineData" />
					<el-empty v-else description="暂无动态日志" />
				</section>
			</div>
		</div>
	</DetailPageLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import { Check, Plus, Loading } from "@element-plus/icons-vue"
import DetailPageLayout from "@/components/DetailPageLayout/index.vue"
import CommonTimeline from "@/components/CommonTimeline/index.vue"
import CommonDivider from "@/components/CommonDivider/index.vue"
import CommonTable from "@/components/CommonTable/index.vue"
import type { TimelineItem } from "@/components/CommonTimeline/index.vue"
import type { BizProjectForm, BizProjectMilestoneVO, BizProjectVO } from "@/api/system/project/types"

interface SelectOption {
	label: string
	value: string | number
	elTagType?: string
	elTagClass?: string
}

interface CoordinationItem {
	id: string | number
	title: string
	department: string
	priority: string
	status: string
	createTime: string
	description: string
}

interface ProjectEditForm {
	projectName: string
	projectDesc: string
	projectLevel: string | number
	currentStage: string | number
	estimatedAmount?: number
	leadingEnterpriseId: string | number
	collaborativeEnterprises: Array<string | number>
}

const props = withDefaults(
	defineProps<{
		project: BizProjectVO
		levelOptions?: SelectOption[]
		stageOptions?: SelectOption[]
		statusOptions?: SelectOption[]
		companyOptions?: SelectOption[]
		timelineTypeOptions?: SelectOption[]
		milestoneStatusOptions?: SelectOption[]
		coordinationItems?: CoordinationItem[]
	}>(),
	{
		levelOptions: () => [],
		stageOptions: () => [],
		statusOptions: () => [],
		companyOptions: () => [],
		timelineTypeOptions: () => [],
		milestoneStatusOptions: () => [],
		coordinationItems: () => []
	}
)

// 协调事项表格列配置
const coordinationColumns = [
	{ label: "事项标题", prop: "title", slotName: "titleSlot", minWidth: "220px", showOverflowTooltip: true },
	{ label: "提出部门", prop: "department", minWidth: "120px", showOverflowTooltip: true },
	{ label: "优先级", prop: "priority", slotName: "prioritySlot", minWidth: "100px" },
	{ label: "状态", prop: "status", slotName: "statusSlot", minWidth: "120px" },
	{ label: "创建时间", prop: "createTime", minWidth: "150px" }
]

const emit = defineEmits<{
	(e: "back"): void
	(e: "updateInfo", form: ProjectEditForm): void
	(e: "advanceStage", stage: string | number): void
	(e: "addLog"): void
	(e: "addMilestone"): void
	(e: "editMilestone", milestone: BizProjectMilestoneVO): void
	(e: "completeMilestone", milestone: BizProjectMilestoneVO): void
	(e: "deleteMilestone", milestone: BizProjectMilestoneVO): void
	(e: "createTodo"): void
}>()

const isInfoEditing = ref(false)
// 左侧业务信息分页签，默认展示项目基本信息
const activeTab = ref("info")
const infoFormRef = ref<FormInstance>()
const infoForm = reactive<ProjectEditForm>({
	projectName: "",
	projectDesc: "",
	projectLevel: "",
	currentStage: "",
	estimatedAmount: undefined,
	leadingEnterpriseId: "",
	collaborativeEnterprises: []
})

const validateCollaborative = (rule: any, value: any, callback: any) => {
	if (value && value.includes(infoForm.leadingEnterpriseId)) {
		callback(new Error("协同企业不能包含牵头企业"))
	} else {
		callback()
	}
}

const validateLeading = (rule: any, value: any, callback: any) => {
	if (value && infoForm.collaborativeEnterprises.includes(value)) {
		callback(new Error("牵头企业不能与协同企业相同"))
	} else {
		callback()
	}
}

const projectRules: FormRules = {
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

const stageActiveIndex = computed(() =>
	props.stageOptions.findIndex((item) => String(item.value) === String(props.project.currentStage))
)
const nextStage = computed(() => {
	const index = stageActiveIndex.value
	if (index < 0 || index >= props.stageOptions.length - 1) return null
	return props.stageOptions[index + 1]
})
const timelineData = computed<TimelineItem[]>(() => {
	return (props.project.timelines || []).map((item) => {
		const type = normalizeTimelineType(item.timelineType)
		const typeLabel = getTimelineTypeLabel(item.timelineType, item.timelineTypeName)
		const stageLabel = getStageLabel(item.stage, item.stageName)

		return {
			time: item.createTime || "",
			label: stageLabel && stageLabel !== "-" ? `${typeLabel} / ${stageLabel}` : typeLabel,
			type,
			user: item.operatorName || "操作人",
			content: item.content || ""
		}
	})
})

watch(
	() => props.project.id,
	() => {
		isInfoEditing.value = false
	}
)

watch(
	() => infoForm.leadingEnterpriseId,
	() => {
		infoFormRef.value?.validateField("collaborativeEnterprises")
	}
)
watch(
	() => infoForm.collaborativeEnterprises,
	() => {
		infoFormRef.value?.validateField("leadingEnterpriseId")
	},
	{ deep: true }
)

function fillInfoForm() {
	// 复制详情数据到编辑态，避免表单输入直接污染展示数据。
	Object.assign(infoForm, {
		projectName: props.project.projectName || "",
		projectDesc: props.project.projectDesc || "",
		projectLevel: props.project.projectLevel || "",
		currentStage: props.project.currentStage || "",
		estimatedAmount: props.project.estimatedAmount,
		leadingEnterpriseId: props.project.leadingEnterpriseId || "",
		collaborativeEnterprises: splitValues(props.project.collaborativeEnterprises)
	})
}

function handleEditInfo() {
	fillInfoForm()
	isInfoEditing.value = true
}

function cancelEditInfo() {
	fillInfoForm()
	isInfoEditing.value = false
	infoFormRef.value?.clearValidate()
}

async function submitInfoForm() {
	const valid = await infoFormRef.value?.validate().catch(() => false)
	if (!valid) return
	emit("updateInfo", { ...infoForm, collaborativeEnterprises: [...infoForm.collaborativeEnterprises] })
	isInfoEditing.value = false
}

function splitValues(value?: string): Array<string | number> {
	if (!value) return []
	return value.split(",").filter(Boolean)
}

function getOptionLabel(options: SelectOption[], value?: string | number, fallback?: string) {
	const target = options.find((item) => String(item.value) === String(value))
	return target?.label || fallback || String(value || "-")
}

function getLevelLabel(value?: string | number, fallback?: string) {
	return getOptionLabel(props.levelOptions, value, fallback)
}

function getStageLabel(value?: string | number, fallback?: string) {
	return getOptionLabel(props.stageOptions, value, fallback)
}

function getTimelineTypeLabel(value?: string | number, fallback?: string) {
	return getOptionLabel(props.timelineTypeOptions, value, fallback)
}

function getMilestoneStatusLabel(value?: string | number, fallback?: string) {
	return getOptionLabel(props.milestoneStatusOptions, value, fallback)
}

function getStageStatusClass(stage?: string | number) {
	const index = props.stageOptions.findIndex((item) => String(item.value) === String(stage))
	if (index < 0) return "status-ongoing"
	if (index === 0) return "status-pending"
	if (index === props.stageOptions.length - 1) return "status-completed"
	return "status-ongoing"
}

function getStageNodeClass(index: number) {
	if (index < stageActiveIndex.value) return "is-finished"
	if (index === stageActiveIndex.value) return "is-active"
	return "is-wait"
}

function getMilestoneTagType(status?: string | number) {
	if (String(status) === "2") return "success"
	if (String(status) === "1") return "primary"
	return "info"
}

function normalizeTimelineType(type?: string | number) {
	const map: Record<string, string> = {
		"1": "progress",
		"2": "problem",
		progress_update: "progress",
		problem: "problem",
		other: "create"
	}
	return map[String(type)] || String(type || "progress")
}

function getPriorityClass(priority: string) {
	return {
		"is-high": priority === "高",
		"is-middle": priority === "中",
		"is-low": priority === "低"
	}
}

const statusIconMap: Record<string, string> = {
	"0": new URL("@/assets/collaboration/Pending.png", import.meta.url).href,
	"1": new URL("@/assets/collaboration/processing.png", import.meta.url).href,
	"2": new URL("@/assets/collaboration/resolved.png", import.meta.url).href,
	"3": new URL("@/assets/collaboration/unresolved.png", import.meta.url).href,
	待处理: new URL("@/assets/collaboration/Pending.png", import.meta.url).href,
	处理中: new URL("@/assets/collaboration/processing.png", import.meta.url).href,
	已解决: new URL("@/assets/collaboration/resolved.png", import.meta.url).href,
	已完成: new URL("@/assets/collaboration/resolved.png", import.meta.url).href,
	未解决: new URL("@/assets/collaboration/unresolved.png", import.meta.url).href,
	已关闭: new URL("@/assets/collaboration/unresolved.png", import.meta.url).href
}

function getCoordinationStatusIcon(status: string) {
	return statusIconMap[status] || statusIconMap["待处理"]
}

function getCoordinationStatusClass(status: string) {
	const map: Record<string, string> = {
		"0": "pending",
		"1": "processing",
		"2": "resolved",
		"3": "unresolved",
		待处理: "pending",
		处理中: "processing",
		已解决: "resolved",
		已完成: "resolved",
		未解决: "unresolved",
		已关闭: "unresolved"
	}
	return map[status] || "pending"
}

function getStageStatusClassForTop(stage?: string | number) {
	const stageStr = String(stage || "").trim()
	if (
		stageStr === "1" ||
		stageStr.includes("商机") ||
		stageStr === "3" ||
		stageStr.includes("建设") ||
		stageStr.includes("实施")
	) {
		return "status-ongoing" // 蓝色
	}
	if (stageStr === "4" || stageStr.includes("验收") || stageStr.includes("交付")) {
		return "status-completed" // 绿色
	}
	return "status-pending" // 灰色
}

function getLevelBadgeClass(level?: string | number) {
	const levelStr = String(level || "")
	if (levelStr === "1") return "level-group"
	if (levelStr === "2") return "level-company"
	return "level-general"
}

function getMilestoneClass(level?: string | number) {
	const levelStr = String(level || "")
	if (levelStr === "2") return "is-completed"
	if (levelStr === "1") return "is-processing"
	return "is-pending"
}

function getMilestoneStatusIcon(status?: string | number) {
	const statusStr = String(status || "")
	return statusIconMap[statusStr] || statusIconMap["0"]
}

function getMilestoneStatusClass(status?: string | number) {
	const statusStr = String(status || "")
	if (statusStr === "2") return "resolved"
	if (statusStr === "1") return "processing"
	return "pending"
}

function getTimelineTypeLabelText(type: string) {
	if (type === "problem") return "问题"
	if (type === "create") return "创建"
	if (type === "statusChange") return "变更"
	return "进展"
}

function formatAmount(amount?: number) {
	return Number(amount || 0).toLocaleString("zh-CN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
</script>

<style scoped lang="scss">
/* 顶部副标题元数据区域 */
.subline-wrapper {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 12px;
	color: #5d6678;
	font-size: 14px;
	width: 100%;
	position: relative;

	.level-badge {
		display: inline-flex;
		align-items: center;
		height: 24px;
		padding: 0 10px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 600;

		&::before {
			content: "";
			display: inline-block;
			width: 6px;
			height: 6px;
			border-radius: 50%;
			margin-right: 6px;
		}

		&.level-group {
			color: #00b46e;
			background: rgba(0, 180, 110, 0.1);
			&::before {
				background: #00b46e;
			}
		}
		&.level-company {
			color: #1678ff;
			background: rgba(22, 120, 255, 0.1);
			&::before {
				background: #1678ff;
			}
		}
		&.level-general {
			color: #8a94a6;
			background: rgba(138, 148, 166, 0.1);
			&::before {
				background: #8a94a6;
			}
		}
	}

	.desc-text {
		color: #8a94a6;
		max-width: 320px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.sep-line {
		color: #edf0f5;
		margin: 0 4px;
	}

	.meta-item {
		.amount-val {
			color: #8a94a6;
		}
	}
}

/* 主布局 */
.detail-main-layout {
	display: flex;
	gap: 0;
	align-items: stretch;
	background: #fff;
	border-radius: 12px;
}

.detail-left-section {
	flex: 1;
	min-width: 0;
	padding: 24px 30px;
	display: flex;
	flex-direction: column;
}

.detail-right-section {
	display: flex;
	flex-direction: column;
	gap: 24px;
}

/* 左侧业务信息 Tab（与重点事项详情保持一致） */
.detail-tabs {
	flex: 1;
	min-height: 0;
	display: flex;
	flex-direction: column;

	:deep(.el-tabs__content) {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		padding: 8px 2px 0;
	}

	:deep(.el-tabs__item) {
		height: 48px;
		line-height: 48px;
		font-size: 15px;
		color: #8a94a6;

		&.is-active {
			color: var(--el-color-primary);
			font-weight: 700;
		}
	}

	:deep(.el-tabs__active-bar) {
		height: 3px;
		border-radius: 2px;
		background-color: var(--el-color-primary);
	}
}

/* 各 Tab 内的操作按钮统一右对齐 */
.tab-action-bar {
	display: flex;
	justify-content: flex-end;
	margin-bottom: 12px;
}

/* 通用 section */
.detail-section {
	padding: 24px 26px;
	border-radius: 12px;
	background: #ffffff;
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	margin-bottom: 22px;

	h2 {
		margin: 0;
		padding-left: 10px;
		border-left: 4px solid var(--el-color-primary);
		color: #202938;
		font-size: 18px;
		font-weight: 700;
		line-height: 24px;
	}
}

.soft-button {
	height: 32px;
	border-radius: 8px;
}

/* 项目基本信息 */
.info-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 18px 24px;
}

.info-item {
	display: flex;
	align-items: center;
	gap: 10px;
	font-size: 14px;

	span:first-child {
		color: #8a94a6;
		width: 80px;
		flex-shrink: 0;
	}

	span:last-child {
		color: #202938;
	}

	&.full-width {
		grid-column: 1 / -1;
		align-items: flex-start;
	}
}

.project-form {
	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
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
}

.inline-form-actions {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	padding-top: 16px;
	border-top: 1px solid #edf0f5;
	margin-top: 20px;
}

/* 阶段进度 */
.stage-progress {
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	padding: 16px 24px 12px;
}

.stage-node {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;

	.stage-name {
		color: #5d6678;
		font-size: 14px;
		line-height: 20px;
		text-align: center;
	}

	.stage-dot-wrapper {
		position: relative;
		width: 100%;
		height: 32px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.stage-line {
		position: absolute;
		top: 13px; /* 32px/2 - 6px/2 = 13px */
		right: 50%;
		width: 100%;
		height: 6px;
		background: #edf0f5;
		z-index: 1;
		border-radius: 3px;
	}

	.stage-dot {
		position: relative;
		z-index: 2;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: 3px solid #ffffff;
		border-radius: 50%;
		background: #d8dee7;
		color: transparent;
		transition: all 0.3s ease;

		.el-icon {
			font-size: 14px;
			font-weight: bold;
		}

		.active-icon {
			display: inline-block;
			width: 14px;
			height: 14px;
			border: 2px solid #ffffff;
			border-top-color: transparent;
			border-radius: 50%;
			box-sizing: border-box;
		}
	}

	&.is-finished {
		.stage-line {
			background: var(--el-color-success, #00b46e);
		}
		.stage-dot {
			border-color: #ffffff;
			background: var(--el-color-success, #00b46e);
			color: #ffffff;
		}
	}

	&.is-active {
		.stage-line {
			background: var(--el-color-success, #00b46e);
		}
		.stage-dot {
			border-color: #ffffff;
			background: #1678ff;
			color: #ffffff;
		}
		.stage-name {
			color: #1678ff;
		}
	}
}

/* 里程碑管理 */
.milestone-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
	gap: 16px;
}

.milestone-card {
	position: relative;
	border: 1px solid #edf0f5;
	border-radius: 10px;
	background-color: var(--el-fill-color-blank, #ffffff);
	padding: 16px;
	transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
	display: flex;
	flex-direction: column;
	min-height: 120px;
	cursor: pointer;

	&:hover {
		border-color: var(--el-color-primary-light-7, #7ab8fd);
		box-shadow: 0 6px 18px rgba(23, 43, 77, 0.05);

		.milestone-card-actions {
			opacity: 1;
			pointer-events: auto;
			transform: translateY(0);
		}
	}
}

.milestone-card-top {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 12px;
	margin-bottom: 12px;

	.milestone-name {
		font-size: 15px;
		color: #202938;
		line-height: 1.4;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
	}

	.milestone-status-text {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;

		.state-icon {
			width: 16px;
			height: 16px;
			object-fit: contain;
		}

		&.resolved {
			color: var(--el-color-success, #00b46e);
		}
		&.pending {
			color: #8a94a6;
		}
		&.processing {
			color: #1677ff;
		}
	}
}

@keyframes rotate {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

.milestone-card-middle {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 13px;
	color: #8a94a6;
	margin-bottom: auto;

	.delay-text {
		color: var(--el-color-danger, #f53f3f);
	}
}

.milestone-card-actions {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	margin-top: 14px;
	opacity: 0;
	pointer-events: none;
	transform: translateY(4px);
	transition: all 0.2s ease;
}

/* 协调事项 */
.item-title {
	color: #202938;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.coordination-priority-tag {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 24px;
	padding: 0 10px;
	border-radius: 12px;
	font-size: 12px;

	&::before {
		content: "•";
		margin-right: 4px;
		font-size: 14px;
		line-height: 1;
	}

	&.is-high {
		color: var(--el-color-danger, #f53f3f);
		background-color: var(--el-color-danger-light-9, rgba(245, 63, 63, 0.08));
	}

	&.is-middle {
		color: var(--el-color-warning, #ffb020);
		background-color: var(--el-color-warning-light-9, rgba(255, 176, 32, 0.08));
	}

	&.is-low {
		color: var(--el-color-success, #00b46e);
		background-color: var(--el-color-success-light-9, rgba(0, 180, 110, 0.08));
	}
}

.coordination-state-text {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	font-size: 13px;

	.state-icon {
		width: 16px;
		height: 16px;
		object-fit: contain;
	}

	&.resolved {
		color: var(--el-color-success, #00b46e);
	}
	&.pending {
		color: #8a94a6;
	}
	&.processing {
		color: #1677ff;
	}
	&.unresolved {
		color: #ff4d4f;
	}
}

/* 右侧项目动态时间线 */
.timeline-card-section {
	min-height: 600px;
}

/* 插槽自定义时间线卡片白盒 */
.custom-timeline-box {
	background-color: #ffffff;
	border: 1px solid #edf0f5;
	border-radius: 12px;
	padding: 18px 20px;
	box-shadow: 0 4px 12px rgba(23, 43, 77, 0.02);
	transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
	display: flex;
	flex-direction: column;
	gap: 10px;

	&:hover {
		border-color: var(--el-color-primary-light-8, #b3d8ff);
		box-shadow: 0 6px 20px rgba(23, 43, 77, 0.06);
		transform: translateY(-2px);
	}

	.timeline-box-header {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.timeline-box-title {
			font-size: 15px;
			color: #202938;
		}
	}

	.timeline-box-body {
		display: flex;
		flex-direction: column;
		gap: 6px;

		.timeline-user {
			font-size: 14px;
			color: #5d6678;
		}

		.timeline-content {
			font-size: 13px;
			color: #8a94a6;
			line-height: 1.6;
			white-space: pre-wrap;
		}
	}

	.timeline-box-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 4px;

		.timeline-time {
			font-size: 12px;
			color: #8a94a6;
		}

		.timeline-badge {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			padding: 2px 8px;
			border-radius: 4px;
			font-size: 12px;

			&.create,
			&.progress {
				color: #00b46e;
				background-color: rgba(0, 180, 110, 0.08);
			}

			&.problem {
				color: #f53f3f;
				background-color: rgba(245, 63, 63, 0.08);
			}

			&.statusChange,
			&.assign {
				color: #1678ff;
				background-color: rgba(22, 120, 255, 0.08);
			}
		}
	}
}

@media (max-width: 1200px) {
	.detail-main-layout {
		flex-direction: column;
	}

	:deep(.common-divider.vertical) {
		display: none;
	}

	.detail-left-section {
		padding-right: 0;
	}

	.detail-right-section {
		width: 100%;
		padding-left: 0;
		margin-top: 24px;
	}

	.stage-progress {
		grid-template-columns: 1fr;
		gap: 16px;
		padding: 0;

		.stage-node {
			align-items: center;
			flex-direction: row;

			.stage-name {
				order: 2;
				text-align: left;
			}

			.stage-dot-wrapper {
				order: 1;
				width: auto;
				margin-right: 12px;

				.stage-line {
					display: none;
				}
			}
		}
	}
}
</style>
