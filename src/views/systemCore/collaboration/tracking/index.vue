<template>
	<div class="tracking-container" :class="`view-${currentView}`">
		<template v-if="currentView === 'list'">
			<div class="list-page">
				<PageTitle title="项目全生命周期" />

				<SearchHeader
					:key="searchHeaderKey"
					:form-items="searchFields"
					@form-data-change="handleSearch"
					@form-data-reset="resetQuery"
				/>

				<CommonDivider :offset="30" />

				<div class="action-row">
					<el-button type="primary" class="create-button" v-hasPermi="['base:project:add']" @click="handleCreate">
						<el-icon><Plus /></el-icon>
						新增项目
					</el-button>
				</div>

				<div class="project-grid-wrapper" v-loading="loading">
					<div v-if="tableData.length > 0" class="project-grid">
						<PriorityCard
							v-for="project in tableData"
							:key="project.id"
							:priority="project.projectLevel"
							@click="handleView(project)"
						>
							<!-- 卡片头部：级别角标与项目名称，当前阶段状态定位在右上角 -->
							<div class="card-header">
								<div class="title-wrap">
									<span class="priority-indicator" :class="getLevelIndicatorClass(project.projectLevel)">
										{{ getLevelLabel(project.projectLevel, project.projectLevelName) }}
									</span>
									<h3 class="card-title" :title="project.projectName">{{ project.projectName }}</h3>
								</div>
							</div>
							<span class="status-tag" :class="getStageStatusClass(project.currentStage)">
								{{ getStageLabel(project.currentStage, project.currentStageName) }}
							</span>

							<!-- 核心详情信息 (预估金额与牵头企业) -->
							<div class="card-info">
								<div class="info-row">
									<span class="info-label">预估金额(万元)</span>
									<span class="info-value">¥ {{ formatAmount(project.estimatedAmount) }} 万元</span>
								</div>
								<div class="info-row">
									<span class="info-label">牵头企业</span>
									<span class="info-value" :title="project.leadingEnterpriseName">{{
										project.leadingEnterpriseName || "-"
									}}</span>
								</div>
							</div>

							<!-- 卡片底部：延期里程碑警告与更新时间 -->
							<div class="card-footer">
								<!-- <div v-if="getDelayMilestone(project)" class="overdue-warning">
                  <el-icon class="warning-icon"><Warning /></el-icon>
                  <span class="warning-text" :title="`${getDelayMilestone(project).milestoneName}延迟${getDelayMilestone(project).delayDays}天`">
                    {{ getDelayMilestone(project).milestoneName }}延迟{{ getDelayMilestone(project).delayDays }}天
                  </span>
                </div> -->
								<div class="deadline-wrap" :class="{ 'align-right': !getDelayMilestone(project) }">
									<span class="deadline-label">更新于 </span>
									<span class="deadline-value">{{ project.createTime }}</span>
								</div>
							</div>
						</PriorityCard>
					</div>
					<el-empty v-else-if="!loading" class="empty-state" description="暂无项目数据" />
				</div>

				<div class="pager-row">
					<Pagination
						v-model:current-page="currentPage"
						v-model:page-size="pageSize"
						:total="total"
						paginationType="success"
					/>
				</div>
			</div>
		</template>

		<CreateProject
			v-else-if="currentView === 'create'"
			:level-options="levelOptions"
			:stage-options="stageOptions"
			:company-options="companyOptions"
			@back="goBackToList"
			@submit="submitProjectForm"
		/>

		<DetailProject
			v-else
			:project="currentProject"
			:level-options="levelOptions"
			:stage-options="stageOptions"
			:status-options="statusOptions"
			:company-options="companyOptions"
			:timeline-type-options="timelineTypeOptions"
			:milestone-status-options="milestoneStatusOptions"
			:coordination-items="coordinationItems"
			@back="goBackToList"
			@update-info="submitInfoForm"
			@advance-stage="handleAdvanceStage"
			@add-log="openLogDialog"
			@add-milestone="openMilestoneDialog"
			@edit-milestone="handleEditMilestone"
			@complete-milestone="handleCompleteMilestone"
			@delete-milestone="handleDeleteMilestone"
			@create-todo="openTodoDialog"
		/>

		<AddLogDialog
			v-model="logDialogVisible"
			:stage-options="stageOptions"
			:timeline-type-options="timelineTypeOptions"
			:current-stage="currentProject.currentStage"
			@submit="submitLogForm"
		/>

		<AddMilestoneDialog
			v-model="milestoneDialogVisible"
			:stage-options="stageOptions"
			:milestone-status-options="milestoneStatusOptions"
			:current-stage="currentProject.currentStage"
			:milestone-data="currentMilestone"
			@submit="submitMilestoneForm"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import modal from "@/plugins/modal"
import { ArrowRight, Money, OfficeBuilding, Plus, Warning } from "@element-plus/icons-vue"
import PageTitle from "@/components/PageTitle/index.vue"
import SearchHeader from "@/components/SearchHeader/index.vue"
import CommonDivider from "@/components/CommonDivider/index.vue"
import Pagination from "@/components/Pagination/index.vue"
import PriorityCard from "@/components/PriorityCard/index.vue"
import { usePagination } from "@/hooks/usePagination"
import { useCrudView } from "@/hooks/useCrudView"
import { checkPermi } from "@/utils/permission"
import { getDicts } from "@/api/system/dict/data"
import {
	addProject,
	addProjectMilestone,
	addProjectTimeline,
	advanceProject,
	delProjectMilestones,
	getProject,
	listProject,
	updateProject,
	updateProjectMilestone,
	updateProjectMilestoneStatus
} from "@/api/system/project"
import { listCoordination } from "@/api/system/coordination"
import type {
	BizProjectForm,
	BizProjectMilestoneForm,
	BizProjectMilestoneVO,
	BizProjectTimelineForm,
	BizProjectVO
} from "@/api/system/project/types"
import CreateProject from "./create.vue"
import DetailProject from "./detail.vue"
import AddLogDialog from "./AddLogDialog.vue"
import AddMilestoneDialog from "./AddMilestoneDialog.vue"
import { getTaskCompanySelectOptions } from "@/utils/taskCompany"

type ViewMode = "list" | "create" | "detail"

interface ProjectForm {
	projectName: string
	projectDesc: string
	projectLevel: string | number
	currentStage: string | number
	estimatedAmount?: number
	leadingEnterpriseId: string | number
	collaborativeEnterprises: Array<string | number>
}

type ProjectEditForm = ProjectForm

interface SelectOption {
	label: string
	value: string | number
	elTagType?: string
	elTagClass?: string
}

interface TodoForm {
	title: string
	description: string
	department: string
	priority: string
	status: string
}

interface CoordinationItem extends TodoForm {
	id: string | number
	createTime: string
}

const fallbackLevelOptions: SelectOption[] = [
	{ label: "集团重点", value: "1" },
	{ label: "公司重点", value: "2" },
	{ label: "一般项目", value: "3" }
]

const fallbackStageOptions: SelectOption[] = [
	{ label: "商机跟踪", value: "1" },
	{ label: "项目立项", value: "2" },
	{ label: "建设实施", value: "3" },
	{ label: "交付验收", value: "4" },
	{ label: "运营维护", value: "5" }
]

const fallbackStatusOptions: SelectOption[] = [
	{ label: "待启动", value: "0" },
	{ label: "进行中", value: "1" },
	{ label: "已完成", value: "2" },
	{ label: "已终止", value: "3" }
]

const fallbackTimelineTypeOptions: SelectOption[] = [
	{ label: "进展更新", value: "progress_update" },
	{ label: "存在问题", value: "problem" },
	{ label: "其他", value: "other" }
]

const fallbackMilestoneStatusOptions: SelectOption[] = [
	{ label: "未开始", value: "0" },
	{ label: "进行中", value: "1" },
	{ label: "已完成", value: "2" }
]

const router = useRouter()
const {
	currentView,
	isEditMode,
	currentRow: currentProject,
	clearQueryAndPush,
	handleCreate,
	goBackToList
} = useCrudView<BizProjectVO>()
const loading = ref(false)
const searchHeaderKey = ref(0)
const tableData = ref<BizProjectVO[]>([])
const coordinationItems = ref<CoordinationItem[]>([])

const levelOptions = ref<SelectOption[]>(fallbackLevelOptions)
const stageOptions = ref<SelectOption[]>(fallbackStageOptions)
const statusOptions = ref<SelectOption[]>(fallbackStatusOptions)
const companyOptions = ref<SelectOption[]>([])
const timelineTypeOptions = ref<SelectOption[]>(fallbackTimelineTypeOptions)
const milestoneStatusOptions = ref<SelectOption[]>(fallbackMilestoneStatusOptions)
const logDialogVisible = ref(false)
const milestoneDialogVisible = ref(false)
const currentMilestone = ref<BizProjectMilestoneVO | null>(null)

const queryParams = reactive({
	projectName: "",
	projectLevel: "",
	currentStage: "",
	leadingEnterpriseId: ""
})

const searchFields = computed(() => [
	{ key: "projectName", label: "项目名称", type: "input", placeholder: "请输入项目名称", width: "240px" },
	{
		key: "projectLevel",
		label: "项目级别",
		type: "select",
		placeholder: "全部",
		width: "180px",
		options: levelOptions.value
	},
	{
		key: "currentStage",
		label: "当前阶段",
		type: "select",
		placeholder: "全部",
		width: "180px",
		options: stageOptions.value
	},
	{
		key: "leadingEnterpriseId",
		label: "牵头企业",
		type: "select",
		placeholder: "全部",
		width: "220px",
		options: companyOptions.value
	}
])

const { currentPage, pageSize, total } = usePagination(() => getList(), 10)

onMounted(async () => {
	await getDictData()
	await getList()
})

async function getList() {
	// 拦截无查询权限的请求
	if (!checkPermi(["base:project:query"])) {
		return
	}
	loading.value = true
	try {
		const res = (await listProject({
			pageNum: currentPage.value,
			pageSize: pageSize.value,
			...queryParams
		})) as any
		tableData.value = res.rows || []
		total.value = res.total || 0
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}

async function getDictData() {
	const dictConfigs = [
		{ key: "project_level", target: levelOptions, fallback: fallbackLevelOptions },
		{ key: "project_stage", target: stageOptions, fallback: fallbackStageOptions },
		{ key: "project_status", target: statusOptions, fallback: fallbackStatusOptions },
		{ key: "project_timeline_type", target: timelineTypeOptions, fallback: fallbackTimelineTypeOptions },
		{ key: "project_milestone_status", target: milestoneStatusOptions, fallback: fallbackMilestoneStatusOptions }
	]

	await Promise.all([
		...dictConfigs.map(async (config) => {
			try {
				const res = (await getDicts(config.key)) as any
				const options = mapDictOptions(res.data || [])
				config.target.value = options.length ? options : config.fallback
			} catch (error) {
				console.error(error)
				config.target.value = config.fallback
			}
		}),
		getTaskCompanySelectOptions()
			.then((options) => {
				companyOptions.value = options
			})
			.catch((error) => {
				console.error(error)
				companyOptions.value = []
			})
	])
}

function mapDictOptions(dicts: any[]): SelectOption[] {
	return dicts.map((item) => ({
		label: item.dictLabel,
		value: item.dictValue,
		elTagType: item.listClass,
		elTagClass: item.cssClass
	}))
}

function handleSearch(data: Record<string, any>) {
	queryParams.projectName = data.projectName || ""
	queryParams.projectLevel = data.projectLevel || ""
	queryParams.currentStage = data.currentStage || ""
	queryParams.leadingEnterpriseId = data.leadingEnterpriseId || ""
	reloadFirstPage()
}

function resetQuery() {
	queryParams.projectName = ""
	queryParams.projectLevel = ""
	queryParams.currentStage = ""
	queryParams.leadingEnterpriseId = ""
	searchHeaderKey.value += 1
	reloadFirstPage()
}

function reloadFirstPage() {
	if (currentPage.value === 1) {
		getList()
		return
	}
	currentPage.value = 1
}

async function handleView(row: BizProjectVO) {
	//判断按钮是否有详情权限，如果没有，return
	if (!checkPermi(["base:project:query"])) {
		return
	}
	loading.value = true
	try {
		const res = (await getProject(row.id as string | number)) as any
		currentProject.value = normalizeProject(res.data || row)
		// 获取当前项目的协调事项
		await getCoordinationItems(currentProject.value.projectName)
	} catch (error) {
		console.error(error)
		currentProject.value = normalizeProject(row)
	} finally {
		loading.value = false
		clearQueryAndPush("detail")
	}
}
function normalizeProject(project: BizProjectVO): BizProjectVO {
	return {
		...project,
		timelines: project.timelines || [],
		milestones: project.milestones || []
	}
}

function buildProjectPayload(
	form: {
		projectName: string
		projectDesc: string
		projectLevel: string | number
		currentStage: string | number
		estimatedAmount?: number
		leadingEnterpriseId: string | number
		collaborativeEnterprises?: string | Array<string | number>
	},
	id?: string | number
): BizProjectForm {
	const leadingCompany = companyOptions.value.find((item) => String(item.value) === String(form.leadingEnterpriseId))
	const collaborativeValues = Array.isArray(form.collaborativeEnterprises)
		? form.collaborativeEnterprises
		: splitValues(form.collaborativeEnterprises)
	const collaborativeNames = collaborativeValues
		.map((value) => companyOptions.value.find((item) => String(item.value) === String(value))?.label || "")
		.filter(Boolean)
		.join(",")

	return {
		id,
		projectName: form.projectName,
		projectDesc: form.projectDesc,
		projectLevel: String(form.projectLevel || ""),
		currentStage: String(form.currentStage || ""),
		estimatedAmount: Number(form.estimatedAmount || 0),
		leadingEnterpriseId: form.leadingEnterpriseId,
		leadingEnterpriseName: leadingCompany?.label,
		collaborativeEnterprises: collaborativeValues.join(","),
		collaborativeEnterpriseNames: collaborativeNames
	}
}

async function submitProjectForm(form: ProjectForm) {
	await addProject(buildProjectPayload(form))
	modal.msgSuccess("创建成功")
	goBackToList()
	await getList()
}

async function submitInfoForm(form: ProjectEditForm) {
	await updateProject(buildProjectPayload(form, currentProject.value.id))
	modal.msgSuccess("保存成功")
	await refreshCurrentProject()
	await getList()
}

async function handleAdvanceStage(stage: string | number) {
	if (!currentProject.value.id) return
	await advanceProject(currentProject.value.id, String(stage))
	modal.msgSuccess("阶段已推进")
	await refreshCurrentProject()
	await getList()
}

function openLogDialog() {
	logDialogVisible.value = true
}

async function submitLogForm(form: BizProjectTimelineForm) {
	if (!currentProject.value.id) return
	await addProjectTimeline(currentProject.value.id, form)
	modal.msgSuccess("日志已添加")
	logDialogVisible.value = false
	await refreshCurrentProject()
}

function openMilestoneDialog() {
	currentMilestone.value = null
	milestoneDialogVisible.value = true
}

function handleEditMilestone(milestone: BizProjectMilestoneVO) {
	currentMilestone.value = { ...milestone }
	milestoneDialogVisible.value = true
}

async function submitMilestoneForm(form: BizProjectMilestoneForm) {
	if (!currentProject.value.id) return
	if (currentMilestone.value?.id) {
		await updateProjectMilestone(form)
		modal.msgSuccess("里程碑已更新")
	} else {
		await addProjectMilestone(currentProject.value.id, form)
		modal.msgSuccess("里程碑已添加")
	}
	milestoneDialogVisible.value = false
	await refreshCurrentProject()
}

async function handleCompleteMilestone(milestone: BizProjectMilestoneVO) {
	if (!milestone.id) return
	await updateProjectMilestoneStatus(milestone.id, "2")
	modal.msgSuccess("里程碑已完成")
	await refreshCurrentProject()
}

function handleDeleteMilestone(milestone: BizProjectMilestoneVO) {
	if (!milestone.id) return
	modal.confirm("确定删除该里程碑吗？").then(async () => {
		await delProjectMilestones(milestone.id as string | number)
		modal.msgSuccess("删除成功")
		await refreshCurrentProject()
	})
}

// 打开创建待协调事项页面，跳转到 /synergy/coordinate 新增视图，并携带项目名和牵头企业 ID 作为初始值
function openTodoDialog() {
	router.push({
		path: "/synergy/coordinate",
		query: {
			action: "create",
			projectName: currentProject.value.projectName,
			reportCompany: currentProject.value.leadingEnterpriseId
		}
	})
}

// 根据项目名称从接口查询对应的协调支持事项列表
async function getCoordinationItems(projectName?: string) {
	if (!projectName) {
		coordinationItems.value = []
		return
	}
	try {
		const res = (await listCoordination({
			pageNum: 1,
			pageSize: 100,
			relatedTaskTitle: projectName
		})) as any
		const allItems = res.rows || []

		// 状态编码到状态名称的映射适配
		const getStatusName = (status: string) => {
			const map: Record<string, string> = {
				"0": "待处理",
				"1": "处理中",
				"2": "已解决",
				"3": "未解决"
			}
			return map[status] || status || "待处理"
		}

		// 过滤出当前项目的协调事项并适配前端结构
		coordinationItems.value = allItems
			.filter((item: any) => String(item.relatedTaskTitle).trim() === String(projectName).trim())
			.map((item: any) => ({
				id: item.id,
				title: item.title,
				department: item.reportingEnterpriseName,
				priority: item.priority || "中",
				status: item.statusName || getStatusName(item.status),
				createTime: item.createTime ? item.createTime.split(" ")[0] : "",
				description: item.description
			}))
	} catch (error) {
		console.error("获取协调事项失败:", error)
	}
}

async function refreshCurrentProject() {
	if (!currentProject.value.id) return
	const res = (await getProject(currentProject.value.id)) as any
	currentProject.value = normalizeProject(res.data || {})
	// 刷新时同步重新获取协调事项
	await getCoordinationItems(currentProject.value.projectName)
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
	return getOptionLabel(levelOptions.value, value, fallback)
}

function getStageLabel(value?: string | number, fallback?: string) {
	return getOptionLabel(stageOptions.value, value, fallback)
}

function getStageClass(stage?: string | number) {
	const index = stageOptions.value.findIndex((item) => String(item.value) === String(stage))
	const classes = ["stage-tracking", "stage-init", "stage-build", "stage-accept", "stage-operate"]
	return classes[index] || "stage-tracking"
}

function getStageTagType(stage?: string | number) {
	const option = stageOptions.value.find((item) => String(item.value) === String(stage))
	if (option?.elTagType) return option.elTagType as any

	const index = stageOptions.value.findIndex((item) => String(item.value) === String(stage))
	const types: Array<"info" | "primary" | "success" | "warning"> = ["info", "primary", "success", "warning", "success"]
	return types[index] || "info"
}

function getLevelTagType(level?: string | number) {
	const option = levelOptions.value.find((item) => String(item.value) === String(level))
	if (option?.elTagType) return option.elTagType as any

	const index = levelOptions.value.findIndex((item) => String(item.value) === String(level))
	const types: Array<"danger" | "warning" | "info"> = ["danger", "warning", "info"]
	return types[index] || "info"
}

function formatAmount(amount?: number) {
	return Number(amount || 0).toLocaleString("zh-CN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function formatDate() {
	const date = new Date()
	const pad = (value: number) => String(value).padStart(2, "0")
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// 获取项目级别指示器样式类
function getLevelIndicatorClass(level?: string | number) {
	const levelStr = String(level || "")
	if (levelStr === "1") return "level-group"
	if (levelStr === "2") return "level-company"
	return "level-general"
}

// 映射项目当前阶段到状态类名，以便匹配原型设计的配色 (5个状态：商机跟踪、项目立项、建设实施、交付验收、运营维护)
function getStageStatusClass(stage?: string | number) {
	const stageStr = String(stage || "").trim()

	// 优先使用文字判定以保证绝对准确
	if (stageStr.includes("商机")) return "status-stage-1"
	if (stageStr.includes("立项")) return "status-stage-2"
	if (stageStr.includes("建设") || stageStr.includes("实施")) return "status-stage-3"
	if (stageStr.includes("验收") || stageStr.includes("交付")) return "status-stage-4"
	if (stageStr.includes("运营") || stageStr.includes("维护") || stageStr.includes("管理")) return "status-stage-5"

	// 其次使用码值判定作为兜底 (1: 商机跟踪, 2: 项目立项, 3: 建设实施, 4: 交付验收, 5: 运营维护)
	if (stageStr === "1") return "status-stage-1"
	if (stageStr === "2") return "status-stage-2"
	if (stageStr === "3") return "status-stage-3"
	if (stageStr === "4") return "status-stage-4"
	if (stageStr === "5") return "status-stage-5"

	return "status-stage-1"
}

// 格式化日期字符串为 YYYY-MM-DD 或 YYYY/M/D (移除下午等杂质)
function formatDateString(timeStr?: string) {
	if (!timeStr) return "-"
	const match = timeStr.trim().match(/^(\d{4}[-/]\d{1,2}[-/]\d{1,2})/)
	return match ? match[1] : timeStr.slice(0, 10)
}

// 寻找该项目是否存在未完成且有延迟天数的里程碑
function getDelayMilestone(project: BizProjectVO) {
	if (!project.milestones || project.milestones.length === 0) return null
	return project.milestones.find((m) => String(m.status) !== "2" && Number(m.delayDays) > 0) || null
}
</script>

<style scoped lang="scss">
.tracking-container {
	height: 100%;
	color: #202938;

	&.view-list {
		overflow: hidden;
	}

	&.view-create,
	&.view-detail {
		overflow-y: auto;
	}
}

.list-page {
	height: 100%;
	display: flex;
	flex-direction: column;
	padding: 30px;
	overflow: hidden;
	background: #fff;
	border-radius: 20px;
	box-shadow: 0 8px 24px rgba(23, 43, 77, 0.05);
}

.action-row {
	margin-bottom: 20px;
}

.create-button {
	min-width: 96px;
	height: 34px;
	border-radius: 8px;
}

.project-grid-wrapper {
	flex: 1;
	overflow-y: auto;
	min-height: 0;
}

.project-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
	align-content: start;
	gap: 24px;
	padding: 4px 0;
}

:deep(.priority-card) {
	padding: 24px 20px 20px;
}

.card-header {
	display: flex;
	align-items: flex-start;
	padding-right: 80px;
	margin-bottom: 16px;

	.title-wrap {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
		min-width: 0;
		width: 100%;
	}
}

.priority-indicator {
	font-size: 12px;
	padding: 2px 6px;
	height: 20px;
	border-radius: 4px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	color: var(--el-color-white, #ffffff);

	&.level-group {
		background: linear-gradient(180deg, #9450f8 0%, #bfa2fa 100%);
	}
	&.level-company {
		background: linear-gradient(180deg, #2d8ffc 0%, #477deb 100%);
	}
	&.level-general {
		background: linear-gradient(180deg, #34beff 0%, #68f2fa 100%);
	}
}

.card-title {
	margin: 0;
	color: #202938;
	font-size: 18px;
	line-height: 24px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	width: 100%;
}

.status-tag {
	position: absolute;
	top: 0;
	right: 0;
	z-index: 2;
	width: 100px;
	height: 36.97px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0 0 6px 12px;
	box-sizing: border-box;
	background: url("@/assets/operations/cardTop.png") center / 100% 100% no-repeat;
	font-size: 14px;
	line-height: 1;
	white-space: nowrap;
	pointer-events: none;

	&.status-stage-1 {
		color: #5a4de8;
	}
	&.status-stage-2 {
		color: #ffb975;
	}
	&.status-stage-3 {
		color: #1678ff;
	}
	&.status-stage-4 {
		color: #00b46e;
	}
	&.status-stage-5 {
		color: #8a94a6;
	}
}

.card-info {
	background-color: var(--el-fill-color-blank, #ffffff);
	border: 1px solid var(--el-border-color-lighter, #edf0f5);
	border-radius: 8px;
	padding: 12px 14px;
	margin-bottom: 20px;
	display: flex;
	flex-direction: column;
	gap: 8px;

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 13px;

		.info-label {
			color: #8a94a6;
		}

		.info-value {
			color: #202938;
			max-width: 160px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
}

.card-footer {
	display: flex;
	justify-content: flex-end;
	align-items: center;
	margin-top: auto;
	font-size: 12px;

	.overdue-warning {
		display: flex;
		align-items: center;
		gap: 4px;
		color: var(--el-color-danger, #f53f3f);
		font-weight: 500;
		min-width: 0;
		flex: 1;

		.warning-icon {
			font-size: 14px;
			flex-shrink: 0;
		}

		.warning-text {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			font-size: 12px;
		}
	}

	.deadline-wrap {
		color: #8a94a6;
		flex-shrink: 0;
		white-space: nowrap;

		&.align-right {
			margin-left: auto;
		}

		.deadline-value {
			color: #5d6678;
		}
	}
}

.empty-state {
	grid-column: 1 / -1;
}

.pager-row {
	display: flex;
	justify-content: flex-end;
	flex-shrink: 0;
}
</style>
