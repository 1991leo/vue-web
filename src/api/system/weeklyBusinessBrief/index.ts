import request, { download } from "@/utils/request"
import { AxiosPromise } from "axios"
import FileSaver from "file-saver"
import { ElMessage } from "element-plus"
import { blobValidate } from "@/utils/ruoyi"
import { errorCode } from "@/utils/errorCode"
import type {
	WeeklyBusinessBriefForm,
	WeeklyBusinessBriefQuery,
	WeeklyBusinessBriefStatsVO,
	WeeklyBusinessBriefVO,
	WeeklyBusinessUploadResult
} from "./types"

// 查询每周经营简报列表
export function listWeeklyBusinessBrief(
	query: WeeklyBusinessBriefQuery
): AxiosPromise<WeeklyBusinessBriefStatsVO | WeeklyBusinessBriefVO[]> {
	return request({
		url: "/base/weeklyBusinessBrief/list",
		method: "get",
		params: query
	})
}

// 获取每周经营简报详情
export function getWeeklyBusinessBrief(id: string | number): AxiosPromise<WeeklyBusinessBriefVO> {
	return request({
		url: `/base/weeklyBusinessBrief/${id}`,
		method: "get"
	})
}

// 新增每周经营简报
export function addWeeklyBusinessBrief(data: WeeklyBusinessBriefForm): AxiosPromise<any> {
	return request({
		url: "/base/weeklyBusinessBrief",
		method: "post",
		data
	})
}

// 修改每周经营简报
export function updateWeeklyBusinessBrief(data: WeeklyBusinessBriefForm): AxiosPromise<any> {
	return request({
		url: "/base/weeklyBusinessBrief",
		method: "put",
		data
	})
}

// 上传周报附件，返回系统 OSS 文件地址
export function uploadWeeklyBusinessBriefFile(data: FormData): AxiosPromise<WeeklyBusinessUploadResult> {
	return request({
		url: "/resource/oss/upload",
		method: "post",
		data
	})
}

// 删除每周经营简报
export function delWeeklyBusinessBrief(ids: string | number | Array<string | number>): AxiosPromise<any> {
	return request({
		url: `/base/weeklyBusinessBrief/${ids}`,
		method: "delete"
	})
}

// 导出每周经营简报列表
export function exportWeeklyBusinessBriefExcel(query: WeeklyBusinessBriefQuery) {
	return download("/base/weeklyBusinessBrief/export/excel", query, `每周经营简报_${new Date().getTime()}.xlsx`)
}

// 获取汇总简报 Word 文件流，供预览和下载复用
export async function getWeeklyBusinessBriefWordBlob(query: WeeklyBusinessBriefQuery) {
	const resp = (await request({
		url: "/base/weeklyBusinessBrief/export/word",
		method: "get",
		params: query,
		responseType: "blob"
	})) as any

	if (blobValidate(resp)) {
		return new Blob([resp], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })
	}

	const resText = await new Blob([resp]).text()
	const rspObj = JSON.parse(resText)
	const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode.default
	ElMessage.error(errMsg)
	throw new Error(errMsg)
}

// 导出汇总简报 Word，使用 GET 方法下载
export async function exportWeeklyBusinessBriefWord(query: WeeklyBusinessBriefQuery) {
	const blob = await getWeeklyBusinessBriefWordBlob(query)
	FileSaver.saveAs(blob, `每周经营简报汇总_${new Date().getTime()}.docx`)
}

// 导出汇总简报 PDF，使用 GET 方法下载
export async function exportWeeklyBusinessBriefPdf(query: WeeklyBusinessBriefQuery) {
	const resp = (await request({
		url: "/base/weeklyBusinessBrief/export/pdf",
		method: "get",
		params: query,
		responseType: "blob"
	})) as any

	if (blobValidate(resp)) {
		const blob = new Blob([resp], { type: "application/pdf" })
		FileSaver.saveAs(blob, `每周经营简报汇总_${new Date().getTime()}.pdf`)
		return
	}

	const resText = await new Blob([resp]).text()
	const rspObj = JSON.parse(resText)
	const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode.default
	ElMessage.error(errMsg)
	throw new Error(errMsg)
}
