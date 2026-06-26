<template>
	<!-- 通用分割线组件 (支持水平满宽穿透与垂直拉满) -->
	<div class="common-divider" :class="[direction]" :style="dividerStyle"></div>
</template>

<script setup lang="ts">
import { computed } from "vue"

// 接收相关控制参数
const props = withDefaults(
	defineProps<{
		offset?: number | string // 偏移量，用于水平穿透 padding
		color?: string // 分割线颜色
		verticalMargin?: number | string // 水平线时的上下边距 (默认 20px)
		horizontalMargin?: number | string // 垂直线时的左右边距 (默认 20px)
		direction?: "horizontal" | "vertical" // 分割线方向
		verticalOffset?: number | string // 垂直线时的上下偏移量 (用于穿透 padding 等)
	}>(),
	{
		offset: 30,
		verticalMargin: 20,
		horizontalMargin: 20,
		direction: "horizontal"
	}
)

// 动态计算样式
const dividerStyle = computed(() => {
	const isHorizontal = props.direction === "horizontal"
	const offsetVal = typeof props.offset === "number" ? `${props.offset}px` : props.offset
	const vMarginVal = typeof props.verticalMargin === "number" ? `${props.verticalMargin}px` : props.verticalMargin
	const hMarginVal = typeof props.horizontalMargin === "number" ? `${props.horizontalMargin}px` : props.horizontalMargin
	const bgColor = props.color || "var(--el-border-color-lighter, #e5eaf1)"

	if (isHorizontal) {
		return {
			width: "auto",
			height: "1px",
			marginLeft: `-${offsetVal}`,
			marginRight: `-${offsetVal}`,
			marginTop: vMarginVal,
			marginBottom: vMarginVal,
			backgroundColor: bgColor
		}
	} else {
		// 垂直方向分割线
		const vOffsetVal =
			props.verticalOffset !== undefined
				? typeof props.verticalOffset === "number"
					? `${props.verticalOffset}px`
					: props.verticalOffset
				: null

		// 如果设置了 verticalOffset，使用负的偏移量穿透；否则使用 vMarginVal 正常的上下边距
		const marginTopVal = vOffsetVal !== null ? `-${vOffsetVal}` : vMarginVal
		const marginBottomVal = vOffsetVal !== null ? `-${vOffsetVal}` : vMarginVal

		return {
			width: "1px",
			height: "auto",
			alignSelf: "stretch",
			marginLeft: hMarginVal,
			marginRight: hMarginVal,
			marginTop: marginTopVal,
			marginBottom: marginBottomVal,
			backgroundColor: bgColor
		}
	}
})
</script>

<style scoped lang="scss">
.common-divider {
	border: none;
	padding: 0;
	box-sizing: border-box;
	display: block;
	flex-shrink: 0; // 防止在 flex 布局中被压缩
}
</style>
