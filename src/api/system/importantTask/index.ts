import request from "@/utils/request"
import { AxiosPromise } from "axios"
import { ImportantTaskForm, ImportantTaskQuery, ImportantTaskVO } from "./types"

// 查询集团重点任务列表
export function listImportantTask(query: ImportantTaskQuery): AxiosPromise<ImportantTaskVO[]> {
	return request({
		url: "/base/importantTask/list",
		method: "get",
		params: query
	})
}

// 查询集团重点任务详情（含日志时间线）
export function getImportantTaskWithLogs(id: number | string): AxiosPromise<ImportantTaskVO> {
	return request({
		url: "/base/importantTask/" + id + "/withLogs",
		method: "get"
	})
}

// 新增集团重点任务
export function addImportantTask(data: ImportantTaskForm): AxiosPromise<any> {
	return request({
		url: "/base/importantTask",
		method: "post",
		data: data
	})
}

// 修改集团重点任务
export function updateImportantTask(data: ImportantTaskForm): AxiosPromise<any> {
	return request({
		url: "/base/importantTask",
		method: "put",
		data: data
	})
}

// 删除集团重点任务
export function delImportantTask(ids: number | string | Array<number | string>): AxiosPromise<any> {
	return request({
		url: "/base/importantTask/" + ids,
		method: "delete"
	})
}

// 获取集团重点任务统计信息
export function getImportantTaskStatistics(): AxiosPromise<any> {
	return request({
		url: "/base/importantTask/statistics",
		method: "get"
	})
}
