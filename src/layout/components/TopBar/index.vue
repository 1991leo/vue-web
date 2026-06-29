<template>
	<el-menu
		class="topbar-menu"
		:ellipsis="false"
		:default-active="activeMenu"
		:active-text-color="theme"
		mode="horizontal"
	>
		<sidebar-item :key="route.path + index" v-for="(route, index) in topMenus" :item="route" :base-path="route.path" />

		<!-- <el-sub-menu index="more" class="el-sub-menu__hide-arrow" v-if="moreRoutes.length > 0">
      <template #title>
        <span>更多菜单</span>
      </template>
      <sidebar-item :key="route.path + index" v-for="(route, index) in moreRoutes" :item="route" :base-path="route.path" />
    </el-sub-menu> -->
	</el-menu>
</template>

<script setup lang="ts">
import SidebarItem from "../Sidebar/SidebarItem.vue"
import { useAppStore } from "@/store/modules/app"
import { useSettingsStore } from "@/store/modules/settings"
import { usePermissionStore } from "@/store/modules/permission"
import type { RouteRecordRaw } from "vue-router"

const route = useRoute()
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()

const sidebarRouters = computed(() => permissionStore.sidebarRouters)
const theme = computed(() => settingsStore.theme)
const device = computed(() => appStore.device)
const activeMenu = computed(() => {
	const { meta, path } = route
	if (meta.activeMenu) {
		return meta.activeMenu
	}
	return path
})

const visibleNumber = ref(5)
const topMenus = computed<RouteRecordRaw[]>(() => {
	return permissionStore.sidebarRouters.filter((f) => !f.hidden).slice(0, visibleNumber.value) as RouteRecordRaw[]
})
const moreRoutes = computed(() => {
	return permissionStore.sidebarRouters
		.filter((f) => !f.hidden)
		.slice(visibleNumber.value, sidebarRouters.value.length - visibleNumber.value)
})
function setVisibleNumber() {
	let width = document.body.getBoundingClientRect().width
	if (width >= 1000) {
		width -= 500
	}
	visibleNumber.value = Math.floor(width / 3 / 85)
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
/* menu item */
#app .topbar-menu.el-menu--horizontal {
	background-color: transparent !important;
	border-bottom: none !important;
}

#app .topbar-menu.el-menu--horizontal .el-sub-menu__title,
#app .topbar-menu.el-menu--horizontal .el-menu-item {
	padding: 0 10px !important;
	background-color: transparent !important;
}

.topbar-menu.el-menu--horizontal > .el-menu-item {
	height: 50px !important;
	line-height: 50px !important;
	color: rgba(255, 255, 255, 0.7) !important;
	padding: 0 15px !important;
	margin: 0 5px !important;
	border-bottom: none !important;
}

.topbar-menu.el-menu--horizontal > .el-menu-item:hover,
.topbar-menu.el-menu--horizontal > .el-sub-menu:hover .el-sub-menu__title {
	color: #fff !important;
	// background-color: rgba(255, 255, 255, 0.1) !important;
	border-radius: 4px;
}

.topbar-menu.el-menu--horizontal > .el-menu-item.is-active,
.topbar-menu.el-menu--horizontal > .el-sub-menu.is-active .el-sub-menu__title {
	color: #fff !important;
	font-weight: bold;
	// background-color: rgba(255, 255, 255, 0.15) !important;
	border-bottom: none !important;
	border-radius: 4px;
}

.topbar-menu .el-sub-menu.is-active .svg-icon,
.topbar-menu .el-menu-item.is-active .svg-icon + span,
.topbar-menu .el-sub-menu.is-active .svg-icon + span,
.topbar-menu .el-sub-menu.is-active .el-sub-menu__title span {
	color: #fff !important;
}

/* sub-menu item */
.topbar-menu.el-menu--horizontal > .el-sub-menu .el-sub-menu__title {
	line-height: 50px !important;
	color: rgba(255, 255, 255, 0.7) !important;
	margin: 0 5px !important;
	border-bottom: none !important;
}

/* topbar more arrow */
.topbar-menu .el-sub-menu .el-sub-menu__icon-arrow {
	position: static;
	margin-left: 8px;
	margin-top: 0px;
	display: inline-block !important;
}

/* menu__title el-menu-item */
.topbar-menu.el-menu--horizontal .el-sub-menu__title,
.topbar-menu.el-menu--horizontal .el-menu-item {
	height: 60px;
	display: flex;
	align-items: center;
}
</style>
