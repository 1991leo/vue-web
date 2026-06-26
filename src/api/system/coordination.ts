import request from "@/utils/request"
import { AxiosPromise } from "axios"

// 查询协调支持事项列表
export function listCoordination(query: any): AxiosPromise<any> {
	return request({
		url: "/base/coordination/list",
		method: "get",
		params: query
	})
}

// 查询协调支持事项详细信息（含日志时间线）
export function getCoordination(id: string | number): AxiosPromise<any> {
	return request({
		url: "/base/coordination/" + id + "/withLogs",
		method: "get"
	})
}

// 新增协调支持事项
export function addCoordination(data: any): AxiosPromise<any> {
	return request({
		url: "/base/coordination",
		method: "post",
		data: data
	})
}

// 修改协调支持事项
export function updateCoordination(data: any): AxiosPromise<any> {
	return request({
		url: "/base/coordination",
		method: "put",
		data: data
	})
}

// 删除协调支持事项
export function delCoordination(ids: string | number | Array<string | number>): AxiosPromise<any> {
	return request({
		url: "/base/coordination/" + ids,
		method: "delete"
	})
}
