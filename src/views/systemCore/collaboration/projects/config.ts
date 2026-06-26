export type ProjectPageMode = "list" | "create" | "edit" | "detail" | "report" | "history" | "import" | "archive"
export type ProjectStatusKey = string
export type WeeklyStatusKey = "normal" | "overdue" | "notStarted"
export type CompletionModeKey = "" | "date" | "month" | "quarter"

export const projectFollowStatusLabels = {
	draft: "草稿",
	ongoing: "进行中",
	stopped: "停止"
} as const

export interface ProjectOption {
	label: string
	value: string
}

export interface ProjectSearchItem {
	key: string
	label: string
	type: string
	placeholder: string
	filterable?: boolean
	width: string
	options?: ProjectOption[]
	value?: string
}

export interface ProjectWeeklyReportItem {
	id: string
	weekLabel: string
	reportDate: string
	statusTag: string
	progressSummary: string
	situationFlag: string
	situationFlagName: string
	currentStatus: string
	nextPlan: string
	reporter: string
}

export interface ProjectTimelineItem {
	id: string
	step: string
	result: string
	operator: string
	time: string
	content: string
}

export interface CooperationProjectItem {
	id: string
	projectNo: string
	projectName: string
	companyName: string
	businessUnitId: string
	partnerName: string
	cooperationDirection: string
	cooperationDirectionName: string
	projectType: string
	projectTypeName: string
	responsiblePersonId: string
	responsiblePerson: string
	liaisonName: string
	completionMode: CompletionModeKey
	completionModeName: string
	completionDate: string
	completionMonth: string
	completionQuarter: string
	projectStatus: ProjectStatusKey
	projectStatusName: string
	weeklyStatus: WeeklyStatusKey
	weeklyStatusName: string
	latestReportDate: string
	latestProgress: string
	currentSituationTag: string
	nextPlan: string
	contentGoal: string
	remark: string
	stopReason?: string
	stopTime?: string
	isOverdue: boolean
	createdTime: string
	updatedTime: string
	reports: ProjectWeeklyReportItem[]
	timeline: ProjectTimelineItem[]
}

export interface ProjectSearchForm {
	keyword: string | null
	businessUnitId: string | null
	partnerName: string | null
	cooperationDirection: string | null
	projectType: string | null
	projectStatus: string | null
	weeklyStatus: string | null
	currentSituationTag: string | null
}

export interface ProjectFormData {
	id?: string
	projectNo?: string
	projectName: string
	companyName: string
	businessUnitId: string
	partnerName: string
	cooperationDirection: string
	projectType: string
	responsiblePersonId: string
	responsiblePerson: string
	liaisonName: string
	completionMode: CompletionModeKey
	finishTimeValue: string
	followStatus: string
	contentGoal: string
	remark: string
}

export interface ProjectReportFormData {
	currentSituationTag: string
	progressSummary: string
	nextPlan: string
}

export interface ProjectImportResultItem {
	rowIndex: number
	projectName: string
	reason: string
}

export const projectDictTypes = {
	projectCategory: "coop_project_category",
	finishTimeType: "coop_project_finish_time_type",
	projectDirection: "coop_project_direction",
	situationFlag: "situation_flag",
	reportStatus: "report_status",
	followStatus: "follow_status"
} as const

export const projectTableColumns = [
	{ label: "合作企业", dataIndex: "partnerName", minWidth: 120, showOverflowTooltip: true },
	{ label: "合作方向", dataIndex: "cooperationDirectionName", minWidth: 140, showOverflowTooltip: true },
	{ label: "战略合作落地项目", dataIndex: "projectName", minWidth: 160, showOverflowTooltip: true },
	// { label: '合作类别', dataIndex: 'projectTypeName' },
	// { label: '完成时间', dataIndex: 'completionModeName', slotName: 'completionMode' },
	{ label: "负责业务单元", dataIndex: "companyName", minWidth: 160, showOverflowTooltip: true },
	{ label: "大数据集团业务对接人", dataIndex: "responsiblePerson", minWidth: 180, showOverflowTooltip: true },
	{ label: "企业对接人", dataIndex: "liaisonName", minWidth: 140, showOverflowTooltip: true },
	{ label: "跟进状态", dataIndex: "projectStatusName", slotName: "projectStatus", minWidth: 120 },
	{ label: "现状标识", dataIndex: "currentSituationTag", minWidth: 120, showOverflowTooltip: true },
	{ label: "周报状态", dataIndex: "weeklyStatusName", slotName: "weeklyStatus", minWidth: 130 },
	{ label: "本周进展", dataIndex: "latestProgress", minWidth: 140, showOverflowTooltip: true },
	{ label: "下一步计划", dataIndex: "nextPlan", minWidth: 180, showOverflowTooltip: true },
	{ label: "更新日期", dataIndex: "latestReportDate", minWidth: 180, showOverflowTooltip: true },
	{
		label: "操作",
		dataIndex: "operation",
		slotName: "operation",
		fixed: "right",
		minWidth: 72,
		className: "project-operation-column"
	}
]

export const createProjectSearchForm = (): ProjectSearchForm => ({
	keyword: null,
	businessUnitId: null,
	partnerName: null,
	cooperationDirection: null,
	projectType: null,
	projectStatus: null,
	weeklyStatus: null,
	currentSituationTag: null
})

export const createProjectSearchItems = (options?: {
	projectTypeOptions?: ProjectOption[]
	cooperationDirectionOptions?: ProjectOption[]
	companyOptions?: ProjectOption[]
	situationTagOptions?: ProjectOption[]
	reportStatusOptions?: ProjectOption[]
	projectStatusOptions?: ProjectOption[]
	showBusinessUnitSearch?: boolean
}): ProjectSearchItem[] => {
	const showBusinessUnitSearch = options?.showBusinessUnitSearch !== false

	return [
		{
			key: "keyword",
			label: "搜索",
			type: "input",
			placeholder: "项目名称或合作企业",
			width: "12rem"
		},
		// {
		//   key: 'partnerName',
		//   label: '合作企业',
		//   type: 'input',
		//   placeholder: '请输入合作企业',
		//   width: '12rem'
		// },
		{
			key: "cooperationDirection",
			label: "合作方向",
			type: "select",
			filterable: true,
			placeholder: "请选择合作方向",
			width: "12rem",
			options: options?.cooperationDirectionOptions || []
		},
		...(showBusinessUnitSearch
			? [
					{
						key: "businessUnitId",
						label: "负责业务单元",
						filterable: true,
						type: "select",
						placeholder: "请选择负责业务单元",
						width: "12rem",
						options: options?.companyOptions || []
					}
				]
			: []),
		{
			key: "projectType",
			label: "合作类别",
			type: "select",
			placeholder: "请选择合作类别",
			width: "12rem",
			options: options?.projectTypeOptions || []
		},
		{
			key: "currentSituationTag",
			label: "现状标识",
			type: "select",
			placeholder: "请选择现状标识",
			width: "12rem",
			options: options?.situationTagOptions || []
		},
		{
			key: "projectStatus",
			label: "跟进状态",
			type: "select",
			placeholder: "请选择跟进状态",
			width: "12rem",
			options: options?.projectStatusOptions || []
		},
		{
			key: "weeklyStatus",
			label: "周报状态",
			type: "select",
			placeholder: "请选择周报状态",
			width: "12rem",
			options: options?.reportStatusOptions || []
		}
	]
}

export const createProjectFormData = (): ProjectFormData => ({
	projectName: "",
	companyName: "",
	businessUnitId: "",
	partnerName: "",
	cooperationDirection: "",
	projectType: "",
	responsiblePersonId: "",
	responsiblePerson: "",
	liaisonName: "",
	completionMode: "",
	finishTimeValue: "",
	followStatus: "",
	contentGoal: "",
	remark: ""
})

export const createProjectReportFormData = (item?: CooperationProjectItem): ProjectReportFormData => ({
	currentSituationTag: item?.currentSituationTag && item.currentSituationTag !== "-" ? item.currentSituationTag : "",
	// 本周填报必须由用户重新录入，列表上的最新摘要只用于历史参考展示。
	progressSummary: "",
	nextPlan: ""
})

export const getProjectStatusTagType = (status: ProjectStatusKey) => {
	if (status.includes(projectFollowStatusLabels.ongoing)) return "success"
	if (status.includes(projectFollowStatusLabels.stopped)) return "danger"
	if (status.includes(projectFollowStatusLabels.draft)) return "info"
	return "info"
}

export const getWeeklyStatusTagType = (status: WeeklyStatusKey) => {
	if (status === "normal") return "success"
	if (status === "overdue") return "danger"
	return "info"
}

export const formatCompletionText = (item: CooperationProjectItem) => {
	if (item.completionMode === "date") return item.completionDate
	if (item.completionMode === "month") return item.completionMonth
	return item.completionQuarter || "持续型"
}
