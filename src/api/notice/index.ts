import request from "@/utils/request"

export interface DeviceMsgItem {
	id?: string | number
	msgTitle?: string
	msgContent?: string
	msgReadStatus?: number
	msgType?: string
	pushTime?: string
	routerPath?: string
	isExpanded?: boolean
}

export interface DeviceMsgQuery {
	receiveUserId?: string | number
	pageNum: number
	pageSize: number
}

export interface ReadMsgParams {
	id?: string | number
	receiveUserId?: string | number
	readType: 1 | 2
}

export interface DeviceMsgListResponse {
	code?: number
	msg?: string
	rows?: DeviceMsgItem[]
	total?: number
}

export interface DeviceMsgActionResponse {
	code?: number
	msg?: string
	data?: unknown
}

// 获取SSE信息列表
export const getSseMsgList = (params: DeviceMsgQuery): Promise<DeviceMsgListResponse> => {
	return request({
		url: "/base/deviceMsg/list",
		method: "get",
		params: params
	})
}
// 全读
export const readMsg = (data: ReadMsgParams): Promise<DeviceMsgActionResponse> => {
	return request({
		url: "/base/deviceMsg/readMsg",
		method: "post",
		data
	})
}
