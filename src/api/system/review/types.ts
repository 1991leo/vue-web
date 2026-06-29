export interface MapObject {
	key?: { [key: string]: any }
	[property: string]: any
}

export interface BusinessMattersListQuery {
	projectName?: string
	applicantEnterpriseIdName?: string
	applicantEnterpriseName?: string
	beginApplicationDate?: string
	endApplicationDate?: string
	status?: string | number
	keyword?: string
	pageSize: number
	pageNum: number
	orderlyColumn?: string
	isAsc?: string
}

export interface BizBusinessMattersApproveBo {
	comment?: string
	coSignDeptIdList?: number[]
	id: number | string
	result: number
	[property: string]: any
}

export interface ReviewLeafDeptVo {
	deptId?: number | string
	requiredCoSignDept?: boolean
	parentId?: number | string
	parentName?: string
	ancestors?: string
	deptName?: string
	deptCategory?: string
	orderNum?: number
	leader?: number | string
	leaderName?: string
	phone?: string
	email?: string
	status?: string
	createTime?: string

	[property: string]: any
}

export interface ReviewLeafDeptResponse {
	code?: number
	msg?: string
	data?: ReviewLeafDeptVo[]
	[property: string]: any
}

export interface BizBusinessMattersCurrentTaskHandlerVo {
	userId?: string | number
	userName?: string
	nickName?: string
	deptName?: string | null
	[property: string]: any
}

export interface BizBusinessMattersProcessLogVo {
	id?: number
	bizMatterId?: number
	createDept?: number
	createDeptName?: string
	type?: number
	typeName?: string
	operate?: number
	operateName?: string
	processInstanceId?: string
	message?: string
	createBy?: number | string
	createByName?: string
	createTime?: string
	updateBy?: number | string
	updateTime?: string
	[property: string]: any
}

export interface BizBusinessMattersVo {
	applicantEnterpriseId?: string
	applicantEnterpriseIdName?: string
	applicationDate?: string
	applicationNo?: string
	contractAmount?: number
	contractDraft?: string
	coreContent?: string
	coSignDeptIds?: string
	counterparty?: string
	counterpartyDueDiligence?: string
	createTime?: string
	financialCalculation?: string
	fundArrangement?: string
	id?: number
	internalDecisionRecord?: string
	legalCompliance?: string
	legalOpinion?: string
	matterType?: number
	matterTypeName?: string | number
	otherFile?: string
	performanceRisk?: string
	processInstanceId?: string
	profitSituation?: string
	projectBackground?: string
	projectGoal?: string
	projectInitiationRecord?: string
	projectName?: string
	remark?: string
	status?: number
	statusName?: string | number
	techAndSafety?: string
	triggerDescription?: string
	updateTime?: string
	currentTaskHandlerList?: BizBusinessMattersCurrentTaskHandlerVo[]
	processLogList?: BizBusinessMattersProcessLogVo[]
	[property: string]: any
}

export interface TableDataInfoBizBusinessMattersVoResponse {
	total?: number
	rows?: BizBusinessMattersVo[]
	code?: number
	msg?: string
	[property: string]: any
}

export interface RBizBusinessMattersVoResponse {
	code?: number
	data?: BizBusinessMattersVo
	msg?: string
	[property: string]: any
}

export interface BizBusinessMattersBo {
	applicantEnterpriseId?: string | number
	applicationDate?: string
	applicationNo?: string
	contractAmount?: number
	contractDraft?: string
	coreContent?: string
	coSignDeptIds?: string
	counterparty?: string
	counterpartyDueDiligence?: string
	createBy?: number
	createDept?: number
	createTime?: string
	financialCalculation?: string
	fundArrangement?: string
	id?: number | string
	internalDecisionRecord?: string
	keyword?: string
	legalCompliance?: string
	legalOpinion?: string
	matterType?: number
	otherFile?: string
	params?: MapObject
	performanceRisk?: string
	processInstanceId?: string
	profitSituation?: string
	projectBackground?: string
	projectGoal?: string
	projectInitiationRecord?: string
	projectName?: string
	remark?: string
	status?: number
	techAndSafety?: string
	triggerDescription?: string
	updateBy?: number
	updateTime?: string
	[property: string]: any
}

export interface BusinessMattersActionResponse {
	code?: number
	msg?: string
	data?: any
	[property: string]: any
}

export interface ReviewUploadResult {
	url: string
	urlWx?: string
	fileName: string
	ossId: number | string
}
