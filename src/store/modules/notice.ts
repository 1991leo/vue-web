import { defineStore } from "pinia"
import { reactive } from "vue"

export interface NoticeItem {
	id?: string | number
	title?: string
	read?: boolean
	message?: unknown
	time?: string
	msgTitle?: string
	msgContent?: string
	msgReadStatus?: number
	msgType?: string
	pushTime?: string
	routerPath?: string
	isExpanded?: boolean
}

export const useNoticeStore = defineStore("notice", () => {
	const state = reactive({
		notices: [] as NoticeItem[]
	})

	const addNotice = (notice: NoticeItem) => {
		state.notices.push(notice)
	}

	const removeNotice = (notice: NoticeItem) => {
		state.notices.splice(state.notices.indexOf(notice), 1)
	}

	// 兼容 SSE/WebSocket 推入的旧消息结构，接口消息仍以 msgReadStatus 为准
	const readAll = () => {
		state.notices.forEach((item) => {
			item.read = true
			item.msgReadStatus = 1
		})
	}

	const clearNotice = () => {
		state.notices = []
	}
	return {
		state,
		addNotice,
		removeNotice,
		readAll,
		clearNotice
	}
})
