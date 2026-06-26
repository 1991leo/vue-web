import request, { download } from "@/utils/request"
import type { AxiosPromise } from "axios"
import type {
	BizBusinessMattersApproveBo,
	BizBusinessMattersBo,
	BusinessMattersActionResponse,
	BusinessMattersListQuery,
	RBizBusinessMattersVoResponse,
	ReviewLeafDeptResponse,
	ReviewUploadResult,
	TableDataInfoBizBusinessMattersVoResponse
} from "./types"

export function getBusinessMattersList(
	query: BusinessMattersListQuery
): AxiosPromise<TableDataInfoBizBusinessMattersVoResponse> {
	return request({
		url: "/base/businessMatters/list",
		method: "get",
		params: query
	})
}

export function getBusinessMattersDetail(id: string | number): AxiosPromise<RBizBusinessMattersVoResponse> {
	return request({
		url: `/base/businessMatters/${id}`,
		method: "get"
	})
}

export function saveBusinessMatters(data: BizBusinessMattersBo): AxiosPromise<BusinessMattersActionResponse> {
	return request({
		url: "/base/businessMatters",
		method: "post",
		data
	})
}

export function submitBusinessMatters(data: BizBusinessMattersBo): AxiosPromise<BusinessMattersActionResponse> {
	return request({
		url: "/base/businessMatters/submit",
		method: "post",
		data
	})
}

export function approveBusinessMatters(data: BizBusinessMattersApproveBo): AxiosPromise<BusinessMattersActionResponse> {
	return request({
		url: "/base/businessMatters/approve",
		method: "post",
		data
	})
}

export function deleteBusinessMatters(
	ids: string | number | Array<string | number>
): AxiosPromise<BusinessMattersActionResponse> {
	const idText = Array.isArray(ids) ? ids.join(",") : ids
	return request({
		url: `/base/businessMatters/${idText}`,
		method: "delete"
	})
}

export function exportBusinessMatters(query: BusinessMattersListQuery) {
	return download("/base/businessMatters/export", query, `经营事项评审_${new Date().getTime()}.xlsx`)
}

export function uploadReviewFile(data: FormData): AxiosPromise<ReviewUploadResult> {
	return request({
		url: "/resource/oss/upload",
		method: "post",
		data
	})
}

export function getReviewLeafDeptList(): AxiosPromise<ReviewLeafDeptResponse> {
	return request({
		url: "/base/public/depts/leaf",
		method: "get"
	})
}
