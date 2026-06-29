import { to as tos } from "await-to-js"
import router from "./router"
import NProgress from "nprogress"
import "nprogress/nprogress.css"
import { getToken } from "@/utils/auth"
import { isHttp, isPathMatch } from "@/utils/validate"
import { isRelogin } from "@/utils/request"
import { useUserStore } from "@/store/modules/user"
import { useSettingsStore } from "@/store/modules/settings"
import { usePermissionStore } from "@/store/modules/permission"
import { ElMessage } from "element-plus/es"
import type { RouteLocationNormalized, RouteLocationRaw, RouteRecordRaw } from "vue-router"

NProgress.configure({ showSpinner: false })
const whiteList = ["/login", "/oauthLogin", "/register", "/social-callback", "/register*", "/register/*"]

const isWhiteList = (path: string) => {
	return whiteList.some((pattern) => isPathMatch(pattern, path))
}

const notFoundRoutePath = "/:pathMatch(.*)*"

const hasRealRouteMatched = (to: RouteLocationNormalized): boolean => {
	return to.matched.some((route) => route.path !== notFoundRoutePath)
}

/**
 * 递归查找接口菜单中的第一个可访问页面路径
 */
const findFirstMenuPath = (routes: RouteRecordRaw[], basePath = ""): string | null => {
	for (const route of routes) {
		if (route.hidden || route.meta?.hidden) {
			continue
		}
		if (!route.path || isHttp(route.path)) {
			continue
		}

		let currentPath = route.path
		if (basePath) {
			const cleanBasePath = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath
			const cleanRoutePath = route.path.startsWith("/") ? route.path : "/" + route.path
			currentPath = cleanBasePath + cleanRoutePath
		}

		if (route.children && route.children.length > 0) {
			const firstChildPath = findFirstMenuPath(route.children, currentPath)
			if (firstChildPath) {
				return firstChildPath
			}
			continue
		}

		// 根路由和静态首页不来自后端菜单，避免登录后再次进入守卫循环。
		if (currentPath !== "/" && currentPath !== "/index") {
			return currentPath
		}
	}
	return null
}

// 动态路由添加后需要 replace 当前地址，触发路由表重新匹配。
const createReplaceRoute = (to: RouteLocationNormalized): RouteLocationRaw => ({
	path: to.path,
	replace: true,
	query: to.query,
	hash: to.hash
})

router.beforeEach(async (to) => {
	NProgress.start()
	if (getToken()) {
		const userStore = useUserStore()
		const permissionStore = usePermissionStore()

		to.meta.title && useSettingsStore().setTitle(to.meta.title as string)
		/* has token*/
		if (to.path === "/login") {
			NProgress.done()
			return { path: "/" }
		} else if (isWhiteList(to.path)) {
			return true
		} else {
			if (userStore.roles.length === 0) {
				isRelogin.show = true
				// 判断当前用户是否已拉取完user_info信息
				const [err] = await tos(userStore.getInfo())
				if (err) {
					await userStore.logout()
					ElMessage.error(err)
					return { path: "/" }
				} else {
					isRelogin.show = false
				}
			}

			if (!permissionStore.routesInitialized) {
				// 只有当前地址命中 404 兜底时才重进路由，避免已匹配页面首次渲染后再刷新一次。
				const shouldReplaceCurrentRoute = !hasRealRouteMatched(to)
				const accessRoutes = await permissionStore.generateRoutes()
				// 根据roles权限生成可访问的路由表
				accessRoutes.forEach((route) => {
					if (!isHttp(route.path)) {
						router.addRoute(route) // 动态添加可访问路由表
					}
				})

				// 根路径统一落到后端菜单顺序中的第一个可访问页面。
				if (to.path === "/" || to.path === "/index") {
					const sidebarRoutes = permissionStore.sidebarRouters as RouteRecordRaw[]
					const redirectPath = findFirstMenuPath(sidebarRoutes)
					if (redirectPath) {
						return { path: redirectPath, replace: true }
					} else if (shouldReplaceCurrentRoute) {
						return createReplaceRoute(to)
					} else {
						return true
					}
				} else {
					if (shouldReplaceCurrentRoute) {
						return createReplaceRoute(to)
					}
					return true
				}
			} else {
				// 已初始化路由后访问根路径时，同样使用后端菜单顺序兜底。
				if (to.path === "/" || to.path === "/index") {
					const sidebarRoutes = permissionStore.sidebarRouters as RouteRecordRaw[]
					const redirectPath = findFirstMenuPath(sidebarRoutes)
					if (redirectPath) {
						return { path: redirectPath, replace: true }
					} else {
						return true
					}
				} else {
					return true
				}
			}
		}
	} else {
		// 没有token
		if (isWhiteList(to.path)) {
			// 在免登录白名单，直接进入
			return true
		} else {
			const redirect = encodeURIComponent(to.fullPath || "/")
			NProgress.done()
			return `/login?redirect=${redirect}` // 否则全部重定向到登录页
		}
	}
})

router.afterEach(() => {
	NProgress.done()
})
