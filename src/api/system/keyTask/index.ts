import request from "@/utils/request"
import { AxiosPromise } from "axios"
import {
	KeyTaskVO,
	KeyTaskForm,
	KeyTaskQuery,
	KeyTaskProgressVO,
	KeyTaskProgressForm,
	KeyTaskMilestoneVO,
	KeyTaskMilestoneForm,
	KeyTaskClosureVO,
	KeyTaskClosureForm,
	KeyTaskStatVO
} from "./types"

// ==================== 重点事项主接口 ====================

// 查询重点事项跟踪列表
export function listKeyTask(query: KeyTaskQuery): AxiosPromise<any> {
	return request({
		url: "/base/keyTask/list",
		method: "get",
		params: query
	})
}

// 获取重点事项跟踪详细信息
export function getKeyTask(id: number | string, params?: { deptId?: number | string }): AxiosPromise<KeyTaskVO> {
	return request({
		url: "/base/keyTask/" + id,
		method: "get",
		params
	})
}

// 新增重点事项跟踪
export function addKeyTask(data: KeyTaskForm): AxiosPromise<any> {
	return request({
		url: "/base/keyTask",
		method: "post",
		data: data
	})
}

// 修改重点事项跟踪
export function updateKeyTask(data: Partial<KeyTaskForm>): AxiosPromise<any> {
	return request({
		url: "/base/keyTask",
		method: "put",
		data: data
	})
}

// 删除重点事项跟踪
export function delKeyTask(ids: number | string | Array<number | string>): AxiosPromise<any> {
	return request({
		url: "/base/keyTask/" + ids,
		method: "delete"
	})
}

// ==================== 进度接口 ====================

// 新增重点事项进度
export function addKeyTaskProgress(data: KeyTaskProgressForm): AxiosPromise<any> {
	return request({
		url: "/base/keyTask/progress",
		method: "post",
		data: data
	})
}

// 修改重点事项进度
export function updateKeyTaskProgress(data: KeyTaskProgressForm): AxiosPromise<any> {
	return request({
		url: "/base/keyTask/progress",
		method: "put",
		data: data
	})
}

// 获取重点事项进度列表
export function listKeyTaskProgress(taskId: number | string): AxiosPromise<KeyTaskProgressVO[]> {
	return request({
		url: `/base/keyTask/${taskId}/progress/list`,
		method: "get"
	})
}

// 删除重点事项进度
export function delKeyTaskProgress(ids: number | string | Array<number | string>): AxiosPromise<any> {
	return request({
		url: "/base/keyTask/progress/" + ids,
		method: "delete"
	})
}

// ==================== 里程碑接口 ====================

// 新增重点事项里程碑
export function addKeyTaskMilestone(data: KeyTaskMilestoneForm): AxiosPromise<any> {
	return request({
		url: "/base/keyTask/milestone",
		method: "post",
		data: data
	})
}

// 修改重点事项里程碑
export function updateKeyTaskMilestone(data: KeyTaskMilestoneForm): AxiosPromise<any> {
	return request({
		url: "/base/keyTask/milestone",
		method: "put",
		data: data
	})
}

// 获取重点事项里程碑列表
export function listKeyTaskMilestone(taskId: number | string): AxiosPromise<KeyTaskMilestoneVO[]> {
	return request({
		url: `/base/keyTask/${taskId}/milestone/list`,
		method: "get"
	})
}

// 更新里程碑状态
export function updateKeyTaskMilestoneStatus(id: number | string, status: string): AxiosPromise<any> {
	return request({
		url: `/base/keyTask/milestone/${id}/status`,
		method: "put",
		params: { status }
	})
}

// 删除重点事项里程碑
export function delKeyTaskMilestone(ids: number | string | Array<number | string>): AxiosPromise<any> {
	return request({
		url: "/base/keyTask/milestone/" + ids,
		method: "delete"
	})
}

// ==================== 结项接口 ====================

// 获取重点事项结项申请
export function getKeyTaskClosure(taskId: number | string): AxiosPromise<KeyTaskClosureVO> {
	return request({
		url: `/base/keyTask/${taskId}/closure`,
		method: "get"
	})
}

// 新增重点事项结项申请
export function addKeyTaskClosure(data: KeyTaskClosureForm): AxiosPromise<any> {
	return request({
		url: "/base/keyTask/closure",
		method: "post",
		data: data
	})
}

// 修改重点事项结项申请
export function updateKeyTaskClosure(data: KeyTaskClosureForm): AxiosPromise<any> {
	return request({
		url: "/base/keyTask/closure",
		method: "put",
		data: data
	})
}

// 审核结项申请
export function auditKeyTaskClosure(data: KeyTaskClosureForm): AxiosPromise<any> {
	return request({
		url: "/base/keyTask/closure/audit",
		method: "put",
		data: data
	})
}

// 删除重点事项结项申请
export function delKeyTaskClosure(ids: number | string | Array<number | string>): AxiosPromise<any> {
	return request({
		url: "/base/keyTask/closure/" + ids,
		method: "delete"
	})
}

// 获取重点事项状态统计
export function getKeyTaskStats(): AxiosPromise<KeyTaskStatVO[]> {
	return request({
		url: "/base/keyTask/stats",
		method: "get"
	})
}
