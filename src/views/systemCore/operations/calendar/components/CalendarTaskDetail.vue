<template>
	<div class="detail-page">
		<div class="detail-header">
			<button class="back-square" @click="$emit('close')">
				<el-icon><ArrowLeft /></el-icon>
			</button>
			<h1>{{ task.taskTitle }}</h1>
			<span class="state-text" :class="stateClass">
				<i></i>
				{{ task.taskStatusName }}
			</span>
			<el-button type="primary" class="detail-edit-button" @click="$emit('edit')">编辑</el-button>
		</div>

		<div class="detail-subline">
			<span class="warning-chip" :class="task.warningLevel === '正常' ? 'normal' : 'attention'">
				<i></i>
				{{ task.warningLevel }}
			</span>
			<span>ID: {{ task.id }}</span>
			<b>|</b>
			<span>创建时间: {{ task.reportTime }}</span>
			<b>|</b>
			<span>最后更新: {{ task.lastUpdateTime }}</span>
		</div>

		<div class="detail-card">
			<div class="detail-left">
				<section class="info-section">
					<h2>任务描述</h2>
					<p>{{ task.taskDescription }}</p>
				</section>

				<section class="info-section">
					<h2>解决措施</h2>
					<p>{{ task.solution }}</p>
				</section>

				<section class="process-section">
					<h2>基本信息</h2>
					<div class="info-grid">
						<div class="info-grid__item">
							<span class="info-grid__label">任务名称</span>
							<span class="info-grid__value">{{ task.taskTitle }}</span>
						</div>
						<div class="info-grid__item">
							<span class="info-grid__label">负责人</span>
							<span class="info-grid__value">{{ task.assigneeName }}</span>
						</div>
						<div class="info-grid__item">
							<span class="info-grid__label">任务类别</span>
							<span class="info-grid__value">{{ task.taskCategoryName }}</span>
						</div>
						<div class="info-grid__item">
							<span class="info-grid__label">优先级</span>
							<span class="priority-chip" :class="priorityClass">{{ task.taskPriorityName }}</span>
						</div>
						<div class="info-grid__item">
							<span class="info-grid__label">任务类型</span>
							<span class="info-grid__value">{{ task.taskPlanTypeName }}</span>
						</div>
						<div class="info-grid__item">
							<span class="info-grid__label">协同负责人</span>
							<span class="info-grid__value">{{ task.collaboratorNames || "-" }}</span>
						</div>
						<div class="info-grid__item">
							<span class="info-grid__label">开始日期</span>
							<span class="info-grid__value">{{ startDateText }}</span>
						</div>
						<div class="info-grid__item">
							<span class="info-grid__label">截止日期</span>
							<span class="info-grid__value">{{ endDateText }}</span>
						</div>
					</div>

					<div class="progress-panel">
						<div class="progress-panel__line">
							<span>完成进度</span>
							<span>{{ task.completionProgress }}%</span>
						</div>
						<el-progress :percentage="task.completionProgress" :show-text="false" :stroke-width="8" color="#00b46e" />
						<div class="progress-panel__tips">
							<span>任务进度：{{ task.taskProgress || `${task.completionProgress}%` }}</span>
							<span>距离截止还有 {{ deadlineText }}</span>
						</div>
					</div>
				</section>
			</div>

			<div class="detail-right">
				<h2>推进时间线</h2>
				<div class="timeline">
					<div
						v-for="item in task.timeline"
						:key="`${item.time}-${item.label}`"
						class="timeline-item"
						:class="item.type"
					>
						<div class="timeline-dot"></div>
						<div class="timeline-box">
							<div class="timeline-title">{{ item.user }}</div>
							<p>{{ item.content }}</p>
							<div class="timeline-bottom">
								<span>{{ item.time }}</span>
								<em>{{ item.label }}</em>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ArrowLeft } from "@element-plus/icons-vue"
import { ElButton, ElIcon, ElProgress } from "element-plus"
import dayjs from "dayjs"
import { computed } from "vue"
import type { CalendarTask } from "../config"

const props = defineProps({
	task: {
		type: Object as () => CalendarTask,
		required: true
	},
	getCategoryColor: {
		type: Function as () => (category: string) => string,
		required: true
	}
})

defineEmits<{
	(e: "close"): void
	(e: "edit"): void
}>()

const startDateText = computed(() => dayjs(props.task.planStartTime).format("YYYY-MM-DD"))
const endDateText = computed(() => dayjs(props.task.planEndTime).format("YYYY-MM-DD"))

const deadlineText = computed(() => {
	const diff = dayjs(props.task.planEndTime).startOf("day").diff(dayjs().startOf("day"), "day")
	if (diff > 0) return `${diff} 天`
	if (diff === 0) return "今天"
	return `已超期 ${Math.abs(diff)} 天`
})

const stateClass = computed(() => {
	if (props.task.taskStatusName === "已完成") return "is-success"
	if (props.task.taskStatusName === "进行中") return "is-processing"
	if (props.task.taskStatusName === "延期") return "is-danger"
	return "is-pending"
})

const priorityClass = computed(() => {
	if (props.task.taskPriorityName === "高") return "is-high"
	if (props.task.taskPriorityName === "中") return "is-medium"
	return "is-low"
})
</script>

<style scoped lang="scss">
.detail-page {
	max-width: 100%;
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

.detail-edit-button {
	margin-left: auto;
	border-radius: 0.5rem;
	--el-button-bg-color: #00b46e;
	--el-button-border-color: #00b46e;
	--el-button-hover-bg-color: #00a665;
	--el-button-hover-border-color: #00a665;
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
	grid-template-columns: minmax(0, 1fr) 26rem;
	height: 41rem;
	overflow: hidden;
	border-radius: 1.25rem;
	background: #fff;
}

.detail-left {
	padding: 1.875rem 2rem;
	border-right: 1px solid #edf0f5;
}

.detail-right {
	padding: 1.875rem 1.875rem 1.625rem;

	h2 {
		margin: 0 0 1.5rem;
		color: #0f2748;
		font-size: 1rem;
		font-weight: 700;
	}
}

.state-text {
	display: inline-flex;
	align-items: center;
	gap: 0.375rem;
	font-size: 0.875rem;

	i {
		position: relative;
		width: 0.875rem;
		height: 0.875rem;
		border-radius: 50%;
	}

	&.is-success {
		color: #00b46e;

		i {
			background: #00b46e;

			&::after {
				position: absolute;
				top: 0.25rem;
				left: 0.1875rem;
				width: 0.4375rem;
				height: 0.25rem;
				border-bottom: 2px solid #fff;
				border-left: 2px solid #fff;
				transform: rotate(-45deg);
				content: "";
			}
		}
	}

	&.is-pending {
		color: #344563;

		i {
			border: 3px solid #a5adba;
		}
	}

	&.is-processing {
		color: #1677ff;

		i {
			border: 3px solid #1677ff;
			border-left-color: transparent;
		}
	}

	&.is-danger {
		color: #ff4d4f;

		i {
			background: #ff4d4f;

			&::before,
			&::after {
				position: absolute;
				top: 0.375rem;
				left: 0.1875rem;
				width: 0.5rem;
				height: 2px;
				background: #fff;
				content: "";
			}

			&::before {
				transform: rotate(45deg);
			}

			&::after {
				transform: rotate(-45deg);
			}
		}
	}
}

.warning-chip {
	display: inline-flex;
	align-items: center;
	gap: 0.4375rem;
	height: 1.75rem;
	padding: 0 0.75rem;
	border-radius: 0.5rem;
	font-size: 0.875rem;

	i {
		width: 0.3125rem;
		height: 0.3125rem;
		border-radius: 50%;
	}

	&.normal {
		color: #00b46e;
		background: rgba(0, 180, 110, 0.06);

		i {
			background: #00b46e;
		}
	}

	&.attention {
		color: #ff7d00;
		background: rgba(255, 125, 0, 0.06);

		i {
			background: #ff7d00;
		}
	}
}

.info-section,
.process-section {
	h2 {
		margin: 0 0 1rem;
		color: #0f2748;
		font-size: 1rem;
		font-weight: 700;
	}

	p {
		margin: 0 0 1.75rem;
		color: #5f6f8c;
		font-size: 0.875rem;
		line-height: 1.75;
	}
}

.info-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1rem 2.5rem;
	margin-bottom: 1.5rem;
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

.priority-chip {
	display: inline-flex;
	width: fit-content;
	align-items: center;
	justify-content: center;
	height: 1.5rem;
	padding: 0 0.625rem;
	border-radius: 999px;
	font-size: 0.75rem;
}

.priority-chip.is-high {
	background: rgba(245, 63, 63, 0.12);
	color: #f53f3f;
}

.priority-chip.is-medium {
	background: rgba(255, 159, 46, 0.12);
	color: #ff9f2e;
}

.priority-chip.is-low {
	background: rgba(0, 180, 110, 0.12);
	color: #00b46e;
}

.progress-panel {
	padding: 1rem;
	border-radius: 0.75rem;
	background: #f7f9fc;
}

.progress-panel__line {
	display: flex;
	justify-content: space-between;
	margin-bottom: 0.5rem;
	color: #6b7795;
	font-size: 0.875rem;
}

.progress-panel__tips {
	display: flex;
	justify-content: space-between;
	gap: 1rem;
	margin-top: 0.875rem;
	color: #6b7795;
	font-size: 0.875rem;
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
	margin-bottom: 1.5rem;

	.timeline-dot {
		position: absolute;
		top: 1rem;
		left: -1.6875rem;
		width: 0.8125rem;
		height: 0.8125rem;
		border: 3px solid #e9eef6;
		border-radius: 50%;
		background: #a5adba;
	}

	&.statusChange .timeline-dot,
	&.assign .timeline-dot {
		background: #1677ff;
	}

	&.progress .timeline-dot {
		background: #00b46e;
	}

	&.problem .timeline-dot {
		background: #ff4d4f;
	}

	&.create .timeline-dot {
		background: #6b7795;
	}
}

.timeline-box {
	padding: 0.875rem 1rem 0.75rem;
	border: 1px solid #e1e7f0;
	border-radius: 0.5rem;
	background: #fff;

	p {
		min-height: 1.25rem;
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
	color: #5f6f8c;
	font-size: 0.875rem;

	em {
		padding: 0.1875rem 0.6875rem;
		border-radius: 0.5rem;
		background: #f4f8ff;
		color: #1677ff;
		font-style: normal;
	}
}

.timeline-item.create .timeline-bottom em {
	color: #6b7795;
	background: #f5f7fa;
}

.timeline-item.progress .timeline-bottom em {
	color: #00b46e;
	background: rgba(0, 180, 110, 0.06);
}

.timeline-item.problem .timeline-bottom em {
	color: #ff4d4f;
	background: rgba(255, 77, 79, 0.06);
}

@media (max-width: 1200px) {
	.detail-card {
		grid-template-columns: 1fr;
	}

	.detail-left {
		border-right: 0;
		border-bottom: 1px solid #edf0f5;
	}

	.info-grid,
	.progress-panel__tips,
	.detail-subline {
		grid-template-columns: 1fr;
		flex-direction: column;
		align-items: flex-start;
	}

	.detail-header {
		flex-wrap: wrap;
	}

	.detail-edit-button {
		margin-left: 0;
	}
}
</style>
