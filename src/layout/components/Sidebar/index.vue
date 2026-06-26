<template>
	<div class="sidebar-root" :class="{ 'has-logo': showLogo }" :style="{ backgroundColor: bgColor }">
		<!-- <logo v-if="showLogo" :collapse="isCollapse" /> -->

		<!-- 人员展示面板 (154px) - 仅在侧边栏展开状态下显示 -->
		<div v-show="!isCollapse" class="user-profile-panel">
			<!-- 齿轮设置按钮 - 根据全局配置动态控制显示 -->
			<div v-if="settingsStore.showSettings" class="profile-setting-btn" @click="handleSettingClick">
				<img src="@/assets/layout/setting.png" class="profile-setting-icon" />
			</div>
			<!-- 圆形头像：有用户头像则展示，否则回退默认图标 -->
			<div class="profile-avatar-wrap">
				<img :src="userStore.avatar || defaultAvatar" class="profile-avatar" @error="onAvatarError" />
			</div>
			<!-- 用户名 -->
			<div class="profile-username">
				{{ userStore.nickname }}
			</div>
		</div>

		<el-scrollbar :class="[sideTheme, 'sidebar-scroll', { 'has-profile': !isCollapse }]" wrap-class="scrollbar-wrapper">
			<transition :enter-active-class="proxy?.animate.menuSearchAnimate.enter" mode="out-in">
				<el-menu
					ref="menuRef"
					:default-active="activeMenu"
					:collapse="isCollapse"
					:background-color="bgColor"
					:text-color="textColor"
					:unique-opened="false"
					:default-openeds="defaultOpeneds"
					:active-text-color="theme"
					:collapse-transition="false"
					:popper-offset="12"
					mode="vertical"
				>
					<template v-for="(r, index) in visibleSidebarRouters" :key="r.path + index">
						<!-- 仅在两个一级菜单模块之间显示分隔线，首个菜单前不显示 -->
						<div v-if="index > 0" class="menu-group-divider"></div>
						<sidebar-item :item="r" :base-path="r.path" />
					</template>
				</el-menu>
			</transition>
		</el-scrollbar>
		<hamburger class="menu-fold-container" :is-active="appStore.sidebar.opened" @toggle-click="toggleSideBar" />
	</div>
</template>

<script setup lang="ts">
// import Logo from './Logo.vue';
import SidebarItem from "./SidebarItem.vue"
import Hamburger from "@/components/Hamburger/index.vue"
import variables from "@/assets/styles/variables.module.scss"
import { useAppStore } from "@/store/modules/app"
import { useSettingsStore } from "@/store/modules/settings"
import { usePermissionStore } from "@/store/modules/permission"
import { useUserStore } from "@/store/modules/user"
import { RouteRecordRaw } from "vue-router"
import type { MenuInstance } from "element-plus"
import { isExternal } from "@/utils/validate"
import { getNormalPath } from "@/utils/ruoyi"
import { NavTypeEnum } from "@/enums/NavTypeEnum"
import defaultAvatar from "@/assets/layout/avatar.png"

const { proxy } = getCurrentInstance() as ComponentInternalInstance
const emits = defineEmits(["setLayout"])

const route = useRoute()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()
const userStore = useUserStore()
const menuRef = ref<MenuInstance>()
const sidebarRouters = computed<RouteRecordRaw[]>(() => {
	// 左侧菜单模式使用完整菜单，避免若依混合布局临时裁剪 sidebarRouters 后污染侧栏。
	if (settingsStore.navType === NavTypeEnum.LEFT) {
		return permissionStore.getDefaultRoutes()
	}
	return permissionStore.getSidebarRoutes()
})

// 过滤出可见的一级路由，用于分隔线渲染
const visibleSidebarRouters = computed<RouteRecordRaw[]>(() => {
	return sidebarRouters.value.filter((r) => !r.hidden)
})

const getVisibleChildren = (routeItem: RouteRecordRaw) => {
	return (routeItem.children || []).filter((child) => !child.hidden)
}

const resolveMenuPath = (basePath: string, routePath: string) => {
	if (isExternal(routePath)) return routePath
	if (isExternal(basePath)) return basePath
	return getNormalPath(basePath + "/" + routePath)
}

const isSubMenuRoute = (routeItem: RouteRecordRaw) => {
	const visibleChildren = getVisibleChildren(routeItem)
	return visibleChildren.length > 1 || (visibleChildren.length > 0 && routeItem.alwaysShow)
}

const collectOpenMenuIndexes = (routes: RouteRecordRaw[], basePath = ""): string[] => {
	return routes.reduce<string[]>((openIndexes, routeItem) => {
		if (routeItem.hidden) return openIndexes

		const currentBasePath = basePath || routeItem.path
		const currentPath = resolveMenuPath(currentBasePath, routeItem.path)

		// 仅收集一级 el-sub-menu，二级菜单下的三级菜单保持默认收起。
		if (isSubMenuRoute(routeItem)) {
			openIndexes.push(currentPath)
		}

		return openIndexes
	}, [])
}

// 默认只展开所有一级菜单。
const defaultOpeneds = computed(() => {
	return collectOpenMenuIndexes(sidebarRouters.value)
})
const defaultOpenedsKey = computed(() => defaultOpeneds.value.join("|"))
const showLogo = computed(() => settingsStore.sidebarLogo)
const sideTheme = computed(() => settingsStore.sideTheme)
const theme = computed(() => settingsStore.theme)
const isCollapse = computed(() => !appStore.sidebar.opened)

const activeMenu = computed(() => {
	const { meta, path } = route
	// if set path, the sidebar will highlight the path you set
	if (meta.activeMenu) {
		return meta.activeMenu
	}
	return path
})

const bgColor = computed(() =>
	sideTheme.value === "theme-dark" ? variables.menuBackground : variables.menuLightBackground
)
const textColor = computed(() => (sideTheme.value === "theme-dark" ? variables.menuColor : variables.menuLightColor))

const restoreOpenMenus = async () => {
	if (isCollapse.value) return
	await nextTick()
	// Element Plus 在侧栏收起/窗口变小时会清空打开状态，展开后需要主动恢复一级菜单。
	defaultOpeneds.value.forEach((menuIndex) => {
		menuRef.value?.open(menuIndex)
	})
}

watch([isCollapse, defaultOpenedsKey, () => route.fullPath], restoreOpenMenus, { immediate: true })

const toggleSideBar = () => {
	appStore.toggleSideBar(false)
}

const handleSettingClick = () => {
	emits("setLayout")
}

// 头像加载失败时回退默认图标
const onAvatarError = (e: Event) => {
	;(e.target as HTMLImageElement).src = defaultAvatar
}
</script>

<style lang="scss" scoped>
.sidebar-root {
	position: relative;
	height: 100%;
}

/* 人员展示面板样式 */
.user-profile-panel {
	position: relative;
	width: 220px;
	height: 154px;
	background-color: #f6faf7;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border-bottom: 1px solid #f0f2f5;
	box-sizing: border-box;
	padding: 16px;

	.profile-setting-btn {
		position: absolute;
		top: 12px;
		right: 12px;
		width: 20px;
		height: 20px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.3s ease;

		&:hover {
			transform: rotate(45deg);
		}

		.profile-setting-icon {
			width: 16px;
			height: 16px;
			object-fit: contain;
		}
	}

	.profile-avatar-wrap {
		width: 66px;
		height: 66px;
		border-radius: 50%;
		// border: 1.5px dashed #00b96b;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 8px;
		padding: 3px;
		box-sizing: border-box;

		.profile-avatar {
			width: 100%;
			height: 100%;
			border-radius: 50%;
			object-fit: cover;
		}
	}

	.profile-username {
		font-size: 15px;
		font-weight: 600;
		color: #1f2937;
		line-height: 1.4;
	}
}

.sidebar-scroll {
	height: calc(100% - 44px);

	&.has-profile {
		height: calc(100% - 198px) !important; /* 减去人员展示面板 154px 和底部收起按钮占高 */

		// 展开且有人物卡片状态下，菜单顶部与人物卡片之间空出 24px 边距
		:deep(.el-menu) {
			padding-top: 24px !important;
		}
	}
}

.has-logo .sidebar-scroll {
	margin-top: 12px;
	height: calc(100% - 94px);
}

.menu-fold-container {
	position: absolute;
	right: 0px;
	bottom: 20px;
	z-index: 3;
}

/* 一级菜单模块之间的分隔线 */
.menu-group-divider {
	/* 用负 margin 抵消 el-menu 的左右 padding(24px)，使线条贯穿卡片全宽 */
	margin: 20px -24px;
	height: 1px;
	background-color: #e8ecf0;
	flex-shrink: 0;
}
</style>
