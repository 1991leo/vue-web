import { ref } from "vue"
import { useRoute, useRouter } from "vue-router"

/**
 * 统一管理 CRUD 页面视图模式切换与路由参数清理的 Hook
 * @param emptyItemFactory 初始化或清空当前行数据的工厂函数
 * @param defaultView 默认视图模式，默认为 'list'
 */
export function useCrudView<T>(emptyItemFactory?: () => T, defaultView: "list" | "create" | "detail" = "list") {
	const route = useRoute()
	const router = useRouter()

	const currentView = ref<"list" | "create" | "detail">(defaultView)
	const isEditMode = ref(false)
	const currentRow = ref<T>(emptyItemFactory ? emptyItemFactory() : ({} as T))

	/**
	 * 清理路由中的 Query 参数并设置新视图
	 */
	const clearQueryAndPush = (view: "list" | "create" | "detail") => {
		router.push({ path: route.path, query: {} })
		currentView.value = view
	}

	/**
	 * 处理“新建”事件：清空参数，切换为新建态
	 */
	const handleCreate = () => {
		isEditMode.value = false
		currentRow.value = emptyItemFactory ? emptyItemFactory() : ({} as T)
		clearQueryAndPush("create")
	}

	/**
	 * 处理“返回列表”事件：清空参数，切回列表态
	 */
	const goBackToList = () => {
		clearQueryAndPush("list")
	}

	return {
		currentView,
		isEditMode,
		currentRow,
		clearQueryAndPush,
		handleCreate,
		goBackToList
	}
}
