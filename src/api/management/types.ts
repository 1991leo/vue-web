export interface DeptTaskListQuery {
	pageNum: number
	pageSize: number
	type?: "day" | "month"
	startTime?: string | null
	taskTitle?: string | null
	assigneeId?: string | number | null
	taskStatus?: string | null
	taskPriority?: string | null
	taskCategory?: string | null
	beginTime?: string | null
	endTime?: string | null
	params?: Record<string, any>
}

export interface DeptTaskMonthlyTrend {
	month?: string | null
	totalCount?: number | null
	completedCount?: number | null
}

export interface DeptTaskCategoryDistribution {
	categoryName?: string | null
	categoryCode?: string | null
	count?: number | null
	rate?: string | null
}

export interface DeptTaskRecentTask {
	id?: number | null
	taskTitle?: string | null
	taskCategory?: string | null
	taskCategoryName?: string | null
	taskStatus?: string | null
	taskStatusName?: string | null
	planEndTime?: string | null
}

export interface DeptTaskStatisticsData {
	totalCount?: number | null
	notStartedCount?: number | null
	notStartedRate?: string | null
	inProgressCount?: number | null
	inProgressRate?: string | null
	completedCount?: number | null
	completedRate?: string | null
	delayedCount?: number | null
	delayedRate?: string | null
	exceptionCount?: number | null
	exceptionRate?: string | null
	exceptionDelayedCount?: number | null
	exceptionDelayedRate?: string | null
	monthlyTrend?: DeptTaskMonthlyTrend[] | null
	categoryDistribution?: DeptTaskCategoryDistribution[] | null
	recentTasks?: DeptTaskRecentTask[] | null
}

export interface DeptTaskStatisticsResult {
	code?: number
	msg?: string
	data?: DeptTaskStatisticsData | null
}

export interface DeptTaskRow {
	id: string | number
	taskTitle: string
	taskDescription?: string | null
	assigneeId?: string | number | null
	assigneeName?: string | null
	collaboratorIds?: string | null
	collaboratorNames?: string | null
	taskCategory?: string | null
	taskCategoryName?: string | null
	taskPlanType?: string | null
	taskPlanTypeName?: string | null
	taskStatus?: string | null
	taskStatusName?: string | null
	completionProgress?: number | null
	planStartTime?: string | null
	planEndTime?: string | null
	actualStartTime?: string | null
	actualEndTime?: string | null
	deptId?: number | null
	deptName?: string | null
	remark?: string | null
	taskPriority?: string | null
	taskPriorityName?: string | null
	taskProgress?: string | null
	taskProblem?: string | null
	createBy?: string | null
	createDept?: number | null
}

export interface DeptTaskListResult {
	rows: DeptTaskRow[]
	total: number
}

export interface DeptTaskDetailResult {
	code?: number
	msg?: string
	data?: DeptTaskRow | null
}

export interface DeptTaskCreateData {
	id?: string | number
	taskTitle: string
	taskDescription?: string
	assigneeId?: string | number | null
	assigneeName?: string
	collaboratorIds?: string
	collaboratorNames?: string
	remark?: string
	taskCategory?: string
	taskPriority?: string
	taskPlanType?: string
	taskStatus?: string
	planStartTime?: string
	planEndTime?: string
}

export interface WeeklyReportTask {
	id?: number | null
	taskTitle?: string | null
	taskDescription?: string | null
	taskStatus?: string | null
	taskStatusName?: string | null
	assigneeName?: string | null
	planStartTime?: string | null
	planEndTime?: string | null
	taskCategory?: string | null
	taskCategoryName?: string | null
}

export interface WeeklyReportData {
	weekStartDate?: string | null
	weekEndDate?: string | null
	nextWeekStartDate?: string | null
	nextWeekEndDate?: string | null
	weekTotalCount?: number | null
	weekCompletedCount?: number | null
	weekInProgressCount?: number | null
	weekNotStartedCount?: number | null
	weekTasks?: WeeklyReportTask[] | null
	nextWeekTasks?: WeeklyReportTask[] | null
}

export interface WeeklyReportResult {
	code?: number
	msg?: string
	data?: WeeklyReportData | null
}
