<template>
	<div class="container" :class="[`view-${currentView}`]">
		<!-- 列表页视图 -->
		<div v-if="currentView === 'list'" class="list-wrapper">
			<!-- 顶部状态 Tabs 切换 -->
			<div class="tabs-header-row">
				<HeaderTabs v-model="activeStatus" :tabs="statusTabs" @change="handleTabChange" />
			</div>

			<!-- 白色主卡片容器 -->
			<div class="main-card">
				<!-- 页面标题与搜索区域 -->
				<div class="title-and-search-panel">
					<div class="title-row-container">
						<PageTitle title="重点事项跟踪" />
					</div>
					<SearchHeader :form-items="searchFields" @form-data-change="handleSearch" @form-data-reset="handleReset" />
				</div>

				<!-- 满宽分割线 -->
				<CommonDivider :offset="30" />

				<!-- 操作按钮区 -->
				<div class="table-actions">
					<el-button
						type="primary"
						:icon="Plus"
						class="create-btn"
						v-hasPermi="['base:keyTask:add']"
						:loading="preparingForm"
						@click="handleAdd"
					>
						下发任务
					</el-button>
				</div>

				<!-- 任务卡片包装区（自动撑满剩余高度且内部滚动） -->
				<div class="task-list-wrapper" v-loading="loading">
					<!-- 任务卡片列表 -->
					<div v-if="tableData.length > 0" class="task-list">
						<PriorityCard
							v-for="(task, index) in tableData"
							:key="index"
							:priority="getCardThemeSource(task)"
							@click="handleViewDetail(task)"
						>
							<!-- 卡片头部：优先级与级别同排展示 -->
							<div class="card-header">
								<div class="header-tags">
									<span class="priority-indicator" :class="getPriorityClass(task.priorityName)">
										{{ task.priorityName ? task.priorityName.slice(0, 1) : "低" }}
									</span>
									<span class="tag-badge level-tag" :class="getLevelClass(task.taskLevelName, task.priorityName)">
										{{ task.taskLevelName }}
									</span>
								</div>
							</div>

							<!-- 右上角状态角标 -->
							<span class="status-tag" :class="getStatusClass(task.taskStatus)">
								{{ task.taskStatusName }}
							</span>

							<!-- 项目名称与类别标签 -->
							<div class="task-title-row">
								<h3 class="card-title" :title="task.taskTitle">{{ task.taskTitle }}</h3>
								<span class="tag-badge category-tag" :class="getCategoryClass(task.taskCategoryName)">
									{{ task.taskCategoryName }}
								</span>
							</div>

							<!-- 承办单位进度环 -->
							<div class="task-progress-section">
								<div class="progress-title">承办单位执行概况</div>
								<div class="progress-circles">
									<div
										v-for="(progressItem, progressIndex) in getExecutionProgressItems(task)"
										:key="progressIndex"
										class="progress-circle"
										:style="{
											background: `conic-gradient(${getProgressColor(progressIndex)} 0% ${progressItem.value}%, #f2f5fa ${progressItem.value}% 100%)`
										}"
									>
										<span class="value-text">{{ progressItem.value }}</span>
									</div>
								</div>
							</div>

							<!-- 卡片底部 -->
							<div class="task-footer">
								<div class="footer-left">
									<!-- hover 三点时展示编辑入口，避免误触进入详情。 -->
									<div class="more-action" @click.stop>
										<button class="more-btn" type="button">
											<el-icon><MoreFilled /></el-icon>
										</button>
										<div class="edit-popover">
											<button
												class="edit-option"
												type="button"
												link
												v-hasPermi="['base:keyTask:edit']"
												@click.stop="handleEditTask(task)"
											>
												编辑
											</button>
										</div>
									</div>
								</div>
								<div class="footer-right">
									<span class="deadline-text"
										>截止日期：{{ task.planEndTime ? task.planEndTime.slice(0, 10) : "" }}</span
									>
								</div>
							</div>
						</PriorityCard>
					</div>
					<!-- 无数据时的空占位 -->
					<div v-else-if="!loading" class="empty-wrapper">
						<el-empty description="暂无重点事项" :image-size="120" />
					</div>
				</div>

				<!-- 分页组件 -->
				<Pagination
					v-model:current-page="currentPage"
					v-model:page-size="pageSize"
					:total="total"
					paginationType="success"
					style="margin-top: 24px"
				/>
			</div>
		</div>

		<!-- 新建/编辑表单页视图 (抽离出来的单独 Vue 组件) -->
		<CreateView
			v-else-if="currentView === 'create'"
			:is-edit="isEditMode"
			:row="currentRow"
			:source-options="taskSourceOptions"
			:priority-options="taskPriorityOptions"
			:category-options="taskCategoryOptions"
			:level-options="taskLevelOptions"
			:company-options="taskCompanyOptions"
			:leader-options="leaderOptions"
			:loading="submitLoading"
			@back="goBackToList"
			@submit="handleSubmitPublish"
		/>

		<!-- 详情页视图 (抽离出来的单独 Vue 组件) -->
		<DetailView
			v-else-if="currentView === 'detail'"
			:task="currentTask"
			@back="goBackToList"
			@refresh="handleRefreshDetail"
		/>
	</div>
</template>

<script setup lang="ts">
import { ElButton } from "element-plus"
import modal from "@/plugins/modal"
import {
	Document,
	Timer,
	Refresh,
	EditPen,
	Check,
	Plus,
	CircleCheck,
	Switch,
	MoreFilled
} from "@element-plus/icons-vue"

// 引入全局公共组件
import SearchHeader from "@/components/SearchHeader/index.vue"
import CommonDivider from "@/components/CommonDivider/index.vue"
import Pagination from "@/components/Pagination/index.vue"
import HeaderTabs from "@/components/HeaderTabs/index.vue"
import PageTitle from "@/components/PageTitle/index.vue"
import { usePagination } from "@/hooks/usePagination"
import { useLoading } from "@/hooks/useLoading"
import { useRate } from "@/hooks/useRate"

// 引入抽离出来的详情页子组件与表单子组件
import CreateView from "./create.vue"
import DetailView from "./detail.vue"
import PriorityCard from "@/components/PriorityCard/index.vue"

// 引入 API 接口
import { listKeyTask, getKeyTask, addKeyTask, updateKeyTask, getKeyTaskStats } from "@/api/system/keyTask"
import type { KeyTaskVO, KeyTaskQuery, KeyTaskForm } from "@/api/system/keyTask/types"
import { listUser } from "@/api/system/user"
import { getDicts } from "@/api/system/dict/data"
import { useDictStore } from "@/store/modules/dict"
import { useUserStore } from "@/store/modules/user"
import { ref, computed, onMounted, nextTick } from "vue"
import { getTaskCompanySelectOptions } from "@/utils/taskCompany"
import { checkPermi } from "@/utils/permission"

const { normalizeProgressValue } = useRate()

interface SelectOption {
	label: string
	value: string | number
	elTagType?: string
	elTagClass?: string
}

// ==================== 样式类映射函数 ====================
const getPriorityClass = (name?: string) => {
	if (!name) return "low"
	if (name.includes("高")) return "high"
	if (name.includes("中")) return "medium"
	if (name.includes("低")) return "low"
	return "low"
}

const getLevelClass = (name?: string, priorityName?: string) => {
	if (!name) return getPriorityClass(priorityName)
	if (name.includes("集团") || name.includes("省级")) return "high"
	if (name.includes("公司")) return "medium"
	if (name.includes("一般")) return "low"
	return getPriorityClass(priorityName)
}

const getCategoryClass = (name?: string) => {
	return name ? "business" : "empty"
}

const getCardThemeSource = (task: KeyTaskVO) =>
	task.priorityName || task.priority || task.taskLevelName || task.taskLevel || "低"

const getStatusClass = (status?: string) => {
	const map: Record<string, string> = {
		"0": "pending",
		"1": "processing",
		"2": "completed",
		"3": "review", // 延期映射到 review 样式
		"4": "overdue" // 异常映射到 overdue 样式
	}
	return map[status || ""] || "pending"
}

// ==================== 统计状态数据与 Tabs ====================
const activeStatus = ref("all")
const taskStatistics = ref<Record<string, number>>({
	all: 0,
	"0": 0,
	"1": 0,
	"2": 0,
	"3": 0,
	"4": 0
})

const loadStats = async () => {
	try {
		const res = await getKeyTaskStats()
		const statsData = res.data || []

		const stats: Record<string, number> = {
			all: 0,
			"0": 0,
			"1": 0,
			"2": 0,
			"3": 0,
			"4": 0
		}

		let totalCount = 0
		statsData.forEach((item: any) => {
			const status = String(item.status)
			const count = Number(item.count || 0)
			if (status in stats) {
				stats[status] = count
			}
			totalCount += count
		})

		stats.all = totalCount
		taskStatistics.value = stats
	} catch (error) {
		console.error("获取重点事项统计失败:", error)
	}
}

const getTabCount = (statusKey: string) => {
	if (statusKey === "all") return taskStatistics.value.all || 0
	return taskStatistics.value[statusKey] || 0
}

// ==================== 共享字典数据加载 ====================
const dictStore = useDictStore()
const taskSourceOptions = ref<any[]>([])
const taskPriorityOptions = ref<any[]>([])
const taskCategoryOptions = ref<any[]>([])
const taskLevelOptions = ref<any[]>([])
const taskStatusOptions = ref<SelectOption[]>([])
const taskCompanyOptions = ref<any[]>([])
const leaderOptions = ref<any[]>([])
let listDictLoadPromise: Promise<void> | undefined
let formOptionsLoadPromise: Promise<void> | undefined
let leaderLoadPromise: Promise<SelectOption[]> | undefined
const dictLoadPromises = new Map<string, Promise<SelectOption[]>>()

async function getCachedDictOptions(dictType: string): Promise<SelectOption[]> {
	const cachedDict = dictStore.getDict(dictType)
	if (cachedDict) {
		return cachedDict.map((item) => ({
			label: item.label,
			value: item.value,
			elTagType: item.elTagType,
			elTagClass: item.elTagClass
		}))
	}

	const cachedPromise = dictLoadPromises.get(dictType)
	if (cachedPromise) return cachedPromise

	const loadPromise = getDicts(dictType)
		.then((res) => {
			const options = (res.data || []).map((item) => ({
				label: item.dictLabel,
				value: item.dictValue,
				elTagType: item.listClass,
				elTagClass: item.cssClass
			}))
			dictStore.setDict(dictType, options)
			return options
		})
		.finally(() => {
			dictLoadPromises.delete(dictType)
		})

	dictLoadPromises.set(dictType, loadPromise)
	return loadPromise
}

async function loadListDictOptions() {
	if (listDictLoadPromise) return listDictLoadPromise

	listDictLoadPromise = Promise.all([
		getCachedDictOptions("task_priority"),
		getCachedDictOptions("task_category"),
		getCachedDictOptions("project_level"),
		getCachedDictOptions("task_status")
	])
		.then(([priorityOptions, categoryOptions, levelOptions, statusOptions]) => {
			taskPriorityOptions.value = priorityOptions
			taskCategoryOptions.value = categoryOptions
			taskLevelOptions.value = levelOptions
			taskStatusOptions.value = statusOptions
		})
		.catch((error) => {
			listDictLoadPromise = undefined
			console.error("加载列表字典数据失败:", error)
		})

	return listDictLoadPromise
}

async function loadLeaderOptions() {
	if (leaderLoadPromise) return leaderLoadPromise

	leaderLoadPromise = (listUser({ pageNum: 1, pageSize: 200 }) as any)
		.then((userRes: any) => {
			return (userRes.rows || userRes.data?.rows || userRes.data || []).map((user: any) => ({
				label: user.nickName || user.userName,
				value: user.userId
			}))
		})
		.catch((error: unknown) => {
			leaderLoadPromise = undefined
			console.error("加载责任人数据失败:", error)
			return []
		})

	return leaderLoadPromise
}

async function ensureFormOptions() {
	if (formOptionsLoadPromise) return formOptionsLoadPromise

	formOptionsLoadPromise = Promise.all([
		loadListDictOptions(),
		getCachedDictOptions("task_source"),
		getTaskCompanySelectOptions(),
		loadLeaderOptions()
	])
		.then(([, sourceOptions, companyOptions, userOptions]) => {
			taskSourceOptions.value = sourceOptions
			taskCompanyOptions.value = companyOptions
			leaderOptions.value = userOptions
		})
		.catch((error) => {
			formOptionsLoadPromise = undefined
			console.error("加载表单选项数据失败:", error)
		})

	return formOptionsLoadPromise
}

function scheduleAfterRender(task: () => void) {
	nextTick(() => {
		// 首屏列表先渲染，筛选字典和统计异步补齐，降低接口并发对页面打开的影响。
		window.setTimeout(task, 0)
	})
}

const statusTabs = computed(() => [
	{ label: "全部", name: "all", count: getTabCount("all") },
	...taskStatusOptions.value.map((item) => ({
		label: item.label,
		name: String(item.value),
		count: getTabCount(String(item.value))
	}))
])

// ==================== 查询与搜索配置 ====================
const queryParams = ref({
	keyword: "",
	status: "",
	priority: "",
	category: "",
	level: ""
})

// SearchHeader 组件表单项配置 (对接后端共享字典值)
const searchFields = computed(() => [
	{ key: "keyword", label: "任务名称", type: "input", placeholder: "搜索标题", width: "200px" },
	{
		key: "priority",
		label: "优先级",
		type: "select",
		placeholder: "全部优先级",
		width: "135px",
		options: taskPriorityOptions.value
	},
	{
		key: "category",
		label: "类别",
		type: "select",
		placeholder: "全部类别",
		width: "135px",
		options: taskCategoryOptions.value
	},
	{
		key: "level",
		label: "级别",
		type: "select",
		placeholder: "全部级别",
		width: "135px",
		options: taskLevelOptions.value
	}
])

// ==================== 数据列表与分页 ====================
const loading = ref(false)
const tableData = ref<KeyTaskVO[]>([])

const getList = async () => {
	loading.value = true
	try {
		const query: KeyTaskQuery = {
			pageNum: currentPage.value,
			pageSize: pageSize.value,
			taskTitle: queryParams.value.keyword || undefined,
			taskStatus: activeStatus.value === "all" ? undefined : String(activeStatus.value),
			priority: queryParams.value.priority || undefined,
			taskCategory: queryParams.value.category || undefined,
			taskLevel: queryParams.value.level || undefined
		}
		const res = await listKeyTask(query)
		tableData.value = res.rows || []
		total.value = res.total || 0
	} catch (error) {
		console.error("获取重点事项列表失败:", error)
	} finally {
		loading.value = false
	}
}

const { currentPage, pageSize, total } = usePagination(() => getList(), 10)

onMounted(() => {
	getList()
	scheduleAfterRender(() => {
		loadListDictOptions()
		loadStats()
	})
})

const reloadFirstPage = () => {
	if (currentPage.value === 1) {
		getList()
		return
	}
	currentPage.value = 1
}

// ==================== 搜索交互 ====================
const handleSearch = (data: any) => {
	queryParams.value = { ...queryParams.value, ...data }
	reloadFirstPage()
}

const handleReset = () => {
	queryParams.value = {
		keyword: "",
		status: "",
		priority: "",
		category: "",
		level: ""
	}
	reloadFirstPage()
}

const handleTabChange = (val: string | number) => {
	activeStatus.value = String(val)
	reloadFirstPage()
}

// ==================== 承办单位执行概况配色 ====================
const executionProgressColors = ["#3BD398", "#FA9D42", "#FF6161", "#5093F0"]

const getProgressColor = (index: number) => executionProgressColors[index % executionProgressColors.length]

const getExecutionProgressItems = (task: KeyTaskVO) => {
	const progressList = Array.isArray(task.progressList) ? task.progressList : []
	const progressItems = progressList
		.map((item) => normalizeProgressValue(item.currentProgress ?? item.prevProgress))
		.filter((value) => value >= 0)
		.slice(0, executionProgressColors.length)

	// 列表接口未返回多单位进度时，用主进度兜底展示。
	return (progressItems.length ? progressItems : [normalizeProgressValue(task.progress)]).map((value) => ({ value }))
}

// ==================== 视图与控制逻辑 ====================
const currentView = ref<"list" | "create" | "detail">("list")
const currentTask = ref<KeyTaskVO>({})
const isEditMode = ref(false)
const currentRow = ref<KeyTaskVO>({})
const preparingForm = ref(false)
const userStore = useUserStore()

// 详情接口按当前登录人部门返回对应承办单位进度。
const getDetailParams = () => ({
	deptId: userStore.deptId
})

// 查看详情
const handleViewDetail = async (task: KeyTaskVO) => {
	if (!checkPermi(["base:keyTask:query"])) {
		return
	}
	if (!task.id) return
	try {
		const res = await getKeyTask(task.id, getDetailParams())
		currentTask.value = res.data || task
		currentView.value = "detail"
	} catch (error) {
		console.error("获取重点事项详情失败:", error)
	}
}

// 返回列表页
const goBackToList = () => {
	currentView.value = "list"
	getList()
	loadStats()
}

// 进入新建任务表单页
const handleAdd = async () => {
	if (preparingForm.value) return
	preparingForm.value = true
	try {
		await ensureFormOptions()
		isEditMode.value = false
		currentRow.value = {}
		currentView.value = "create"
	} finally {
		preparingForm.value = false
	}
}

// 从列表卡片进入编辑态，优先拉取详情以保证表单回显完整。
const handleEditTask = async (task: KeyTaskVO) => {
	if (!task.id || preparingForm.value) return
	preparingForm.value = true
	try {
		const [res] = await Promise.all([getKeyTask(task.id, getDetailParams()), ensureFormOptions()])
		isEditMode.value = true
		currentRow.value = res.data || { ...task }
		currentView.value = "create"
	} catch (error) {
		console.error("获取重点事项编辑数据失败:", error)
	} finally {
		preparingForm.value = false
	}
}

// 使用 useLoading 包裹重点事项提交逻辑，防重复点击并获取 loading
const { loading: submitLoading, run: handleSubmitPublish } = useLoading(async (formData: any) => {
	const coDeptIds = Array.isArray(formData.coDeptIds) ? formData.coDeptIds.join(",") : formData.coDeptIds
	const taskPayload: KeyTaskForm = {
		id: isEditMode.value ? currentRow.value.id : undefined,
		taskTitle: formData.taskTitle,
		taskSource: formData.taskSource,
		assigneeId: formData.assigneeId,
		assigneeName: formData.assigneeName,
		taskLevel: formData.taskLevel,
		taskCategory: formData.taskCategory,
		priority: formData.priority,
		specialProject: formData.specialProject,
		planStartTime: formData.planStartTime ? formData.planStartTime + " 00:00:00" : undefined,
		planEndTime: formData.planEndTime ? formData.planEndTime + " 23:59:59" : undefined,
		expectedResult: formData.expectedResult,
		taskRequirement: formData.taskRequirement,
		hostDeptId: formData.hostDeptId,
		coDeptIds: coDeptIds,
		taskStatus: isEditMode.value ? currentRow.value.taskStatus : "0",
		progress: isEditMode.value ? currentRow.value.progress : 0
	}

	try {
		if (isEditMode.value) {
			await updateKeyTask(taskPayload)
			modal.msgSuccess("任务已成功更新")
		} else {
			await addKeyTask(taskPayload)
			modal.msgSuccess("任务已成功提交下发")
		}
		goBackToList()
	} catch (error) {
		console.error("提交重点事项失败:", error)
	}
})

// 详情页内部触发的刷新逻辑
const handleRefreshDetail = async () => {
	if (!currentTask.value?.id) return
	try {
		const res = await getKeyTask(currentTask.value.id, getDetailParams())
		currentTask.value = res.data || currentTask.value
	} catch (error) {
		console.error("刷新重点事项详情失败:", error)
	}
}
</script>

<style scoped lang="scss">
/* 设计变量 */
$primary-color: var(--el-color-primary, #00b46e);
$primary-hover: #4f77ff;
$success-color: var(--el-color-success, #2ecb73);
$warning-color: var(--el-color-warning, #ff9f1a);
$danger-color: var(--el-color-danger, #ff4d4f);
$text-dark: #1a1e2d;
$text-gray: #687182;
$text-light: #8a90a8;
$border-color: rgba(228, 231, 237, 0.7);
$card-shadow: 0 8px 24px rgba(166, 179, 194, 0.08);
$card-shadow-hover: 0 16px 36px rgba(59, 91, 235, 0.08);

.container {
	height: 100%;
	overflow: hidden;
	box-sizing: border-box;

	&.view-list {
		height: 100%;
		overflow: hidden;
	}

	&.view-create {
		overflow-y: auto;
		box-sizing: border-box;
	}

	&.view-detail {
		overflow-y: auto;
		box-sizing: border-box;
	}
}

.list-wrapper {
	display: flex;
	flex-direction: column;
	height: 100%;
}

// 顶部游离态 Tabs 区域，距离下方白底卡片保持 16px 留白
.tabs-header-row {
	margin-bottom: 16px;
	flex-shrink: 0;
	display: flex;
	justify-content: flex-start;
}

.title-and-search-panel {
	display: flex;
	flex-direction: column;
}

.title-row-container {
	display: flex;
	align-items: center;
	margin-bottom: 16px;
}

/* ==================== 白色主卡片 ==================== */
.main-card {
	background: #ffffff;
	border-radius: 20px;
	padding: 30px;
	box-shadow: $card-shadow;
	border: 1px solid rgba(255, 255, 255, 0.6);
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.table-actions {
	display: flex;
	margin-bottom: 20px;
	flex-shrink: 0;

	.create-btn {
		height: 38px;
		border-radius: 8px;
		font-weight: 600;
		padding: 0 20px;
	}
}

/* ==================== 任务卡片包装区与列表 ==================== */
.task-list-wrapper {
	flex: 1;
	overflow-y: auto;
	min-height: 0;
}

.task-list {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
	gap: 24px;
	padding: 4px 0;

	:deep(.priority-card) {
		gap: 8px;
		overflow: visible;

		&:hover {
			z-index: 6;
		}

		.card-header {
			display: flex;
			align-items: flex-start;
			padding-right: 80px;
			margin-bottom: 10px;

			.header-tags {
				display: flex;
				align-items: center;
				gap: 8px;
				min-width: 0;
			}
		}

		.priority-indicator {
			font-size: 13px;
			font-weight: 600;
			width: 24px;
			height: 24px;
			border-radius: 4px;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;

			&.high {
				color: var(--el-color-white, #ffffff);
				background: linear-gradient(180deg, #9450f8 0%, #bfa2fa 100%);
			}
			&.medium {
				background: linear-gradient(180deg, #2d8ffc 0%, #477deb 100%);
				color: var(--el-color-white, #ffffff);
			}
			&.low {
				background: linear-gradient(180deg, #34beff 0%, #68f2fa 100%);
				color: var(--el-color-white, #ffffff);
			}
		}

		.tag-badge {
			font-size: 13px;
			font-weight: 600;
			padding: 2px 8px;
			border-radius: 4px;
			border: 1px solid transparent;
			white-space: nowrap;
		}

		/* 级别跟随优先级高中低主题色 */
		.level-tag.high {
			background-color: #f0e7ff;
			color: #9450f8;
			border-color: #e0ccff;
		}
		.level-tag.medium {
			background-color: #e5f1ff;
			color: #2d8ffc;
			border-color: #cbe2ff;
		}
		.level-tag.low {
			background-color: #e8fbff;
			color: #34beff;
			border-color: #c9f6ff;
		}

		.card-title {
			margin: 0;
			font-size: 16px;
			font-weight: 700;
			color: $text-dark;
			line-height: 1.4;
			letter-spacing: 0.2px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
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

			&.pending {
				color: #42526e;
			}
			&.processing {
				color: #1678ff;
			}
			&.completed {
				color: #00b46e;
			}
			&.review {
				color: var(--el-color-danger, #ff4d4f);
			}
			&.overdue {
				color: var(--el-color-danger, #ff4d4f);
			}
		}

		.task-title-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 12px;
			margin-bottom: 12px;

			.card-title {
				min-width: 0;
			}

			/* 类别统一使用业务绿色标签 */
			.category-tag {
				flex-shrink: 0;

				&.business {
					background-color: rgba(59, 211, 152, 0.12);
					color: #00b46e;
					border-color: transparent;
				}
				&.empty {
					background-color: #f5f6fa;
					color: #8a94a6;
					border-color: transparent;
				}
			}
		}

		/* 承办单位执行进度 */
		.task-progress-section {
			margin: 4px 0;

			.progress-title {
				font-size: 12px;
				color: $text-light;
				font-weight: 500;
				margin-bottom: 10px;
			}

			.progress-circles {
				display: flex;
				width: 100%;
				height: 68px;
				gap: 18px;
				align-items: center;
				padding: 0 20px;
				flex-wrap: wrap;
				border-radius: 8px;
				background: #ffffff;
				box-sizing: border-box;

				/* 纯 CSS conic-gradient 高端环形进度 */
				.progress-circle {
					position: relative;
					width: 38px;
					height: 38px;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 11px;
					font-weight: 700;
					color: $text-dark;
					box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.02);

					&::before {
						content: "";
						position: absolute;
						width: 30px;
						height: 30px;
						border-radius: 50%;
						background: #ffffff;
						z-index: 1;
						box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
					}

					.value-text {
						position: relative;
						z-index: 2;
					}
				}
			}
		}

		/* 卡片底部 */
		.task-footer {
			margin-top: auto;
			padding-top: 12px;
			border-top: 1px solid $border-color;
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 12px;
			color: $text-light;

			.footer-left {
				font-weight: 500;
			}

			.footer-center {
				.status-text-badge {
					font-size: 11px;
					font-weight: 600;
					padding: 2px 8px;
					border-radius: 4px;

					&.pending {
						background-color: #f0f2f5;
						color: $text-gray;
					}
					&.processing {
						background-color: #e8eeff;
						color: $primary-color;
					}
					&.review {
						background-color: #fff9e6;
						color: $warning-color;
					}
					&.completed {
						background-color: #eafcf1;
						color: $success-color;
					}
				}
			}

			.deadline-text {
				font-size: 11px;
			}
		}

		.more-action {
			position: relative;
			z-index: 4;
			width: 32px;
			height: 32px;

			&::after {
				content: "";
				position: absolute;
				left: -12px;
				top: 30px;
				width: 100px;
				height: 16px;
			}

			.more-btn {
				width: 32px;
				height: 32px;
				border: none;
				border-radius: 50%;
				background: #f2f4f8;
				color: #172b4d;
				font-size: 16px;
				cursor: pointer;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.edit-popover {
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

			.edit-option {
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
			}

			&:hover {
				.edit-popover {
					opacity: 1;
					transform: translateY(0);
					pointer-events: auto;
				}
			}
		}
	}
}

.empty-wrapper {
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	background: #ffffff;
}

/* ==================== 动画定义 ==================== */
@keyframes pulse {
	0% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.4);
	}
	70% {
		transform: scale(1);
		box-shadow: 0 0 0 6px rgba(255, 77, 79, 0);
	}
	100% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(255, 77, 79, 0);
	}
}
</style>
