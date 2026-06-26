export interface MonthlyIndicator {
	name?: string
	actualValue?: number
	targetValue?: number
	completionRate?: string
	unit?: string
}

export interface BusinessLineData {
	businessLineName?: string
	revenue?: number
	cost?: number
	profit?: number
	profitMargin?: string
}

export interface KeyTaskProgress {
	taskName?: string
	plannedProgress?: number
	actualProgress?: number
	status?: string
	assigneeName?: string
	remark?: string
}

export interface MonthlyReportVO {
	id?: string | number
	year?: number
	month?: string | number
	monthName?: string
	totalRevenue?: number
	revenueTarget?: number
	revenueCompletionRate?: string
	profit?: number
	profitTarget?: number
	profitCompletionRate?: string
	contractCount?: number
	contractTarget?: number
	contractCompletionRate?: string
	investmentAmount?: number
	investmentTarget?: number
	investmentCompletionRate?: string
	rdInvestment?: number
	rdTarget?: number
	rdCompletionRate?: string
	businessProgress?: string
	majorProjectProgress?: string
	issuesAndMeasures?: string
	nextPlan?: string
	coordinationNeeds?: string
	status?: string
	companyId?: string | number
	companyName?: string
	reporterId?: string | number
	reporterName?: string
	createTime?: string
	updateTime?: string
	indicators?: MonthlyIndicator[]
	businessLineData?: BusinessLineData[]
	keyTasks?: KeyTaskProgress[]
}

export interface MonthlyReportForm {
	id?: string | number
	year?: number
	month: string
	totalRevenue?: number
	revenueTarget?: number
	profit?: number
	profitTarget?: number
	contractCount?: number
	contractTarget?: number
	investmentAmount?: number
	investmentTarget?: number
	rdInvestment?: number
	rdTarget?: number
	businessProgress?: string
	majorProjectProgress?: string
	issuesAndMeasures?: string
	nextPlan?: string
	coordinationNeeds?: string
	status?: string
	companyId?: string | number
	companyName?: string
	reporterId?: string | number
	reporterName?: string
}

export interface MonthlyReportQuery {
	month?: string
	status?: string
	companyName?: string
	pageNum?: number
	pageSize?: number
}
