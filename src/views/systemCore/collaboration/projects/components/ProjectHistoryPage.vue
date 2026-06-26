<template>
	<div v-if="detail" class="history-page">
		<div class="detail-header">
			<button class="back-square" @click="emit('back')">
				<el-icon><ArrowLeft /></el-icon>
			</button>
			<h1>{{ detail.projectName }}周报历史</h1>
			<el-tag :type="getWeeklyStatusTagType(detail.weeklyStatus)">{{ detail.weeklyStatusName }}</el-tag>
		</div>

		<div class="detail-subline">
			<span>项目编号: {{ detail.projectNo }}</span>
			<b>|</b>
			<span>所属公司: {{ detail.companyName }}</span>
			<b>|</b>
			<span>业务对接人: {{ detail.liaisonName }}</span>
		</div>

		<div class="history-layout">
			<div class="history-panel">
				<div v-for="item in detail.reports" :key="item.id" class="history-card">
					<div class="history-card__head">
						<div>
							<strong>{{ item.weekLabel }}</strong>
							<span>{{ item.reportDate }}</span>
						</div>
						<el-tag type="success">{{ item.statusTag }}</el-tag>
					</div>
					<div class="history-card__body">
						<section>
							<h3>本周进展</h3>
							<p>{{ item.progressSummary }}</p>
						</section>
						<!-- <section>
              <h3>当前状态</h3>
              <p>{{ item.situationFlagName }}</p>
            </section> -->
						<section>
							<h3>下一步计划</h3>
							<p>{{ item.nextPlan }}</p>
						</section>
					</div>
					<div class="history-card__foot">填报人：{{ item.reporter }}</div>
				</div>
				<el-empty v-if="detail.reports.length === 0" description="暂无周报历史" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ArrowLeft } from "@element-plus/icons-vue"
import { getWeeklyStatusTagType, type CooperationProjectItem } from "../config"

defineProps({
	detail: {
		type: Object as () => CooperationProjectItem | null,
		default: null
	}
})

const emit = defineEmits<{
	(e: "back"): void
}>()
</script>

<style scoped lang="scss">
.history-page {
	display: flex;
	width: 100%;
	max-width: 100%;
	height: 100%;
	min-height: 0;
	flex-direction: column;
	overflow: hidden;
}

.detail-header {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	gap: 0.875rem;
	margin-bottom: 1rem;

	h1 {
		margin: 0;
		color: #0f2748;
		font-size: 1.375rem;
		font-weight: 700;
	}
}

.back-square {
	display: inline-flex;
	width: 2.25rem;
	height: 2.25rem;
	align-items: center;
	justify-content: center;
	border: 0;
	border-radius: 0.625rem;
	background: #fff;
	color: #0f2748;
	cursor: pointer;
}

.detail-subline {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	gap: 0.75rem;
	margin: 0 0 1.5rem;
	color: #42526e;
	font-size: 0.875rem;

	b {
		color: #6b7795;
		font-weight: 400;
	}
}

.history-layout {
	flex: 1;
	min-height: 0;
	overflow: hidden;
}

.history-panel {
	display: grid;
	grid-auto-rows: max-content;
	gap: 1rem;
	align-content: start;
	height: 100%;
	overflow-y: auto;
}

.history-card {
	padding: 1.25rem 1.25rem 0.875rem;
	border-radius: 1rem;
	background: #fff;
}

.history-card__head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;

	strong {
		display: block;
		color: #172b4d;
		font-size: 1rem;
	}
}

.history-card__body {
	display: grid;
	gap: 0.875rem;
	margin-top: 1rem;

	section {
		padding: 0.875rem 1rem;
		border-radius: 0.875rem;
		background: #f7f9fc;
	}

	h3 {
		margin: 0 0 0.5rem;
		color: #172b4d;
		font-size: 0.9375rem;
		font-weight: 600;
	}

	p {
		margin: 0;
		color: #344563;
		line-height: 1.7;
	}
}

.history-card__foot {
	margin-top: 0.75rem;
	color: #6b7795;
	font-size: 0.8125rem;
	line-height: 1.4;
}

@media (max-width: 1200px) {
	.detail-subline,
	.detail-header,
	.history-card__head {
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>
