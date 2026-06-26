export interface WeeklyBusinessExtraField {
	fieldName: string
	fieldValue?: string
	isRequired?: string
	sortOrder?: number
}

export interface WeeklyBusinessAttachment {
	name?: string
	url: string
	ossId?: string | number
	fileName?: string
}

export interface WeeklyBusinessProjectDetail {
	createDept?: string | number
	createBy?: string | number
	createTime?: string
	updateBy?: string | number
	updateTime?: string
	params?: Record<string, unknown>
	id?: string | number
	briefId?: string | number
	projectType?: number
	projectName?: string
	amount?: number
	customerName?: string
	contractAmount?: number
	businessDomain?: string
	remark?: string
	sort?: number
}

export interface WeeklyBusinessUploadResult {
	url: string
	urlWx?: string
	fileName: string
	ossId: number | string
}

export interface DeptSubmitItem {
	deptName?: string
	submitted?: boolean
	submitTime?: string
}

export interface DeptSubmitStatsVo {
	submittedCount?: number
	count?: number
	deptList?: DeptSubmitItem[]
}

export interface WeeklyBusinessBriefStatsVO {
	deptSubmitStatsVo?: DeptSubmitStatsVo | null
	weeklyBusinessBriefVos?: WeeklyBusinessBriefVO[]
}

export interface WeeklyBusinessBriefVO {
	id?: string | number
	deptId?: string | number
	companyId?: string | number
	companyName?: string
	startTime?: string
	endTime?: string
	annualTargetProfit?: number
	estimatedProfit?: number
	completionRate?: number | string
	confirmedRevenueWeekly?: number
	confirmedRevenueCumulative?: number
	contractAmountWeekly?: number
	contractAmountCumulative?: number
	bidAmountWeekly?: number
	bidAmountCumulative?: number
	investmentWeekly?: number
	investmentCumulative?: number
	issues?: string
	nextWeekPlan?: string
	extraFields?: string
	projectDetails?: WeeklyBusinessProjectDetail[]
	status?: string
	attachments?: string
	reporterId?: string | number
	reporterName?: string
	createTime?: string
	updateTime?: string
}

export interface WeeklyBusinessBriefForm {
	id?: string | number
	deptId?: string | number
	companyId?: string | number
	startTime?: string
	endTime?: string
	annualTargetProfit?: number
	estimatedProfit?: number
	completionRate?: number
	confirmedRevenueWeekly?: number
	confirmedRevenueCumulative?: number
	contractAmountWeekly?: number
	contractAmountCumulative?: number
	bidAmountWeekly?: number
	bidAmountCumulative?: number
	investmentWeekly?: number
	investmentCumulative?: number
	issues?: string
	nextWeekPlan?: string
	extraFields?: string
	projectDetails?: WeeklyBusinessProjectDetail[]
	status?: string
	attachments?: string
	reporterId?: string | number
}

export interface WeeklyBusinessBriefQuery {
	id?: string | number
	deptId?: string | number
	companyId?: string | number
	startTime?: string
	endTime?: string
	status?: string
	reporterId?: string | number
	pageNum?: number
	pageSize?: number
}
