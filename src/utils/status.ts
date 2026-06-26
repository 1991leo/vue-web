import statusErrorB from "../assets/images/status_error_b.webp"
import statusPenddingB from "../assets/images/status_pendding_b.webp"
import statusStartB from "../assets/images/status_start_b.webp"
import statusSuccesB from "../assets/images/status_succes_b.webp"

export type StatusDotType =
	| "status-dot-info"
	| "status-dot-start_dsp_storage"
	| "status-dot-start_dsp"
	| "status-dot-start"
	| "status-dot-pending"
	| "status-dot-success"
	| "status-dot-warning"
	| "status-dot-warning_dsp"
	| "status-dot-warning_dsp_none"
	| "status-dot-error_dsp"
	| "status-dot-normal"
	| "status-dot-none"
	| ""

export type StatusPlanBDotType =
	| "status-plan-b-dot-info"
	| "status-plan-b-dot-start_dsp_storage"
	| "status-plan-b-dot-start_dsp"
	| "status-plan-b-dot-start"
	| "status-plan-b-dot-pending"
	| "status-plan-b-dot-success"
	| "status-plan-b-dot-warning"
	| "status-plan-b-dot-warning_dsp"
	| "status-plan-b-dot-warning_dsp_none"
	| "status-plan-b-dot-error_dsp"
	| "status-plan-b-dot-normal"
	| "status-plan-b-dot-none"
	| ""

export type StatusImgType = "img-info" | "img-start" | "img-pending" | "img-success" | "img-warning"
const STATUS_LISTS = {
	info: ["草稿", "已下单", "已删除", "暂停挂网", "不在线", "未评价", "已消警"],
	start_dsp_storage: ["待县级初审"],
	start: [
		"待材料确认",
		"待部门会签",
		"待领导确认",
		"待开始",
		"待处理",
		"待审核",
		"待发货",
		"待送审",
		"待平台审核",
		"待机构审核",
		"待供应商审核",
		"待调入方审核",
		"待调出方审核",
		"待机构退回",
		"待平台退回",
		"待确认",
		"待确定",
		"待评价",
		"未发货",
		"未上报",
		"待市级复核",
		"待市级初审"
	],
	start_dsp: ["待省级复审、待省级复核"],
	pending: [
		"进行中",
		"审核中",
		"调出方审核中",
		"调入方审核中",
		"供应商审核中",
		"执行中",
		"平台审核中",
		"机构审核中",
		"统采执行中",
		"统采计划中",
		"采购中",
		"统采中",
		"部分发货",
		"一方审核通过",
		"运输中",
		"锁定",
		"药事会审核",
		"专家会审核",
		"已发货",
		"调度计划中",
		"临采中",
		"临时采购计划中",
		"申请变更中",
		"计划中",
		"已付款",
		"提交申请",
		"活跃区"
	],
	success: [
		"已完成",
		"执行完成",
		"执行完毕",
		"执行成功",
		"机构审核通过",
		"平台审核通过",
		"供应商审核通过",
		"调出方审核通过",
		"调入方审核通过",
		"审核通过",
		"处理完成",
		"处理完毕",
		"处理成功",
		"成功",
		"已评价",
		"已挂网",
		"已确认",
		"已确定",
		"已收款",
		"启用",
		"全部发货",
		"双方审核通过",
		"已签收",
		"已收货",
		"已确定",
		"已处理",
		"同意变更申请",
		"启用中",
		"供应中",
		"安全",
		"在线",
		"统一用药",
		"已上报"
	],
	warning: [
		"材料确认不通过",
		"会签驳回",
		"领导驳回",
		"已延期",
		"延期",
		"平台审核未通过",
		"调出方审核未通过",
		"调出方审核不通过",
		"调入方审核未通过",
		"调入方审核不通过",
		"平台审核不通过",
		"机构审核未通过",
		"机构审核不通过",
		"供应商审核未通过",
		"供应商审核不通过",
		"审核未通过",
		"审核不通过",
		"机构退回",
		"平台退回",
		"执行失败",
		"执行不通过",
		"失败",
		"拒绝变更申请",
		"已停用",
		"停止供应",
		"不安全",
		"非活跃区",
		"取消挂网",
		"未锁定",
		"停用",
		"自行遴选用药",
		"非默认供应商"
	],
	warning_dsp: ["审核驳回"],
	warning_dsp_none: ["已注销"],
	error_dsp: ["未消警"],
	normal: ["默认供应商"],
	none: [""]
} as const
export function getStatusColorClass(statusName: string | undefined | null): StatusDotType {
	if (!statusName) return ""

	if (STATUS_LISTS.start_dsp_storage.includes(statusName as any)) return "status-dot-start_dsp_storage"
	if (STATUS_LISTS.start_dsp.includes(statusName as any)) return "status-dot-start_dsp"
	if (STATUS_LISTS.warning_dsp.includes(statusName as any)) return "status-dot-warning_dsp"
	if (STATUS_LISTS.warning_dsp_none.includes(statusName as any)) return "status-dot-warning_dsp_none"
	if (STATUS_LISTS.info.includes(statusName as any)) return "status-dot-info"
	if (STATUS_LISTS.start.includes(statusName as any)) return "status-dot-start"
	if (STATUS_LISTS.pending.includes(statusName as any)) return "status-dot-pending"
	if (STATUS_LISTS.success.includes(statusName as any)) return "status-dot-success"
	if (STATUS_LISTS.warning.includes(statusName as any)) return "status-dot-warning"
	if (STATUS_LISTS.normal.includes(statusName as any)) return "status-dot-normal"
	if (STATUS_LISTS.none.includes(statusName as any)) return "status-dot-none"
	if (STATUS_LISTS.error_dsp.includes(statusName as any)) return "status-dot-error_dsp"
	return "status-dot-info"
}

export function getStatusColorFont(statusName: string | undefined | null) {
	if (!statusName) return ""
	const type = getStatusColorClass(statusName)
	return type ? type.replace("status-dot-", "status-").replace("normal", "info") : ""
}

type StatusPlanBListKey = keyof typeof STATUS_LISTS

function getStatusPlanBListKey(statusName: string | undefined | null): StatusPlanBListKey | "" {
	if (!statusName) return ""
	if (STATUS_LISTS.start_dsp_storage.includes(statusName as any)) return "start_dsp_storage"
	if (STATUS_LISTS.start_dsp.includes(statusName as any)) return "start_dsp"
	if (STATUS_LISTS.warning_dsp.includes(statusName as any)) return "warning_dsp"
	if (STATUS_LISTS.warning_dsp_none.includes(statusName as any)) return "warning_dsp_none"
	if (STATUS_LISTS.info.includes(statusName as any)) return "info"
	if (STATUS_LISTS.start.includes(statusName as any)) return "start"
	if (STATUS_LISTS.pending.includes(statusName as any)) return "pending"
	if (STATUS_LISTS.success.includes(statusName as any)) return "success"
	if (STATUS_LISTS.warning.includes(statusName as any)) return "warning"
	if (STATUS_LISTS.normal.includes(statusName as any)) return "normal"
	if (STATUS_LISTS.none.includes(statusName as any)) return "none"
	if (STATUS_LISTS.error_dsp.includes(statusName as any)) return "error_dsp"
	return "info"
}

export function getStatusPlanBColorClass(statusName: string | undefined | null): StatusPlanBDotType {
	const type = getStatusPlanBListKey(statusName)
	return type ? (`status-plan-b-dot-${type}` as StatusPlanBDotType) : ""
}

export function getStatusPlanBColorFont(statusName: string | undefined | null) {
	if (!statusName) return ""
	const type = getStatusPlanBColorClass(statusName)
	return type ? type.replace("status-plan-b-dot-", "status-plan-b-").replace("normal", "info") : ""
}

export function getStatusPlanBImage(statusName: string | undefined | null) {
	const type = getStatusPlanBListKey(statusName)
	if (!type) return ""
	if (type === "success") return statusSuccesB
	if (type === "warning" || type === "warning_dsp" || type === "error_dsp") return statusErrorB
	if (type === "pending" || type === "start_dsp") return statusPenddingB
	return statusStartB
}

export function getStatusImg(statusName: string | undefined | null): StatusImgType {
	const type = getStatusColorClass(statusName)
	if (type === "status-dot-start") return "img-start"
	if (type === "status-dot-pending") return "img-pending"
	if (type === "status-dot-success") return "img-success"
	if (type === "status-dot-warning") return "img-warning"
	return "img-info"
}
