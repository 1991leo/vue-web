<template>
	<div class="weekly-page">
		<section class="weekly-main" v-loading="loading">
			<div class="weekly-main__summary">
				<WeeklySummaryBanner :summary="activeSummary" />
			</div>

			<div class="weekly-main__toolbar">
				<div class="weekly-main__toolbar-title">工作任务</div>

				<div class="weekly-main__toolbar-actions">
					<div class="switch-tabs">
						<button
							v-for="tab in reportTabs"
							:key="tab.key"
							type="button"
							class="switch-tabs__item"
							:class="{ 'is-active': activeTab === tab.key }"
							@click="activeTab = tab.key"
						>
							{{ tab.label }}
						</button>
					</div>

					<el-button class="export-btn" @click="handleExport" v-hasPermi="['base:weeklyReport:export']"
						>导出word</el-button
					>
				</div>
			</div>

			<div class="weekly-main__board">
				<div class="weekly-main__section-head">
					<button
						v-for="section in activeReport.sections"
						:key="section.key"
						type="button"
						class="weekly-main__section-tab"
						:class="{ 'is-active': activeSectionKey === section.key }"
						@click="activeSectionKey = section.key"
					>
						<div class="weekly-main__section-title">{{ section.title }}</div>
						<div class="weekly-main__section-date">{{ section.dateRange }}</div>
					</button>
				</div>

				<div class="weekly-main__content">
					<WeeklyTaskBoard :section="activeSection" />
				</div>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import { getWeeklyReportCurrent, getWeeklyReportTwoWeeks } from "@/api/management"
import type { WeeklyReportData, WeeklyReportTask } from "@/api/management/types"
import weeklyBgImage from "@/assets/images/weekly_bg.webp"
import { computed, getCurrentInstance, onMounted, ref, watch, type ComponentInternalInstance } from "vue"
import WeeklySummaryBanner from "./components/WeeklySummaryBanner.vue"
import WeeklyTaskBoard from "./components/WeeklyTaskBoard.vue"
const { proxy } = getCurrentInstance() as ComponentInternalInstance
import type { ReportTabKey, WeeklyReport, WeeklySectionKey, WeeklySummaryData } from "./types"

const activeTab = ref<ReportTabKey>("current")
const activeSectionKey = ref<WeeklySectionKey>("current")
const summaryBgImage = `url(${weeklyBgImage})`
const weeklyReportData = ref<WeeklyReportData | null>(null)
const loading = ref(false)

const reportTabs = [
	{ key: "current" as const, label: "当周" },
	{ key: "twoWeeks" as const, label: "近两周" }
]

const activeReport = computed<WeeklyReport>(() => {
	const data = weeklyReportData.value
	return {
		label: "本周任务总数",
		sections: [
			{
				key: "current",
				title: "本周进行的任务",
				dateRange: data?.weekStartDate && data?.weekEndDate ? `${data.weekStartDate} - ${data.weekEndDate}` : "",
				tasks: Array.isArray(data?.weekTasks) ? (data?.weekTasks as WeeklyReportTask[]) : []
			},
			{
				key: "next",
				title: "下周需要完成的任务",
				dateRange:
					data?.nextWeekStartDate && data?.nextWeekEndDate ? `${data.nextWeekStartDate} - ${data.nextWeekEndDate}` : "",
				tasks: Array.isArray(data?.nextWeekTasks) ? (data?.nextWeekTasks as WeeklyReportTask[]) : []
			}
		]
	}
})

const activeSummary = computed<WeeklySummaryData>(() => ({
	weekTotalCount: weeklyReportData.value?.weekTotalCount,
	weekCompletedCount: weeklyReportData.value?.weekCompletedCount,
	weekInProgressCount: weeklyReportData.value?.weekInProgressCount,
	weekNotStartedCount: weeklyReportData.value?.weekNotStartedCount
}))
const activeSection = computed(() => {
	return (
		activeReport.value.sections.find((section) => section.key === activeSectionKey.value) ??
		activeReport.value.sections[0]
	)
})

watch(activeTab, () => {
	activeSectionKey.value = activeReport.value.sections[0]?.key ?? "current"
	getWeeklyReport()
})

const getWeeklyReport = async () => {
	loading.value = true
	try {
		const res = activeTab.value === "twoWeeks" ? await getWeeklyReportTwoWeeks() : await getWeeklyReportCurrent()
		if (res.data && typeof res.data === "object") {
			weeklyReportData.value = res.data
		}
	} finally {
		loading.value = false
	}
}

// const  = () => {
//   ElMessage.success('周报导出任务已提交，请稍候下载。');
// };
/** 导出按钮操作 */
const handleExport = () => {
	proxy?.$download.file(
		"/base/weeklyReport/export",
		`周报_${new Date().toLocaleDateString()}-${new Date().toLocaleTimeString()}.docx`
	)
}
onMounted(() => {
	getWeeklyReport()
})
</script>

<style scoped lang="scss">
.weekly-page {
	height: calc(100vh - 146px);
	min-height: 0;
}

.weekly-main {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	height: 100%;
	min-width: 0;
}

.weekly-main__summary {
	flex: 0 0 9.5rem;
	height: 9.5rem;
	background-color: #fff;
	background-image: v-bind(summaryBgImage);
	background-repeat: no-repeat;
	background-position: right 1rem bottom;
	background-size: 15rem 10.6rem;
	border-radius: 1.25rem;
	overflow: hidden;
}

.weekly-main__toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex: 0 0 3.9rem;
	height: 3.9rem;
	padding: 0 0.35rem 0 0.125rem;
}

.weekly-main__toolbar-title {
	color: #1f2329;
	font-size: 1.25rem;
	font-weight: 600;
	line-height: 1;
}

.weekly-main__toolbar-actions {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.weekly-main__board {
	display: flex;
	flex: 1;
	flex-direction: column;
	min-height: 0;
	overflow: hidden;
	border-radius: 1.125rem;
}

.weekly-main__section-head {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	align-items: end;
	// gap: 0.875rem;
	// padding: 0 0.75rem;
	// background: #ffffff;
}

.weekly-main__section-tab {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	height: 3rem;
	padding: 0 1.125rem;
	border: none;
	border-radius: 20px 20px 0 0;
	background: #f4f5f7;
	cursor: pointer;
}

.weekly-main__section-tab.is-active {
	height: 3.4rem;
	background: #ffffff;
}

.weekly-main__section-tab.is-active .weekly-main__section-title {
	color: var(--el-color-success);
}

.weekly-main__section-date {
	color: #a3acba;
	font-size: 0.75rem;
	line-height: 1;
}

.weekly-main__section-title {
	color: #4e5969;
	font-size: 0.875rem;
	font-weight: 600;
	line-height: 1;
}

.weekly-main__content {
	flex: 1;
	min-height: 0;
}

.switch-tabs {
	display: inline-flex;
	gap: 0.1875rem;
	// width: 8.3rem;
	// padding: 0.125rem;
	border-radius: 8px;
	background: #fff;
	border: 1px solid #dfe1e6;
}

.switch-tabs__item {
	height: 1.875rem;
	padding: 0 0.85rem;
	border: none;
	border-radius: 8px;
	background: transparent;
	color: #6b778c;
	font-size: 0.875rem;
	cursor: pointer;
	transition: all 0.2s ease;
}

.switch-tabs__item.is-active {
	background: var(--el-color-primary);
	color: #ffffff;
	font-weight: 600;
}

.export-btn {
	height: 1.875rem;
	padding: 0 1rem;
	border: none;
	background: #ebecf0;
	color: #6b778c;
	font-size: 0.875rem;
}

@media (max-width: 768px) {
	.weekly-page {
		height: auto;
	}

	.weekly-main__summary {
		background-position: right 0.5rem bottom;
		background-size: 15rem 10.6rem;
	}

	.weekly-main__toolbar {
		flex-basis: auto;
		min-height: auto;
		padding: 0.75rem;
	}

	.weekly-main__toolbar,
	.weekly-main__toolbar-actions {
		flex-direction: column;
		align-items: stretch;
		gap: 0.75rem;
	}

	.weekly-main__section-head {
		grid-template-columns: 1fr;
		row-gap: 0.5rem;
	}

	.weekly-main__section-tab,
	.weekly-main__section-tab.is-active {
		height: auto;
		min-height: 3rem;
		align-items: flex-start;
		flex-direction: column;
		justify-content: center;
		padding: 0.75rem 1rem;
	}
}
</style>
