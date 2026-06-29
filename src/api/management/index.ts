import request from "@/utils/request"
import type {
	DeptTaskCreateData,
	DeptTaskDetailResult,
	DeptTaskListQuery,
	DeptTaskListResult,
	DeptTaskStatisticsResult,
	WeeklyReportResult
} from "./types"

// 查询部门任务信息列表
export function getDeptTaskList(query: DeptTaskListQuery): Promise<DeptTaskListResult> {
	return request({
		url: "/base/deptTask/list",
		method: "get",
		params: query
	})
}

// 获取部门任务统计信息
export function getDeptTaskStatistics(): Promise<DeptTaskStatisticsResult> {
	return request({
		url: "/base/deptTask/statistics",
		method: "get"
	})
}

// 获取部门任务详情
export function getDeptTaskDetail(id: string | number): Promise<DeptTaskDetailResult> {
	return request({
		url: "/base/deptTask/" + id,
		method: "get"
	})
}

// 新增部门任务信息
export function addDeptTask(data: DeptTaskCreateData) {
	return request({
		url: "/base/deptTask",
		method: "post",
		data
	})
}

// 修改部门任务信息
export function updateDeptTask(data: DeptTaskCreateData) {
	return request({
		url: "/base/deptTask",
		method: "put",
		data
	})
}

// 删除部门任务信息
export function deleteDeptTask(ids: string | number | Array<string | number>) {
	const requestIds = Array.isArray(ids) ? ids.join(",") : String(ids)
	return request({
		url: "/base/deptTask/" + requestIds,
		method: "delete"
	})
}

// 获取近两周周报（本周+下周）
export function getWeeklyReportTwoWeeks(): Promise<WeeklyReportResult> {
	return request({
		url: "/base/weeklyReport/twoWeeks",
		method: "get"
	})
}

// 获取当周周报
export function getWeeklyReportCurrent(): Promise<WeeklyReportResult> {
	return request({
		url: "/base/weeklyReport/current",
		method: "get"
	})
}
