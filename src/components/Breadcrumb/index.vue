<template>
	<el-breadcrumb class="app-breadcrumb" separator=">">
		<transition-group name="breadcrumb">
			<el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
				<span
					v-if="item.redirect === 'noRedirect' || index == levelList.length - 1"
					class="no-redirect"
					:class="{ 'is-last': index === levelList.length - 1 }"
					>{{ item.meta?.title }}</span
				>
				<a v-else @click.prevent="handleLink(item)">{{ item.meta?.title }}</a>
			</el-breadcrumb-item>
		</transition-group>
	</el-breadcrumb>
</template>

<script setup lang="ts">
import { RouteLocationMatched } from "vue-router"
import { usePermissionStore } from "@/store/modules/permission"

const route = useRoute()
const router = useRouter()
const permissionStore = usePermissionStore()
const levelList = ref<RouteLocationMatched[]>([])

const getBreadcrumb = () => {
	// only show routes with meta.title
	let matched = []
	const pathNum = findPathNum(route.path)
	// multi-level menu
	if (pathNum > 2) {
		const reg = /\/\w+/gi
		const pathList = route.path.match(reg).map((item, index) => {
			if (index !== 0) item = item.slice(1)
			return item
		})
		getMatched(pathList, permissionStore.defaultRoutes, matched)
	} else {
		matched = route.matched.filter((item) => item.meta && item.meta.title)
	}
	levelList.value = matched.filter((item) => item.meta && item.meta.title && item.meta.breadcrumb !== false)
}
const findPathNum = (str, char = "/") => {
	if (typeof str !== "string" || str.length === 0) return 0
	return str.split(char).length - 1
}
const getMatched = (pathList, routeList, matched) => {
	const data = routeList.find((item) => item.path == pathList[0] || (item.name += "").toLowerCase() == pathList[0])
	if (data) {
		matched.push(data)
		if (data.children && pathList.length) {
			pathList.shift()
			getMatched(pathList, data.children, matched)
		}
	}
}
const handleLink = (item) => {
	const { redirect, path } = item
	redirect ? router.push(redirect) : router.push(path)
}

watchEffect(() => {
	// if you go to the redirect page, do not update the breadcrumbs
	if (route.path.startsWith("/redirect/")) return
	getBreadcrumb()
})
onMounted(() => {
	getBreadcrumb()
})
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
	display: inline-block;
	font-size: 14px;
	line-height: 50px;
	margin-left: 8px;

	.no-redirect {
		color: #97a8be;
		cursor: text;

		&.is-last {
			color: #172b4d;
		}
	}
}
</style>
