export interface BizCoopProjectVO {
	id?: string | number
	projectNo?: string
	partnerName?: string
	cooperationDirection?: number
	projectName?: string
	contentGoal?: string
	cooperationCategory?: number
	finishTimeType?: number
	finishTimeValue?: string
	businessUnitId?: string
	businessUnitName?: string
	bdgLiaisonId?: string | number
	bdgLiaisonName?: string
	enterpriseLiaison?: string
	followStatus?: number
	latestReportId?: string | number
	latestReportDate?: string
	latestSituationFlag?: number
	latestWeeklyProgress?: string
	latestNextPlan?: string
	reportStatus?: number
	stopReason?: string
	stopTime?: string
	restoreTime?: string
	remark?: string
	createTime?: string
	updateTime?: string
}

export interface BizCoopProjectReportVO {
	id?: string | number
	projectId?: string | number
	projectNo?: string
	projectName?: string
	reportYear?: number
	reportWeek?: number
	weekStartDate?: string
	weekEndDate?: string
	situationFlag?: number
	weeklyProgress?: string
	nextPlan?: string
	reportStatus?: number
	updateTime?: string
	updateDate?: string
	submitTime?: string
	reporterId?: string | number
	reporterName?: string
	version?: number
}

export interface BizCoopProjectLogVO {
	id?: string | number
	projectId?: string | number
	projectNo?: string
	projectName?: string
	logType?: number
	logTitle?: string
	logContent?: string
	oldValue?: string
	newValue?: string
	businessType?: number
	businessId?: string | number
	operatorId?: string | number
	operatorName?: string
	operatorDeptId?: string | number
	operatorDeptName?: string
	operationTime?: string
}

export interface BizCoopProjectDetailVO extends BizCoopProjectVO {
	reports?: BizCoopProjectReportVO[]
	logs?: BizCoopProjectLogVO[]
}

export interface BizCoopProjectStatisticsItem {
	code?: string
	name?: string
	count?: number
	percentage?: number
}

export interface BizCoopProjectStatisticsVO {
	overdueCount?: number
	categoryDistribution?: BizCoopProjectStatisticsItem[]
	businessUnitLoad?: BizCoopProjectStatisticsItem[]
}

export interface BizCoopProjectStatusOverviewVO {
	inProgressCount?: number
	stoppedCount?: number
}

export interface SysDictDataVO {
	dictCode?: string | number
	dictSort?: number
	dictLabel?: string
	dictValue?: string
	dictType?: string
	cssClass?: string
	listClass?: string
	isDefault?: string
	remark?: string
	createTime?: string
}

export interface SysDictDataGroupVO {
	dictType?: string
	dictDataList?: SysDictDataVO[]
}

export interface BizCoopProjectQuery extends Partial<PageQuery> {
	deptId?: string | number
	projectNo?: string
	partnerName?: string
	cooperationDirection?: number
	projectName?: string
	contentGoal?: string
	cooperationCategory?: number
	finishTimeType?: number
	finishTimeValue?: string
	businessUnitId?: string
	businessUnitName?: string
	bdgLiaisonId?: string | number
	bdgLiaisonName?: string
	enterpriseLiaison?: string
	followStatus?: number
	latestSituationFlag?: number
	latestWeeklyProgress?: string
	latestNextPlan?: string
	reportStatus?: number
	stopReason?: string
	overdueStatus?: number
	keyword?: string
	orderByColumn?: string
	isAsc?: string
}

export interface BizCoopProjectForm {
	id?: string | number
	projectNo?: string
	partnerName?: string
	cooperationDirection?: number
	projectName?: string
	contentGoal?: string
	cooperationCategory?: number
	finishTimeType?: number
	finishTimeValue?: string
	businessUnitId?: string
	businessUnitName?: string
	bdgLiaisonId?: string | number
	bdgLiaisonName?: string
	enterpriseLiaison?: string
	followStatus?: number
	latestReportId?: string | number
	latestSituationFlag?: number
	latestWeeklyProgress?: string
	latestNextPlan?: string
	stopReason?: string
	remark?: string
	overdueStatus?: number
	keyword?: string
}

export interface BizCoopProjectReportForm {
	situationFlag?: number
	weeklyProgress?: string
	nextPlan?: string
}

export interface BizCoopProjectStopForm {
	stopReason: string
}
