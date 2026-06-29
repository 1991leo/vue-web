<template>
	<aside class="calendar-sidebar">
		<div class="calendar-sidebar__search">
			<el-input v-model="innerKeyword" placeholder="搜索任务" clearable @input="handleKeywordChange">
				<template #suffix>
					<el-icon><Search /></el-icon>
				</template>
			</el-input>
		</div>

		<h3 class="calendar-sidebar__title">任务类别</h3>
		<div class="calendar-sidebar__category-list">
			<button
				v-for="item in categoryItems"
				:key="item.value"
				type="button"
				class="calendar-sidebar__category-item"
				:class="{ 'is-active': modelCategory === item.value }"
				@click="toggleCategory(item.value)"
			>
				<span class="calendar-sidebar__category-dot" :style="{ borderColor: item.color }"></span>
				<span class="calendar-sidebar__category-text">{{ item.label }}</span>
				<span class="calendar-sidebar__category-count">{{ item.count }}</span>
			</button>
		</div>

		<h3 class="calendar-sidebar__title calendar-sidebar__title--tasks">任务日历</h3>
		<div class="calendar-sidebar__task-list">
			<button
				v-for="task in tasks"
				:key="task.id"
				type="button"
				class="calendar-sidebar__task-item"
				@click="$emit('task-click', task)"
			>
				<span class="calendar-sidebar__task-dot" :style="{ borderColor: getCategoryColor(task.taskCategory) }"></span>
				<span class="calendar-sidebar__task-text">{{ task.taskTitle }}</span>
			</button>
			<div v-if="tasks.length === 0" class="calendar-sidebar__empty">暂无任务</div>
		</div>

		<el-button type="primary" class="calendar-sidebar__action" @click="$emit('create')">新建任务</el-button>
	</aside>
</template>

<script setup lang="ts">
import type { CalendarTask } from "../config"
import { ElIcon, ElInput } from "element-plus"
import { Search } from "@element-plus/icons-vue"
import { onBeforeUnmount, ref, watch } from "vue"
import type { PropType } from "vue"

interface SidebarCategoryItem {
	label: string
	value: string
	color: string
	count: number
}

const props = defineProps({
	keyword: {
		type: String,
		default: ""
	},
	modelCategory: {
		type: String,
		default: "all"
	},
	categoryItems: {
		type: Array as () => SidebarCategoryItem[],
		default: () => []
	},
	tasks: {
		type: Array as () => CalendarTask[],
		default: () => []
	},
	getCategoryColor: {
		type: Function as PropType<(category: string) => string>,
		required: true
	}
})

const emit = defineEmits<{
	(e: "update:keyword", value: string): void
	(e: "update:category", value: string): void
	(e: "task-click", task: CalendarTask): void
	(e: "create"): void
}>()

const innerKeyword = ref(props.keyword)
let keywordTimer: ReturnType<typeof setTimeout> | null = null

watch(
	() => props.keyword,
	(value) => {
		innerKeyword.value = value
	}
)

const handleKeywordChange = (value: string) => {
	if (keywordTimer) {
		clearTimeout(keywordTimer)
	}
	keywordTimer = setTimeout(() => {
		emit("update:keyword", value)
	}, 300)
}

const toggleCategory = (value: string) => {
	emit("update:category", props.modelCategory === value ? "all" : value)
}

onBeforeUnmount(() => {
	if (keywordTimer) {
		clearTimeout(keywordTimer)
	}
})
</script>

<style scoped lang="scss">
.calendar-sidebar {
	display: flex;
	height: 100%;
	flex-direction: column;
	padding: 1rem 0.875rem 1.125rem;
	border-right: 1px solid #ebecf0;
	border-radius: 20px 0 0 20px;
	background: #fff;
}

.calendar-sidebar__search {
	margin-bottom: 1.125rem;
}

.calendar-sidebar__title {
	margin: 0 0 0.75rem;
	color: #6b7795;
	font-size: 0.875rem;
	font-weight: 500;
}

.calendar-sidebar__title--tasks {
	margin-top: 1.25rem;
}

.calendar-sidebar__category-list,
.calendar-sidebar__task-list {
	display: flex;
	flex-direction: column;
	gap: 0.625rem;
}

.calendar-sidebar__category-item,
.calendar-sidebar__task-item {
	display: flex;
	align-items: center;
	padding: 0;
	border: none;
	background: transparent;
	color: #172b4d;
	text-align: left;
	cursor: pointer;
}

.calendar-sidebar__category-item.is-active .calendar-sidebar__category-text {
	color: #00b46e;
	font-weight: 600;
}

.calendar-sidebar__category-dot,
.calendar-sidebar__task-dot {
	width: 0.5rem;
	height: 0.5rem;
	margin-right: 0.5rem;
	border: 1.5px solid;
	border-radius: 50%;
	flex-shrink: 0;
}

.calendar-sidebar__category-text,
.calendar-sidebar__task-text {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 0.875rem;
}

.calendar-sidebar__category-count {
	margin-left: 0.5rem;
	color: #a5adba;
	font-size: 0.75rem;
}

.calendar-sidebar__empty {
	padding: 0.5rem 0;
	color: #a5adba;
	font-size: 0.875rem;
}

.calendar-sidebar__action {
	margin-top: auto;
	border-radius: 0.5rem;
	--el-button-bg-color: #00b46e;
	--el-button-border-color: #00b46e;
	--el-button-hover-bg-color: #00a665;
	--el-button-hover-border-color: #00a665;
}
</style>
