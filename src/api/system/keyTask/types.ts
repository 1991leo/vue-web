export interface KeyTaskProgressVO {
	id?: number | string
	taskId?: number | string
	content?: string
	prevProgress?: number
	currentProgress?: number
	coDeptId?: number | string
	coDeptIdName?: string
	operatorId?: number | string
	operatorName?: string
	matched?: boolean
	tenantId?: string
	createTime?: string
}

export interface KeyTaskLogVO {
	createDept?: number | string
	createBy?: number | string
	createTime?: string
	updateBy?: number | string
	updateTime?: string
	content?: string
	operatorName?: string
	prevProgress?: number
	currentProgress?: number
	[key: string]: any
}

export interface KeyTaskProgressForm {
	id?: number | string
	taskId?: number | string
	content?: string
	prevProgress?: number
	currentProgress?: number
}

export interface KeyTaskMilestoneVO {
	id?: number | string
	taskId?: number | string
	milestoneTitle?: string
	deadline?: string
	stage?: string
	status?: string // 0未开始 1进行中 2已完成
	statusName?: string
	delayDays?: number
	remark?: string
	tenantId?: string
	createTime?: string
}

export interface KeyTaskMilestoneForm {
	id?: number | string
	taskId?: number | string
	milestoneTitle?: string
	deadline?: string
	stage?: string
	status?: string
	delayDays?: number
	remark?: string
}

export interface KeyTaskClosureVO {
	id?: number | string
	taskId?: number | string
	evidenceDescription?: string
	attachments?: string
	status?: string // 申请状态(0待审核 1已通过 2已驳回)
	statusName?: string
	auditorId?: number | string
	auditorName?: string
	auditOpinion?: string
	auditTime?: string
	tenantId?: string
	remark?: string
	createTime?: string
}

export interface KeyTaskClosureForm {
	id?: number | string
	taskId?: number | string
	evidenceDescription?: string
	attachments?: string
	status?: string
	auditorId?: number | string
	auditorName?: string
	auditOpinion?: string
	auditTime?: string
	remark?: string
}

export interface KeyTaskVO extends BaseEntity {
	id?: number | string
	taskTitle?: string
	taskSource?: string
	taskSourceName?: string
	assigneeId?: number | string
	assigneeName?: string
	taskLevel?: string
	taskLevelName?: string
	taskCategory?: string
	taskCategoryName?: string
	priority?: string
	priorityName?: string
	specialProject?: string
	planStartTime?: string
	planEndTime?: string
	expectedResult?: string
	taskRequirement?: string
	hostDeptId?: number | string
	hostDeptName?: string
	coDeptIds?: string
	coDeptNames?: string
	taskStatus?: string
	taskStatusName?: string
	progress?: number
	evidenceDescription?: string
	attachments?: string
	closureStatus?: string
	closureStatusName?: string
	auditorId?: number | string
	auditOpinion?: string
	auditTime?: string
	tenantId?: string
	remark?: string
	createTime?: string
	progressList?: KeyTaskProgressVO[]
	logList?: KeyTaskLogVO[]
	milestoneList?: KeyTaskMilestoneVO[]
	closure?: KeyTaskClosureVO
}

export interface KeyTaskForm {
	id?: number | string
	taskTitle: string
	taskSource: string
	assigneeId?: number | string
	assigneeName?: string
	taskLevel?: string
	taskCategory?: string
	priority?: string
	specialProject?: string
	planStartTime?: string
	planEndTime?: string
	expectedResult?: string
	taskRequirement?: string
	hostDeptId?: number | string
	hostDeptName?: string
	coDeptIds?: string
	coDeptNames?: string
	taskStatus?: string
	progress?: number
	evidenceDescription?: string
	attachments?: string
	closureStatus?: string
	remark?: string
}

export interface KeyTaskQuery extends Partial<PageQuery> {
	taskTitle?: string
	taskSource?: string
	assigneeId?: string
	assigneeName?: string
	taskLevel?: string
	taskCategory?: any
	priority?: string
	specialProject?: string
	planStartTime?: string
	planEndTime?: string
	hostDeptId?: string
	coDeptIds?: string
	taskStatus?: string
	progress?: string
}

export interface KeyTaskStatVO {
	status?: string
	statusName?: string
	count?: number
}
