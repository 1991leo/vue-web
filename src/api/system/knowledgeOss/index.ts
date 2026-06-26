import request from "@/utils/request"
import { AxiosPromise } from "axios"
import { KnowledgeOssForm, KnowledgeOssQuery, KnowledgeOssVO, KnowledgeUploadResult } from "./types"

// 查询文件知识库列表
export function listKnowledgeOss(query: KnowledgeOssQuery): AxiosPromise<KnowledgeOssVO[]> {
	return request({
		url: "/base/knowledgeOss/list",
		method: "get",
		params: query
	})
}

// 新增文件知识库
export function addKnowledgeOss(data: KnowledgeOssForm): AxiosPromise<any> {
	return request({
		url: "/base/knowledgeOss",
		method: "post",
		data
	})
}

// 删除文件知识库
export function delKnowledgeOss(ids: number | string | Array<number | string>): AxiosPromise<any> {
	return request({
		url: "/base/knowledgeOss/" + ids,
		method: "delete"
	})
}

// 上传知识库文件，返回 OSS 基础信息后再提交知识库记录
export function uploadKnowledgeFile(data: FormData): AxiosPromise<KnowledgeUploadResult> {
	return request({
		url: "/resource/oss/upload",
		method: "post",
		data
	})
}
