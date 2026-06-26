<template>
	<div class="calendar-day">
		<section v-for="section in sections" :key="section.key" class="calendar-day__section">
			<div class="calendar-day__section-head">
				<h3>{{ section.title }}</h3>
				<p>{{ section.timeRange }}</p>
			</div>

			<div v-if="section.tasks.length > 0" class="calendar-day__task-list">
				<button
					v-for="task in section.tasks"
					:key="task.id"
					type="button"
					class="calendar-day__task"
					:style="{ borderLeftColor: getCategoryColor(task.taskCategoryName) }"
					@click="$emit('task-click', task)"
				>
					<div class="calendar-day__task-head">
						<span class="calendar-day__time">{{ task.timeRange }}</span>
						<span
							class="calendar-day__tag"
							:style="{
								color: getCategoryColor(task.taskCategoryName),
								backgroundColor: `${getCategoryColor(task.taskCategoryName)}12`
							}"
						>
							{{ task.taskCategoryName }}
						</span>
					</div>
					<div class="calendar-day__task-title">{{ task.taskTitle }}</div>
					<div class="calendar-day__task-owner">负责人：{{ task.assigneeName }}</div>
				</button>
			</div>

			<div v-else class="calendar-day__empty">
				<img :src="noDataImage" alt="" />
				<span>暂无视图任务</span>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import noDataImage from "@/assets/images/no_data.webp"
import type { CalendarTask, DaySection } from "../config"

interface DaySectionWithTasks extends DaySection {
	tasks: CalendarTask[]
}

defineProps({
	sections: {
		type: Array as () => DaySectionWithTasks[],
		default: () => []
	},
	getCategoryColor: {
		type: Function as () => (category: string) => string,
		required: true
	}
})

defineEmits<{
	(e: "task-click", task: CalendarTask): void
}>()
</script>

<style scoped lang="scss">
.calendar-day {
	display: grid;
	width: 100%;
	height: 100%;
	min-height: 0;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 1rem;
}

.calendar-day__section {
	display: flex;
	min-height: 0;
	flex-direction: column;
	overflow: hidden;
	border-right: 1px solid #eef2f7;
}

.calendar-day__section:last-child {
	border-right: none;
}

.calendar-day__section-head {
	margin-bottom: 1rem;
	padding: 0.75rem;
	background: #f6f8fb;
	text-align: center;

	h3 {
		margin: 0;
		color: #172b4d;
		font-size: 0.875rem;
		font-weight: 600;
	}

	p {
		margin: 0.25rem 0 0;
		color: #98a2b3;
		font-size: 0.75rem;
	}
}

.calendar-day__task-list {
	display: flex;
	min-height: 0;
	flex: 1;
	flex-direction: column;
	gap: 0.875rem;
	overflow-y: auto;
	overflow-x: hidden;
	scrollbar-gutter: stable;
	scrollbar-width: thin;
	scrollbar-color: transparent transparent;
	padding: 0 0.75rem 0.75rem;

	&::-webkit-scrollbar {
		width: 4px;
	}

	&::-webkit-scrollbar-thumb {
		border-radius: 999px;
		background: transparent;
	}
}

.calendar-day__task-list:hover {
	scrollbar-color: rgba(107, 119, 149, 0.35) transparent;
}

.calendar-day__task-list:hover::-webkit-scrollbar-thumb {
	background: rgba(107, 119, 149, 0.35);
}
.calendar-day__task {
	padding: 0.875rem 1rem;
	border: 1px solid #eef2f7;
	border-left: 3px solid;
	border-radius: 0.75rem;
	background: #ffffff;
	text-align: left;
	cursor: pointer;
}

.calendar-day__task-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem;
	margin-bottom: 0.5rem;
}

.calendar-day__time {
	color: #98a2b3;
	font-size: 0.75rem;
}

.calendar-day__tag {
	padding: 0.0625rem 0.5rem;
	border-radius: 999px;
	font-size: 0.75rem;
}

.calendar-day__task-title {
	margin-bottom: 0.5rem;
	color: #172b4d;
	font-size: 0.875rem;
	font-weight: 500;
	line-height: 1.5;
}

.calendar-day__task-owner {
	color: #98a2b3;
	font-size: 0.75rem;
}

.calendar-day__empty {
	display: flex;
	flex: 1;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	gap: 0.5rem;
	color: #a5adba;
	font-size: 0.875rem;

	img {
		width: 10rem;
		height: auto;
	}
}

@media (max-width: 1200px) {
	.calendar-day {
		grid-template-columns: 1fr;
	}

	.calendar-day__section {
		min-height: auto;
		border-right: none;
		border-bottom: 1px solid #eef2f7;
		overflow: visible;
		padding-bottom: 1rem;
	}

	.calendar-day__section:last-child {
		border-bottom: none;
	}
}
</style>
