import type { DeptTaskStatisticsData } from "@/api/management/types"

export interface DeptTaskTableColumn {
	prop?: string
	label: string
	minWidth?: string | number
	width?: string | number
	slotName?: string
	showOverflowTooltip?: boolean
	fixed?: boolean | "left" | "right"
	showStatusPlanBColor?: boolean
}

export interface DeptTaskSearchItem {
	key: keyof DeptTaskSearchForm
	label: string
	type: string
	placeholder: string
	width: string
	options?: Array<{ label: string; value: string | number }>
	value?: string | number | string[] | null
	valueFormat?: string
	elementAttrs?: Record<string, unknown>
}

export interface DeptTaskFormData {
	id?: string | number
	taskTitle: string
	taskDescription: string
	assigneeId?: string | number | null
	assigneeName: string
	collaboratorIds?: string
	collaboratorNames: string
	taskCategory: string
	taskPlanType: string
	taskStatus?: string
	taskStatusName?: string
	taskPriority: string
	planStartTime: string
	planEndTime: string
	actualStartTime?: string
	actualEndTime?: string
	deptId?: number | null
	deptName?: string
	remark?: string
	taskProgress?: string
	taskProblem?: string
}

export interface DeptTaskStatusTab {
	key: string
	label: string
}

export interface DeptTaskSearchForm {
	assigneeId: string | number | null
	taskPriority: string | null
	taskCategory: string | null
	planEndTimeRange: string[] | null
}

export const statusTabs: DeptTaskStatusTab[] = [
	{ key: "all", label: "全部" },
	{ key: "0", label: "待开始" },
	{ key: "1", label: "进行中" },
	{ key: "2", label: "已完成" },
	{ key: "3", label: "延期" }
]

export const deptTaskTableColumns: DeptTaskTableColumn[] = [
	{
		label: "任务详情",
		prop: "taskTitle",

		slotName: "taskInfo"
	},
	{
		label: "优先级",
		prop: "taskPriorityName",

		slotName: "priority"
	},
	{
		label: "负责人",
		prop: "assigneeName",

		slotName: "assignee"
	},
	{
		label: "协助人",
		prop: "collaboratorNames",
		slotName: "helpers"
	},
	{
		label: "开始日期",
		prop: "planStartTime"
		// slotName: 'planStartTime'
	},
	{
		label: "截止日期",
		prop: "planEndTime"
		// slotName: 'planEndTime'
	},
	{
		label: "状态",
		prop: "taskStatusName",
		showStatusPlanBColor: true
	},
	{
		label: "操作",
		prop: "operation",

		fixed: "right",
		slotName: "operation"
	}
]

export const createDeptTaskFormData = (): DeptTaskFormData => ({
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
	planStartTime: "",
	planEndTime: "",
	remark: ""
})

export const createDeptTaskSearchForm = (): DeptTaskSearchForm => ({
	assigneeId: null,
	taskPriority: null,
	taskCategory: null,
	planEndTimeRange: null
})

export const createDeptTaskStatisticsData = (): DeptTaskStatisticsData => ({
	totalCount: 0,
	notStartedCount: 0,
	inProgressCount: 0,
	completedCount: 0,
	delayedCount: 0,
	exceptionCount: 0
})

export const createDeptTaskSearchItems = (): DeptTaskSearchItem[] => [
	{
		key: "assigneeId",
		label: "负责人",
		type: "select",
		placeholder: "负责人",
		width: "11rem",
		options: []
	},
	{
		key: "taskPriority",
		label: "优先级",
		type: "select",
		placeholder: "优先级",
		width: "11rem",
		options: []
	},
	{
		key: "taskCategory",
		label: "任务类别",
		type: "select",
		placeholder: "任务类别",
		width: "11rem",
		options: []
	},
	{
		key: "planEndTimeRange",
		label: "截止日期",
		type: "daterange",
		placeholder: "截止日期",
		width: "12rem",
		valueFormat: "YYYY-MM-DD",
		elementAttrs: {
			startPlaceholder: "开始日期",
			endPlaceholder: "结束日期",
			displayFormat: "YYYY-MM-DD"
		}
	}
]

export const createDeptTaskStatusOptions = () =>
	statusTabs.filter((item) => item.key !== "all").map((item) => ({ label: item.label, value: item.key }))

export const getDeptTaskStatusCount = (statistics: DeptTaskStatisticsData, statusKey: string) => {
	if (statusKey === "all") return typeof statistics.totalCount === "number" ? statistics.totalCount : 0
	if (statusKey === "0") return typeof statistics.notStartedCount === "number" ? statistics.notStartedCount : 0
	if (statusKey === "1") return typeof statistics.inProgressCount === "number" ? statistics.inProgressCount : 0
	if (statusKey === "2") return typeof statistics.completedCount === "number" ? statistics.completedCount : 0
	if (statusKey === "3") return typeof statistics.delayedCount === "number" ? statistics.delayedCount : 0
	if (statusKey === "4") return typeof statistics.exceptionCount === "number" ? statistics.exceptionCount : 0
	return 0
}

export const buildDeptTaskSearchItemOptions = (
	searchItems: DeptTaskSearchItem[],
	optionsMap: Partial<Record<keyof DeptTaskSearchForm, Array<{ label: string; value: string | number }>>>
) => {
	searchItems.forEach((item) => {
		if (Object.prototype.hasOwnProperty.call(optionsMap, item.key)) {
			item.options = [...(optionsMap[item.key] || [])]
		}
	})
}
