import request from "@/utils/request"
import { AxiosPromise } from "axios"
import type { WeeklyReportConfigForm, WeeklyReportConfigQuery, WeeklyReportConfigVO } from "./types"

// 查询周报配置列表
export function listWeeklyReportConfig(query: WeeklyReportConfigQuery): AxiosPromise<WeeklyReportConfigVO[]> {
	return request({
		url: "/base/weeklyReportConfig/list",
		method: "get",
		params: query
	})
}

// 获取周报配置详情，包含配置属性子表
export function getWeeklyReportConfig(id: string | number): AxiosPromise<WeeklyReportConfigVO> {
	return request({
		url: `/base/weeklyReportConfig/${id}`,
		method: "get"
	})
}

// 新增周报配置
export function addWeeklyReportConfig(data: WeeklyReportConfigForm): AxiosPromise<any> {
	return request({
		url: "/base/weeklyReportConfig",
		method: "post",
		data
	})
}

// 修改周报配置
export function updateWeeklyReportConfig(data: WeeklyReportConfigForm): AxiosPromise<any> {
	return request({
		url: "/base/weeklyReportConfig",
		method: "put",
		data
	})
}

// 删除周报配置
export function delWeeklyReportConfig(ids: string | number | Array<string | number>): AxiosPromise<any> {
	return request({
		url: `/base/weeklyReportConfig/${ids}`,
		method: "delete"
	})
}
