<template>
	<div class="detail-page">
		<!-- 详情页头部 -->
		<div class="detail-header">
			<button class="back-square" @click="emit('back')">
				<img src="@/assets/images/back.png" class="back-icon" />
			</button>
			<h1>{{ title }}</h1>

			<span v-if="statusLabel" class="status-tag" :class="statusClass">
				<span class="status-dot" :class="statusClass"></span>
				{{ statusLabel }}
			</span>
		</div>

		<!-- 详情副标题信息展示 -->
		<div class="detail-subline" v-if="$slots.subline">
			<slot name="subline"></slot>
		</div>

		<!-- 大卡片容器 -->
		<div class="detail-card">
			<!-- 仅保留默认插槽自己实现内容，不要任何左右分布 -->
			<slot></slot>
		</div>
	</div>
</template>

<script setup lang="ts">
// 声明组件 Props
const props = withDefaults(
	defineProps<{
		title?: string
		statusLabel?: string
		statusClass?: string
	}>(),
	{
		title: "",
		statusLabel: "",
		statusClass: ""
	}
)

// 声明组件事件，抛出返回事件
const emit = defineEmits<{
	(e: "back"): void
}>()
</script>

<style scoped lang="scss">
.detail-page {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	margin: 0 auto;
	padding: 8px 0;
	box-sizing: border-box;
}

.detail-header {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	gap: 14px;

	h1 {
		max-width: 600px;
		margin: 0;
		overflow: hidden;
		color: #0f2748;
		font-size: 22px;
		font-weight: 700;
		line-height: 36px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}

.back-square {
	display: inline-flex;
	width: 36px;
	height: 36px;
	align-items: center;
	justify-content: center;
	border: 0;
	border-radius: 10px;
	background: #fff;
	cursor: pointer;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.back-icon {
	width: 20px;
	height: 20px;
	object-fit: contain;
}

.status-tag {
	font-size: 12px;
	padding: 4px 10px;
	border-radius: 4px;
	font-weight: 500;
	white-space: nowrap;
	display: inline-flex;
	align-items: center;
	gap: 6px;

	/* 默认灰色样式 */
	color: #42526e;
	background: #eaeef2;

	/* 常见状态颜色绑定兼容类 */
	&.status-pending,
	&.pending {
		color: #344563;
		background: #eaeef2;
	}
	&.status-ongoing,
	&.processing,
	&.ongoing {
		color: #1678ff;
		background: #e6f7ff;
	}
	&.status-completed,
	&.resolved,
	&.completed {
		color: #00b46e;
		background: #e6ffec;
	}
	&.status-delayed,
	&.delayed {
		color: #ffb020;
		background: #fff7e6;
	}
	&.status-overdue,
	&.unresolved,
	&.overdue {
		color: #f53f3f;
		background: #fff2f0;
	}
}

.status-dot {
	display: inline-block;
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: #a5adba;

	&.status-pending,
	&.pending {
		background: #344563;
	}
	&.status-ongoing,
	&.processing,
	&.ongoing {
		background: #1678ff;
	}
	&.status-completed,
	&.resolved,
	&.completed {
		background: #00b46e;
	}
	&.status-delayed,
	&.delayed {
		background: #ffb020;
	}
	&.status-overdue,
	&.unresolved,
	&.overdue {
		background: #f53f3f;
	}
}

.detail-subline {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	gap: 12px;
	margin: 16px 0 0;
	color: #42526e;
	font-size: 14px;
}

.detail-card {
	/* 主卡片占满剩余高度，仅纵向滚动；横向裁剪避免分割线负 margin 触发横向滚动条 */
	flex: 1;
	min-height: 0;
	margin-top: 24px;
	overflow-x: hidden;
	overflow-y: auto;
	border-radius: 20px;
	background: #fff;
}
</style>
