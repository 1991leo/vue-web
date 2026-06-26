export interface BizProjectVO {
	id?: string | number
	projectName?: string
	projectDesc?: string
	projectLevel?: string
	projectLevelName?: string
	currentStage?: string
	currentStageName?: string
	estimatedAmount?: number
	leadingEnterpriseId?: string | number
	leadingEnterpriseName?: string
	collaborativeEnterprises?: string
	collaborativeEnterpriseNames?: string
	status?: string
	statusName?: string
	remark?: string
	createTime?: string
	timelines?: BizProjectTimelineVO[]
	milestones?: BizProjectMilestoneVO[]
}

export interface BizProjectQuery extends Partial<PageQuery> {
	projectName?: string
	projectLevel?: string | number
	currentStage?: string
	leadingEnterpriseId?: string | number
	remark?: string
}

export interface BizProjectForm {
	id?: string | number
	projectName?: string
	projectDesc?: string
	projectLevel?: string
	currentStage?: string
	estimatedAmount?: number
	leadingEnterpriseId?: string | number
	leadingEnterpriseName?: string
	collaborativeEnterprises?: string
	collaborativeEnterpriseNames?: string
	status?: string
	remark?: string
}

export interface BizProjectTimelineVO {
	id?: string | number
	projectId?: string | number
	timelineType?: string
	timelineTypeName?: string
	content?: string
	stage?: string
	stageName?: string
	operatorName?: string
	createTime?: string
}

export interface BizProjectTimelineForm {
	timelineType?: string
	content?: string
	stage?: string
}

export interface BizProjectMilestoneVO {
	id?: string | number
	projectId?: string | number
	milestoneName?: string
	deadline?: string
	status?: string
	statusName?: string
	stage?: string
	delayDays?: number
	remark?: string
}

export interface BizProjectMilestoneForm {
	id?: string | number
	projectId?: string | number
	milestoneName?: string
	deadline?: string
	status?: string
	stage?: string
	remark?: string
}
