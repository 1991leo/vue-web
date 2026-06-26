<template>
	<div v-loading="state.loading" class="message-dropdown-content">
		<div class="message-header">
			<span class="message-title">系统消息</span>
			<span
				class="mark-all-read"
				:class="{
					'mark-all-read-active': unreadCount > 0,
					'mark-all-read-disabled': unreadCount === 0
				}"
				@click="handleMarkAllRead"
			>
				一键全读
			</span>
		</div>

		<div class="message-list" @scroll="handleScroll">
			<template v-if="newsList.length > 0">
				<div
					v-for="(v, k) in newsList"
					:key="k"
					class="message-item"
					:class="{ 'message-item-expanded': v.isExpanded }"
				>
					<div class="message-icon-wrapper">
						<!-- <svg-icon icon-class="message" class="message-icon-img" /> -->
						<img :src="xiaoxiIcon" alt="消息图标" class="message-icon-img" />
						<el-badge v-if="v.msgReadStatus === 0" is-dot class="message-badge" />
					</div>
					<div class="message-content">
						<div class="message-header-row">
							<span class="message-title-text">{{ v.msgTitle || "系统消息" }}</span>
							<span class="message-time">{{ v.pushTime }}</span>
						</div>
						<div class="message-body">
							<span class="message-text" :class="{ 'message-text-expanded': v.isExpanded }">
								{{ v.msgContent }}
								<span v-if="v.msgType !== 'notify'" class="go-link" @click.stop="handleGoToPage(v)"> 立即前往 </span>
							</span>
							<span class="expand-link" @click.stop="handleToggleExpand(v)">
								{{ v.isExpanded ? "收起" : "展开" }}
							</span>
						</div>
					</div>
				</div>
			</template>
			<div v-else class="empty-message">暂无消息</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="layoutBreadcrumbUserNews">
import { ref, reactive, computed, watch } from "vue"
import { useRouter } from "vue-router"
import { ElMessageBox, ElMessage } from "element-plus"
import { useNoticeStore, type NoticeItem } from "@/store/modules/notice"
import { useUserStore } from "@/store/modules/user"
import { getSseMsgList, readMsg, type DeviceMsgItem, type DeviceMsgQuery, type ReadMsgParams } from "@/api/notice/index"
import xiaoxiIcon from "@/assets/icons/svg/xiaoxi.svg"

const router = useRouter()
const noticeStore = useNoticeStore()
const userStore = useUserStore()
const userId = ref(userStore.userId)

// 定义消息项类型（对齐参考文件的结构）
interface MessageItem {
	id?: string | number
	msgTitle?: string
	pushTime?: string
	msgContent?: string
	msgReadStatus: number
	msgType?: string
	routerPath?: string // 跳转路径
	isExpanded?: boolean // 前端扩展：是否展开
}

// 定义变量内容
const state = reactive({
	loading: false
})
const newsList = ref<MessageItem[]>([])
const unreadCount = computed(() => newsList.value.filter((item: MessageItem) => item.msgReadStatus === 0).length)

const pageNum = ref(2)
const pageSize = ref(20)
const hasMore = ref(true)
const messageLoading = ref(false)

const isStoreNotice = (item: NoticeItem | DeviceMsgItem): item is NoticeItem => "read" in item

const formatMessage = (item: NoticeItem | DeviceMsgItem): MessageItem => ({
	...item,
	msgReadStatus: item.msgReadStatus ?? (isStoreNotice(item) && item.read ? 1 : 0),
	isExpanded: item.isExpanded ?? false
})

watch(
	() => noticeStore.state.notices,
	(list) => {
		newsList.value = list.map(formatMessage)
		const loadedCount = newsList.value.length
		pageNum.value = Math.floor(loadedCount / pageSize.value) + 1
		hasMore.value = loadedCount > 0 && loadedCount % pageSize.value === 0
	},
	{ immediate: true, deep: true }
)

const getTableData = async (isLoadMore = false) => {
	if (messageLoading.value) return
	if (isLoadMore && !hasMore.value) return

	state.loading = true
	messageLoading.value = true
	try {
		const queryParams: DeviceMsgQuery = {
			receiveUserId: userId.value,
			pageNum: isLoadMore ? pageNum.value : 1,
			pageSize: pageSize.value
		}
		const res = await getSseMsgList(queryParams)
		const list = res.rows || []

		const formatList = list.map((item: DeviceMsgItem) => ({
			...item,
			msgReadStatus: item.msgReadStatus ?? 0,
			isExpanded: false // 默认收起
		}))

		if (isLoadMore) {
			newsList.value = [...newsList.value, ...formatList]
			hasMore.value = list.length >= pageSize.value
			if (hasMore.value) pageNum.value += 1
		} else {
			newsList.value = formatList
			hasMore.value = list.length >= pageSize.value
			pageNum.value = 2
		}
		noticeStore.state.notices = [...newsList.value]
	} catch (error) {
		console.error("获取消息列表失败", error)
	} finally {
		state.loading = false
		messageLoading.value = false
	}
}

const markMessageAsRead = async (message: MessageItem) => {
	try {
		if (message.msgReadStatus) return
		const params: ReadMsgParams = {
			id: message.id,
			receiveUserId: userId.value,
			readType: 1
		}
		await readMsg(params)
		getTableData()
	} catch (error) {
		console.error("[消息] 标记已读失败:", error)
	}
}

const handleToggleExpand = (message: MessageItem) => {
	message.isExpanded = !message.isExpanded
	// 展开时自动标记为已读
	if (message.isExpanded && message.msgReadStatus === 0) {
		markMessageAsRead(message)
	}
}

const handleGoToPage = (message: MessageItem) => {
	if (!message.routerPath) return

	// 未读则先标记已读
	if (message.msgReadStatus === 0) {
		markMessageAsRead(message)
	}

	// 跳转到指定路径
	router.push(message.routerPath)
}

const handleMarkAllRead = async () => {
	if (unreadCount.value === 0) return

	try {
		await ElMessageBox.confirm(`确定一键全读吗?`, "确认操作", {
			confirmButtonText: "确定",
			cancelButtonText: "取消",
			type: "warning"
		})

		const params: ReadMsgParams = {
			receiveUserId: userId.value,
			readType: 2
		}
		await readMsg(params)

		getTableData()
		ElMessage.success("操作成功")
	} catch (error) {
		// 取消操作不处理
		if (error !== "cancel") {
			console.error("[消息] 一键全读失败:", error)
			ElMessage.error("操作失败")
		}
	}
}

const handleScroll = (event: Event) => {
	const target = event.target as HTMLElement
	if (!target || messageLoading.value || !hasMore.value) return

	const { scrollTop, scrollHeight, clientHeight } = target
	// 底部预加载一页，避免用户看到明显的加载断层
	if (scrollHeight - scrollTop - clientHeight < 50) {
		getTableData(true)
	}
}
</script>

<style lang="scss" scoped>
.message-dropdown-content {
	width: 400px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.message-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px;
	margin-bottom: 14px;
	border-bottom: 1px solid #ebeef5;
}

.message-title {
	font-size: 18px;
	font-weight: 600;
	color: #172b4d;
}

.mark-all-read {
	font-size: 16px;

	&.mark-all-read-active {
		color: #f53f3f;
		cursor: pointer;

		&:hover {
			color: #d92d20;
		}
	}

	&.mark-all-read-disabled {
		color: #fdcdc5;
		cursor: not-allowed;
		pointer-events: none;
	}
}

.message-list {
	max-height: 300px;
	overflow-y: auto;
	padding: 0 14px;
	flex: 1;

	/* 滚动条样式优化 */
	&::-webkit-scrollbar {
		width: 8px;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
	}

	&::-webkit-scrollbar-thumb {
		background: #e9e9ed;
		border-radius: 4px;

		&:hover {
			background: #d0d0d4;
		}
	}

	// scrollbar-width: thin;
	scrollbar-color: #e9e9ed transparent;
}

.message-item {
	display: flex;
	min-height: 68px;
	padding: 8px 12px;
	margin-bottom: 8px;
	cursor: default;

	&:hover {
		background-color: #fafbfc;
		border-radius: 3px;

		.expand-link {
			color: #00b46e;
		}
	}

	&.message-item-expanded {
		min-height: auto;
		height: auto;
	}
}

.message-icon-wrapper {
	position: relative;
	width: 32px;
	height: 32px;
	margin-right: 12px;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(0, 180, 110, 0.1);
	border-radius: 50%;
}

.message-icon-img {
	font-size: 18px;
	color: #00b46e;
}

.message-badge {
	position: absolute;
	right: 2px;
	top: -1px;
}

.message-content {
	flex: 1;
	min-width: 0;
}

.message-header-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
}

.message-title-text {
	font-weight: 500;
	font-size: 16px;
	color: #172b4d;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	margin-right: 8px;
}

.message-time {
	font-weight: 400;
	font-size: 12px;
	color: #a5adba;
	flex-shrink: 0;
}

.message-body {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 8px;
}

.message-text {
	font-weight: 400;
	font-size: 14px;
	color: #6b778c;
	line-height: 24px;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	margin-right: 8px;

	&.message-text-expanded {
		white-space: normal;
		word-break: break-word;
	}
}

.expand-link {
	margin-top: 2px;
	font-size: 14px;
	color: #6b778c;
	cursor: pointer;
	flex-shrink: 0;
	user-select: none;
	transition: color 0.3s;
}

.go-link {
	font-size: 14px;
	color: #00b46e;
	cursor: pointer;
	user-select: none;
	transition: color 0.3s;
	margin-left: 4px;

	&:hover {
		color: #26c285;
		text-decoration: underline;
	}
}

.empty-message {
	padding: 40px 0;
	text-align: center;
	color: #909399;
	font-size: 14px;
}
</style>
