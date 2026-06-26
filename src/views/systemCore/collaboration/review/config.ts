import type { BizBusinessMattersProcessLogVo, BizBusinessMattersVo } from "@/api/system/review/types"
import { useUserStore } from "@/store/modules/user"
import dayjs from "dayjs"

export type ReviewBusinessType = "review" | "deliberation"
export type ReviewAttachmentFieldKey =
	| "projectInitiationRecord"
	| "counterpartyDueDiligence"
	| "contractDraft"
	| "financialCalculation"
	| "legalOpinion"
	| "otherFile"
	| "internalDecisionRecord"

export interface ReviewAttachmentItem {
	key: ReviewAttachmentFieldKey
	label: string
	name: string
	sizeText: string
	required: boolean
	value: string
	multiple?: boolean
	maxCount?: number
	files?: ReviewAttachmentFileItem[]
}

export interface ReviewAttachmentFileItem {
	fileName: string
	url: string
	name: string
	sizeText: string
	value: string
}

export interface ReviewTimelineItem {
	time: string
	label: string
	type: string
	user: string
	content: string
	raw: BizBusinessMattersProcessLogVo
}

export interface ReviewTableColumn {
	prop?: string
	label: string
	minWidth?: string | number
	width?: string | number
	slotName?: string
	showOverflowTooltip?: boolean
	fixed?: boolean | "left" | "right"
}

export interface ReviewSearchItem {
	key: string
	label: string
	type: string
	placeholder: string
	width: string
	options?: Array<{ value: string | number; label: string; children?: Array<Record<string, unknown>> }>
	valueFormat?: string
	elementAttrs?: Record<string, unknown>
}

export interface ReviewSearchForm {
	projectName: string | null
	applicantEnterpriseName: string | null
	applicationDateRange: string[] | null
	status: string | number | null
}

export interface ReviewFormData {
	id?: string | number
	applicationNo?: string
	applicantEnterpriseId: string | number
	applicantEnterpriseIdName: string
	applicationDate: string
	projectName: string
	matterType: ReviewBusinessType
	projectBackground: string
	projectGoal: string
	counterparty: string
	coreContent: string
	triggerDescription: string
	contractAmount: number | null
	profitSituation: string
	fundArrangement: string
	legalCompliance: string
	techAndSafety: string
	performanceRisk: string
	remark: string
	coSignDeptIds: string
	attachments: ReviewAttachmentItem[]
}

export const reviewBusinessTypeOptions = [
	{ label: "评审", value: "review" },
	{ label: "审议", value: "deliberation" }
]

export const operatorEditableStatusNames = ["草稿", "材料确认不通过", "会签驳回", "领导驳回"] as const
export const operatorEditableStatusCodes = [0, 2, 4, 6] as const

export const reviewTableColumns = [
	{ label: "申请单号", dataIndex: "applicationNo" },
	{ label: "项目名称", dataIndex: "projectName", slotName: "projectName" },
	{ label: "申请单位", dataIndex: "applicantEnterpriseIdName" },
	{ label: "事项类型", dataIndex: "matterTypeName" },
	{ label: "当前状态", dataIndex: "statusName", showStatusColor: true },
	{ label: "流程实例ID", dataIndex: "processInstanceId" },
	{ label: "更新时间", dataIndex: "updateTime" },
	{ label: "操作", dataIndex: "operation", fixed: "right", slotName: "operation" }
]

export const createReviewSearchForm = (): ReviewSearchForm => ({
	projectName: null,
	applicantEnterpriseName: null,
	applicationDateRange: null,
	status: null
})

export const createReviewSearchItems = () => [
	{
		key: "status",
		label: "状态",
		type: "select",
		placeholder: "状态",
		width: "12rem",
		options: []
	},
	{
		key: "projectName",
		label: "项目名称",
		type: "input",
		placeholder: "请输入项目名称",
		width: "12rem"
	},
	{
		key: "applicantEnterpriseName",
		label: "申请单位",
		type: "input",
		placeholder: "请输入申请单位",
		width: "12rem"
	},
	{
		key: "applicationDateRange",
		label: "申请日期",
		type: "daterange",
		placeholder: "申请日期",
		width: "14rem",
		valueFormat: "YYYY-MM-DD",
		elementAttrs: {
			startPlaceholder: "开始日期",
			endPlaceholder: "结束日期",
			displayFormat: "YYYY-MM-DD"
		}
	}
]

export const buildReviewSearchItemOptions = (
	searchItems: Array<{ key: string; options?: unknown[] }>,
	optionsMap: Record<string, unknown[]>
) => {
	searchItems.forEach((item) => {
		if (Object.prototype.hasOwnProperty.call(optionsMap, item.key)) {
			item.options = [...optionsMap[item.key]]
		}
	})
}

const userStore = useUserStore()
const deptName = userStore.deptName
const deptId = userStore.deptId
export const createReviewFormData = (): ReviewFormData => ({
	applicantEnterpriseId: deptId,
	applicantEnterpriseIdName: deptName,
	applicationDate: dayjs().format("YYYY-MM-DD"),
	projectName: "",
	matterType: "review",
	projectBackground: "",
	projectGoal: "",
	counterparty: "",
	coreContent: "",
	triggerDescription: "",
	contractAmount: null,
	profitSituation: "",
	fundArrangement: "",
	legalCompliance: "",
	techAndSafety: "",
	performanceRisk: "",
	remark: buildInstructionText("review"),
	coSignDeptIds: "",
	attachments: buildAttachmentTemplate("review")
})

export const buildInstructionText = (businessType: ReviewBusinessType) =>
	businessType === "review"
		? "请集团运营管理部组织相关部门开展经营事项评审，并按流程提交领导确认。"
		: "请集团运营管理部对该事项组织审议，并提交集团运营分管领导确认。"

export const buildAttachmentTemplate = (businessType: ReviewBusinessType): ReviewAttachmentItem[] => {
	const baseList: Array<{
		key: ReviewAttachmentFieldKey
		label: string
		required?: boolean
		multiple?: boolean
		maxCount?: number
	}> = [
		{ key: "projectInitiationRecord", label: "项目内部立项记录(附件)" },
		{ key: "counterpartyDueDiligence", label: "交易对手方尽调报告(附件)" },
		{ key: "contractDraft", label: "合同草案(附件)" },
		{ key: "financialCalculation", label: "财务测算表(附件)" },
		{ key: "legalOpinion", label: "法律审核意见/意见书(附件)" },
		{ key: "otherFile", label: "其他附件", required: false, multiple: true, maxCount: 3 }
	]
	const list =
		businessType === "deliberation"
			? [...baseList, { key: "internalDecisionRecord" as ReviewAttachmentFieldKey, label: "项目内部决策记录(附件)" }]
			: baseList
	return list.map((item) => ({
		key: item.key,
		label: item.label,
		name: "",
		sizeText: "",
		required: item.required ?? true,
		value: "",
		multiple: item.multiple ?? false,
		maxCount: item.maxCount,
		files: []
	}))
}

export const isReviewEditableStatus = (
	item: Pick<BizBusinessMattersVo, "status" | "statusName"> | null | undefined
) => {
	const statusName = String(item?.statusName || "")
	if (typeof item?.status === "number") {
		return operatorEditableStatusCodes.includes(item.status as (typeof operatorEditableStatusCodes)[number])
	}
	return operatorEditableStatusNames.includes(statusName as (typeof operatorEditableStatusNames)[number])
}

export const hasReviewHandlePermission = (
	item: Pick<BizBusinessMattersVo, "currentTaskHandlerList"> | null | undefined,
	currentUserId?: string | number | null
) => {
	if (currentUserId === undefined || currentUserId === null || currentUserId === "") return false
	const handlerList = Array.isArray(item?.currentTaskHandlerList) ? item.currentTaskHandlerList : []
	return handlerList.some((handler) => String(handler?.userId || "") === String(currentUserId))
}

export const getReviewBusinessTypeValue = (
	detail: Pick<BizBusinessMattersVo, "matterType" | "matterTypeName"> | null | undefined
): ReviewBusinessType => {
	if (detail?.matterTypeName === "审议" || detail?.matterType === 2) return "deliberation"
	return "review"
}

export const getReviewBusinessTypeCode = (businessType: ReviewBusinessType) => (businessType === "deliberation" ? 2 : 1)

export const getReviewBusinessTypeName = (businessType: ReviewBusinessType) =>
	businessType === "deliberation" ? "审议" : "评审"

const splitAttachmentValue = (value: unknown) =>
	String(value || "")
		.split(/[,，]/)
		.map((item) => item.trim())
		.filter(Boolean)

const parseMultiAttachmentFiles = (value: unknown): ReviewAttachmentFileItem[] => {
	if (!value) return []
	try {
		const parsed = JSON.parse(String(value))
		if (Array.isArray(parsed)) {
			return parsed
				.filter((item) => item && typeof item === "object")
				.map((item) => {
					const fileName = String(item.fileName || "")
					const url = String(item.url || "")
					return {
						fileName,
						url,
						name: fileName,
						sizeText: "",
						value: url
					}
				})
				.filter((item) => item.url)
		}
	} catch {
		return splitAttachmentValue(value).map((item) => ({
			fileName: getAttachmentNameFromValue(item),
			url: item,
			name: getAttachmentNameFromValue(item),
			sizeText: "",
			value: item
		}))
	}
	return []
}

const getAttachmentNameFromValue = (value: string) => {
	try {
		const normalized = decodeURIComponent(value.split("?")[0] || value)
		const segments = normalized.split("/")
		return segments[segments.length - 1] || ""
	} catch {
		const segments = String(value).split("/")
		return segments[segments.length - 1] || ""
	}
}

export const buildReviewAttachmentListFromDetail = (
	detail: BizBusinessMattersVo | null | undefined,
	businessType: ReviewBusinessType = "review"
) => {
	const template = buildAttachmentTemplate(businessType)
	return template.map((item) => ({
		...(() => {
			const rawValue = detail?.[item.key]
			if (item.multiple) {
				const files = parseMultiAttachmentFiles(rawValue)
				return {
					...item,
					name: files.length ? `已上传 ${files.length} 个文件` : "",
					sizeText: files.length ? `${files.length} 个文件` : "",
					value: files.length ? JSON.stringify(files.map((file) => ({ fileName: file.fileName, url: file.url }))) : "",
					files
				}
			}
			const valueList = splitAttachmentValue(rawValue)
			const singleValue = valueList[0] || ""
			return {
				...item,
				name: singleValue ? getAttachmentNameFromValue(singleValue) : "",
				value: singleValue,
				files: singleValue
					? [
							{
								fileName: getAttachmentNameFromValue(singleValue),
								url: singleValue,
								name: getAttachmentNameFromValue(singleValue),
								sizeText: "",
								value: singleValue
							}
						]
					: []
			}
		})()
	}))
}

export const buildReviewFormDataFromDetail = (detail: BizBusinessMattersVo): ReviewFormData => {
	const matterType = getReviewBusinessTypeValue(detail)
	return {
		id: detail.id,
		applicationNo: detail.applicationNo,
		applicantEnterpriseId: detail.applicantEnterpriseId || "",
		applicantEnterpriseIdName: detail.applicantEnterpriseIdName || "",
		applicationDate: detail.applicationDate || "",
		projectName: detail.projectName || "",
		matterType,
		projectBackground: detail.projectBackground || "",
		projectGoal: detail.projectGoal || "",
		counterparty: detail.counterparty || "",
		coreContent: detail.coreContent || "",
		triggerDescription: detail.triggerDescription || "",
		contractAmount: typeof detail.contractAmount === "number" ? detail.contractAmount : null,
		profitSituation: detail.profitSituation || "",
		fundArrangement: detail.fundArrangement || "",
		legalCompliance: detail.legalCompliance || "",
		techAndSafety: detail.techAndSafety || "",
		performanceRisk: detail.performanceRisk || "",
		remark: detail.remark || buildInstructionText(matterType),
		coSignDeptIds: detail.coSignDeptIds || "",
		attachments: buildReviewAttachmentListFromDetail(detail, matterType)
	}
}

export const getReviewTimelineType = (
	item: Pick<BizBusinessMattersProcessLogVo, "operateName" | "message" | "typeName"> | null | undefined
) => {
	const text = `${item?.operateName || ""}${item?.message || ""}${item?.typeName || ""}`
	if (/驳回|退回|拒绝/.test(text)) return "problem"
	if (/通过|完成|同意/.test(text)) return "progress"
	return "statusChange"
}

export const buildReviewTimelineData = (
	list: BizBusinessMattersProcessLogVo[] | null | undefined
): ReviewTimelineItem[] =>
	(Array.isArray(list) ? list : []).map((item) => ({
		time: item.updateTime || "-",
		label: item.operateName || "-",
		type: getReviewTimelineType(item),
		user: item.createByName || "-",
		content: item.message || "-",
		raw: item
	}))

export const getReviewDetailMetaData = (detail: BizBusinessMattersVo | null) => [
	{ label: "流程实例ID", value: detail?.processInstanceId || "-" },
	{ label: "会签部门ID", value: detail?.coSignDeptIds || "-" },
	{ label: "创建时间", value: detail?.createTime || "-" },
	{ label: "更新时间", value: detail?.updateTime || "-" }
]
