<template>
	<div class="form-page">
		<div class="create-card">
			<!-- 卡片头部信息（可通过 hideHeader 隐藏，由外部自定义头部时使用） -->
			<div class="create-card-header" v-if="!hideHeader">
				<slot name="icon">
					<img :src="iconUrl" class="header-icon" />
				</slot>
				<div>
					<div class="header-title-row">
						<h1>{{ title }}</h1>
						<slot name="title-suffix"></slot>
					</div>
					<p>{{ desc }}</p>
				</div>
			</div>
			<div v-if="!hideHeader" class="create-card-header-mask" aria-hidden="true"></div>

			<!-- 表单插槽 -->
			<div class="prototype-form">
				<slot></slot>
			</div>

			<!-- 操作按钮区域插槽 -->
			<div class="form-actions" v-if="$slots.actions">
				<slot name="actions"></slot>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import defaultIcon from "@/assets/collaboration/coordination.png"

// 声明组件 Props
const props = withDefaults(
	defineProps<{
		title?: string
		desc?: string
		icon?: string
		hideHeader?: boolean
	}>(),
	{
		title: "创建事项",
		desc: "填写基础信息，提交保存后查看",
		icon: "",
		hideHeader: false
	}
)

// 获取图标 URL，若外部不传则展示默认图标
const iconUrl = computed(() => props.icon || defaultIcon)
</script>

<style scoped lang="scss">
.form-page {
	display: flex;
	justify-content: center;
	height: 100%;
	padding: 8px 0;
	box-sizing: border-box;
}

.create-card {
	/* 纵向布局：头部 + 滚动表单 + 固定底部操作区，整体不超出视口 */
	position: relative;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	max-width: 1080px;
	max-height: 100%;
	padding: 4px 4px 0;
	overflow: hidden;
	border-radius: 20px;
	background: #fff;
	// box-shadow: 0 8px 24px rgba(23, 43, 77, 0.05);
}

.create-card-header {
	position: relative;
	z-index: 0;
	display: flex;
	flex-shrink: 0;
	align-items: center;
	gap: 20px;
	height: 104px;
	padding: 0 58px;
	border-radius: 16px 16px 0 0;
	background: linear-gradient(180deg, #f0f9f6 0%, #e3f6e9 100%);

	.header-title-row {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	h1 {
		margin: 0 0 6px;
		color: #0f2748;
		font-size: 20px;
		font-weight: 700;
	}

	p {
		margin: 0;
		color: #6b7795;
		font-size: 14px;
	}
}

.create-card-header-mask {
	position: absolute;
	top: 100px;
	right: 0px;
	left: 0px;
	z-index: 4;
	display: block;
	height: 28px;
	border-radius: 20px 20px 0 0;
	background: #ffffff;
	pointer-events: none;
}

.header-icon {
	width: 54px;
	height: 54px;
	object-fit: contain;
}

.prototype-form {
	/* 仅表单区域内部滚动，避免滚动条出现在整个页面 */
	position: relative;
	z-index: 2;
	flex: 1;
	min-height: 0;
	overflow-y: auto;
	padding: 28px 58px 0;
}

.form-actions {
	display: flex;
	flex-shrink: 0;
	justify-content: flex-end;
	gap: 12px;
	padding: 20px 58px;
	border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
}
</style>
