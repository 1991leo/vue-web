import request from "@/utils/request"
import { AxiosPromise } from "axios"
import { PlatformInfoForm, PlatformInfoListResult, PlatformInfoVO } from "./types"

// 查询平台信息列表（初始化）
export function listPlatformInfo(): AxiosPromise<PlatformInfoListResult> {
	return request({
		url: "/base/platformInfo/list",
		method: "get"
	})
}

// 保存平台信息
export function savePlatformInfo(data: PlatformInfoForm) {
	return request({
		url: "/base/platformInfo",
		method: "put",
		data: data
	})
}
// 查询预警规则列表
export function listWarningRules(query: any): AxiosPromise<any> {
	return request({
		url: "/base/warningRule/list",
		method: "get",
		params: query
	})
}

// 新增预警规则
export function addWarningRule(data: any): AxiosPromise<any> {
	return request({
		url: "/base/warningRule",
		method: "post",
		data: data
	})
}

// 修改预警规则
export function updateWarningRule(data: any): AxiosPromise<any> {
	return request({
		url: "/base/warningRule",
		method: "put",
		data: data
	})
}
// 查询推送配置列表
export function listPushConfigs(query: any): AxiosPromise<any> {
	return request({
		url: "/base/pushConfig/list",
		method: "get",
		params: query
	})
}
// 删除预警规则
export function deleteWarningRule(ids: (number | string)[]): AxiosPromise<any> {
	return request({
		url: "/base/warningRule/" + ids,
		method: "delete"
	})
}
// 新增推送配置
export function addPushConfig(data: any): AxiosPromise<any> {
	return request({
		url: "/base/pushConfig",
		method: "post",
		data: data
	})
}
// 修改推送配置
export function updatePushConfig(data: any): AxiosPromise<any> {
	return request({
		url: "/base/pushConfig",
		method: "put",
		data: data
	})
}
// 删除推送配置
export function deletePushConfig(ids: (number | string)[]): AxiosPromise<any> {
	return request({
		url: "/base/pushConfig/" + ids,
		method: "delete"
	})
}
