import request, { download } from "@/utils/request"
import { AxiosPromise } from "axios"
import type {
	BizCoopProjectDetailVO,
	BizCoopProjectForm,
	BizCoopProjectQuery,
	BizCoopProjectReportForm,
	BizCoopProjectReportVO,
	BizCoopProjectStatisticsVO,
	BizCoopProjectStatusOverviewVO,
	BizCoopProjectStopForm,
	BizCoopProjectVO,
	SysDictDataGroupVO
} from "./types"

export function listCoopProject(query: BizCoopProjectQuery): AxiosPromise<{ rows: BizCoopProjectVO[]; total: number }> {
	return request({
		url: "/base/coopProject/list",
		method: "get",
		params: query
	})
}

export function getCoopProject(id: string | number): AxiosPromise<BizCoopProjectDetailVO> {
	return request({
		url: `/base/coopProject/${id}`,
		method: "get"
	})
}

export function listCoopProjectReports(id: string | number): AxiosPromise<BizCoopProjectReportVO[]> {
	return request({
		url: `/base/coopProject/${id}/reports`,
		method: "get"
	})
}

export function addCoopProject(data: BizCoopProjectForm): AxiosPromise<void> {
	return request({
		url: "/base/coopProject",
		method: "post",
		data
	})
}

export function updateCoopProject(data: BizCoopProjectForm): AxiosPromise<void> {
	return request({
		url: "/base/coopProject",
		method: "put",
		data
	})
}

export function submitCoopProjectReport(id: string | number, data: BizCoopProjectReportForm): AxiosPromise<void> {
	return request({
		url: `/base/coopProject/${id}/report`,
		method: "post",
		data
	})
}

export function stopCoopProject(id: string | number, data: BizCoopProjectStopForm): AxiosPromise<void> {
	return request({
		url: `/base/coopProject/${id}/stop`,
		method: "post",
		data
	})
}

export function restoreCoopProject(id: string | number): AxiosPromise<void> {
	return request({
		url: `/base/coopProject/${id}/restore`,
		method: "post"
	})
}

export function remindCoopProject(): AxiosPromise<void> {
	return request({
		url: "/base/coopProject/addMessage",
		method: "get"
	})
}

export function getCoopProjectStatistics(): AxiosPromise<BizCoopProjectStatisticsVO> {
	return request({
		url: "/base/coopProject/statistics",
		method: "get"
	})
}

export function getCoopProjectStatusOverview(): AxiosPromise<BizCoopProjectStatusOverviewVO> {
	return request({
		url: "/base/coopProject/statistics/overview",
		method: "get"
	})
}

export function importCoopProject(data: FormData): AxiosPromise<void> {
	return request({
		url: "/base/coopProject/importData",
		method: "post",
		data
	})
}

export function exportCoopProject(query: BizCoopProjectQuery) {
	return download("/base/coopProject/export", query, `合作项目_${new Date().getTime()}.xlsx`)
}

export function downloadCoopProjectTemplate() {
	return download("/base/coopProject/importTemplate", {}, `合作项目导入模板_${new Date().getTime()}.xlsx`)
}

export function listDictDataByTypes(dictTypeList: string[]): AxiosPromise<SysDictDataGroupVO[]> {
	return request({
		url: "/system/dict/data/type/list",
		method: "post",
		data: { dictTypeList }
	})
}
