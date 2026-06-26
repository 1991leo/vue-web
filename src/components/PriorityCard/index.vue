<template>
	<!-- 公共优先级卡片组件：支持高中低三种优先级背景及 hover 过渡动画 -->
	<div class="priority-card" :class="themeClass">
		<slot></slot>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue"

// 定义 Props
const props = withDefaults(
	defineProps<{
		priority?: string // 优先级/级别：支持 '高' | '中' | '低'，'high' | 'medium' | 'low'，'集团重点' | '公司重点' | '一般项目' 以及其对应的字典码值 '1' | '2' | '3'
	}>(),
	{
		priority: "低"
	}
)

// 根据传入的优先级或项目级别计算对应的 CSS 主题类名
const themeClass = computed(() => {
	const normalizedPriority = props.priority?.trim().toLowerCase() || ""
	if (["高", "high", "集团重点", "1"].includes(normalizedPriority)) {
		return "theme-priority-high"
	}
	if (["中", "medium", "公司重点", "2"].includes(normalizedPriority)) {
		return "theme-priority-medium"
	}
	return "theme-priority-low"
})
</script>

<style scoped lang="scss">
.priority-card {
	--card-hover-border: var(--el-border-color-lighter, #e5eaf1); // 默认 hover 描边色（由各优先级主题类覆盖）
	background-color: var(--el-bg-color, #ffffff);
	border: 1px solid var(--el-border-color-lighter, #e5eaf1);
	border-radius: 8px; // 保持集团重点卡片 8px 圆角
	padding: 20px;
	display: flex;
	flex-direction: column;
	transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
	box-sizing: border-box;
	position: relative;
	overflow: hidden;
	cursor: pointer;

	&:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 24px rgba(23, 43, 77, 0.08);
		border-color: var(--card-hover-border);
	}

	// 优先级——高（紫色渐变）
	&.theme-priority-high {
		--card-hover-border: #c99dfc;
		background: linear-gradient(180deg, #f7f6ff 1%, #fbf8ff 24%, var(--el-bg-color, #ffffff) 100%);
	}

	// 优先级——中（蓝色渐变）
	&.theme-priority-medium {
		--card-hover-border: #7ab8fd;
		background: linear-gradient(180deg, #e9f0ff 1%, #f4f8ff 24%, var(--el-bg-color, #ffffff) 100%);
	}

	// 优先级——低（青色渐变）
	&.theme-priority-low {
		--card-hover-border: #68f2fa;
		background: linear-gradient(180deg, #f0fbff 1%, #f8feff 24%, var(--el-bg-color, #ffffff) 100%);
	}
}
</style>
