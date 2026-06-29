<template>
	<div class="calendar-month">
		<div class="calendar-month__header">
			<div v-for="item in weekHeaders" :key="item" class="calendar-month__header-item">{{ item }}</div>
		</div>

		<div class="calendar-month__grid">
			<button
				v-for="cell in cells"
				:key="cell.key"
				type="button"
				class="calendar-month__cell"
				:class="{ 'is-muted': !cell.isCurrentMonth, 'is-today': cell.isToday }"
				@click="$emit('select-day', cell.key)"
			>
				<div class="calendar-month__cell-head">
					<span class="calendar-month__day">{{ cell.dayNumber }}</span>
					<span class="calendar-month__sub">{{ cell.subLabel }}</span>
				</div>

				<div class="calendar-month__tasks">
					<div
						v-for="task in getTasks(cell.key)"
						:key="task.id"
						class="calendar-month__task"
						:style="{
							borderLeftColor: getCategoryColor(task.taskCategoryName),
							color: getCategoryColor(task.taskCategoryName)
						}"
						@click.stop="$emit('task-click', task)"
					>
						{{ task.taskTitle }}
					</div>
				</div>
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { PropType } from "vue"
import type { CalendarCellItem, CalendarTask } from "../config"

const props = defineProps({
	cells: {
		type: Array as () => CalendarCellItem[],
		default: () => []
	},
	taskMap: {
		type: Object as () => Map<string, CalendarTask[]>,
		required: true
	},
	getCategoryColor: {
		type: Function as PropType<(category: string) => string>,
		required: true
	}
})

defineEmits<{
	(e: "select-day", value: string): void
	(e: "task-click", task: CalendarTask): void
}>()

const weekHeaders = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
const getTasks = (dateKey: string) => props.taskMap.get(dateKey) || []
</script>

<style scoped lang="scss">
.calendar-month {
	display: flex;
	height: 100%;
	width: 100%;
	flex-direction: column;
}

.calendar-month__header,
.calendar-month__grid {
	display: grid;
	grid-template-columns: repeat(7, minmax(0, 1fr));
}

.calendar-month__header {
	height: 3rem;
	flex: 0 0 3rem;
}

.calendar-month__header-item {
	border-bottom: 1px solid #eef2f7;
	background: #f6f8fb;
	color: #98a2b3;
	font-size: 0.875rem;
	line-height: 3rem;
	text-align: center;
}

.calendar-month__grid {
	min-height: 0;
	flex: 1;
	grid-template-rows: repeat(6, minmax(0, 1fr));
}

.calendar-month__cell {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	min-height: 0;
	padding: 0.3rem;
	border-bottom: 1px solid #eef2f7;
	background: #ffffff;
	text-align: left;
	cursor: pointer;
	box-sizing: border-box;
}

.calendar-month__cell.is-muted {
	background: #fbfcfd;
}

.calendar-month__cell:hover .calendar-month__day {
	background: #1678ff;
	color: #ffffff;
}
.calendar-month__cell.is-today:hover .calendar-month__day {
	color: #ffffff;
}
.calendar-month__cell:nth-last-child(-n + 7) {
	border-bottom: none;
}

.calendar-month__cell-head {
	display: flex;
	align-items: baseline;
	gap: 0.25rem;
	flex: 0 0 auto;
	margin-bottom: 0.1rem;
}

.calendar-month__day {
	display: inline-flex;
	width: 1.275rem;
	height: 1.275rem;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	color: #172b4d;
	font-size: 0.9rem;
	font-weight: 600;
	transition:
		background-color 0.2s ease,
		color 0.2s ease;
}

.calendar-month__sub {
	color: #98a2b3;
	font-size: 0.75rem;
}

.calendar-month__cell.is-today .calendar-month__day {
	color: #1678ff;
}

.calendar-month__tasks {
	display: flex;
	min-height: 0;
	flex: 1;
	flex-direction: column;
	gap: 0.25rem;
	overflow-y: auto;
	overflow-x: hidden;
	scrollbar-gutter: stable;
	scrollbar-width: thin;
	scrollbar-color: transparent transparent;

	&::-webkit-scrollbar {
		width: 4px;
	}

	&::-webkit-scrollbar-thumb {
		border-radius: 999px;
		background: transparent;
	}
}

.calendar-month__cell:hover .calendar-month__tasks {
	scrollbar-color: rgba(107, 119, 149, 0.35) transparent;
}

.calendar-month__cell:hover .calendar-month__tasks::-webkit-scrollbar-thumb {
	background: rgba(107, 119, 149, 0.35);
}

.calendar-month__task {
	flex: 0 0 auto;
	overflow: hidden;
	padding: 0.125rem 0.375rem;
	border-left: 2px solid;
	background: #f8fafc;
	font-size: 0.75rem;
	line-height: 1.375;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
