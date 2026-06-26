import { getToken } from "@/utils/auth"
import { ElNotification } from "element-plus"
import { useNoticeStore } from "@/store/modules/notice"
import xiaoxiwebp from "@/assets/images/xiaoxiwebp.webp"

let currentNotification: ReturnType<typeof ElNotification> | null = null

// 初始化
export const initSSE = (url: any) => {
	if (import.meta.env.VITE_APP_SSE === "false") {
		return
	}

	url = url + "?Authorization=Bearer " + getToken() + "&clientid=" + import.meta.env.VITE_APP_CLIENT_ID
	const { data, error } = useEventSource(url, [], {
		autoReconnect: {
			retries: 5,
			delay: 5000,
			onFailed() {
				console.log("Failed to connect after 5 retries")
			}
		}
	})

	watch(error, () => {
		console.log("SSE connection error:", error.value)
		error.value = null
	})

	watch(data, () => {
		if (!data.value) return
		useNoticeStore().addNotice({
			message: data.value,
			read: false,
			time: new Date().toLocaleString()
		})

		if (currentNotification) {
			currentNotification.close()
			currentNotification = null
		}

		const iconUrl = new URL(xiaoxiwebp, import.meta.url).href
		const notificationHtml = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <img src="${iconUrl}" style="width: 24px; height: 24px; margin-top: 2px;margin-left: -15px;" />
        <div style="flex: 1;font-family: PingFang SC, PingFang SC;">
          <div style="font-size: 18px; color: #172B4D; font-weight: 600; line-height: 26px;">站内消息</div>
          <div style="margin-top: 8px; font-size: 16px; color: #6B778C; line-height: 24px;">${data.value}</div>
        </div>
      </div>
    `

		currentNotification = ElNotification({
			message: notificationHtml,
			dangerouslyUseHTMLString: true,
			type: "info",
			position: "bottom-right",
			duration: 0,
			showClose: true,
			customClass: "sse-notification-custom"
		})

		data.value = null
	})
}
