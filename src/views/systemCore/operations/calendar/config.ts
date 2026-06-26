import dayjs from "dayjs"
import type { DeptTaskRow } from "@/api/management/types"

export type CalendarViewMode = "month" | "day"
export type CalendarPanelMode = "calendar" | "create" | "edit" | "detail"

export interface CalendarCategory {
	label: string
	value: string
	color: string
	elTagType?: ElTagType
	elTagClass?: string
}

export interface CalendarTask {
	id: string | number
	taskTitle: string
	taskDescription: string
	assigneeId: number | string | null
	assigneeName: string
	collaboratorNames: string
	taskCategory: string
	taskCategoryName: string
	taskPlanType: string
	taskPlanTypeName: string
	taskPriority: string
	taskPriorityName: string
	taskStatus: string
	taskStatusName: string
	completionProgress: number
	planStartTime: string
	planEndTime: string
	timeRange: string
	reportTime?: string
	lastUpdateTime?: string
	warningLevel?: "正常" | "关注"
	solution?: string
	timeline?: Array<{
		time: string
		label: string
		type: string
		user: string
		content: string
	}>
	remark?: string
	taskProgress?: string
	taskProblem?: string
}

export interface CalendarCellItem {
	key: string
	date: dayjs.Dayjs
	dayNumber: number
	subLabel: string
	isCurrentMonth: boolean
	isToday: boolean
}

export interface DaySection {
	key: "morning" | "afternoon" | "evening"
	title: string
	timeRange: string
}

export const DAY_SECTIONS: DaySection[] = [
	{ key: "morning", title: "上午", timeRange: "06:00-12:00" },
	{ key: "afternoon", title: "下午", timeRange: "12:00-18:00" },
	{ key: "evening", title: "晚上", timeRange: "18:00-24:00" }
]

const CHINESE_DAY_LABELS = [
	"",
	"初一",
	"初二",
	"初三",
	"初四",
	"初五",
	"初六",
	"初七",
	"初八",
	"初九",
	"初十",
	"十一",
	"十二",
	"十三",
	"十四",
	"十五",
	"十六",
	"十七",
	"十八",
	"十九",
	"二十",
	"廿一",
	"廿二",
	"廿三",
	"廿四",
	"廿五",
	"廿六",
	"廿七",
	"廿八",
	"廿九",
	"三十",
	"卅一"
]

const CATEGORY_COLOR_POOL = [
	"var(--el-color-primary)",
	"var(--el-color-success)",
	"var(--el-color-warning)",
	"var(--el-color-danger)",
	"#7a5af8",
	"#98a2b3"
]

const resolveCategoryColor = (item: DictDataOption, index: number) => {
	if (item.elTagType === "primary") return "var(--el-color-primary)"
	if (item.elTagType === "success") return "var(--el-color-success)"
	if (item.elTagType === "warning") return "var(--el-color-warning)"
	if (item.elTagType === "danger") return "var(--el-color-danger)"
	if (item.elTagType === "info") return "#98a2b3"
	return CATEGORY_COLOR_POOL[index % CATEGORY_COLOR_POOL.length]
}

const buildTimeRange = (startTime?: string | null, endTime?: string | null) => {
	const start = startTime ? dayjs(startTime) : null
	const end = endTime ? dayjs(endTime) : null
	const startText = start && start.isValid() ? start.format("HH:mm") : "--:--"
	const endText = end && end.isValid() ? end.format("HH:mm") : "--:--"
	return `${startText} - ${endText}`
}

const buildWarningLevel = (endTime?: string | null, statusName?: string | null): "正常" | "关注" => {
	if (!endTime || statusName === "已完成") return "正常"
	const end = dayjs(endTime)
	if (!end.isValid()) return "正常"
	return end.isBefore(dayjs()) ? "关注" : "正常"
}

const buildTimeline = (task: DeptTaskRow, planStartTime: string, planEndTime: string, completionProgress: number) => [
	{
		time: planStartTime,
		label: "创建任务",
		type: "create",
		user: task.assigneeName || "-",
		content: `创建任务“${task.taskTitle}”`
	},
	{
		time: planEndTime,
		label: task.taskStatusName || "状态更新",
		type: completionProgress >= 100 ? "progress" : "statusChange",
		user: task.assigneeName || "-",
		content: task.taskProblem || task.remark || "任务按计划推进中"
	}
]

export const buildCalendarCategories = (options: DictDataOption[]): CalendarCategory[] =>
	options.map((item, index) => ({
		label: item.label,
		value: String(item.value),
		elTagType: item.elTagType,
		elTagClass: item.elTagClass,
		color: resolveCategoryColor(item, index)
	}))

export const mapDeptTaskRowToCalendarTask = (task: DeptTaskRow): CalendarTask => {
	const planStartTime = task.planStartTime || dayjs().format("YYYY-MM-DD 09:00:00")
	const planEndTime = task.planEndTime || planStartTime
	const completionProgress =
		typeof task.completionProgress === "number"
			? task.completionProgress
			: task.taskStatus === "2"
				? 100
				: task.taskStatus === "1"
					? 50
					: 0

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
		timeRange: buildTimeRange(planStartTime, planEndTime),
		reportTime: planStartTime,
		lastUpdateTime: planEndTime,
		warningLevel: buildWarningLevel(planEndTime, task.taskStatusName),
		solution: task.remark || "按计划推进当前任务，及时同步阶段性成果并跟进风险问题。",
		timeline: buildTimeline(task, planStartTime, planEndTime, completionProgress),
		remark: task.remark || "",
		taskProgress: task.taskProgress || `${completionProgress}%`,
		taskProblem: task.taskProblem || ""
	}
}

export const getChineseDayLabel = (dayNumber: number) => CHINESE_DAY_LABELS[dayNumber] || ""
