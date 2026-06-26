export interface HqOperationDataVO {
	id?: string | number
	year?: number
	week?: number
	startTime?: string
	endTime?: string
	annualTargetProfit?: number
	estimatedCompletion?: number
	createTime?: string
}

export interface HqOperationDataForm {
	id?: string | number
	year?: number
	week?: number
	startTime?: string
	endTime?: string
	annualTargetProfit?: number
	estimatedCompletion?: number
}

export interface HqOperationDataQuery {
	id?: string | number
	year?: number
	week?: number
	startTime?: string
	endTime?: string
	annualTargetProfit?: string
	estimatedCompletion?: string
	pageNum?: number
	pageSize?: number
	orderByColumn?: string
	isAsc?: "asc" | "desc"
}

export interface HqOperationDataListResponse {
	total?: number
	rows?: HqOperationDataVO[]
	code?: number
	msg?: string
}
