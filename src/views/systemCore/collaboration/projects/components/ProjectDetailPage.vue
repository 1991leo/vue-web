<template>
	<div v-if="detail" class="detail-page">
		<div class="detail-header">
			<button class="back-square" @click="emit('back')">
				<el-icon><ArrowLeft /></el-icon>
			</button>
			<h1>{{ detail.projectName }}</h1>
			<el-tag :type="getProjectStatusTagType(detail.projectStatusName)">{{ detail.projectStatusName }}</el-tag>
		</div>

		<div class="detail-subline">
			<span>项目编号: {{ detail.projectNo }}</span>
			<b>|</b>
			<span>负责业务单元: {{ detail.companyName }}</span>
			<b>|</b>
			<span>大数据集团业务对接人: {{ detail.responsiblePerson }}</span>
			<b>|</b>
			<span>企业对接人: {{ detail.liaisonName }}</span>
			<b>|</b>
			<span>最近更新: {{ detail.updatedTime }}</span>
		</div>

		<div class="detail-card">
			<div class="detail-left">
				<section class="info-section">
					<h2>基础信息</h2>
					<div class="info-grid">
						<div class="info-grid__item">
							<span class="info-grid__label">合作类别</span>
							<span class="info-grid__value">{{ detail.projectTypeName }}</span>
						</div>
						<div class="info-grid__item">
							<span class="info-grid__label">合作企业</span>
							<span class="info-grid__value">{{ detail.partnerName }}</span>
						</div>
						<div class="info-grid__item">
							<span class="info-grid__label">合作方向</span>
							<span class="info-grid__value">{{ detail.cooperationDirectionName }}</span>
						</div>
						<div class="info-grid__item">
							<span class="info-grid__label">完成时间</span>
							<span class="info-grid__value">{{ formatCompletionText(detail) }}</span>
						</div>
						<div class="info-grid__item">
							<span class="info-grid__label">周报状态</span>
							<span class="info-grid__value">
								<el-tag :type="getWeeklyStatusTagType(detail.weeklyStatus)">{{ detail.weeklyStatusName }}</el-tag>
							</span>
						</div>
						<div class="info-grid__item">
							<span class="info-grid__label">最新周报日期</span>
							<span class="info-grid__value">{{ detail.latestReportDate || "-" }}</span>
						</div>
					</div>
				</section>

				<section class="info-section">
					<h2>合作情况说明</h2>
					<div class="desc-card-list">
						<div class="desc-card">
							<h3>合作内容及目标</h3>
							<p>{{ detail.contentGoal || "-" }}</p>
						</div>
						<div class="desc-card">
							<h3>备注</h3>
							<p>{{ detail.remark || "-" }}</p>
						</div>
					</div>
				</section>

				<section class="info-section">
					<h2>最新周报</h2>
					<div class="weekly-card">
						<div class="weekly-card__header">
							<span>{{ detail.currentSituationTag }}</span>
							<span>{{ detail.latestReportDate || "暂无填报记录" }}</span>
						</div>
						<div class="weekly-card__item">
							<strong>本周进展</strong>
							<p>{{ detail.latestProgress || "-" }}</p>
						</div>
						<div class="weekly-card__item">
							<strong>下一步计划</strong>
							<p>{{ detail.nextPlan || "-" }}</p>
						</div>
						<div v-if="detail.stopReason" class="weekly-card__item weekly-card__item--warn">
							<strong>{{
								detail.projectStatusName.includes(projectFollowStatusLabels.ongoing) ? "历史停止原因" : "停止原因"
							}}</strong>
							<p>{{ detail.stopReason }}</p>
						</div>
					</div>
				</section>
			</div>

			<div class="detail-right">
				<!-- <section class="side-section">
          <h2>周报历史</h2>
          <div class="report-list">
            <div v-for="item in detail.reports" :key="item.id" class="report-card">
              <div class="report-card__top">
                <strong>{{ item.weekLabel }}</strong>
                <span>{{ item.reportDate }}</span>
              </div>
              <p>{{ item.progressSummary }}</p>
              <div class="report-card__footer">
                <span>{{ item.statusTag }}</span>
                <span>{{ item.reporter }}</span>
              </div>
            </div>
            <el-empty v-if="detail.reports.length === 0" description="暂无周报记录" />
          </div>
        </section> -->

				<section class="side-section">
					<h2>项目轨迹</h2>
					<div class="timeline">
						<div v-for="item in detail.timeline" :key="item.id" class="timeline-item">
							<div class="timeline-dot"></div>
							<div class="timeline-box">
								<div class="timeline-title">{{ item.step }}</div>
								<p>{{ item.content }}</p>
								<div class="timeline-bottom">
									<span>{{ item.operator }}</span>
								</div>
								<div class="timeline-time">{{ item.time }}</div>
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ArrowLeft } from "@element-plus/icons-vue"
import {
	formatCompletionText,
	getProjectStatusTagType,
	getWeeklyStatusTagType,
	projectFollowStatusLabels,
	type CooperationProjectItem
} from "../config"

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
.detail-page {
	display: flex;
	width: 100%;
	height: 100%;
	min-height: 0;
	flex-direction: column;
	margin: 0 auto;
}

.detail-header {
	display: flex;
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

.detail-action-button {
	margin-left: auto;
}

.detail-subline {
	display: flex;
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

.detail-card {
	display: grid;
	grid-template-columns: minmax(0, 1fr) 28rem;
	flex: 1;
	min-height: 0;
	overflow: hidden;
	border-radius: 1.25rem;
	background: #fff;
}

.detail-left,
.detail-right {
	overflow-y: auto;
}

.detail-left {
	padding: 1.875rem 2rem;
	border-right: 1px solid #edf0f5;
}

.detail-right {
	padding: 1.875rem 1.875rem 1.625rem;
}

.info-section,
.side-section {
	margin-bottom: 1.5rem;

	h2 {
		margin: 0 0 1rem;
		color: #0f2748;
		font-size: 1rem;
		font-weight: 700;
	}
}

.info-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1rem 2.5rem;
}

.info-grid__item {
	display: flex;
	flex-direction: column;
	gap: 0.375rem;
}

.info-grid__label {
	color: #6b7795;
	font-size: 0.875rem;
}

.info-grid__value {
	color: #172b4d;
	font-size: 0.875rem;
	line-height: 1.6;
}

.desc-card-list {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0.875rem;
}

.desc-card,
.report-card,
.weekly-card {
	padding: 0.875rem 1rem;
	border-radius: 0.875rem;
	background: #f7f9fc;
}

.desc-card {
	h3 {
		margin: 0 0 0.625rem;
		color: #172b4d;
		font-size: 0.9375rem;
		font-weight: 600;
	}

	p {
		margin: 0;
		color: #344563;
		line-height: 1.75;
	}
}

.weekly-card__header,
.report-card__top,
.report-card__footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem;
}

.weekly-card__header {
	margin-bottom: 0.875rem;
	color: #00b46e;
	font-size: 0.8125rem;
	font-weight: 600;
}

.weekly-card__item {
	margin-bottom: 0.875rem;

	strong {
		display: block;
		margin-bottom: 0.375rem;
		color: #172b4d;
		font-size: 0.875rem;
	}

	p {
		margin: 0;
		color: #344563;
		line-height: 1.7;
	}
}

.weekly-card__item--warn {
	padding: 0.75rem;
	border-radius: 0.75rem;
	background: rgba(245, 63, 63, 0.05);

	strong {
		color: #f53f3f;
	}
}

.report-list {
	display: grid;
	gap: 0.75rem;
}

.report-card {
	p {
		margin: 0.75rem 0;
		color: #344563;
		line-height: 1.6;
	}
}

.report-card__top {
	color: #172b4d;
	font-size: 0.875rem;
}

.report-card__footer {
	color: #6b7795;
	font-size: 0.75rem;
}

.timeline {
	position: relative;
	padding-left: 2rem;

	&::before {
		position: absolute;
		top: 0.625rem;
		bottom: 0;
		left: 0.625rem;
		width: 1px;
		border-left: 1px dashed #cfd6e4;
		content: "";
	}
}

.timeline-item {
	position: relative;
	margin-bottom: 1.25rem;
}

.timeline-dot {
	position: absolute;
	top: 1rem;
	left: -1.6875rem;
	width: 0.8125rem;
	height: 0.8125rem;
	border: 3px solid #e9eef6;
	border-radius: 50%;
	background: #00b46e;
}

.timeline-box {
	padding: 0.875rem 1rem 0.75rem;
	border: 1px solid #e1e7f0;
	border-radius: 0.75rem;
	background: #fff;

	p {
		margin: 0.5rem 0 0.75rem;
		color: #344563;
		font-size: 0.875rem;
		line-height: 1.45;
	}
}

.timeline-title {
	color: #0f2748;
	font-size: 1rem;
	font-weight: 700;
}

.timeline-bottom {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	color: #5f6f8c;
	font-size: 0.8125rem;
}

.timeline-time {
	margin-top: 0.5rem;
	color: #86909c;
	font-size: 0.75rem;
}

@media (max-width: 1200px) {
	.detail-card {
		grid-template-columns: 1fr;
		min-height: auto;
	}

	.detail-left {
		border-right: 0;
		border-bottom: 1px solid #edf0f5;
	}

	.detail-subline,
	.detail-header,
	.weekly-card__header,
	.report-card__top,
	.report-card__footer {
		flex-direction: column;
		align-items: flex-start;
	}

	.detail-action-button {
		margin-left: 0;
	}

	.info-grid,
	.desc-card-list {
		grid-template-columns: 1fr;
	}
}
</style>
