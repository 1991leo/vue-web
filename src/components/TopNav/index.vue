<template>
	<el-menu :default-active="activeMenu" mode="horizontal" :ellipsis="false" @select="handleSelect">
		<template v-for="(item, index) in topMenus">
			<el-menu-item v-if="index < visibleNumber" :key="index" :style="{ '--theme': theme }" :index="item.path"
				><svg-icon
					v-if="item.meta && item.meta.icon && item.meta.icon !== '#'"
					:icon-class="item.meta ? item.meta.icon : ''"
				/>
				{{ item.meta?.title }}</el-menu-item
			>
		</template>

		<!-- 顶部菜单超出数量折叠 -->
		<el-sub-menu v-if="topMenus.length > visibleNumber" :style="{ '--theme': theme }" index="more">
			<template #title>更多菜单</template>
			<template v-for="(item, index) in topMenus">
				<el-menu-item v-if="index >= visibleNumber" :key="index" :index="item.path"
					><svg-icon :icon-class="item.meta ? item.meta.icon : ''" /> {{ item.meta?.title }}</el-menu-item
				>
			</template>
		</el-sub-menu>
	</el-menu>
</template>

<script setup lang="ts">
import { constantRoutes } from "@/router"
import { isHttp } from "@/utils/validate"
import { useAppStore } from "@/store/modules/app"
import { useSettingsStore } from "@/store/modules/settings"
import { usePermissionStore } from "@/store/modules/permission"
import { RouteRecordRaw } from "vue-router"
import { NavTypeEnum } from "@/enums/NavTypeEnum"

// 顶部栏初始数
const visibleNumber = ref<number>(-1)
// 当前激活菜单的 index
const currentIndex = ref<string>()
// 隐藏侧边栏路由
const hideList = ["/index", "/user/profile"]

const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()
const route = useRoute()
const router = useRouter()

// 主题颜色
const theme = computed(() => settingsStore.theme)
const isMixNav = computed(() => settingsStore.navType === NavTypeEnum.MIX)
// 所有的路由信息
const routers = computed(() => permissionStore.getTopbarRoutes())

// 顶部显示菜单
const topMenus = computed(() => {
	const topMenus: RouteRecordRaw[] = []
	routers.value.map((menu) => {
		if (menu.hidden !== true) {
			// 过滤掉首页，使其不显示在顶部导航栏
			if (menu.path === "/index") {
				return
			}

			// 兼容顶部栏一级菜单内部跳转
			if (menu.path === "/" && menu.children) {
				topMenus.push(menu.children ? menu.children[0] : menu)
			} else {
				topMenus.push(menu)
			}
		}
	})
	return topMenus
})

// 设置子路由
const childrenMenus = computed(() => {
	const childrenMenus: RouteRecordRaw[] = []
	routers.value.map((router) => {
		router.children?.forEach((item) => {
			if (item.parentPath === undefined) {
				if (router.path === "/") {
					item.path = "/" + item.path
				} else {
					if (!isHttp(item.path)) {
						item.path = router.path + "/" + item.path
					}
				}
				item.parentPath = router.path
			}
			childrenMenus.push(item)
		})
	})
	return constantRoutes.concat(childrenMenus)
})

// 默认激活的菜单
const activeMenu = computed(() => {
	let path = route.path
	let isHome = false

	// 如果进入首页，强制高亮顶部菜单的第一个选项
	if (path === "/index" || path === "/") {
		isHome = true
		if (topMenus.value.length > 0) {
			path = topMenus.value[0].path
		}
	}

	let activePath = path
	if (path !== undefined && path.lastIndexOf("/") > 0 && hideList.indexOf(path) === -1) {
		const tmpPath = path.substring(1, path.length)
		if (!route.meta.link) {
			activePath = "/" + tmpPath.substring(0, tmpPath.indexOf("/"))
			if (isMixNav.value) {
				appStore.toggleSideBarHide(false)
			}
		}
	} else if (!route.children && !isHome && isMixNav.value) {
		activePath = path
		appStore.toggleSideBarHide(true)
	}

	// 仅混合菜单需要按顶部一级菜单裁剪侧栏，左侧菜单保持完整路由树。
	if (isMixNav.value) {
		activeRoutes(activePath)
	}

	// 如果是首页跳转过来的，强制保证侧边栏处于展开状态
	if (isHome && isMixNav.value) {
		appStore.toggleSideBarHide(false)
	}

	return activePath
})

const setVisibleNumber = () => {
	const width = document.body.getBoundingClientRect().width
	visibleNumber.value = parseInt(String(width / 85))
}

const handleSelect = (key: string) => {
	currentIndex.value = key
	const route = routers.value.find((item) => item.path === key)
	if (isHttp(key)) {
		// http(s):// 路径新窗口打开
		window.open(key, "_blank")
	} else if (!route || !route.children) {
		// 没有子路由路径内部打开
		const routeMenu = childrenMenus.value.find((item) => item.path === key)
		if (routeMenu && routeMenu.query) {
			const query = JSON.parse(routeMenu.query)
			router.push({ path: key, query: query })
		} else {
			router.push({ path: key })
		}
		if (isMixNav.value) {
			appStore.toggleSideBarHide(true)
		}
	} else {
		// 显示左侧联动菜单
		if (isMixNav.value) {
			activeRoutes(key)
			appStore.toggleSideBarHide(false)
		}
	}
}

const activeRoutes = (key: string) => {
	const routes: RouteRecordRaw[] = []
	if (childrenMenus.value && childrenMenus.value.length > 0) {
		childrenMenus.value.map((item) => {
			if (key == item.parentPath || (key == "index" && "" == item.path)) {
				routes.push(item)
			}
		})
	}
	if (routes.length > 0) {
		permissionStore.setSidebarRouters(routes)
		appStore.toggleSideBarHide(false)
	} else {
		appStore.toggleSideBarHide(true)
	}
	return routes
}

onMounted(() => {
	window.addEventListener("resize", setVisibleNumber)
})
onBeforeUnmount(() => {
	window.removeEventListener("resize", setVisibleNumber)
})

onMounted(() => {
	setVisibleNumber()
})
</script>

<style lang="scss">
.topmenu-container.el-menu--horizontal {
	background-color: transparent !important;
	border-bottom: none !important;
}

.topmenu-container.el-menu--horizontal > .el-menu-item {
	height: 50px !important;
	line-height: 50px !important;
	color: rgba(255, 255, 255, 0.7) !important;
	padding: 0 15px !important;
	margin: 0 5px !important;
	border-bottom: none !important;
	background-color: transparent !important;
}

.topmenu-container.el-menu--horizontal > .el-menu-item.is-active,
.topmenu-container.el-menu--horizontal > .el-sub-menu.is-active .el-sub-menu__title {
	border-bottom: none !important;
	color: #fff !important;
	font-weight: bold;
	// background-color: rgba(255, 255, 255, 0.15) !important;
	border-radius: 4px;
}

/* sub-menu item */
.topmenu-container.el-menu--horizontal > .el-sub-menu .el-sub-menu__title {
	height: 50px !important;
	line-height: 50px !important;
	color: rgba(255, 255, 255, 0.7) !important;
	padding: 0 15px !important;
	margin: 0 5px !important;
	background-color: transparent !important;
	border-bottom: none !important;
}

/* 背景色隐藏 */
.topmenu-container.el-menu--horizontal > .el-menu-item:not(.is-disabled):focus,
.topmenu-container.el-menu--horizontal > .el-menu-item:not(.is-disabled):hover,
.topmenu-container.el-menu--horizontal > .el-sub-menu .el-sub-menu__title:hover {
	// background-color: rgba(255, 255, 255, 0.1) !important;
	color: #fff !important;
	border-radius: 4px;
}

/* 图标右间距 */
.topmenu-container .svg-icon {
	margin-right: 4px;
}
</style>
