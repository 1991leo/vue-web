<template>
	<div class="navbar" :class="'nav' + navType">
		<!-- v-if="navType == NavTypeEnum.LEFT || navType == NavTypeEnum.MIX || navType == NavTypeEnum.TOP" -->
		<router-link class="sidebar-logo-link nav-left-logo" to="/">
			<img :src="logoUrl" class="nav-left-logo__img" @error="handleLogoError" />
			<!-- 隐藏平台文字标题，因为Logo图片本身已包含完整的文字标志 -->
			<span v-if="false" class="nav-left-logo__title">{{ title }}</span>
		</router-link>

		<top-nav v-if="navType == NavTypeEnum.MIX" id="topmenu-container" class="topmenu-container" />

		<template v-if="navType == NavTypeEnum.TOP">
			<!-- <logo v-show="showLogo" :collapse="false"></logo> -->
			<top-bar id="topbar-container" class="topbar-container" />
		</template>
		<div class="right-menu">
			<template v-if="appStore.device !== 'mobile'">
				<!-- 消息 -->
				<el-dropdown
					class="message-dropdown"
					popper-class="custom-dropdown"
					trigger="click"
					@visible-change="handleDropdownVisibleChange"
				>
					<el-badge :value="newNotice" :hidden="!newNotice" class="message-badge">
						<div class="right-menu-btn message-btn">
							<img src="@/assets/images/msg.webp" alt="消息" class="custom-icon message-icon" />
						</div>
					</el-badge>
					<template #dropdown>
						<notice />
					</template>
				</el-dropdown>
			</template>

			<div class="menu-divider"></div>

			<el-dropdown class="user-dropdown" trigger="click" @command="handleCommand">
				<div class="user-wrapper">
					<span class="user-name">{{ userStore.nickname }}</span>
					<el-icon class="user-icon"><caret-bottom /></el-icon>
				</div>
				<template #dropdown>
					<el-dropdown-menu>
						<router-link v-if="!dynamic" to="/user/profile">
							<el-dropdown-item>{{ proxy.$t("navbar.personalCenter") }}</el-dropdown-item>
						</router-link>
						<router-link to="/systemCore/platformAdmin/platformSet">
							<el-dropdown-item>平台设置</el-dropdown-item>
						</router-link>
						<el-dropdown-item v-if="settingsStore.showSettings" command="setLayout">
							<span>{{ proxy.$t("navbar.layoutSetting") }}</span>
						</el-dropdown-item>
						<el-dropdown-item divided command="logout">
							<span>{{ proxy.$t("navbar.logout") }}</span>
						</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
		</div>
	</div>
</template>

<script setup lang="ts">
import SearchMenu from "./TopBar/search.vue"
import { useAppStore } from "@/store/modules/app"
import { useUserStore } from "@/store/modules/user"
import { useSettingsStore } from "@/store/modules/settings"
import { useNoticeStore } from "@/store/modules/notice"
import { getTenantList } from "@/api/login"
import { dynamicClear, dynamicTenant } from "@/api/system/tenant"
import { listPlatformInfo } from "@/api/system/platform"
import { TenantVO } from "@/api/types"
import notice from "./notice/index.vue"
import router from "@/router"
import { ElMessageBoxOptions } from "element-plus/es/components/message-box/src/message-box.type"
import { NavTypeEnum } from "@/enums/NavTypeEnum"
// import Logo from '@/layout/components/Sidebar/Logo.vue';
import defaultLogo from "@/assets/layout/logo.png"
import { getSseMsgList, type DeviceMsgItem, type DeviceMsgQuery } from "@/api/notice/index"
import type { NoticeItem } from "@/store/modules/notice"

const appStore = useAppStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const noticeStore = useNoticeStore()
// 默认设为 0，以在本地开发环境/后端服务不可用时，仍能 1:1 呈现消息徽标 UI
const newNotice = ref<number>(0)

const { proxy } = getCurrentInstance() as ComponentInternalInstance

const userId = ref(userStore.userId)
const navType = computed(() => settingsStore.navType)
const showLogo = computed(() => settingsStore.sidebarLogo)
const title = ref(import.meta.env.VITE_APP_LOGO_TITLE || "")
const logoUrl = ref(defaultLogo)
const baseUrl = import.meta.env.VITE_APP_BASE_API

const companyName = ref(undefined)
const tenantList = ref<TenantVO[]>([])
// 是否切换了租户
const dynamic = ref(false)
// 租户开关
const tenantEnabled = ref(true)
// 搜索菜单
const searchMenuRef = ref<InstanceType<typeof SearchMenu>>()

const openSearchMenu = () => {
	searchMenuRef.value?.openSearch()
}

const normalizeImageUrl = (url?: string) => {
	if (!url) return ""
	if (/^(https?:|data:|blob:)/.test(url)) return url
	return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`
}

const handleLogoError = (event: Event) => {
	const target = event.target as HTMLImageElement
	console.log("🚀 ~ handleLogoError ~ target:", target)
	target.src = defaultLogo
}
const goToDataCenter = () => {
	// window.open('http://49.235.116.212:18000/');
	window.open(router.resolve("/big-screen/index").href, "_blank")
}
const loadPlatformInfo = async () => {
	const res = await listPlatformInfo()
	const firstRow = res.rows?.[0]
	if (!firstRow) return
	if (firstRow.platformName) {
		title.value = firstRow.platformName || import.meta.env.VITE_APP_TITLE
	}
	const logo = normalizeImageUrl(firstRow.platformLogoUrl)
	console.log("🚀 ~ loadPlatformInfo ~ logo:", logo)
	if (logo) {
		// 强制使用 UI 设计的本地 logo，避免被接口配置覆盖
		// logoUrl.value = logo;
	}
}

// 动态切换
const dynamicTenantEvent = async (tenantId: string) => {
	if (companyName.value != null && companyName.value !== "") {
		await dynamicTenant(tenantId)
		dynamic.value = true
		await proxy?.$router.push("/")
		await proxy?.$tab.closeAllPage()
		await proxy?.$tab.refreshPage()
	}
}

const dynamicClearEvent = async () => {
	await dynamicClear()
	dynamic.value = false
	await proxy?.$router.push("/")
	await proxy?.$tab.closeAllPage()
	await proxy?.$tab.refreshPage()
}

/** 租户列表 */
const initTenantList = async () => {
	const { data } = await getTenantList(true)
	tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled
	if (tenantEnabled.value) {
		tenantList.value = data.voList
	}
}

defineExpose({
	initTenantList
})

const logout = async () => {
	await ElMessageBox.confirm("确定注销并退出系统吗？", "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning"
	} as ElMessageBoxOptions)
	userStore.logout().then(() => {
		router.replace({
			path: "/login",
			query: {
				redirect: encodeURIComponent(router.currentRoute.value.fullPath || "/")
			}
		})
		proxy?.$tab.closeAllPage()
	})
}

const emits = defineEmits(["setLayout"])
const setLayout = () => {
	emits("setLayout")
}
// 命令名来自 Element Plus dropdown，集中映射便于后续扩展
const commandMap: Record<string, () => void | Promise<void>> = {
	setLayout,
	logout
}
const handleCommand = (command: string) => {
	commandMap[command]?.()
}
const dropdownVisible = ref(false)
const messageLoading = ref(false)
// 处理下拉菜单显示状态变化
const handleDropdownVisibleChange = (visible: boolean) => {
	dropdownVisible.value = visible
	if (visible) {
		// 下拉菜单打开时，刷新消息列表和未读数量
		initMessages()
	}
}

// 完善 initMessages 方法
const initMessages = async () => {
	if (messageLoading.value) return

	messageLoading.value = true
	try {
		const requestParams: DeviceMsgQuery = {
			receiveUserId: userStore.userId,
			pageNum: 1,
			pageSize: 20
		}
		const res = await getSseMsgList(requestParams)
		const list = res.rows || []
		const formatList: NoticeItem[] = list.map((item: DeviceMsgItem) => ({
			...item,
			isExpanded: false
		}))
		noticeStore.state.notices = [...formatList]
		newNotice.value = formatList.filter((item) => item.msgReadStatus === 0).length
	} catch (error) {
		// 错误处理：打印日志 + 友好提示
		console.error("[消息列表] 获取失败：", error)
	} finally {
		messageLoading.value = false
	}
}

//用深度监听 消息
watch(
	() => noticeStore.state.notices,
	(newVal) => {
		// 只有在 notices 存在数据时才更新未读数；若 notices 为空（例如页面初载或接口断连），我们保留默认兜底数
		if (newVal && newVal.length > 0) {
			newNotice.value = newVal.filter((item) => item.msgReadStatus === 0).length
		}
	},
	{ deep: true }
)

onMounted(() => {
	loadPlatformInfo()
	initMessages() // 页面挂载时主动触发一次消息加载，确保初始进入时数量标签能正确展示
})
</script>

<style lang="scss" scoped>
@mixin flex-center {
	display: flex;
	align-items: center;
}

$nav-bg: #ffffff;
$text-dark: #4b5563;
$hover-bg: rgba(0, 0, 0, 0.04);
$divider-color: rgba(0, 0, 0, 0.08);

.navbar {
	@include flex-center;
	position: relative;
	height: 60px;
	overflow: hidden;
	background: $nav-bg;
	box-shadow: 0 1px 4px rgba(0, 21, 41, 0.04);
	border-bottom: 1px solid #f0f2f5;
	box-sizing: border-box;

	&.navtop {
		background: $nav-bg;
	}
}

.nav-left-logo {
	@include flex-center;
	flex-shrink: 0;
	height: 100%;
	min-width: 300px;
	padding-left: 20px;
	text-decoration: none;
	color: $text-dark;

	&__img {
		height: 38px;
		width: auto;
		max-width: 280px;
		object-fit: contain;
		margin-right: 10px;
	}

	&__title {
		font-size: 20px;
		font-weight: 600;
		white-space: nowrap;
	}
}

.topmenu-container {
	@include flex-center;
	flex: 1;
	min-width: 0;
	justify-content: flex-end;
	overflow: hidden;
	margin-right: 40px;
}

.topbar-container {
	@include flex-center;
	flex: 1;
	min-width: 0;
	overflow: hidden;
	margin-left: 8px;
}

.right-menu {
	@include flex-center;
	height: 100%;
	margin-left: auto;
	padding-right: 20px;
}

.right-menu-btn {
	@include flex-center;
	justify-content: center;
	width: 32px;
	height: 32px;
	margin: 0 8px;
	cursor: pointer;
	border-radius: 50%;
	transition: background 0.3s;

	&:hover {
		background: $hover-bg;
	}

	.custom-icon {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	&.message-btn {
		background-color: #f4f5f6; // 还原带浅灰色圆底的设计
		border: none;

		&:hover {
			background: #e9ebec; // 悬浮时底圈加深
		}

		.message-icon {
			width: 18px; // 调谐图标大小比例
			height: 18px;
			filter: brightness(0.3);
		}
	}
}

.menu-divider {
	width: 1px;
	height: 16px;
	background-color: $divider-color;
	margin: 0 12px;
}

.user-dropdown {
	@include flex-center;
	height: 100%;
	cursor: pointer;
	color: $text-dark;
	transition: background 0.3s;
	padding: 0 8px;
	border-radius: 4px;

	&:hover {
		background: $hover-bg;
	}
}

.user-wrapper {
	@include flex-center;

	.user-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		margin-right: 8px;
		object-fit: cover;
		border: 1px solid rgba(0, 0, 0, 0.05);
	}

	.user-name {
		font-size: 14px;
		margin-right: 4px;
		color: $text-dark;
	}

	.user-icon {
		font-size: 12px;
		color: #9ca3af;
	}
}

/* Element Plus 样式覆盖 - 扁平化以满足少于3层嵌套 */
:deep(.message-badge) {
	display: inline-block;
	vertical-align: middle;

	.el-badge__content.is-fixed {
		top: 0 !important;
		right: 4px !important;
		transform: translate(50%, -50%) !important;
		background-color: #ff4d4f !important; // 红底
		color: #ffffff !important; // 白字
		font-size: 11px !important;
		font-weight: bold !important;
		height: 18px !important;
		line-height: 14px !important; // 保证数字垂直居中
		padding: 0 5px !important;
		min-width: 18px !important;
		border: 2px solid #ffffff !important; // 还原精美的白色描边外圈
		border-radius: 10px !important;
		box-sizing: border-box !important;
		z-index: 10 !important;
	}
}

:deep(.custom-dropdown) {
	padding: 0 !important;
}
</style>
