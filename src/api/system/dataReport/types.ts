export interface DataReportVO extends BaseEntity {
	id?: number | string
	reportType?: string | number
	reportTypeName?: string
	quarter?: string | number
	year?: number
	month?: string | number
	operatingRevenue?: number | string
	totalProfit?: number | string
	newContractAmount?: number | string
	rdInvestment?: number | string
	investmentAmount?: number | string
	deptId?: string | number
	deptName?: string
	tenantId?: string
	createDept?: number | string
	createTime?: string
	remark?: string
}

export interface DataReportQuery {
	id?: number | string
	reportType?: string | number
	quarter?: string | number
	year?: number
	month?: string | number
	operatingRevenue?: number | string
	totalProfit?: number | string
	newContractAmount?: number | string
	rdInvestment?: number | string
	investmentAmount?: number | string
	deptId?: string | number
	tenantId?: string
	remark?: string
	orderByColumn?: string
	isAsc?: string
}

export interface DataReportForm {
	id?: number | string
	reportType?: string | number
	quarter?: string | number
	year?: number
	month?: string | number
	operatingRevenue?: number
	totalProfit?: number
	newContractAmount?: number
	rdInvestment?: number
	investmentAmount?: number
	deptId: string | number
	tenantId?: string
	remark?: string
}

export type DataReportBatchForm = DataReportForm[]

export interface DataReportListResponse {
	total?: number
	rows?: DataReportVO[]
	code?: number
	msg?: string
}

export interface TotalProfitQuery {
	year: number
	deptId: string | number
}
