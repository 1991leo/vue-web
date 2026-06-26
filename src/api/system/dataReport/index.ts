import request, { download } from "@/utils/request"
import { AxiosPromise } from "axios"
import type {
	DataReportBatchForm,
	DataReportListResponse,
	DataReportQuery,
	DataReportVO,
	TotalProfitQuery
} from "./types"

// 查询数据填报列表
export function listDataReport(query: DataReportQuery): AxiosPromise<DataReportListResponse> {
	return request({
		url: "/base/dataReport/list",
		method: "get",
		params: query
	})
}

// 获取数据填报详情
export function getDataReport(id: string | number, deptId?: string | number): AxiosPromise<DataReportVO> {
	return request({
		url: `/base/dataReport/${id}`,
		method: "get",
		params: { deptId }
	})
}

// 新增和修改共用批量保存接口，后端按 id 判断新增或更新。
export function addDataReport(data: DataReportBatchForm): AxiosPromise<void> {
	return request({
		url: "/base/dataReport",
		method: "post",
		data
	})
}

// 修改数据填报
export function updateDataReport(data: DataReportBatchForm): AxiosPromise<void> {
	return request({
		url: "/base/dataReport",
		method: "post",
		data
	})
}

// 删除数据填报
export function delDataReport(
	ids: string | number | Array<string | number>,
	deptId?: string | number
): AxiosPromise<void> {
	return request({
		url: `/base/dataReport/${ids}`,
		method: "delete",
		params: { deptId }
	})
}

// 导出数据填报列表
export function exportDataReport(query: DataReportQuery) {
	return download("/base/dataReport/export", query, `数据填报_${new Date().getTime()}.xlsx`)
}

// 查询利润总额（获取年度目标利润）
export function getTotalProfit(data: TotalProfitQuery): AxiosPromise<number> {
	return request({
		url: "/base/dataReport/totalProfit",
		method: "post",
		data
	})
}
