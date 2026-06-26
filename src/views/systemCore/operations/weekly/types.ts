export type ReportTabKey = "current" | "twoWeeks"
export type WeeklySectionKey = "current" | "next"
export type SummaryItemType = "completed" | "ongoing" | "pending"

export interface WeeklyTask {
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

export interface WeeklySection {
	key: WeeklySectionKey
	title: string
	dateRange: string
	tasks: WeeklyTask[]
}

export interface WeeklyReport {
	label: string
	sections: WeeklySection[]
}

export interface WeeklySummaryData {
	weekTotalCount?: number | null
	weekCompletedCount?: number | null
	weekInProgressCount?: number | null
	weekNotStartedCount?: number | null
}

export interface WeeklyReportTab {
	key: ReportTabKey
	label: string
}
