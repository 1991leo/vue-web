import request from "@/utils/request"
import { AxiosPromise } from "axios"
import {
	BizProjectForm,
	BizProjectMilestoneForm,
	BizProjectMilestoneVO,
	BizProjectQuery,
	BizProjectTimelineForm,
	BizProjectTimelineVO,
	BizProjectVO
} from "./types"

// 查询项目全生命周期管理列表
export function listProject(query: BizProjectQuery): AxiosPromise<BizProjectVO[]> {
	return request({
		url: "/base/project/list",
		method: "get",
		params: query
	})
}

// 查询项目全生命周期管理详细信息
export function getProject(id: string | number): AxiosPromise<BizProjectVO> {
	return request({
		url: `/base/project/${id}`,
		method: "get"
	})
}

// 新增项目全生命周期管理
export function addProject(data: BizProjectForm): AxiosPromise<void> {
	return request({
		url: "/base/project",
		method: "post",
		data
	})
}

// 修改项目全生命周期管理
export function updateProject(data: BizProjectForm): AxiosPromise<void> {
	return request({
		url: "/base/project",
		method: "put",
		data
	})
}

// 删除项目全生命周期管理
export function delProject(ids: string | number | Array<string | number>): AxiosPromise<void> {
	return request({
		url: `/base/project/${ids}`,
		method: "delete"
	})
}

// 项目阶段推进
export function advanceProject(id: string | number, stage: string): AxiosPromise<void> {
	return request({
		url: `/base/project/${id}/advance`,
		method: "put",
		params: { stage }
	})
}

// 获取项目动态时间线列表
export function listProjectTimelines(projectId: string | number): AxiosPromise<BizProjectTimelineVO[]> {
	return request({
		url: `/base/project/${projectId}/timelines`,
		method: "get"
	})
}

// 添加项目动态日志
export function addProjectTimeline(projectId: string | number, data: BizProjectTimelineForm): AxiosPromise<void> {
	return request({
		url: `/base/project/${projectId}/timelines`,
		method: "post",
		data
	})
}

// 删除项目动态日志
export function delProjectTimelines(ids: string | number | Array<string | number>): AxiosPromise<void> {
	return request({
		url: `/base/project/timelines/${ids}`,
		method: "delete"
	})
}

// 获取项目里程碑列表
export function listProjectMilestones(projectId: string | number): AxiosPromise<BizProjectMilestoneVO[]> {
	return request({
		url: `/base/project/${projectId}/milestones`,
		method: "get"
	})
}

// 添加项目里程碑
export function addProjectMilestone(projectId: string | number, data: BizProjectMilestoneForm): AxiosPromise<void> {
	return request({
		url: `/base/project/${projectId}/milestones`,
		method: "post",
		data
	})
}

// 修改项目里程碑
export function updateProjectMilestone(data: BizProjectMilestoneForm): AxiosPromise<void> {
	return request({
		url: "/base/project/milestones",
		method: "put",
		data
	})
}

// 更新里程碑状态
export function updateProjectMilestoneStatus(id: string | number, status: string): AxiosPromise<void> {
	return request({
		url: `/base/project/milestones/${id}/status`,
		method: "put",
		params: { status }
	})
}

// 删除项目里程碑
export function delProjectMilestones(ids: string | number | Array<string | number>): AxiosPromise<void> {
	return request({
		url: `/base/project/milestones/${ids}`,
		method: "delete"
	})
}
