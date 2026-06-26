import request from "@/utils/request"
import { AxiosPromise } from "axios"
import type { HqOperationDataForm, HqOperationDataListResponse, HqOperationDataQuery } from "./types"

// 查询集团本部经营数据列表
export function listHqOperationData(query: HqOperationDataQuery): AxiosPromise<HqOperationDataListResponse> {
	return request({
		url: "/base/hqOperationData/list",
		method: "get",
		params: query
	})
}

// 新增集团本部经营数据
export function addHqOperationData(data: HqOperationDataForm): AxiosPromise<void> {
	return request({
		url: "/base/hqOperationData",
		method: "post",
		data
	})
}

// 修改集团本部经营数据
export function updateHqOperationData(data: HqOperationDataForm): AxiosPromise<void> {
	return request({
		url: "/base/hqOperationData",
		method: "put",
		data
	})
}
