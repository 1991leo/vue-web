<template>
	<div v-if="!item.hidden" class="sidebar-item" :class="`sidebar-item-level-${menuLevel}`">
		<template
			v-if="
				hasOneShowingChild(item, item.children) &&
				(!onlyOneChild.children || onlyOneChild.noShowingChildren) &&
				!item.alwaysShow
			"
		>
			<app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path, onlyOneChild.query)">
				<el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{ 'submenu-title-noDropdown': menuLevel === 1 }">
					<svg-icon v-if="showMenuIcon" :icon-class="onlyOneChild.meta.icon || (item.meta && item.meta.icon)" />
					<template #title>
						<span class="menu-title" :title="hasTitle(onlyOneChild.meta.title)">{{ onlyOneChild.meta.title }}</span>
					</template>
				</el-menu-item>
			</app-link>
		</template>

		<el-sub-menu v-else ref="subMenu" :index="resolvePath(item.path)" teleported>
			<template v-if="item.meta" #title>
				<!-- 二级父菜单存在三级菜单时不展示图标，仅叶子菜单保留图标。 -->
				<svg-icon v-if="showSubMenuIcon" :icon-class="item.meta ? item.meta.icon : ''" />
				<!-- 一级菜单在展开状态下阻止点击折叠，使用带 click.stop.prevent 的包裹层 -->
				<div v-if="menuLevel === 1 && !isCollapse" class="sub-menu-title-wrapper" @click.stop.prevent>
					<span class="menu-title" :title="hasTitle(item.meta?.title)">{{ item.meta?.title }}</span>
				</div>
				<span v-else class="menu-title" :title="hasTitle(item.meta?.title)">{{ item.meta?.title }}</span>
			</template>

			<sidebar-item
				v-for="(child, index) in item.children"
				:key="child.path + index"
				:is-nest="true"
				:item="child"
				:base-path="resolvePath(child.path)"
				:menu-level="menuLevel + 1"
				class="nest-menu"
			/>
		</el-sub-menu>
	</div>
</template>

<script setup lang="ts">
import { isExternal } from "@/utils/validate"
import AppLink from "./Link.vue"
import { getNormalPath } from "@/utils/ruoyi"
import { RouteRecordRaw } from "vue-router"
import { useAppStore } from "@/store/modules/app"

const appStore = useAppStore()
const isCollapse = computed(() => !appStore.sidebar.opened)

const props = defineProps({
	item: {
		type: Object as PropType<RouteRecordRaw>,
		required: true
	},
	isNest: {
		type: Boolean,
		default: false
	},
	menuLevel: {
		type: Number,
		default: 1
	},
	basePath: {
		type: String,
		default: ""
	}
})

const onlyOneChild = ref<any>({})
const showMenuIcon = computed(() => props.menuLevel > 1)
const showSubMenuIcon = computed(() => props.menuLevel > 1 && props.menuLevel !== 2)

const hasOneShowingChild = (parent: RouteRecordRaw, children?: RouteRecordRaw[]) => {
	if (!children) {
		children = []
	}
	const showingChildren = children.filter((item) => {
		if (item.hidden) {
			return false
		}
		onlyOneChild.value = item
		return true
	})

	// When there is only one child router, the child router is displayed by default
	if (showingChildren.length === 1) {
		return true
	}

	// Show parent if there are no child router to display
	if (showingChildren.length === 0) {
		onlyOneChild.value = { ...parent, path: "", noShowingChildren: true }
		return true
	}

	return false
}

const resolvePath = (routePath: string, routeQuery?: string): any => {
	if (isExternal(routePath)) {
		return routePath
	}
	if (isExternal(props.basePath as string)) {
		return props.basePath
	}
	if (routeQuery) {
		const query = JSON.parse(routeQuery)
		return { path: getNormalPath(props.basePath + "/" + routePath), query: query }
	}
	return getNormalPath(props.basePath + "/" + routePath)
}

const hasTitle = (title: string | undefined): string => {
	if (!title || title.length <= 5) {
		return ""
	}
	return title
}
</script>
