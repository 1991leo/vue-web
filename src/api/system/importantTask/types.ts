export interface ImportantTaskLogVO {
	id?: number | string
	taskId?: number | string
	taskTitle?: string
	logType?: string
	logTitle?: string
	logContent?: string
	oldValue?: string
	newValue?: string
	operatorId?: number | string
	operatorDeptId?: number | string
	operatorDeptName?: string
	operationTime?: string
	remark?: string
}

export interface ImportantTaskVO extends BaseEntity {
	id?: number | string
	taskTitle?: string
	taskDescription?: string
	taskSource?: string
	taskSourceName?: string
	investedEnterprise?: string
	investedEnterpriseName?: string
	taskDept?: string
	hostDept?: string
	coDept?: string
	assigneeId?: number | string
	assigneeName?: string
	collaboratorIds?: string
	collaboratorNames?: string
	taskStatus?: string
	taskPriority?: string
	planEndTime?: string
	deptId?: number | string
	deptName?: string
	remark?: string
	logs?: ImportantTaskLogVO[]
}

export interface ImportantTaskForm {
	id?: number | string
	taskTitle: string
	taskDescription?: string
	taskSource?: string
	investedEnterprise?: string
	taskDept?: string
	hostDept?: string
	coDept?: string
	assigneeId?: number | string
	assigneeName?: string
	collaboratorIds?: string
	collaboratorNames?: string
	taskStatus?: string
	taskPriority?: string
	planEndTime?: string
	deptId?: number | string
	deptName?: string
	remark?: string
}

export interface ImportantTaskQuery extends Partial<PageQuery> {
	id?: number | string
	taskTitle?: string
	taskSource?: string
	investedEnterprise?: string
	taskDept?: string
	hostDept?: string
	coDept?: string
	assigneeId?: number | string
	assigneeName?: string
	taskStatus?: string
	taskPriority?: string
	beginTime?: string
	endTime?: string
	planEndTime?: string
	deptId?: number | string
	deptName?: string
	remark?: string
	orderByColumn?: string
	isAsc?: string
	params?: Record<string, any>
}
