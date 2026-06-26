import { getToken } from "@/utils/auth"
import { ElNotification } from "element-plus"
import { useNoticeStore } from "@/store/modules/notice"
import xiaoxiwebp from "@/assets/images/xiaoxiwebp.webp"

let currentNotification: ReturnType<typeof ElNotification> | null = null

// 暴露一个用于测试的函数
export const testTriggerNotification = (msg: string = "这是一条测试消息内容") => {
	if (currentNotification) {
		currentNotification.close()
		currentNotification = null
	}

	const iconUrl = new URL(xiaoxiwebp, import.meta.url).href
	const notificationHtml = `
    <div style="display: flex; align-items: flex-start; gap: 12px;">
      <img src="${iconUrl}" style="width: 24px; height: 24px; margin-top: 2px;margin-left: -15px;" />
      <div style="flex: 1;font-family: PingFang SC, PingFang SC;">
        <div style="font-size: 18px; color: #172B4D; font-weight: 600; line-height: 26px;">系统消息</div>
        <div style="margin-top: 8px; font-size: 16px; color: #6B778C; line-height: 24px;">${msg}</div>
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
}

// 初始化socket
export const initWebSocket = (url: any) => {
	if (import.meta.env.VITE_APP_WEBSOCKET === "false") {
		return
	}
	url = url + "?Authorization=Bearer " + getToken() + "&clientid=" + import.meta.env.VITE_APP_CLIENT_ID
	useWebSocket(url, {
		autoReconnect: {
			// 重连最大次数
			retries: 3,
			// 重连间隔
			delay: 1000,
			onFailed() {
				console.log("websocket重连失败")
			}
		},
		heartbeat: {
			message: JSON.stringify({ type: "ping" }),
			// 发送心跳的间隔
			interval: 10000,
			// 接收到心跳response的超时时间
			pongTimeout: 2000
		},
		onConnected() {
			console.log("websocket已经连接")
		},
		onDisconnected() {
			console.log("websocket已经断开")
		},
		onMessage: (_, e) => {
			if (e.data.indexOf("ping") > 0) {
				return
			}
			useNoticeStore().addNotice({
				message: e.data,
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
            <div style="font-size: 18px; color: #172B4D; font-weight: 600; line-height: 26px;">系统消息</div>
            <div style="margin-top: 8px; font-size: 16px; color: #6B778C; line-height: 24px;">${e.data}</div>
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
		}
	})
}
