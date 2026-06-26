import { ref } from "vue"

/**
 * 经营指标完成率与进度条规约 Hook
 */
export function useRate() {
	/**
	 * 规约进度百分比，限制在 0-100 之间给 el-progress 使用
	 * @param rate 进度百分比
	 */
	const normalizeProgress = (rate: number | string): number => {
		const num = Number(rate) || 0
		return Math.max(0, Math.min(num, 100))
	}

	/**
	 * 规约进度百分比并进行四舍五入
	 * @param value 原始进度值
	 */
	const normalizeProgressValue = (value?: number | string): number => {
		const numericValue = Number(value ?? 0)
		if (!Number.isFinite(numericValue)) return 0
		return Math.min(100, Math.max(0, Math.round(numericValue)))
	}

	/**
	 * 格式化输出百分比文本（保留两位小数）
	 * @param rate 百分比数值
	 */
	const formatRateText = (rate: number | string): string => {
		return (Number(rate) || 0).toFixed(2)
	}

	/**
	 * 解析并换算后端返回的可能混杂百分号或0-1比例的数值为纯数字
	 * @param rate 待解析的率
	 */
	const parseRateValue = (rate: string | number | undefined | null): number | undefined => {
		if (rate === undefined || rate === null || rate === "") return undefined
		const rateText = String(rate)
		const parsedRate = Number(rateText.replace("%", ""))
		if (Number.isNaN(parsedRate)) return undefined

		// 如果无百分号且绝对值小于等于1，说明后端返回的是小数比例，换算为百分比
		if (!rateText.includes("%") && Math.abs(parsedRate) <= 1) {
			return parsedRate * 100
		}
		return parsedRate
	}

	/**
	 * 计算并获取完成率（保留两位小数）
	 * @param rate 备用百分比值
	 * @param actual 实际值
	 * @param target 目标值
	 */
	const getRateValue = (rate: string | number | undefined, actual?: number, target?: number): number => {
		const parsed = parseRateValue(rate)
		if (parsed !== undefined) return Number(parsed.toFixed(2))
		if (!target) return 0
		return Number(((Number(actual || 0) / Number(target)) * 100).toFixed(2))
	}

	return {
		normalizeProgress,
		normalizeProgressValue,
		formatRateText,
		parseRateValue,
		getRateValue
	}
}
