<template>
	<div class="calendar-toolbar">
		<div class="calendar-toolbar__left">
			<el-button class="calendar-toolbar__today" @click="$emit('today')">今天</el-button>
		</div>

		<div class="calendar-toolbar__center">
			<button type="button" class="calendar-toolbar__nav" @click="$emit('prev')">
				<el-icon><ArrowLeft /></el-icon>
			</button>
			<span class="calendar-toolbar__title">{{ title }}</span>
			<button type="button" class="calendar-toolbar__nav" @click="$emit('next')">
				<el-icon><ArrowRight /></el-icon>
			</button>
		</div>

		<div class="calendar-toolbar__right">
			<el-radio-group :model-value="viewMode" class="calendar-toolbar__switch" @update:model-value="onViewChange">
				<el-radio-button label="day">日</el-radio-button>
				<el-radio-button label="month">月</el-radio-button>
			</el-radio-group>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { CalendarViewMode } from "../config"
import { ElButton, ElIcon, ElRadioButton, ElRadioGroup } from "element-plus"
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue"

defineProps({
	title: {
		type: String,
		default: ""
	},
	viewMode: {
		type: String as () => CalendarViewMode,
		default: "month"
	}
})

const emit = defineEmits<{
	(e: "today"): void
	(e: "prev"): void
	(e: "next"): void
	(e: "change-view", value: CalendarViewMode): void
}>()

const onViewChange = (value: string | number | boolean) => {
	if (value === "day" || value === "month") {
		emit("change-view", value)
	}
}
</script>

<style scoped lang="scss">
.calendar-toolbar {
	display: flex;
	height: 4.5rem;
	box-sizing: border-box;
	flex: 0 0 4.5rem;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	padding: 0.875rem 1rem;
}

.calendar-toolbar__left,
.calendar-toolbar__center,
.calendar-toolbar__right {
	display: flex;
	align-items: center;
}

.calendar-toolbar__center {
	gap: 0.875rem;
}

.calendar-toolbar__today {
	min-width: 4rem;
	border-color: #e6ebf2;
	color: #6b7795;
}

.calendar-toolbar__title {
	min-width: 10rem;
	color: #172b4d;
	font-size: 1.125rem;
	font-weight: 600;
	text-align: center;
}

.calendar-toolbar__nav {
	display: inline-flex;
	width: 1.75rem;
	height: 1.75rem;
	align-items: center;
	justify-content: center;
	border: 1px solid #e6ebf2;
	border-radius: 0.5rem;
	background: #ffffff;
	color: #6b7795;
	cursor: pointer;
}

.calendar-toolbar__switch {
	:deep(.el-radio-button__inner) {
		min-width: 2rem;
		padding: 0.3125rem 0.75rem;
		border-color: #e6ebf2;
		box-shadow: none;
		color: #6b7795;
	}

	:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
		border-color: #00b46e;
		background: #00b46e;
	}
}
</style>
