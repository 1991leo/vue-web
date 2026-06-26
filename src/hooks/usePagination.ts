import { ref, watch } from "vue"

/**
 * 通用分页处理 Hook
 * @param fetchDataCallback 获取列表数据并更新总数的回调函数
 * @param defaultPageSize 默认每页条数 (默认 20 条)
 */
export function usePagination(fetchDataCallback: () => void | Promise<void>, defaultPageSize = 20) {
	const currentPage = ref(1)
	const pageSize = ref(defaultPageSize)
	const total = ref(0)

	// 使用 watch 监听页码和页大小的改变，自动触发数据获取
	watch([currentPage, pageSize], ([curPage, size], [oldPage, oldSize]) => {
		// 切换页大小时，默认重置当前页为第一页
		if (size !== oldSize) {
			if (currentPage.value !== 1) {
				currentPage.value = 1
				// 重置页码会触发下一次 watch，此处直接 return 避免重复发送请求
				return
			}
		}
		fetchDataCallback()
	})

	return {
		currentPage,
		pageSize,
		total
	}
}
