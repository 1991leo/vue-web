<template>
	<div class="weekly-summary-content">
		<div class="summary-main-card">
			<div class="summary-main-card__text">
				<span class="summary-main-card__label">本周任务总数</span>
				<span class="summary-main-card__value">{{ summary.weekTotalCount }}</span>
			</div>
			<div class="summary-main-card__bg" :style="{ backgroundImage: `url(${weeklyTotalImage})` }"></div>
		</div>

		<div class="summary-mini-list">
			<div class="summary-mini-card">
				<span class="summary-mini-card__label">已完成</span>
				<span class="summary-mini-card__value">{{ summary.weekCompletedCount }}</span>
			</div>
			<div class="summary-mini-card">
				<span class="summary-mini-card__label">进行中</span>
				<span class="summary-mini-card__value">{{ summary.weekInProgressCount }}</span>
			</div>
			<div class="summary-mini-card">
				<span class="summary-mini-card__label">未开始</span>
				<span class="summary-mini-card__value">{{ summary.weekNotStartedCount }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import weeklyTotalImage from "@/assets/images/weekly_total.webp"
import type { PropType } from "vue"
import type { WeeklySummaryData } from "../types"

defineProps({
	summary: {
		type: Object as PropType<WeeklySummaryData>,
		required: true
	}
})
</script>

<style scoped lang="scss">
.weekly-summary-content {
	display: flex;
	align-items: end;
	justify-content: flex-start;
	gap: 1.275rem;
	width: 75%;
	height: 100%;
	padding: 1.5rem;
	background: transparent;
}

.summary-main-card {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex: 0 0 19.921875rem;
	width: 19.921875rem;
	height: 6.48125rem;
	padding: 0 1.125rem;
	border-radius: 1rem;
	background: linear-gradient(90deg, #f7fbfd 0%, #fdfeff 100%);
	cursor: pointer;
	transition: color 0.2s ease;
}

.summary-main-card__text {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.summary-main-card__label {
	color: #8d98ac;
	font-size: 0.75rem;
	font-weight: 400;
	line-height: 1;
}

.summary-main-card__value {
	color: #172b4d;
	font-size: 1.6rem;
	font-weight: 700;
	line-height: 1;
}

.summary-main-card__bg {
	position: absolute;
	top: 50%;
	right: 0.875rem;
	width: 3.25rem;
	height: 3.25rem;
	background-repeat: no-repeat;
	background-position: center;
	background-size: contain;
	transform: translateY(-50%);
}

.summary-mini-list {
	display: grid;
	flex: 0 0 auto;
	grid-template-columns: repeat(3, 12.059375rem);
	grid-auto-rows: 5rem;
	gap: 1.275rem;
}

.summary-mini-card {
	display: flex;
	flex-direction: column;
	justify-content: center;
	width: 12.059375rem;
	min-height: 5rem;
	height: 5rem;
	padding: 0 1.5rem;
	border-radius: 1rem;
	background: linear-gradient(90deg, #f7fbfd 0%, #f7fafe14 100%);
	cursor: pointer;
	transition: color 0.2s ease;
}

.summary-mini-card__label {
	color: #7f8aa0;
	font-size: 0.75rem;
	font-weight: 400;
	line-height: 1;
}

.summary-mini-card__value {
	margin-top: 0.75rem;
	color: #172b4d;
	font-size: 1.6rem;
	font-weight: 700;
	line-height: 1;
}

.summary-main-card:hover .summary-main-card__label,
.summary-main-card:hover .summary-main-card__value,
.summary-mini-card:hover .summary-mini-card__label,
.summary-mini-card:hover .summary-mini-card__value {
	color: var(--el-color-primary);
}

@media (max-width: 1080px) {
	.summary-mini-list {
		grid-template-columns: 1fr;
		grid-auto-rows: auto;
	}

	.weekly-summary-content {
		width: 100%;
		max-width: 100%;
		flex-direction: column;
		align-items: stretch;
	}

	.summary-main-card {
		flex: 1;
		width: 100%;
		min-width: 0;
	}

	.summary-mini-card {
		width: 100%;
	}
}

@media (max-width: 768px) {
	.weekly-summary-content {
		padding: 0.875rem;
	}
}
</style>
