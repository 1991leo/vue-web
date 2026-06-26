import request, { download } from "@/utils/request"
import { AxiosPromise } from "axios"
import { MonthlyReportForm, MonthlyReportQuery, MonthlyReportVO } from "./types"

// 查询月度经营分析报告列表
export function listMonthlyReport(query: MonthlyReportQuery): AxiosPromise<MonthlyReportVO[]> {
	return request({
		url: "/base/monthlyReport/list",
		method: "get",
		params: query
	})
}

// 查询月度经营分析报告详情
export function getMonthlyReport(id: string | number): AxiosPromise<MonthlyReportVO> {
	return request({
		url: `/base/monthlyReport/${id}`,
		method: "get"
	})
}

// 新增月度经营分析报告
export function addMonthlyReport(data: MonthlyReportForm): AxiosPromise<any> {
	return request({
		url: "/base/monthlyReport",
		method: "post",
		data
	})
}

// 修改月度经营分析报告
export function updateMonthlyReport(data: MonthlyReportForm): AxiosPromise<any> {
	return request({
		url: "/base/monthlyReport",
		method: "put",
		data
	})
}

// 删除月度经营分析报告
export function delMonthlyReport(ids: string | number | Array<string | number>): AxiosPromise<any> {
	return request({
		url: `/base/monthlyReport/${ids}`,
		method: "delete"
	})
}

// 导出月度经营分析报告列表
export function exportMonthlyReportExcel(query: MonthlyReportQuery) {
	return download("/base/monthlyReport/export/excel", query, `月度经营分析报告_${new Date().getTime()}.xlsx`)
}
