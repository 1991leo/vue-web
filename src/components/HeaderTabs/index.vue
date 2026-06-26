<template>
	<!-- 顶部 tabs 公共组件 -->
	<div class="header-tabs-container">
		<div
			v-for="tab in tabs"
			:key="tab.name"
			class="tab-item"
			:class="{ active: modelValue === tab.name }"
			@click="handleTabClick(tab.name)"
		>
			{{ tab.label }}
			<span v-if="showCount" class="count-badge">{{ tab.count ?? 0 }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
// 定义选项类型
interface TabItem {
	label: string
	name: string | number
	count?: number
}

// 定义传参
withDefaults(
	defineProps<{
		modelValue: string | number
		tabs: TabItem[]
		showCount?: boolean
	}>(),
	{
		showCount: true
	}
)

// 定义事件
const emit = defineEmits<{
	(e: "update:modelValue", value: string | number): void
	(e: "change", value: string | number): void
}>()

// 处理 tab 点击
const handleTabClick = (name: string | number) => {
	emit("update:modelValue", name)
	emit("change", name)
}
</script>

<style scoped lang="scss">
.header-tabs-container {
	display: inline-flex;
	align-items: center;
	// 顶部 tabs 高度固定为 38px，圆角 100px，背景色为白色，加柔和边框以便在白底上突显层次
	height: 38px;
	border-radius: 100px;
	background-color: var(--el-bg-color, #ffffff);
	// border: 1px solid var(--el-border-color-lighter, #e5eaf1);
	padding: 3px;
	gap: 4px;
	box-sizing: border-box;

	.tab-item {
		// 扣除容器 padding 后自动填充 100% 高度
		height: 100%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0 44px;
		font-size: 14px;
		font-weight: 500;
		color: var(--el-text-color-regular, #606266);
		// 高亮及默认圆角均调整为胶囊型 100px
		border-radius: 100px;
		cursor: pointer;
		transition: all 0.25s cubic-bezier(0.645, 0.045, 0.355, 1);
		user-select: none;
		gap: 6px;

		.count-badge {
			min-width: 24px;
			height: 16px;
			border-radius: 10px;
			padding: 0 4px;
			box-sizing: border-box;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			font-size: 12px;
			font-weight: 400;
			line-height: 12px;
			background-color: #172b4d0d; // HEX #172B4D with 5% opacity
			color: #6b778c;
			transition: all 0.25s cubic-bezier(0.645, 0.045, 0.355, 1);
		}

		&:hover {
			color: var(--el-text-color-primary, #303133);
		}

		&.active {
			// 激活态高亮底色与文字颜色
			background-color: var(--el-color-primary, #00b46e);
			color: var(--el-color-white, #ffffff);
			font-weight: 600;

			.count-badge {
				background-color: #ffffff33; // HEX #FFFFFF with 20% opacity
				color: #ffffff;
			}
		}
	}
}
</style>
