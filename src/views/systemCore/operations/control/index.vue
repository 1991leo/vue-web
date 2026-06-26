<template>
	<div class="task-management-container" :class="`view-${currentView}`">
		<!-- 列表视图 -->
		<template v-if="currentView === 'list'">
			<!-- 顶部状态 Tabs 切换（游离在白色大卡片外面，悬浮于页面浅蓝色渐变背景中） -->
			<div class="tabs-header-row">
				<HeaderTabs v-model="activeStatus" :tabs="statusTabs" @change="handleTabChange" />
			</div>

			<!-- 主体大卡片容器（接管白底、大圆角和柔和投影） -->
			<div class="task-main-card">
				<!-- 页面标题与搜索区域 -->
				<div class="title-and-search-panel">
					<div class="title-row-container">
						<PageTitle title="年度重点任务" />
					</div>
					<SearchHeader
						:formItems="searchFields"
						searchButtonText="搜索"
						resetButtonText="重置"
						@form-data-change="handleSearch"
						@form-data-reset="handleReset"
					/>
				</div>

				<!-- 通用满宽分割线组件，左右穿透大卡片的 30px padding -->
				<CommonDivider :offset="30" />

				<!-- 操作按钮区 -->
				<div class="actions-row">
					<el-button type="primary" class="create-btn" v-hasPermi="['base:importantTask:add']" @click="handleCreate">
						<el-icon class="btn-icon"><Plus /></el-icon>
						新建
					</el-button>
				</div>

				<!-- 任务卡片网格 -->
				<div class="task-grid-wrapper" v-loading="loading">
					<div class="task-grid">
						<!-- 使用公共组件，保留高中低优先级背景和悬浮动画 -->
						<PriorityCard
							v-for="task in filteredTasks"
							:key="task.id"
							:priority="task.priority"
							@click="handleView(task)"
						>
							<!-- 卡片头部：优先级前缀与标题，状态角标绝对定位到右上角 -->
							<div class="card-header">
								<div class="title-wrap">
									<span class="priority-indicator" :class="getPriorityClass(task.priority)">
										{{ task.priority }}
									</span>
									<h3 class="card-title" :title="task.title">{{ task.title }}</h3>
								</div>
							</div>
							<span class="status-tag" :class="getStatusClass(task.status)">
								{{ task.status }}
							</span>

							<!-- 描述 -->
							<p class="card-desc" :title="task.desc">{{ task.desc }}</p>

							<!-- 核心详情信息 -->
							<div class="card-info">
								<div class="info-row">
									<span class="info-label">被投企业</span>
									<span class="info-value" :title="task.company">{{ task.company }}</span>
								</div>
								<div class="info-row">
									<span class="info-label">任务部门</span>
									<span class="info-value" :title="task.department">{{ task.department }}</span>
								</div>
								<div class="info-row">
									<span class="info-label">负责人 | 协同负责人</span>
									<span class="info-value">{{ task.leader }} | {{ task.assistant }}</span>
								</div>
							</div>

							<!-- 卡片底部：超期警告与截止日期 -->
							<div class="card-footer">
								<!-- <div class="overdue-warning">
                  <img src="@/assets/operations/error.png" class="warning-icon" alt="逾期" />
                  <span>已逾期，请尽快完成</span>
                </div> -->
								<div class="deadline-wrap" :class="{ 'align-right': !task.overdue }">
									<span class="deadline-label">截止日期：</span>
									<span class="deadline-value">{{ task.deadline }}</span>
								</div>
							</div>

							<!-- hover 三点时展示操作入口，避免误触进入详情。 -->
							<div class="more-action" @click.stop>
								<button class="more-btn" type="button">
									<el-icon><MoreFilled /></el-icon>
								</button>
								<div class="action-popover">
									<button
										class="action-option"
										type="button"
										v-hasPermi="['base:importantTask:edit']"
										@click.stop="handleEdit(task)"
									>
										编辑
									</button>
									<button
										class="action-option delete"
										type="button"
										v-hasPermi="['base:importantTask:remove']"
										@click.stop="handleDelete(task)"
									>
										删除
									</button>
								</div>
							</div>
						</PriorityCard>
					</div>
				</div>

				<!-- 底部分页 -->
				<div class="pagination-footer">
					<!-- 采用统一的成功主题 success 分页，保持高亮背景色与文字颜色一致 -->
					<Pagination
						v-model:current-page="currentPage"
						v-model:page-size="pageSize"
						:total="totalRecords"
						paginationType="success"
					/>
				</div>
			</div>
		</template>

		<!-- 新建与编辑视图，引入封装的公用表单组件，通信采用 camelCase 命名 -->
		<template v-else-if="currentView === 'create'">
			<CreateTask
				:is-edit="isEditMode"
				:row="currentRow"
				:leader-options="leaderOptions"
				:company-options="companyOptions"
				:source-options="sourceOptions"
				:priority-options="priorityOptions"
				:status-options="statusOptions"
				:loading="submitLoading"
				@back="goBackToList"
				@submit="submitForm"
			/>
		</template>

		<!-- 详情视图，引入封装的详情展示组件 -->
		<template v-else>
			<DetailTask :row="currentRow" @back="goBackToList" />
		</template>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { ElSelect, ElDatePicker } from "element-plus"
import modal from "@/plugins/modal"
import { MoreFilled, Plus } from "@element-plus/icons-vue"
import {
	listImportantTask,
	getImportantTaskWithLogs,
	addImportantTask,
	updateImportantTask,
	delImportantTask,
	getImportantTaskStatistics
} from "@/api/system/importantTask"
import type {
	ImportantTaskForm,
	ImportantTaskLogVO,
	ImportantTaskQuery,
	ImportantTaskVO
} from "@/api/system/importantTask/types"
import { getDicts } from "@/api/system/dict/data"
import { listUser } from "@/api/system/user"
import { useDictStore } from "@/store/modules/dict"
import { getTaskCompanySelectOptions } from "@/utils/taskCompany"
import HeaderTabs from "@/components/HeaderTabs/index.vue"
import PageTitle from "@/components/PageTitle/index.vue"
import SearchHeader from "@/components/SearchHeader/index.vue"
import CommonDivider from "@/components/CommonDivider/index.vue"
import Pagination from "@/components/Pagination/index.vue"
import PriorityCard from "@/components/PriorityCard/index.vue"
import { usePagination } from "@/hooks/usePagination"
import { useLoading } from "@/hooks/useLoading"
import { useCrudView } from "@/hooks/useCrudView"
import { addDateRange } from "@/utils/ruoyi"

// 引入拆分后的同级子组件
import CreateTask from "./create.vue"
import DetailTask from "./detail.vue"
import { checkPermi } from "@/utils/permission"

interface SelectOption {
	label: string
	value: string | number
}

// 任务状态与接口编码映射，避免页面展示文案直接耦合后端值
const statusValueMap: Record<string, string> = {
	"0": "未开始",
	"1": "进行中",
	"2": "已完成",
	"3": "延期",
	"4": "异常",
	未开始: "未开始",
	进行中: "进行中",
	已完成: "已完成",
	延期: "延期",
	异常: "异常"
}
const statusCodeMap: Record<string, string> = {
	未开始: "0",
	进行中: "1",
	已完成: "2",
	延期: "3",
	异常: "4"
}
const taskPriorityDictType = "task_priority"
const taskStatusDictType = "task_status"
const taskSourceDictType = "task_source"

// 视图控制相关的响应式状态
const loading = ref(false)
const leaderOptions = ref<SelectOption[]>([])
const companyOptions = ref<SelectOption[]>([])
const sourceOptions = ref<SelectOption[]>([])
const priorityOptions = ref<SelectOption[]>([])
const statusOptions = ref<SelectOption[]>([])
const dictStore = useDictStore()

// 当前选中的重点任务行数据
interface TaskItem {
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
	remark?: string
	createTime?: string
	creator?: string
	overdue?: boolean
	timeline?: Array<{
		time: string
		label: string
		type: string
		user: string
		content: string
	}>
}

const emptyTask = (): TaskItem => ({
	id: "",
	title: "",
	desc: "",
	source: "",
	sourceName: "",
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
	remark: "",
	overdue: false
})

const { currentView, isEditMode, currentRow, clearQueryAndPush, handleCreate, goBackToList } =
	useCrudView<TaskItem>(emptyTask)

// 响应式状态与分页逻辑 Hook 的集成
const activeStatus = ref("all")

const { currentPage, pageSize, total: totalRecords } = usePagination(() => getTaskList(), 20)

const queryParams = ref({
	leader: "" as string | number | "",
	dateRange: null as null | [string, string],
	priority: "",
	source: ""
})

// 集团重点任务统计数据响应式变量
const importantTaskStatistics = ref({
	totalCount: 0,
	notStartedCount: 0,
	inProgressCount: 0,
	completedCount: 0,
	delayedCount: 0,
	exceptionCount: 0
})

// 获取各状态对应的统计数量
const getTabCount = (statusKey: string) => {
	const stats = importantTaskStatistics.value
	if (statusKey === "all") return stats.totalCount || 0
	if (statusKey === "0") return stats.notStartedCount || 0
	if (statusKey === "1") return stats.inProgressCount || 0
	if (statusKey === "2") return stats.completedCount || 0
	if (statusKey === "3") return stats.delayedCount || 0
	if (statusKey === "4") return stats.exceptionCount || 0
	return 0
}

const statusTabs = computed(() => [
	{ label: "全部", name: "all", count: getTabCount("all") },
	...statusOptions.value.map((item) => ({
		label: item.label,
		name: String(item.value),
		count: getTabCount(String(item.value))
	}))
])

// 配置式搜索项定义，通过 SearchHeader 属性驱动
const searchFields = computed(() => [
	{
		key: "leader",
		label: "负责人",
		type: "select",
		placeholder: "请选择负责人",
		width: "160px",
		filterable: true,
		options: leaderOptions.value
	},
	{
		key: "dateRange",
		label: "截止日期",
		type: "daterange",
		width: "240px",
		valueFormat: "YYYY-MM-DD",
		elementAttrs: {
			startPlaceholder: "请选择日期",
			endPlaceholder: "请选择日期"
		}
	},
	{
		key: "priority",
		label: "优先级",
		type: "select",
		placeholder: "全部",
		width: "120px",
		options: priorityOptions.value
	},
	{
		key: "source",
		label: "任务来源",
		type: "select",
		placeholder: "全部",
		width: "140px",
		options: sourceOptions.value
	}
])

// 根据计划完成时间和状态计算超期展示状态
const checkOverdueStatus = (status: string, deadline: string): boolean => {
	if (status === "已完成") return false
	if (!deadline) return false
	const now = new Date()
	const year = now.getFullYear()
	const month = String(now.getMonth() + 1).padStart(2, "0")
	const day = String(now.getDate()).padStart(2, "0")
	const todayStr = `${year}-${month}-${day}`
	return deadline < todayStr
}

const allTasks = ref<TaskItem[]>([])

const formatDate = (value?: string) => {
	return value ? value.slice(0, 10) : ""
}

const normalizeStatusLabel = (status?: string) => statusValueMap[status || ""] || status || ""

const normalizeStatusCode = (status?: string) => {
	if (!status) return ""
	return /^[0-4]$/.test(status) ? status : statusCodeMap[status] || status
}

const getOptionLabel = (options: SelectOption[], value?: string | number) => {
	const matched = options.find((item) => String(item.value) === String(value || ""))
	return matched?.label || String(value || "")
}

const mapLogToTimeline = (logs?: ImportantTaskLogVO[]) => {
	return (logs || []).map((log) => ({
		time: log.operationTime || "",
		user: log.operatorDeptName || "-",
		content: log.logContent || log.logTitle || "-",
		type: mapTimelineType(log.logType, log.logTitle),
		label: log.logTitle || log.logType || "操作记录"
	}))
}

const mapTimelineType = (logType?: string, logTitle?: string) => {
	const title = logTitle || ""
	if (logType === "create" || title.includes("创建")) return "create"
	if (logType === "assign" || logType === "delegate" || title.includes("分配") || title.includes("委派"))
		return "assign"
	if (logType === "progress_update" || title.includes("进度") || title.includes("推进")) return "progress"
	if (logType === "delete" || title.includes("异常") || title.includes("问题") || title.includes("删除"))
		return "problem"
	if (
		logType === "status_change" ||
		logType === "update" ||
		logType === "remark_update" ||
		logType === "attachment_upload" ||
		title.includes("变更")
	) {
		return "statusChange"
	}
	return "progress"
}

const mapTaskToView = (task: ImportantTaskVO): TaskItem => {
	const statusValue = task.taskStatus || ""
	const priorityValue = task.taskPriority || ""
	const status = getOptionLabel(statusOptions.value, statusValue) || normalizeStatusLabel(statusValue)
	const priority = getOptionLabel(priorityOptions.value, priorityValue)
	const deadline = formatDate(task.planEndTime)
	return {
		id: task.id || "",
		title: task.taskTitle || "",
		desc: task.taskDescription || "",
		source: task.taskSource || "",
		sourceName: task.taskSourceName || task.taskSource || "",
		company: task.investedEnterpriseName || task.investedEnterprise || "",
		companyValue: task.investedEnterprise || "",
		department: task.taskDept || "",
		hostDept: task.hostDept || "",
		coDept: task.coDept || "",
		assigneeId: task.assigneeId,
		leader: task.assigneeName || "",
		collaboratorIds: task.collaboratorIds || "",
		assistant: task.collaboratorNames || "",
		deadline,
		status,
		statusValue,
		priority,
		priorityValue,
		deptId: task.deptId,
		deptName: task.deptName,
		remark: task.remark || "",
		createTime: task.createTime,
		creator: task.createBy,
		overdue: checkOverdueStatus(status, deadline),
		timeline: mapLogToTimeline(task.logs)
	}
}

const buildTaskPayload = (formData: TaskItem): ImportantTaskForm => ({
	id: formData.id || undefined,
	taskTitle: formData.title,
	taskDescription: formData.desc,
	taskSource: formData.source,
	investedEnterprise: formData.companyValue || formData.company,
	taskDept: formData.department,
	hostDept: formData.hostDept,
	coDept: formData.coDept,
	assigneeId: formData.assigneeId,
	assigneeName: formData.leader,
	collaboratorIds: formData.collaboratorIds,
	collaboratorNames: formData.assistant,
	taskStatus: formData.statusValue || normalizeStatusCode(formData.status),
	taskPriority: formData.priorityValue || formData.priority,
	planEndTime: formData.deadline ? `${formData.deadline} 00:00:00` : undefined,
	deptId: formData.deptId,
	deptName: formData.deptName,
	remark: formData.remark
})

const buildListQuery = (): ImportantTaskQuery => {
	const query: ImportantTaskQuery = {
		pageNum: currentPage.value,
		pageSize: pageSize.value,
		taskPriority: queryParams.value.priority,
		// 任务来源过滤
		taskSource: queryParams.value.source || undefined,
		// 负责人过滤，传 assigneeId 字段
		assigneeId: queryParams.value.leader || undefined,
		taskStatus: activeStatus.value === "all" ? "" : String(activeStatus.value)
	}
	const dateRange = queryParams.value.dateRange
		? [queryParams.value.dateRange[0] + " 00:00:00", queryParams.value.dateRange[1] + " 23:59:59"]
		: []
	// 参照若依 addDateRange 方法将范围参数塞入 query.params 属性
	addDateRange(query, dateRange)
	return query
}

// 接口列表已完成筛选和分页，前端只负责渲染当前页数据
const filteredTasks = computed(() => allTasks.value)

const reloadFirstPage = () => {
	if (currentPage.value === 1) {
		getTaskList()
		return
	}
	currentPage.value = 1
}

async function getTaskList() {
	loading.value = true
	try {
		const res = (await listImportantTask(buildListQuery())) as any
		allTasks.value = (res.rows || []).map(mapTaskToView)
		totalRecords.value = res.total || 0
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}

async function getOptions() {
	try {
		const [taskCompanyOptions, taskSourceOptions, userRes, taskPriorityOptions, taskStatusOptions] = await Promise.all([
			getTaskCompanySelectOptions(),
			getCachedDictOptions(taskSourceDictType),
			listUser({ pageNum: 1, pageSize: 200 }) as any,
			getCachedDictOptions(taskPriorityDictType),
			getCachedDictOptions(taskStatusDictType)
		])
		companyOptions.value = taskCompanyOptions
		sourceOptions.value = taskSourceOptions
		priorityOptions.value = taskPriorityOptions
		statusOptions.value = taskStatusOptions
		leaderOptions.value = (userRes.rows || userRes.data || []).map((user: any) => ({
			label: user.nickName || user.userName,
			value: user.userId
		}))
	} catch (error) {
		console.error(error)
	}
}

async function getCachedDictOptions(dictType: string): Promise<SelectOption[]> {
	const cachedDict = dictStore.getDict(dictType)
	if (cachedDict) {
		return cachedDict.map((item) => ({
			label: item.label,
			value: item.value
		}))
	}
	const res = await getDicts(dictType)
	const dictOptions = (res.data || []).map((item: any) => ({
		label: item.dictLabel,
		value: item.dictValue,
		elTagType: item.listClass,
		elTagClass: item.cssClass
	}))
	dictStore.setDict(dictType, dictOptions)
	return dictOptions
}

// 获取优先级样式类
const getPriorityClass = (priority: string) => {
	switch (priority) {
		case "高":
			return "priority-high"
		case "中":
			return "priority-medium"
		case "低":
			return "priority-low"
		default:
			return ""
	}
}

// 获取状态样式类
const getStatusClass = (status: string) => {
	switch (status) {
		case "未开始":
			return "status-pending"
		case "进行中":
			return "status-ongoing"
		case "已完成":
			return "status-completed"
		case "延期":
		case "已延期":
		case "逾期":
		case "已逾期":
			return "status-delayed"
		// 异常状态样式暂不启用
		// case '异常':
		//   return 'status-overdue';
		default:
			return ""
	}
}

// 交互操作
const handleTabChange = (val: string | number) => {
	activeStatus.value = String(val)
	reloadFirstPage()
}

const handleSearch = (data: any) => {
	queryParams.value.leader = data.leader || ""
	queryParams.value.dateRange = data.dateRange || null
	queryParams.value.priority = data.priority || ""
	queryParams.value.source = data.source || ""
	reloadFirstPage()
}

const handleReset = (data: any) => {
	queryParams.value.leader = ""
	queryParams.value.dateRange = null
	queryParams.value.priority = ""
	queryParams.value.source = ""
	reloadFirstPage()
}

const handleEdit = (task: TaskItem) => {
	isEditMode.value = true
	currentRow.value = { ...task }
	clearQueryAndPush("create")
}

const handleView = async (task: TaskItem) => {
	if (!checkPermi(["base:importantTask:query"])) {
		return
	}
	if (!task.id) return
	try {
		const res = (await getImportantTaskWithLogs(task.id)) as any
		currentRow.value = mapTaskToView(res.data || res)
		clearQueryAndPush("detail")
	} catch (error) {
		console.error(error)
	}
}

const handleDelete = (task: TaskItem) => {
	if (!task.id) return
	modal
		.confirm(`确定删除任务《${task.title}》吗？`)
		.then(async () => {
			await delImportantTask(task.id)
			modal.msgSuccess("删除成功")
			getTaskList()
			fetchStatistics()
		})
		.catch(() => {})
}

// 提交创建或编辑表单
// 使用 useLoading 包裹重点任务提交逻辑，防重复点击并控制 loading
const { loading: submitLoading, run: submitForm } = useLoading(async (formData: TaskItem) => {
	try {
		const payload = buildTaskPayload(formData)
		if (isEditMode.value) {
			await updateImportantTask(payload)
			modal.msgSuccess("保存成功")
		} else {
			await addImportantTask(payload)
			modal.msgSuccess("创建成功")
		}
		currentView.value = "list"
		getTaskList()
		fetchStatistics()
	} catch (error) {
		console.error(error)
	}
})

// 拉取集团重点任务状态统计
async function fetchStatistics() {
	try {
		const res = await getImportantTaskStatistics()
		if (res.data) {
			importantTaskStatistics.value = res.data
		}
	} catch (error) {
		console.error("获取集团重点任务统计数据失败：", error)
	}
}

onMounted(() => {
	getOptions().finally(() => {
		getTaskList()
		fetchStatistics()
	})
})
</script>

<style scoped lang="scss">
.task-management-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	box-sizing: border-box;
	overflow: hidden;

	&.view-list {
		height: 100%;
		overflow: hidden;
	}

	&.view-create,
	&.view-detail {
		position: relative;
		background: rgba(244, 245, 247, 0);
		overflow-y: auto;
	}
}

// 顶部游离态 Tabs 区域，距离下方白底卡片保持 16px 留白
.tabs-header-row {
	margin-bottom: 16px;
	flex-shrink: 0;
	display: flex;
	justify-content: flex-start;
}

// 白色主卡片，在此处接管白底、大圆角与阴影
.task-main-card {
	background-color: var(--el-bg-color, #ffffff);
	border-radius: 20px;
	padding: 30px;
	flex: 1;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	overflow: hidden;
}

.title-and-search-panel {
	display: flex;
	flex-direction: column;
}

.title-row-container {
	display: flex;
	align-items: center;
}

.actions-row {
	margin-bottom: 18px;
}

.create-btn {
	height: 34px;
	padding: 0 16px;
	border-radius: 8px;
	font-weight: 500;
	display: inline-flex;
	align-items: center;
	gap: 6px;

	.btn-icon {
		font-size: 14px;
	}
}

.task-grid-wrapper {
	flex: 1;
	overflow-y: auto;
	min-height: 0;
}

.task-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
	gap: 24px;
	padding: 4px 0;
}

:deep(.priority-card) {
	overflow: visible;

	&:hover {
		z-index: 6;
	}
}

.card-header {
	display: flex;
	align-items: flex-start;
	padding-right: 100px;
	margin-bottom: 12px;

	.title-wrap {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}
}

.priority-indicator {
	font-size: 14px;
	font-weight: 500;
	width: 24px;
	height: 24px;
	border-radius: 4px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;

	&.priority-high {
		color: var(--el-color-white, #ffffff);
		background: linear-gradient(180deg, #9450f8 0%, #bfa2fa 100%);
	}
	&.priority-medium {
		background: linear-gradient(180deg, #2d8ffc 0%, #477deb 100%);
		color: var(--el-color-white, #ffffff);
	}
	&.priority-low {
		background: linear-gradient(180deg, #34beff 0%, #68f2fa 100%);
		color: var(--el-color-white, #ffffff);
	}
}

.card-title {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
	color: var(--el-text-color-primary, #172b4d);
	line-height: 1.4;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
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
	background: url("@/assets/operations/cardTop.png") center / 100% 100% no-repeat; // 状态角标底图
	font-size: 14px;
	line-height: 1;
	white-space: nowrap;
	pointer-events: none;

	&.status-pending {
		color: #42526e; // 未开始
	}
	&.status-ongoing {
		color: #1678ff; // 进行中
	}
	&.status-completed {
		color: #00b46e; // 已完成
	}
	&.status-delayed {
		color: var(--el-color-danger); // 延期/已延期
	}
	// 异常状态样式暂不启用
	// &.status-overdue {
	//   color: var(--el-color-danger);
	// }
}

.card-desc {
	margin: 0 0 16px 0;
	font-size: 14px;
	line-height: 20px;
	color: var(--el-text-color-secondary, #6b778c);
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	height: 42px;
}

.card-info {
	margin-top: auto;
	padding: 12px 14px;
	background-color: #fff;
	display: flex;
	flex-direction: column;
	gap: 8px;

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 13px;
	}

	.info-label {
		color: var(--el-text-color-secondary, #6b778c);
	}

	.info-value {
		color: var(--el-text-color-primary, #172b4d);
		max-width: 60%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
}

.card-footer {
	margin-top: 16px;
	padding-top: 12px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 12px;
}

.overdue-warning {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	color: var(--el-color-danger, #ff4d4f);
	font-weight: 500;

	.warning-icon {
		width: 12px;
		height: 12px;
		object-fit: contain;
	}
}

.deadline-wrap {
	display: flex;
	align-items: center;
	color: var(--el-text-color-secondary, #8996b0);

	&.align-right {
		margin-left: auto;
	}
}

.deadline-value {
	color: var(--el-text-color-secondary, #6b778c);
	font-weight: 500;
}

.more-action {
	position: absolute;
	left: 20px;
	bottom: 14px;
	z-index: 4;
	width: 32px;
	height: 32px;

	&::after {
		content: "";
		position: absolute;
		left: -12px;
		top: 30px;
		width: 120px;
		height: 16px;
	}

	.more-btn {
		width: 32px;
		height: 32px;
		border: none;
		border-radius: 50%;
		background: #f2f4f8;
		color: #172b4d;
		font-size: 18px;
		font-weight: 700;
		line-height: 20px;
		cursor: pointer;
	}

	.action-popover {
		position: absolute;
		left: -46px;
		top: 44px;
		z-index: 5;
		min-width: 130px;
		padding: 8px 0;
		border-radius: 4px;
		background: #ffffff;
		box-shadow: 0 4px 14px rgba(23, 43, 77, 0.16);
		opacity: 0;
		transform: translateY(-4px);
		pointer-events: none;
		transition:
			opacity 0.18s ease,
			transform 0.18s ease;

		&::before {
			content: "";
			position: absolute;
			left: 58px;
			top: -7px;
			width: 14px;
			height: 14px;
			background: #ffffff;
			transform: rotate(45deg);
			box-shadow: -2px -2px 4px rgba(23, 43, 77, 0.04);
		}
	}

	.action-option {
		position: relative;
		z-index: 1;
		width: 100%;
		height: 32px;
		border: none;
		background: transparent;
		color: #172b4d;
		font-size: 14px;
		text-align: center;
		cursor: pointer;

		&:hover {
			background: #f5f7fa;
		}

		&.delete {
			color: #ff4d4f;

			&:hover {
				background: #fff2f0;
			}
		}
	}

	&:hover {
		.action-popover {
			opacity: 1;
			transform: translateY(0);
			pointer-events: auto;
		}
	}
}
</style>
