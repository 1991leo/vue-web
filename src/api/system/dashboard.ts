import request from "@/utils/request"
import { AxiosPromise } from "axios"

export interface ProjectStats {
	inProgressCount?: number
	monthlyNewCount?: number
}

export interface BusinessStats {
	totalRevenue?: number
	growthRate?: number
}

export interface TodoStats {
	pendingCount?: number
	urgentCount?: number
}

export interface MonthlyTrend {
	months?: string[]
	revenueData?: number[]
	profitData?: number[]
}

export interface ProjectStatusDistribution {
	statusName?: string
	statusCode?: string
	count?: number
	percentage?: number
	color?: string
}

export interface ProjectTracking {
	projectId?: number | string
	projectName?: string
	projectCode?: string
	assigneeName?: string
	progress?: number
	status?: string
	statusName?: string
}

export interface CoordinationItem {
	coordinationId?: number | string
	title?: string
	responsibleDept?: string
	deadline?: string
	priority?: string
	priorityName?: string
}

export interface DashboardVo {
	projectStats?: ProjectStats
	businessStats?: BusinessStats
	todoStats?: TodoStats
	monthlyTrend?: MonthlyTrend
	projectStatusDistribution?: ProjectStatusDistribution[]
	projectTrackingList?: ProjectTracking[]
	coordinationList?: CoordinationItem[]
}

export interface DashboardResponse {
	code: number
	msg: string
	data: DashboardVo
}

// 获取汇总工作台数据
export function getDashboardData(): AxiosPromise<DashboardResponse> {
	return request({
		url: "/base/dashboard/data",
		method: "get"
	})
}
