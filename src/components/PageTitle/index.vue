<template>
	<!-- 统一的页面标题组件 -->
	<div class="page-title-container">
		<h1 class="title-text">{{ title }}</h1>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	title: string
}>()
</script>

<style scoped lang="scss">
.page-title-container {
	display: flex;
	align-items: center;
	margin-bottom: 20px;

	.title-text {
		margin: 0;
		// 标题字号固定为 20px，字重为 600，颜色继承自全局文本颜色变量
		font-size: 20px;
		font-weight: 600;
		line-height: 1.2;
		color: var(--el-text-color-primary, #172b4d);
	}
}
</style>
