export interface WeeklyReportConfigField {
	id?: string | number
	configId?: string | number
	fieldName: string
	isRequired: string
	sortOrder: number
	remark?: string
	createTime?: string
}

export interface WeeklyReportConfigVO {
	id?: string | number
	enterpriseId?: string | number
	enterpriseName?: string
	isEnabled?: string
	isEnabledName?: string
	remark?: string
	createTime?: string
	fields?: WeeklyReportConfigField[]
}

export interface WeeklyReportConfigForm {
	id?: string | number
	enterpriseId?: string | number
	isEnabled: string
	remark?: string
	fields: WeeklyReportConfigField[]
}

export interface WeeklyReportConfigQuery {
	id?: string | number
	enterpriseId?: string | number
	isEnabled?: string
	remark?: string
	pageNum?: number
	pageSize?: number
}
