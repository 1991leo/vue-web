<template>
	<div class="workbench-container">
		<div class="list-page">
			<PageTitle title="工作台" />

			<div v-loading="loading" class="workbench-content">
				<div class="summary-grid">
					<div v-for="item in summaryCards" :key="item.key" class="summary-card">
						<div class="summary-icon" :class="item.className">
							<el-icon>
								<component :is="item.icon" />
							</el-icon>
						</div>
						<div class="summary-main">
							<div class="summary-label">{{ item.label }}</div>
							<div class="summary-value">
								{{ item.value }}
								<span>{{ item.unit }}</span>
							</div>
							<div class="summary-desc" :class="item.descClass">{{ item.desc }}</div>
						</div>
					</div>
				</div>

				<div class="chart-grid">
					<section class="panel">
						<div class="panel-header">
							<h2 class="panel-title">月度经营趋势</h2>
						</div>
						<v-chart class="chart-view" :option="trendOption" autoresize />
					</section>

					<section class="panel">
						<div class="panel-header">
							<h2 class="panel-title">项目状态分布</h2>
						</div>
						<v-chart class="chart-view" :option="pieOption" autoresize />
					</section>
				</div>

				<div class="bottom-grid">
					<section class="panel tracking-panel">
						<div class="panel-header">
							<h2 class="panel-title">重点事项追踪</h2>
							<el-button link type="primary" class="text-button" @click="handleViewAll">
								查看全部
								<el-icon class="el-icon--right"><ArrowRight /></el-icon>
							</el-button>
						</div>

						<CommonTable :data="projectTrackingList" :columns="projectColumns" :loading="false" row-key="projectId">
							<template #projectSlot="{ row }">
								<div class="project-cell">
									<div class="project-name" :title="row.projectName">{{ row.projectName || "-" }}</div>
									<div class="project-code">编号：{{ row.projectCode || "-" }}</div>
								</div>
							</template>

							<template #progressSlot="{ row }">
								<el-progress
									:percentage="formatProgress(row.progress)"
									:stroke-width="8"
									:color="progressColor(row.status || row.statusName)"
								/>
							</template>

							<template #statusSlot="{ row }">
								<el-tag :type="statusTagType(row.status || row.statusName)" effect="light" round>
									{{ row.statusName || row.status || "-" }}
								</el-tag>
							</template>
						</CommonTable>
					</section>

					<section class="panel todo-panel">
						<div class="panel-header">
							<h2 class="panel-title">协调待办</h2>
							<el-button type="primary" class="create-button" @click="handleAddTodo">
								<el-icon><Plus /></el-icon>
								新增
							</el-button>
						</div>

						<div v-if="coordinationList.length" class="todo-list">
							<div v-for="item in coordinationList" :key="item.coordinationId || item.title" class="todo-item">
								<div class="priority-dot" :class="priorityClass(item.priority || item.priorityName)" />
								<div class="todo-main">
									<div class="todo-title" :title="item.title">{{ item.title || "-" }}</div>
									<div class="todo-meta">
										<span>
											<el-icon><OfficeBuilding /></el-icon>
											{{ item.responsibleDept || "-" }}
										</span>
										<span>
											<el-icon><Calendar /></el-icon>
											{{ item.deadline || "-" }}
										</span>
									</div>
								</div>
								<el-tag :type="priorityTagType(item.priority || item.priorityName)" effect="light" round>
									{{ item.priorityName || item.priority || "-" }}
								</el-tag>
							</div>
						</div>
						<el-empty v-else class="empty-state" description="暂无协调待办" />
					</section>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { ArrowRight, Calendar, Coin, OfficeBuilding, Plus, Tickets, TrendCharts } from "@element-plus/icons-vue"
import VChart from "vue-echarts"
import { use } from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import { BarChart, LineChart, PieChart as EchartsPieChart } from "echarts/charts"
import { GridComponent, LegendComponent, TooltipComponent } from "echarts/components"
import PageTitle from "@/components/PageTitle/index.vue"
import CommonTable from "@/components/CommonTable/index.vue"
import { getDashboardData } from "@/api/system/dashboard"
import type { CoordinationItem, DashboardVo, ProjectTracking } from "@/api/system/dashboard"

use([CanvasRenderer, BarChart, LineChart, EchartsPieChart, TooltipComponent, LegendComponent, GridComponent])

type TrendType = "营收" | "利润"
type TagType = "primary" | "success" | "warning" | "info" | "danger"

interface SummaryCard {
	key: string
	label: string
	value: string | number
	unit: string
	desc: string
	className: string
	descClass: string
	icon: unknown
}

const router = useRouter()
const loading = ref(false)
const trendType = ref<TrendType>("营收")
const dashboardData = ref<DashboardVo>({})
const trendOptions = ["营收", "利润"]

const projectColumns = [
	{ label: "事项名称", minWidth: 220, slotName: "projectSlot", showOverflowTooltip: true },
	{ prop: "assigneeName", label: "负责人", minWidth: 100 },
	{ label: "进度", minWidth: 160, slotName: "progressSlot" },
	{ label: "状态", minWidth: 110, slotName: "statusSlot" }
]

const projectTrackingList = computed<ProjectTracking[]>(() => dashboardData.value.projectTrackingList || [])
const coordinationList = computed<CoordinationItem[]>(() => dashboardData.value.coordinationList || [])

const summaryCards = computed<SummaryCard[]>(() => {
	const projectStats = dashboardData.value.projectStats || {}
	const businessStats = dashboardData.value.businessStats || {}
	const todoStats = dashboardData.value.todoStats || {}

	return [
		{
			key: "project",
			label: "重点项目动态",
			value: projectStats.inProgressCount ?? 0,
			unit: "个进行中",
			desc: `本月新增 ${projectStats.monthlyNewCount ?? 0} 个`,
			className: "is-blue",
			descClass: "is-success",
			icon: TrendCharts
		},
		{
			key: "revenue",
			label: "本年累计营收",
			value: formatNumber(businessStats.totalRevenue),
			unit: "亿元",
			desc: `同比增长 ${formatPercent(businessStats.growthRate)}%`,
			className: "is-green",
			descClass: "is-primary",
			icon: Coin
		},
		{
			key: "todo",
			label: "待办事项",
			value: todoStats.pendingCount ?? 0,
			unit: "项待处理",
			desc: `紧急事项 ${todoStats.urgentCount ?? 0} 项`,
			className: "is-orange",
			descClass: "is-danger",
			icon: Tickets
		}
	]
})

function getCssVar(name: string) {
	return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const trendOption = computed(() => {
	const monthlyTrend = dashboardData.value.monthlyTrend || {}
	const months = monthlyTrend.months || []
	const revenueData = monthlyTrend.revenueData || []
	const profitData = monthlyTrend.profitData || []
	const isRevenue = trendType.value === "营收"

	return {
		tooltip: {
			trigger: "axis",
			backgroundColor: "#ffffff",
			borderColor: "#e5eaf1",
			textStyle: { color: "#202938" }
		},
		legend: {
			bottom: 0,
			icon: "roundRect",
			itemWidth: 12,
			itemHeight: 6,
			textStyle: { color: "#606266" }
		},
		grid: { left: 18, right: 18, top: 24, bottom: 44, containLabel: true },
		xAxis: {
			type: "category",
			data: months,
			axisTick: { show: false },
			axisLine: { lineStyle: { color: "#dcdfe6" } },
			axisLabel: { color: "#606266" }
		},
		yAxis: {
			type: "value",
			axisLabel: { color: "#606266" },
			splitLine: { lineStyle: { type: "dashed", color: "#e5eaf1" } }
		},
		series: [
			{
				name: "营收",
				type: "bar",
				barWidth: 18,
				itemStyle: { color: "#2d8ffc", borderRadius: [4, 4, 0, 0] },
				emphasis: { focus: "series" },
				data: revenueData,
				opacity: isRevenue ? 1 : 0.35
			},
			{
				name: "利润",
				type: "line",
				smooth: true,
				symbolSize: 7,
				lineStyle: { width: 3, color: "#20b486" },
				itemStyle: { color: "#20b486" },
				data: profitData,
				opacity: isRevenue ? 0.45 : 1
			}
		]
	}
})

const pieOption = computed(() => {
	const textColor = getCssVar("--el-text-color-regular") || "#606266"
	const bgColor = getCssVar("--el-bg-color") || "#ffffff"
	const distribution = dashboardData.value.projectStatusDistribution || []
	const data = distribution.map((item) => ({
		value: item.count ?? 0,
		name: item.statusName || item.statusCode || "-",
		itemStyle: item.color ? { color: item.color } : undefined
	}))

	return {
		tooltip: {
			trigger: "item",
			backgroundColor: bgColor,
			borderColor: "#e5eaf1",
			textStyle: { color: "#202938" },
			formatter: "{b}<br/>数量：{c}<br/>占比：{d}%"
		},
		legend: {
			orient: "vertical",
			right: "5%",
			top: "center",
			data: data.map((item) => item.name),
			textStyle: { color: textColor }
		},
		color: ["#2d8ffc", "#20b486", "#f59a23", "#f56c6c", "#8b5cf6"],
		series: [
			{
				name: "项目状态",
				type: "pie",
				radius: ["48%", "70%"],
				center: ["40%", "50%"],
				avoidLabelOverlap: false,
				itemStyle: { borderRadius: 10, borderColor: bgColor, borderWidth: 2 },
				label: { show: false },
				emphasis: {
					label: { show: false }
				},
				labelLine: { show: false },
				data
			}
		]
	}
})

async function getDashboard() {
	loading.value = true
	try {
		const res = (await getDashboardData()) as any
		dashboardData.value = res.data || {}
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}

function formatNumber(value?: number) {
	if (value === undefined || value === null) return "0"
	return Number(value).toLocaleString("zh-CN", { maximumFractionDigits: 2 })
}

function formatPercent(value?: number) {
	if (value === undefined || value === null) return "0"
	return Number(value).toLocaleString("zh-CN", { maximumFractionDigits: 2 })
}

function formatProgress(value?: number) {
	const progress = Number(value ?? 0)
	if (Number.isNaN(progress)) return 0
	return Math.min(Math.max(progress, 0), 100)
}

function statusTagType(status?: string): TagType {
	const map: Record<string, TagType> = {
		"0": "info",
		"1": "primary",
		"2": "success",
		"3": "warning",
		规划中: "info",
		进行中: "primary",
		待审批: "warning",
		已完成: "success",
		已暂停: "danger",
		已终止: "danger"
	}
	return map[status || ""] || "info"
}

function progressColor(status?: string) {
	const map: Record<string, string> = {
		"0": "#909399",
		"1": "#2d8ffc",
		"2": "#20b486",
		"3": "#f59a23",
		规划中: "#909399",
		进行中: "#2d8ffc",
		待审批: "#f59a23",
		已完成: "#20b486",
		已暂停: "#f56c6c",
		已终止: "#f56c6c"
	}
	return map[status || ""] || "#2d8ffc"
}

function priorityClass(priority?: string) {
	const text = priority || ""
	if (["高", "高优先级", "high", "1"].includes(text)) return "is-high"
	if (["中", "中优先级", "medium", "2"].includes(text)) return "is-medium"
	return "is-low"
}

function priorityTagType(priority?: string): TagType {
	const className = priorityClass(priority)
	if (className === "is-high") return "danger"
	if (className === "is-medium") return "warning"
	return "info"
}

function handleViewAll() {
	router.push("/synergy/tracking")
}

function handleAddTodo() {
	// 协调待办新增复用协调支持事项页的 create 视图入口
	router.push({
		path: "/synergy/coordinate",
		query: { action: "create" }
	})
}

onMounted(() => {
	getDashboard()
})
</script>

<style scoped lang="scss">
.workbench-container {
	height: 100%;
	color: #202938;
	overflow: hidden;
}

.list-page {
	height: 100%;
	display: flex;
	flex-direction: column;
	padding: 30px;
	overflow: hidden;
	background: #ffffff;
	border-radius: 20px;
	box-shadow: 0 8px 24px rgba(23, 43, 77, 0.05);
}

.workbench-content {
	flex: 1;
	min-height: 0;
	overflow-y: auto;
	padding-right: 2px;
}

.summary-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 20px;
	margin-bottom: 20px;
}

.summary-card {
	display: flex;
	align-items: center;
	gap: 18px;
	min-height: 116px;
	padding: 22px;
	border: 1px solid var(--el-border-color-lighter, #e5eaf1);
	border-radius: 12px;
	background: #ffffff;
}

.summary-icon {
	width: 52px;
	height: 52px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	border-radius: 10px;
	font-size: 24px;

	&.is-blue {
		color: #2d8ffc;
		background: rgba(45, 143, 252, 0.1);
	}

	&.is-green {
		color: #20b486;
		background: rgba(32, 180, 134, 0.1);
	}

	&.is-orange {
		color: #f59a23;
		background: rgba(245, 154, 35, 0.12);
	}
}

.summary-main {
	min-width: 0;
}

.summary-label {
	margin-bottom: 8px;
	color: var(--el-text-color-regular, #606266);
	font-size: 14px;
	line-height: 20px;
}

.summary-value {
	margin-bottom: 8px;
	color: var(--el-text-color-primary, #202938);
	font-size: 30px;
	font-weight: 700;
	line-height: 36px;

	span {
		margin-left: 6px;
		color: var(--el-text-color-secondary, #909399);
		font-size: 14px;
		font-weight: 400;
	}
}

.summary-desc {
	font-size: 13px;
	line-height: 18px;

	&.is-success {
		color: var(--el-color-success, #20b486);
	}

	&.is-primary {
		color: var(--el-color-primary, #2d8ffc);
	}

	&.is-danger {
		color: var(--el-color-danger, #f56c6c);
	}
}

.chart-grid,
.bottom-grid {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
	gap: 20px;
	margin-bottom: 20px;
}

.panel {
	min-width: 0;
	padding: 22px;
	border: 1px solid var(--el-border-color-lighter, #e5eaf1);
	border-radius: 12px;
	background: #ffffff;
}

.panel-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	margin-bottom: 18px;
}

.panel-title {
	position: relative;
	margin: 0;
	padding-left: 12px;
	padding-bottom: 0;
	color: var(--el-text-color-primary, #202938);
	font-size: 16px;
	font-weight: 600;
	line-height: 22px;
	border-bottom: none;
	text-decoration: none;

	// &::before {
	//   content: '';
	//   position: absolute;
	//   left: 0;
	//   top: 50%;
	//   width: 4px;
	//   height: 16px;
	//   border-radius: 2px;
	//   background: var(--el-color-primary, #2d8ffc);
	//   transform: translateY(-50%);
	// }
}

.chart-view {
	width: 100%;
	height: 320px;
}

.tracking-panel,
.todo-panel {
	min-height: 420px;
}

.text-button {
	height: 28px;
	padding: 0;
}

.create-button {
	min-width: 76px;
	height: 34px;
	border-radius: 8px;
}

.project-cell {
	min-width: 0;
}

.project-name {
	overflow: hidden;
	color: var(--el-text-color-primary, #202938);
	font-weight: 600;
	line-height: 20px;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.project-code {
	margin-top: 4px;
	color: var(--el-text-color-secondary, #909399);
	font-size: 12px;
	line-height: 18px;
}

.todo-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.todo-item {
	display: flex;
	align-items: center;
	gap: 14px;
	min-height: 78px;
	padding: 14px 16px;
	border: 1px solid var(--el-border-color-lighter, #e5eaf1);
	border-radius: 10px;
	background: var(--el-fill-color-extra-light, #fafafa);
}

.priority-dot {
	width: 8px;
	height: 40px;
	flex-shrink: 0;
	border-radius: 6px;

	&.is-high {
		background: var(--el-color-danger, #f56c6c);
	}

	&.is-medium {
		background: var(--el-color-warning, #f59a23);
	}

	&.is-low {
		background: var(--el-color-info, #909399);
	}
}

.todo-main {
	flex: 1;
	min-width: 0;
}

.todo-title {
	overflow: hidden;
	margin-bottom: 8px;
	color: var(--el-text-color-primary, #202938);
	font-weight: 600;
	line-height: 20px;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.todo-meta {
	display: flex;
	flex-wrap: wrap;
	gap: 14px;
	color: var(--el-text-color-secondary, #909399);
	font-size: 13px;

	span {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		min-width: 0;
	}
}

.empty-state {
	height: 300px;
}

:deep(.el-segmented) {
	--el-segmented-item-selected-color: var(--el-color-primary);
	--el-segmented-item-selected-bg-color: #ffffff;
}

:deep(.common-table-wrapper) {
	min-height: 330px;
}

@media (max-width: 1200px) {
	.summary-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.chart-grid,
	.bottom-grid {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 768px) {
	.list-page {
		padding: 20px;
	}

	.summary-grid {
		grid-template-columns: 1fr;
	}

	.summary-card,
	.panel {
		padding: 18px;
	}

	.panel-header {
		align-items: flex-start;
		flex-direction: column;
	}
}
</style>
