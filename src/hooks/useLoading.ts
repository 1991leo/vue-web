import { ref } from "vue"

/**
 * 防重复点击 & 统一加载状态 Hook
 * @param submitFn 实际要执行的异步提交函数，需要返回 Promise
 * @returns { loading, run }
 * - loading: 响应式布尔值，表示当前是否在加载中
 * - run: 包装后的执行函数，会自动处理 loading 并进行重复拦截
 */
export function useLoading<T extends (...args: any[]) => Promise<any>>(submitFn: T) {
	const loading = ref(false)

	const run = async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
		if (loading.value) return
		loading.value = true
		try {
			return await submitFn(...args)
		} finally {
			loading.value = false
		}
	}

	return {
		loading,
		run
	}
}
