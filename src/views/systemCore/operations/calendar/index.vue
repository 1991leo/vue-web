<template>
	<div class="calendar-page">
		<TaskCreateCard
			v-if="isFormMode"
			v-loading="taskDetailLoading"
			:mode="formMode"
			:initial-form="currentFormData"
			:header-title="formCardTitle"
			:header-desc="formCardDesc"
			:user-options="calendarUserOptions"
			:category-options="calendarCategoryOptions"
			:priority-options="calendarPriorityOptions"
			:status-options="calendarStatusOptions"
			:type-options="calendarTypeOptions"
			@back="handleCalendarClosePanel"
			@submit="handleCalendarFormSubmit"
		/>

		<CalendarTaskDetail
			v-else-if="isDetailMode && currentDetailTask"
			v-loading="taskDetailLoading"
			:task="currentDetailTask"
			:get-category-color="getCategoryColor"
			@close="handleCalendarClosePanel"
			@edit="handleCalendarEdit"
		/>

		<div v-else class="calendar-layout" v-loading="loading">
			<CalendarSidebar
				:keyword="keyword"
				:model-category="categoryFilter"
				:category-items="categoryItems"
				:tasks="sidebarTasks"
				:get-category-color="getCategoryColor"
				@update:keyword="handleCalendarKeywordChange"
				@update:category="categoryFilter = $event"
				@task-click="handleSidebarTaskClick"
				@create="handleCalendarCreate"
			/>

			<div class="calendar-content">
				<CalendarToolbar
					:title="calendarTitle"
					:view-mode="currentView"
					@today="goToday"
					@prev="goPrev"
					@next="goNext"
					@change-view="setView"
				/>

				<div class="calendar-content__body">
					<div v-if="taskList.length === 0" class="calendar-empty">
						<img :src="noDataImage" alt="" />
						<span>暂无日历任务</span>
					</div>

					<template v-else>
						<CalendarMonthView
							v-if="currentView === 'month'"
							:cells="monthCells"
							:task-map="monthTaskMap"
							:get-category-color="getCategoryColor"
							@select-day="handleMonthCellClick"
							@task-click="handleCalendarTaskClick"
						/>

						<CalendarDayView
							v-else
							:sections="daySectionTasks"
							:get-category-color="getCategoryColor"
							@task-click="handleCalendarTaskClick"
						/>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { addDeptTask, getDeptTaskDetail, updateDeptTask } from "@/api/management"
import type { DeptTaskCreateData, DeptTaskRow } from "@/api/management/types"
import noDataImage from "@/assets/images/no_data.webp"
import { listUser } from "@/api/system/user"
import type { UserQuery, UserVO } from "@/api/system/user/types"
import { ElMessage } from "element-plus"
import dayjs from "dayjs"
import type { ComponentInternalInstance } from "vue"
import { computed, getCurrentInstance, onMounted, ref, toRefs } from "vue"
import type { DeptTaskFormData } from "../deptTask/config"
import { statusTabs } from "../deptTask/config"
import TaskCreateCard from "../deptTask/components/TaskCreateCard.vue"
import CalendarDayView from "./components/CalendarDayView.vue"
import CalendarMonthView from "./components/CalendarMonthView.vue"
import CalendarSidebar from "./components/CalendarSidebar.vue"
import CalendarTaskDetail from "./components/CalendarTaskDetail.vue"
import CalendarToolbar from "./components/CalendarToolbar.vue"
import { buildCalendarCategories, type CalendarTask } from "./config"
import { useCalendar } from "./useCalendar"

const { proxy } = getCurrentInstance() as ComponentInternalInstance
const { task_category_type, task_type, task_priority } = toRefs<any>(
	proxy?.useDict("task_category_type", "task_type", "task_priority")
)
const USER_QUERY_DEPT_ID = "420000"

const calendarCategoryOptions = computed(() =>
	buildCalendarCategories(Array.isArray(task_category_type.value) ? task_category_type.value : [])
)
const calendarPriorityOptions = computed<DictDataOption[]>(() =>
	Array.isArray(task_priority.value) ? task_priority.value : []
)
const calendarTypeOptions = computed<DictDataOption[]>(() => (Array.isArray(task_type.value) ? task_type.value : []))
const calendarStatusOptions = computed(() =>
	statusTabs.filter((item) => item.key !== "all").map((item) => ({ label: item.label, value: item.key }))
)
const calendarUserOptions = ref<Array<{ label: string; value: string | number }>>([])
const taskDetailLoading = ref(false)
const currentTaskDetail = ref<DeptTaskRow | null>(null)

const {
	loading,
	keyword,
	panelMode,
	currentView,
	calendarTitle,
	categoryFilter,
	categoryItems,
	sidebarTasks,
	monthCells,
	monthTaskMap,
	daySectionTasks,
	taskList,
	getCategoryColor,
	setView,
	selectDate,
	selectedDate,
	goToday,
	goPrev,
	goNext,
	handleMonthCellClick,
	handleKeywordSearch,
	handleTaskClick,
	handleCreateTask,
	handleEditTask,
	closePanel,
	fetchCalendarData
} = useCalendar({
	categoryOptions: calendarCategoryOptions
})

const isDetailMode = computed(() => panelMode.value === "detail")
const isFormMode = computed(() => panelMode.value === "create" || panelMode.value === "edit")
const formMode = computed<"create" | "edit">(() => (panelMode.value === "edit" ? "edit" : "create"))
const formCardTitle = computed(() => (formMode.value === "edit" ? "编辑任务" : "创建任务"))
const formCardDesc = computed(() =>
	formMode.value === "edit" ? "修改任务信息并同步更新日历排期" : "填写基础信息后创建新的日历任务"
)

const getMatchedAssigneeValue = (assigneeId: string | number | null | undefined) => {
	if (typeof assigneeId === "undefined" || assigneeId === null || assigneeId === "") return undefined
	const matchedOption = calendarUserOptions.value.find((item) => String(item.value) === String(assigneeId))
	return matchedOption ? matchedOption.value : assigneeId
}

const currentDetailTask = computed<CalendarTask | null>(() => {
	if (!currentTaskDetail.value) return null
	return buildCalendarTaskFromDetail(currentTaskDetail.value)
})

const currentFormData = computed<DeptTaskFormData | null>(() => {
	if (formMode.value === "edit" && currentTaskDetail.value) {
		const matchedAssigneeValue = getMatchedAssigneeValue(currentTaskDetail.value.assigneeId)
		const matchedAssignee = calendarUserOptions.value.find((item) => item.value === matchedAssigneeValue)
		return {
			id: currentTaskDetail.value.id,
			taskTitle: currentTaskDetail.value.taskTitle,
			taskDescription: currentTaskDetail.value.taskDescription || "",
			assigneeId: matchedAssigneeValue,
			assigneeName: matchedAssignee ? matchedAssignee.label : currentTaskDetail.value.assigneeName || "",
			collaboratorIds: currentTaskDetail.value.collaboratorIds || "",
			collaboratorNames: currentTaskDetail.value.collaboratorNames || "",
			taskCategory: currentTaskDetail.value.taskCategory || "",
			taskPlanType: currentTaskDetail.value.taskPlanType || "",
			taskPriority: currentTaskDetail.value.taskPriority || "",
			taskStatus: currentTaskDetail.value.taskStatus || "",
			taskStatusName: currentTaskDetail.value.taskStatusName || "",
			planStartTime: formatFormDate(currentTaskDetail.value.planStartTime),
			planEndTime: formatFormDate(currentTaskDetail.value.planEndTime),
			remark: currentTaskDetail.value.remark || "",
			taskProgress: currentTaskDetail.value.taskProgress || "",
			taskProblem: currentTaskDetail.value.taskProblem || ""
		}
	}

	const selectedDateText = selectedDate.value.format("YYYY-MM-DD")
	console.log("🚀 ~ selectedDate.value:", selectedDate.value)
	return {
		taskTitle: "",
		taskDescription: "",
		assigneeId: undefined,
		assigneeName: "",
		collaboratorNames: "",
		taskCategory: "",
		taskPlanType: "",
		taskStatus: "",
		taskStatusName: "",
		taskPriority: "",
		planStartTime: null,
		planEndTime: null,
		remark: ""
	}
})

const formatFormDate = (value?: string | null) => {
	if (!value) return ""
	const dateValue = dayjs(value)
	return dateValue.isValid() ? dateValue.format("YYYY-MM-DD") : ""
}

const buildCalendarTaskFromDetail = (task: DeptTaskRow): CalendarTask => {
	const planStartTime = task.planStartTime || ""
	const planEndTime = task.planEndTime || planStartTime
	const completionProgress =
		typeof task.completionProgress === "number"
			? task.completionProgress
			: task.taskStatus === "2"
				? 100
				: task.taskStatus === "1"
					? 50
					: 0
	const endTime = planEndTime || planStartTime

	return {
		id: task.id,
		taskTitle: task.taskTitle,
		taskDescription: task.taskDescription || "",
		assigneeId: typeof task.assigneeId === "undefined" ? null : task.assigneeId,
		assigneeName: task.assigneeName || "-",
		collaboratorNames: task.collaboratorNames || "",
		taskCategory: task.taskCategory || "",
		taskCategoryName: task.taskCategoryName || "",
		taskPlanType: task.taskPlanType || "",
		taskPlanTypeName: task.taskPlanTypeName || "",
		taskPriority: task.taskPriority || "",
		taskPriorityName: task.taskPriorityName || "",
		taskStatus: task.taskStatus || "",
		taskStatusName: task.taskStatusName || "待开始",
		completionProgress,
		planStartTime,
		planEndTime,
		timeRange: buildTimeRangeText(planStartTime, planEndTime),
		reportTime: planStartTime || "-",
		lastUpdateTime: planEndTime || "-",
		warningLevel: buildWarningLevelText(endTime, task.taskStatusName),
		solution: task.remark || "按计划推进当前任务，及时同步阶段性成果并跟进风险问题。",
		timeline: buildDetailTimeline(task, planStartTime, planEndTime, completionProgress),
		remark: task.remark || "",
		taskProgress: task.taskProgress || `${completionProgress}%`,
		taskProblem: task.taskProblem || ""
	}
}

const buildTimeRangeText = (startTime?: string | null, endTime?: string | null) => {
	const start = startTime ? dayjs(startTime) : null
	const end = endTime ? dayjs(endTime) : null
	const startText = start && start.isValid() ? start.format("HH:mm") : "--:--"
	const endText = end && end.isValid() ? end.format("HH:mm") : "--:--"
	return `${startText} - ${endText}`
}

const buildWarningLevelText = (endTime?: string | null, statusName?: string | null): "正常" | "关注" => {
	if (!endTime || statusName === "已完成") return "正常"
	const end = dayjs(endTime)
	if (!end.isValid()) return "正常"
	return end.isBefore(dayjs()) ? "关注" : "正常"
}

const buildDetailTimeline = (
	task: DeptTaskRow,
	planStartTime: string,
	planEndTime: string,
	completionProgress: number
) => [
	{
		time: planStartTime || "-",
		label: "创建任务",
		type: "create",
		user: task.assigneeName || "-",
		content: `创建任务“${task.taskTitle}”`
	},
	{
		time: planEndTime || planStartTime || "-",
		label: task.taskStatusName || "状态更新",
		type: completionProgress >= 100 ? "progress" : "statusChange",
		user: task.assigneeName || "-",
		content: task.taskProblem || task.remark || "任务按计划推进中"
	}
]

const loadTaskDetail = async (taskId: string | number) => {
	taskDetailLoading.value = true
	try {
		const res = await getDeptTaskDetail(taskId)
		currentTaskDetail.value = res.data || null
	} finally {
		taskDetailLoading.value = false
	}
}

const handleSidebarTaskClick = async (task: CalendarTask) => {
	selectDate(dayjs(task.planStartTime).format("YYYY-MM-DD"))
	// await setView('day');
	handleTaskClick(task)
	await loadTaskDetail(task.id)
}

const handleCalendarKeywordChange = async (value: string) => {
	await handleKeywordSearch(value)
}

const handleCalendarCreate = () => {
	currentTaskDetail.value = null
	handleCreateTask()
}

const handleCalendarTaskClick = async (task: CalendarTask) => {
	handleTaskClick(task)
	await loadTaskDetail(task.id)
}

const handleCalendarEdit = async () => {
	if (!currentDetailTask.value) return
	handleEditTask(currentDetailTask.value)
	await loadTaskDetail(currentDetailTask.value.id)
}

const handleCalendarClosePanel = async () => {
	currentTaskDetail.value = null
	await closePanel()
}

const getCalendarUserOptions = async () => {
	const query: UserQuery = {
		pageNum: 1,
		pageSize: 100,
		deptId: USER_QUERY_DEPT_ID
	}
	const res = await listUser(query)
	const rows = Array.isArray(res.rows) ? res.rows : []
	calendarUserOptions.value = rows.map((item: UserVO) => ({
		label: item.nickName,
		value: item.userId
	}))
}

const handleCalendarFormSubmit = async (formData: DeptTaskFormData) => {
	const matchedUser = calendarUserOptions.value.find((item) => item.value === formData.assigneeId)
	const baseTask = currentTaskDetail.value
	const payload: DeptTaskCreateData = {
		id: baseTask ? baseTask.id : formData.id,
		taskTitle: formData.taskTitle,
		taskDescription: formData.taskDescription,
		assigneeId: typeof formData.assigneeId === "undefined" ? null : Number(formData.assigneeId),
		assigneeName: matchedUser ? matchedUser.label : formData.assigneeName,
		collaboratorIds: formData.collaboratorIds,
		collaboratorNames: formData.collaboratorNames,
		taskCategory: formData.taskCategory,
		taskPlanType: formData.taskPlanType,
		taskPriority: formData.taskPriority,
		taskStatus: formMode.value === "edit" ? formData.taskStatus || baseTask?.taskStatus || "0" : "0",
		planStartTime: formData.planStartTime ? `${formData.planStartTime} 00:00:00` : "",
		planEndTime: formData.planEndTime ? `${formData.planEndTime} 23:59:59` : "",
		remark: formData.remark
	}

	if (formMode.value === "edit") {
		await updateDeptTask(payload)
	} else {
		await addDeptTask(payload)
	}

	await fetchCalendarData()
	const startDateText = dayjs(formData.planStartTime).format("YYYY-MM-DD")
	const endDateText = dayjs(formData.planEndTime).format("YYYY-MM-DD")
	selectDate(startDateText <= endDateText ? startDateText : selectedDate.value.format("YYYY-MM-DD"))
	currentTaskDetail.value = null
	// await setView('day');
	handleCalendarClosePanel()
	ElMessage.success(formMode.value === "edit" ? "任务编辑成功" : "任务创建成功")
}

onMounted(async () => {
	await Promise.allSettled([getCalendarUserOptions(), fetchCalendarData()])
	ElMessage.closeAll()
})
</script>

<style scoped lang="scss">
.calendar-page {
	height: 47.8rem;
	// padding: 1rem;
	// background: linear-gradient(180deg, #eef5f2 0%, #f7f9fb 100%);
}

.calendar-layout {
	display: grid;
	grid-template-columns: 20rem minmax(0, 1fr);
	// gap: 1rem;

	height: 100%;
}

.calendar-content {
	display: flex;
	min-width: 0;
	min-height: 0;
	flex-direction: column;
	overflow: hidden;
	border-radius: 0 20px 20px 0;
	// border-radius: 1rem;
	background: #ffffff;
	box-shadow: 0 0.5rem 1.5rem rgba(23, 43, 77, 0.06);
}

.calendar-content__body {
	display: flex;
	min-height: 0;
	flex: 1;
	overflow: hidden;
}

.calendar-empty {
	display: flex;
	height: 100%;
	width: 100%;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	gap: 0.75rem;
	color: #a5adba;
	font-size: 0.875rem;

	img {
		width: 14rem;
		height: auto;
	}
}

@media (max-width: 1200px) {
	.calendar-layout {
		grid-template-columns: 1fr;
	}
}
</style>
