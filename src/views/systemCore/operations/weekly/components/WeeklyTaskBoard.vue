<template>
	<div class="task-board">
		<div class="task-columns">
			<article v-for="task in props.section.tasks" :key="task.id" class="task-card">
				<div class="task-card__status" :class="getTaskStatusClass(task.taskStatus)">
					{{ getTaskStatusBadgeLabel(task.taskStatusName) }}
				</div>

				<div class="task-card__body">
					<div class="task-card__head">
						<div class="task-card__title">{{ task.taskTitle }}</div>
					</div>

					<div class="task-card__desc">{{ task.taskDescription }}</div>

					<div class="task-card__meta">
						<div class="task-card__meta-left">
							<span class="task-card__owner">{{ task.assigneeName }}</span>
							<span>负责人</span>
						</div>

						<div class="task-card__meta-status" :class="getStatusPlanBColorFont(task.taskStatusName)">
							<img :src="getStatusPlanBImage(task.taskStatusName)" alt="" />
							<span>{{ task.taskStatusName }}</span>
						</div>
					</div>
				</div>
			</article>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { PropType } from "vue"
import type { WeeklySection } from "../types"
import { getStatusPlanBColorFont, getStatusPlanBImage } from "@/utils/status"

const props = defineProps({
	section: {
		type: Object as PropType<WeeklySection>,
		required: true
	}
})

const getTaskStatusClass = (status?: string | null) => {
	if (status === "1") return "is-ongoing"
	if (status === "2") return "is-completed"
	if (status === "3") return "is-delayed"
	return "is-pending"
}

const getTaskStatusBadgeLabel = (statusName?: string | null) => {
	if (statusName === "已完成") return "完成"
	if (statusName === "进行中") return "处理"
	if (statusName === "已延期") return "超时"
	return "待办"
}
</script>

<style scoped lang="scss">
.task-board {
	display: flex;
	flex: 1;
	flex-direction: column;
	width: 100%;
	height: 100%;
	min-height: 0;
	padding: 1rem;
	background: #fff;
	overflow-y: auto;
}

.task-columns {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 1.35rem;
	align-content: start;
	min-height: min-content;
	padding: 0;
}

.task-card {
	display: flex;
	gap: 12px;
	height: 7.43rem;
	padding: 0.95rem 0.95rem 0.875rem;
	border-radius: 8px;
	background: #fafbfc;
}

.task-card__status {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 3.6rem;
	height: 3.6rem;
	border-radius: 8px;
	font-size: 12px;
	font-weight: 600;
}

.task-card__status.is-ongoing {
	background: rgba(22, 119, 255, 0.1);
	color: var(--el-color-primary);
}

.task-card__status.is-completed {
	background: rgba(0, 180, 110, 0.12);
	color: var(--el-color-success);
}

.task-card__status.is-delayed {
	background: rgba(245, 63, 63, 0.1);
	color: #f53f3f;
}
.task-card__status.is-pending {
	background: #edf1f7;
	color: #6b778c;
}
.task-card__body {
	display: flex;
	min-width: 0;
	flex: 1;
	flex-direction: column;
}

.task-card__head {
	display: flex;
	align-items: flex-start;
	gap: 12px;
}

.task-card__title {
	color: #1f2329;
	font-size: 15px;
	font-weight: 600;
	line-height: 1.45;
}

.task-card__desc {
	margin-top: 0.45rem;
	color: #8a93a3;
	font-size: 12px;
	line-height: 1.55;
}

.task-card__meta {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: auto;
	color: #9aa4b2;
	font-size: 12px;
}

.task-card__meta-left {
	display: flex;
	align-items: center;
	gap: 8px;
}

.task-card__owner {
	color: #6b778c;
	font-weight: 600;
}

.task-card__meta-status {
	display: inline-flex;
	align-items: center;
	gap: 0.25rem;
	font-size: 12px;
	font-weight: 500;
	line-height: 1;
}

.task-card__meta-status img {
	display: block;
	width: 0.75rem;
	height: 0.75rem;
	object-fit: contain;
}

@media (max-width: 1280px) {
	.task-columns {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 768px) {
	.task-columns {
		grid-template-columns: 1fr;
	}
}
</style>
