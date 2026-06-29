<template>
	<div class="dept-task-page">
		<TaskCreateCard
			v-if="isFormMode"
			v-loading="formDetailLoading"
			:mode="formMode"
			:initial-form="currentFormData"
			:header-title="formCardTitle"
			:header-desc="formCardDesc"
			:user-options="userOptions"
			:category-options="taskCategoryOptions"
			:priority-options="taskPriorityOptions"
			:status-options="taskStatusOptions"
			:type-options="taskTypeOptions"
			:loading="submitLoading"
			@back="closeFormPage"
			@submit="handleFormSubmit"
		/>

		<template v-else>
			<!-- 采用统一的 HeaderTabs 公共组件 -->
			<div class="tabs-header-row">
				<HeaderTabs v-model="currentStatus" :tabs="tabItems" @change="handleStatusChange" />
			</div>
			<div class="dept-task-panel">
				<div class="title-and-search-panel">
					<div class="title-row-container">
						<PageTitle :title="pageTitle" />
					</div>
					<SearchHeader
						:formItems="searchHeaderItems"
						searchButtonText="搜索"
						resetButtonText="重置"
						@form-data-change="onSearch"
						@form-data-reset="onReset"
					/>
				</div>
				<CommonDivider :offset="30" />

				<div class="dept-task-toolbar">
					<el-button type="primary" :icon="Plus" @click="openCreatePage" v-hasPermi="['base:deptTask:add']">
						新建</el-button
					>
				</div>

				<div class="dept-task-table-wrapper" v-loading="loading">
					<CommonTable :columns="tableColumns" :data="allTasks" :showIndexColumn="true" maxHeight="100%">
						<template #taskInfo="{ row }">
							<div class="task-info-cell">
								<div class="task-info-cell__title">
									<span>{{ row.taskTitle }}</span>
									<el-tooltip
										v-if="checkOverdue(row.planEndTime) && row.taskStatusName !== '已完成'"
										content="该任务已逾期，请尽快处理"
										placement="top"
									>
										<span class="task-info-cell__warning">逾期</span>
									</el-tooltip>
								</div>
								<div class="task-info-cell__desc">
									{{ getDisplayText(row.taskDescription, "-") }}
								</div>
							</div>
						</template>

						<template #priority="{ row }">
							<span class="priority-badge" :class="getPriorityClassName(row.taskPriorityName)">
								<i class="priority-badge__dot"></i>
								<span>{{ getDisplayText(row.taskPriorityName, "-") }}</span>
							</span>
						</template>

						<template #assignee="{ row }">
							<div v-if="hasDisplayName(row.assigneeName)" class="person-cell">
								<span class="person-avatar" :style="{ background: getPersonAvatarColor(row.assigneeName) }">
									{{ getPersonInitial(row.assigneeName) }}
								</span>
								<span class="person-cell__name">{{ row.assigneeName }}</span>
							</div>
							<span v-else class="table-text">-</span>
						</template>

						<template #helpers="{ row }">
							<div v-if="getCollaboratorList(row.collaboratorNames).length > 0" class="helper-list">
								<el-tooltip
									v-for="helper in getCollaboratorList(row.collaboratorNames)"
									:key="helper"
									:content="helper"
									placement="top"
								>
									<span class="person-avatar helper-avatar" :style="{ background: getPersonAvatarColor(helper) }">
										{{ getPersonInitial(helper) }}
									</span>
								</el-tooltip>
							</div>
							<span v-else class="table-text">-</span>
						</template>

						<template #operation="{ row }">
							<div class="table-actions">
								<el-button link type="primary" @click="openEditPage(row)" v-hasPermi="['base:deptTask:edit']">
									编辑
								</el-button>
								<el-button link type="danger" @click="handleDelete(row)" v-hasPermi="['base:deptTask:remove']">
									删除
								</el-button>
							</div>
						</template>
					</CommonTable>
				</div>

				<div class="dept-task-pagination">
					<Pagination
						v-show="total > 0"
						v-model:current-page="currentPage"
						v-model:page-size="pageSize"
						:total="total"
						paginationType="success"
						@pagination="handlePagination"
					/>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import {
	addDeptTask,
	deleteDeptTask,
	getDeptTaskDetail,
	getDeptTaskList,
	getDeptTaskStatistics,
	updateDeptTask
} from "@/api/management"
import type { DeptTaskCreateData, DeptTaskListQuery, DeptTaskRow, DeptTaskStatisticsData } from "@/api/management/types"
import { listUser } from "@/api/system/user"
import type { UserQuery, UserVO } from "@/api/system/user/types"
import Pagination from "@/components/Pagination/index.vue"
import SearchHeader from "@/components/SearchHeader/index.vue"
import CommonDivider from "@/components/CommonDivider/index.vue"
import PageTitle from "@/components/PageTitle/index.vue"
import { useLoading } from "@/hooks/useLoading"
import { addDateRange } from "@/utils/ruoyi"

import CommonTable from "@/components/CommonTable/index.vue"
import { Plus } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import type { ComponentInternalInstance } from "vue"
import { computed, getCurrentInstance, onMounted, ref, toRefs, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import TaskCreateCard from "./components/TaskCreateCard.vue"
import HeaderTabs from "@/components/HeaderTabs/index.vue"
import {
	buildDeptTaskSearchItemOptions,
	createDeptTaskFormData,
	createDeptTaskSearchForm,
	createDeptTaskSearchItems,
	createDeptTaskStatisticsData,
	createDeptTaskStatusOptions,
	deptTaskTableColumns,
	getDeptTaskStatusCount,
	statusTabs,
	type DeptTaskFormData,
	type DeptTaskSearchForm
} from "./config"

const { proxy } = getCurrentInstance() as ComponentInternalInstance
const { task_category_type, task_type, task_priority } = toRefs<any>(
	proxy?.useDict("task_category_type", "task_type", "task_priority")
)

const route = useRoute()
const router = useRouter()
const USER_QUERY_DEPT_ID = "420000"
const allTasks = ref<DeptTaskRow[]>([])
const userOptions = ref<Array<{ label: string; value: string | number }>>([])
const deptTaskStatistics = ref<DeptTaskStatisticsData>(createDeptTaskStatisticsData())
const currentStatus = ref("all")
const currentPage = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const total = ref(0)
const formDetailLoading = ref(false)
const editingTaskDetail = ref<DeptTaskRow | null>(null)
const searchFormItems = ref(createDeptTaskSearchItems())
const searchFormData = ref<DeptTaskSearchForm>(createDeptTaskSearchForm())

const tableColumns = deptTaskTableColumns
const taskCategoryOptions = computed<DictDataOption[]>(() =>
	Array.isArray(task_category_type.value) ? task_category_type.value : []
)
const taskTypeOptions = computed<DictDataOption[]>(() => (Array.isArray(task_type.value) ? task_type.value : []))
const taskPriorityOptions = computed<DictDataOption[]>(() =>
	Array.isArray(task_priority.value) ? task_priority.value : []
)
const taskStatusOptions = createDeptTaskStatusOptions()

const pageTitle = computed(() => {
	const metaTitle = route.meta.title
	if (typeof metaTitle === "string" && metaTitle.trim() !== "") {
		return metaTitle
	}
	return "部门任务"
})

const getQueryString = (value: unknown) => {
	if (typeof value === "string") return value
	if (Array.isArray(value) && typeof value[0] === "string") return value[0]
	return ""
}

const formMode = computed<"create" | "edit">(() => (getQueryString(route.query.mode) === "edit" ? "edit" : "create"))
const isFormMode = computed(() => {
	const mode = getQueryString(route.query.mode)
	return mode === "create" || mode === "edit"
})
const formTaskId = computed(() => {
	const idText = getQueryString(route.query.id)
	return idText
})

const getMatchedAssigneeValue = (assigneeId: string | number | null | undefined) => {
	if (isEmpty(assigneeId)) return undefined
	const matchedOption = userOptions.value.find((item) => String(item.value) === String(assigneeId))
	return matchedOption ? matchedOption.value : assigneeId
}

const currentFormData = computed<DeptTaskFormData | null>(() => {
	if (formMode.value === "edit") {
		const task = editingTaskDetail.value ?? allTasks.value.find((item) => String(item.id) === formTaskId.value) ?? null
		if (!task) return null
		const matchedAssigneeValue = getMatchedAssigneeValue(task.assigneeId)
		const matchedAssignee = userOptions.value.find((item) => item.value === matchedAssigneeValue)
		return {
			...createDeptTaskFormData(),
			...task,
			taskTitle: task.taskTitle || "",
			taskDescription: task.taskDescription || "",
			collaboratorNames: task.collaboratorNames || "",
			taskCategory: task.taskCategory || "",
			taskPlanType: task.taskPlanType || "",
			taskPriority: task.taskPriority || "",
			planStartTime: task.planStartTime || "",
			planEndTime: task.planEndTime || "",
			assigneeId: matchedAssigneeValue,
			assigneeName: matchedAssignee ? matchedAssignee.label : task.assigneeName
		}
	}
	return createDeptTaskFormData()
})
const formCardTitle = computed(() => `${formMode.value === "edit" ? "编辑" : "创建"}${pageTitle.value}`)
const formCardDesc = computed(() => {
	if (formMode.value === "edit") {
		return `修改基础信息，保存后同步更新${pageTitle.value}列表`
	}
	return `填写基础信息，创建后可在${pageTitle.value}列表查看`
})

const paginationData = computed(() => ({
	pageNum: currentPage.value,
	pageSize: pageSize.value,
	total: total.value
}))

const tabItems = computed(() =>
	statusTabs.map((item) => ({
		...item,
		name: item.key,
		count: getDeptTaskStatusCount(deptTaskStatistics.value, item.key)
	}))
)
const searchHeaderItems = computed(() =>
	searchFormItems.value.map((item) => ({
		...item,
		value: searchFormData.value[item.key as keyof DeptTaskSearchForm] ?? null
	}))
)

const syncSearchDictOptions = () => {
	buildDeptTaskSearchItemOptions(searchFormItems.value, {
		assigneeId: userOptions.value,
		taskCategory: taskCategoryOptions.value,
		taskPriority: taskPriorityOptions.value
	})
}

const buildDeptTaskListQuery = (): DeptTaskListQuery => {
	const query: DeptTaskListQuery = {
		pageNum: currentPage.value,
		pageSize: pageSize.value
	}

	if (searchFormData.value.assigneeId !== null) {
		query.assigneeId = searchFormData.value.assigneeId
	}

	if (searchFormData.value.taskPriority !== null) {
		query.taskPriority = searchFormData.value.taskPriority
	}

	if (searchFormData.value.taskCategory !== null) {
		query.taskCategory = searchFormData.value.taskCategory
	}

	const dateRange =
		Array.isArray(searchFormData.value.planEndTimeRange) && searchFormData.value.planEndTimeRange.length === 2
			? [searchFormData.value.planEndTimeRange[0] + " 00:00:00", searchFormData.value.planEndTimeRange[1] + " 23:59:59"]
			: []

	if (currentStatus.value !== "all") {
		query.taskStatus = currentStatus.value
	}

	addDateRange(query, dateRange)
	return query
}

const getList = async () => {
	loading.value = true
	try {
		const res = await getDeptTaskList(buildDeptTaskListQuery())
		allTasks.value = Array.isArray(res.rows) ? res.rows : []
		total.value = typeof res.total === "number" ? res.total : 0
	} finally {
		loading.value = false
	}
}

const getStatistics = async () => {
	const res = await getDeptTaskStatistics()
	if (res.data && typeof res.data === "object") {
		deptTaskStatistics.value = res.data
		return
	}
	deptTaskStatistics.value = createDeptTaskStatisticsData()
}

const refreshDeptTaskData = async () => {
	await Promise.allSettled([getList(), getStatistics()])
}

const getUserOptions = async () => {
	const query: UserQuery = {
		pageNum: 1,
		pageSize: 100,
		deptId: USER_QUERY_DEPT_ID
	}
	const res = await listUser(query)
	const rows = Array.isArray(res.rows) ? res.rows : []
	userOptions.value = rows.map((item: UserVO) => ({
		label: item.nickName,
		value: item.userId
	}))
}

const loadEditTaskDetail = async () => {
	if (formMode.value !== "edit" || formTaskId.value === "") {
		editingTaskDetail.value = null
		return
	}

	formDetailLoading.value = true
	try {
		const res = await getDeptTaskDetail(formTaskId.value)
		editingTaskDetail.value = res.data || null
	} finally {
		formDetailLoading.value = false
	}
}

const getDisplayText = (value: string | null | undefined, emptyText = "-") =>
	typeof value === "string" && value !== "" ? value : emptyText
const hasDisplayName = (value: string | null | undefined) => typeof value === "string" && value.trim() !== ""
const getPersonInitial = (value: string | null | undefined) => {
	if (!hasDisplayName(value)) return "-"
	return value!.trim().charAt(0)
}
const getCollaboratorList = (value: string | null | undefined) => {
	if (!hasDisplayName(value)) return []
	return value!
		.split(/[，,]/)
		.map((item) => item.trim())
		.filter((item) => item !== "")
}
const getPersonAvatarColor = (name: string | null | undefined) => {
	const palette = ["#00b46e", "#3d7eff", "#ff8a00", "#f53f3f", "#7a5af8"]
	if (!hasDisplayName(name)) return "#c9cdd4"
	const seed = name!
		.trim()
		.split("")
		.reduce((total, char) => total + char.charCodeAt(0), 0)
	return palette[seed % palette.length]
}
const getPriorityClassName = (priority: string | null | undefined) => {
	if (priority === "高") return "is-high"
	if (priority === "中") return "is-medium"
	if (priority === "低") return "is-low"
	return "is-default"
}
const checkOverdue = (dateText: string | null | undefined) => {
	if (typeof dateText !== "string" || dateText === "") return false
	return new Date(dateText).getTime() < Date.now()
}

const handleStatusChange = async (value: string) => {
	currentStatus.value = value
	currentPage.value = 1
	await getList()
}

const applySearchForm = async (formDataValue: DeptTaskSearchForm) => {
	searchFormData.value = { ...formDataValue }
	currentPage.value = 1
	await getList()
}

const onSearch = (formDataValue: DeptTaskSearchForm) => applySearchForm(formDataValue)
const onReset = (formDataValue: DeptTaskSearchForm) => applySearchForm(formDataValue)

const handleSortChange = () => undefined

const handlePagination = async (data: { page: number; limit: number }) => {
	currentPage.value = data.page
	pageSize.value = data.limit
	await getList()
}

const pushFormRoute = (mode?: "create" | "edit", id?: string | number) => {
	const nextQuery = { ...route.query }
	if (!mode) {
		delete nextQuery.mode
		delete nextQuery.id
	} else {
		nextQuery.mode = mode
		nextQuery.id = String(id)
	}

	return router.push({
		path: route.path,
		query: nextQuery
	})
}

const openCreatePage = () => {
	pushFormRoute("create")
}

const closeFormPage = () => {
	pushFormRoute()
}

const openEditPage = (row: DeptTaskRow) => {
	pushFormRoute("edit", row.id)
}

const buildSubmitPayload = (data: DeptTaskFormData): DeptTaskCreateData => ({
	id: data.id,
	taskTitle: data.taskTitle,
	taskDescription: data.taskDescription,
	assigneeId: data.assigneeId,
	assigneeName: data.assigneeName,
	collaboratorIds: data.collaboratorIds,
	collaboratorNames: data.collaboratorNames,
	taskCategory: data.taskCategory,
	taskPlanType: data.taskPlanType,
	taskStatus: data.taskStatus || "0",
	taskPriority: data.taskPriority,
	planStartTime: data.planStartTime,
	planEndTime: data.planEndTime,
	remark: data.remark
})

// 使用 useLoading 包裹部门任务提交逻辑，防重复点击并控制 loading
const { loading: submitLoading, run: handleFormSubmit } = useLoading(async (data: DeptTaskFormData) => {
	if (formMode.value === "edit") {
		await updateDeptTask(buildSubmitPayload(data))
		ElMessage.success("任务编辑成功")
	} else {
		await addDeptTask(buildSubmitPayload(data))
		ElMessage.success("任务创建成功")
		currentPage.value = 1
	}

	await refreshDeptTaskData()
	closeFormPage()
})

const handleDelete = (row: DeptTaskRow) => {
	ElMessageBox.confirm("确定要删除该任务吗？删除后无法恢复！", "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning"
	})
		.then(async () => {
			await deleteDeptTask(row.id)
			ElMessage.success(`任务“${row.taskTitle}”已成功删除`)
			if (allTasks.value.length === 1 && currentPage.value > 1) {
				currentPage.value -= 1
			}
			await refreshDeptTaskData()
		})
		.catch(() => undefined)
}

watch(
	[taskCategoryOptions, taskPriorityOptions, userOptions],
	() => {
		syncSearchDictOptions()
	},
	{ immediate: true }
)

watch(
	[formMode, formTaskId],
	() => {
		loadEditTaskDetail()
	},
	{ immediate: true }
)

onMounted(() => {
	syncSearchDictOptions()
	getUserOptions()
	refreshDeptTaskData()
})
</script>

<style scoped lang="scss">
.dept-task-page {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	box-sizing: border-box;
	overflow: hidden;
}

// 顶部游离态 Tabs 区域，距离下方白底卡片保持 16px 留白
.tabs-header-row {
	margin-bottom: 16px;
	flex-shrink: 0;
	display: flex;
	justify-content: flex-start;
}

.dept-task-panel {
	display: flex;
	flex-direction: column;
	flex: 1;
	min-height: 0;
	padding: 30px;
	box-sizing: border-box;
	border-radius: 20px;
	background: #fff;
	overflow: hidden;
}

.title-and-search-panel {
	display: flex;
	flex-direction: column;
	flex-shrink: 0;
}

.title-row-container {
	display: flex;
	align-items: center;
}

.dept-task-toolbar {
	display: flex;
	justify-content: flex-start;
	flex-shrink: 0;
	margin-bottom: 18px;
}

.dept-task-table-wrapper {
	flex: 1;
	min-height: 0;
	overflow: hidden;
	margin-bottom: 20px;

	:deep(.el-table) {
		height: 100%;
	}
}

// 分页固定在白底卡片底部，避免绝对定位脱离面板背景
.dept-task-pagination {
	display: flex;
	justify-content: flex-end;
	flex-shrink: 0;
}

.task-info-cell {
	display: flex;
	flex-direction: column;
}

.task-info-cell__title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;
	color: #172b4d;
}

.task-info-cell__warning {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 22px;
	padding: 0 8px;
	border-radius: 999px;
	background: rgba(245, 63, 63, 0.1);
	color: #f53f3f;
	font-size: 12px;
	font-weight: 500;
}

.task-info-cell__desc {
	color: #86909c;
}

.table-text {
	color: #4e5969;
	font-weight: 500;
}

.priority-badge {
	display: inline-flex;
	align-items: center;
	gap: 0.375rem;
	height: 1.5rem;
	padding: 0 0.5rem;
	border-radius: 999px;
	font-size: 0.75rem;
	font-weight: 600;
	line-height: 1;
}

.priority-badge__dot {
	width: 4px;
	height: 4px;
	border-radius: 50%;
	background: currentColor;
	flex: 0 0 auto;
}

.priority-badge.is-high {
	background: rgba(245, 63, 63, 0.08);
	color: #f53f3f;
}

.priority-badge.is-medium {
	background: rgba(255, 125, 0, 0.1);
	color: #ff7d00;
}

.priority-badge.is-low {
	background: rgba(22, 119, 255, 0.08);
	color: #1677ff;
}

.priority-badge.is-default {
	background: rgba(144, 147, 153, 0.1);
	color: #909399;
}

.person-cell {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
}

.person-cell__name {
	color: #172b4d;
	font-size: 0.875rem;
	font-weight: 500;
	line-height: 1;
}

.person-avatar {
	display: inline-flex;
	width: 1.8rem;
	height: 1.8rem;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	color: #ffffff;
	font-size: 0.75rem;
	font-weight: 600;
	line-height: 1;
	flex: 0 0 1.8rem;
}

.helper-list {
	display: inline-flex;
	align-items: center;
	flex-wrap: nowrap;
}

.helper-avatar {
	box-sizing: border-box;
	border: 2px solid #ffffff;
	cursor: pointer;
}

.helper-list :deep(.helper-avatar:not(:first-child)) {
	margin-left: -4px;
}

.table-muted {
	color: #c9cdd4;
}

.table-date {
	color: #4e5969;
}

.table-date--warning {
	color: #f53f3f;
	font-weight: 600;
}

.task-status {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 0;
	border: none;
	background: transparent;
	cursor: pointer;
	font: inherit;
}

.task-status:hover {
	opacity: 0.88;
}

.table-actions {
	display: inline-flex;
	align-items: center;
	gap: 12px;
}

.log-card {
	border: 1px solid #edf3ef;
	border-radius: 14px;
}

.log-card__header {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 8px;
}

.log-card__operator {
	display: inline-flex;
	align-items: center;
	height: 26px;
	padding: 0 10px;
	border-radius: 999px;
	background: #f2f5f3;
	color: #1f2329;
	font-size: 12px;
	font-weight: 600;
}

.log-card__action {
	display: inline-flex;
	align-items: center;
	height: 24px;
	padding: 0 8px;
	border-radius: 999px;
	font-size: 12px;
	font-weight: 600;
}

.log-card__action.created {
	color: #1677ff;
	background: rgba(22, 119, 255, 0.1);
}

.log-card__action.updated {
	color: #ff7d00;
	background: rgba(255, 125, 0, 0.1);
}

.log-card__action.deleted {
	color: #f53f3f;
	background: rgba(245, 63, 63, 0.1);
}

.log-card__action.status_changed {
	color: #00b46e;
	background: rgba(0, 180, 110, 0.1);
}

.log-card__body {
	color: #4e5969;
	line-height: 1.6;
}
</style>
