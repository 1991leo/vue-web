<template>
	<div class="dashboard-container view-list">
		<!-- 顶部状态 Tabs 切换，游离在白色大卡片外面 -->
		<div class="tabs-header-row">
			<HeaderTabs v-model="activeTab" :tabs="statusTabs" @change="handleTabChange" :showCount="false" />
		</div>

		<!-- 主体滚动容器：各模块自身承载白底卡片视觉 -->
		<div class="dashboard-main-card" v-loading="loading">
			<!-- 部门任务统计：铺满一行 -->
			<div class="stat-section">
				<div class="stat-cards">
					<div v-for="(item, index) in currentStat" :key="index" class="stat-card" :class="`type-${item.type}`">
						<img class="stat-card-bg" :src="item.backgroundUrl" aria-hidden="true" alt="" />
						<div class="stat-content">
							<div class="stat-icon">
								<img :src="item.iconUrl" :alt="item.label" />
							</div>
							<div class="stat-info">
								<p class="stat-label">{{ item.label }}</p>
								<p class="stat-value">{{ item.value }}</p>
								<!-- <p class="stat-ratio">{{ item.ratioNum }}%</p> -->
							</div>
						</div>
						<el-progress class="stat-progress" :percentage="item.ratio" :color="item.progressColor" :stroke-width="6" />
					</div>
				</div>
			</div>

			<!-- 图表区 -->
			<div class="chart-section">
				<div class="chart-card">
					<div class="card-header">月度任务趋势</div>
					<div class="chart-body">
						<v-chart :option="trendChartOption" style="height: 260px" :autoresize="true" />
					</div>
				</div>
				<div class="chart-card">
					<div class="card-header">任务类别分布</div>
					<div class="chart-body">
						<v-chart :option="pieChartOption" style="height: 260px" :autoresize="true" />
					</div>
				</div>
			</div>

			<!-- 近期任务流：每行3个卡片 -->
			<div class="task-section">
				<div class="task-header">
					<div>
						<PageTitle title="近期任务流" />
						<!-- <p class="section-subtitle">RECENT TASK STREAM</p> -->
					</div>
					<!-- <el-button icon="Filter" circle /> -->
				</div>
				<div class="task-cards">
					<PriorityCard v-for="(task, index) in filteredTasks" :key="index" :priority="task.priority">
						<div class="task-top">
							<span v-if="activeTab === 'group'" class="priority-indicator" :class="getPriorityClass(task.priority)">
								{{ task.priority }}
							</span>
							<div v-else class="task-tag" :style="{ background: task.tagBg, color: task.tagColor }">
								{{ task.category }}
							</div>
						</div>
						<span class="status-tag" :class="getStatusClass(task.status)">{{ task.status }}</span>
						<h3 class="task-title">
							{{ task.title }}
						</h3>
						<div class="task-meta">
							<div class="meta-item">
								<el-icon><Calendar /></el-icon>
								<span>{{ task.date }}</span>
							</div>
							<div class="meta-item">
								<el-icon><User /></el-icon>
								<span>{{ task.owner }}</span>
							</div>
						</div>
						<div class="task-warnings">
							<div class="warning-item" v-if="task.warn1">
								<el-icon><Warning /></el-icon>
								<span>{{ task.warn1 }}</span>
							</div>
							<div class="warning-item" v-if="task.warn2">
								<el-icon><Warning /></el-icon>
								<span>{{ task.warn2 }}</span>
							</div>
						</div>
					</PriorityCard>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import VChart from "vue-echarts"
import { graphic } from "echarts/core"
import { use } from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import { BarChart, LineChart, PieChart } from "echarts/charts"
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from "echarts/components"
import { Warning, Calendar, User } from "@element-plus/icons-vue"
import HeaderTabs from "@/components/HeaderTabs/index.vue"
import PageTitle from "@/components/PageTitle/index.vue"
import PriorityCard from "@/components/PriorityCard/index.vue"
import { getDeptTaskStatistics } from "@/api/management"
import { getImportantTaskStatistics } from "@/api/system/importantTask"
import backImg1 from "@/assets/operations/dashboard/backImg-1.png"
import backImg2 from "@/assets/operations/dashboard/backImg-2.png"
import backImg3 from "@/assets/operations/dashboard/backImg-3.png"
import backImg4 from "@/assets/operations/dashboard/backImg-4.png"
import backImg5 from "@/assets/operations/dashboard/backImg-5.png"
import icon1 from "@/assets/operations/dashboard/icon-1.png"
import icon2 from "@/assets/operations/dashboard/icon-2.png"
import icon3 from "@/assets/operations/dashboard/icon-3.png"
import icon4 from "@/assets/operations/dashboard/icon-4.png"
import icon5 from "@/assets/operations/dashboard/icon-5.png"

use([CanvasRenderer, BarChart, LineChart, PieChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

const router = useRouter()
const activeTab = ref("dept")
const loading = ref(false)

interface MonthlyTrendItem {
	month: string
	totalCount: number
	completedCount: number
}

interface CategoryDistributionItem {
	categoryName: string
	count: number
}

interface RecentTaskItem {
	taskPriorityName?: string
	taskCategoryName?: string
	taskStatusName?: string
	taskTitle?: string
	planEndTime?: string
	assigneeName?: string
	statusTip?: string
}

const monthlyTrend = ref<MonthlyTrendItem[]>([])
const categoryDistribution = ref<CategoryDistributionItem[]>([])
const apiRecentTasks = ref<RecentTaskItem[]>([])

type StatRate = string | number | null | undefined

interface StatItem {
	label: string
	value: number
	type: "primary" | "info" | "warning" | "success" | "danger"
	rate?: StatRate
}

const statCardThemes = [
	{ backgroundUrl: backImg1, iconUrl: icon1, progressColor: "linear-gradient(90deg, #44D57F 0%, #79F9AD 100%)" },
	{ backgroundUrl: backImg2, iconUrl: icon2, progressColor: "linear-gradient(90deg, #1BB7F0 0%, #6DD8FF 100%)" },
	{ backgroundUrl: backImg3, iconUrl: icon3, progressColor: "linear-gradient(90deg, #5E72F0 0%, #AEB9FF 100%)" },
	{ backgroundUrl: backImg4, iconUrl: icon4, progressColor: "linear-gradient(90deg, #0DC9CD 0%, #4FE7E6 100%)" },
	{ backgroundUrl: backImg5, iconUrl: icon5, progressColor: "linear-gradient(90deg, #FA4040 0%, #FF9696 100%)" }
]

// 定义顶部选项卡的胶囊配置
const statusTabs = computed(() => [
	{ label: "部门任务", name: "dept" },
	{ label: "集团重点", name: "group" }
])

// 部门任务统计初始数据，采用类型绑定而非硬编码色值
const deptStat = ref<StatItem[]>([
	{ label: "总任务数", value: 0, type: "primary" },
	{ label: "未开始", value: 0, type: "info" },
	{ label: "进行中", value: 0, type: "warning" },
	{ label: "已完成", value: 0, type: "success" },
	{ label: "延期", value: 0, type: "danger" }
])

// 集团重点统计初始数据
const groupStat = ref<StatItem[]>([
	{ label: "总任务数", value: 0, type: "primary" },
	{ label: "未开始", value: 0, type: "info" },
	{ label: "进行中", value: 0, type: "warning" },
	{ label: "已完成", value: 0, type: "success" },
	{ label: "延期", value: 0, type: "danger" }
])

const normalizePercent = (value: StatRate) => {
	const parsedValue = typeof value === "string" ? Number(value.replace("%", "").trim()) : Number(value)
	if (!Number.isFinite(parsedValue)) {
		return 0
	}
	return Math.min(Math.max(parsedValue, 0), 100)
}

// 动态计算当前的统计状态数据，并按展示顺序注入卡片资源与进度条主题
const currentStat = computed(() => {
	const stat = activeTab.value === "dept" ? deptStat.value : groupStat.value
	const total = stat[0].value
	return stat.map((item, index) => {
		const calculatedRate = total > 0 ? Math.round((item.value / total) * 100) : 0
		// 后端 rate 已带 %，这里统一转成 el-progress 需要的数值，避免 0/0 产生 NaN。
		const ratio = index === 0 ? (total > 0 ? 100 : 0) : normalizePercent(item.rate ?? calculatedRate)
		return {
			...item,
			...statCardThemes[index],
			ratio,
			ratioNum: ratio
		}
	})
})

// 格式化 API 近期任务到卡片所需数据结构
const mapRecentTasks = (apiTasks: RecentTaskItem[]) => {
	return apiTasks.map((task) => {
		// 采用接口中新增的 taskPriorityName 字段进行优先级背景渲染，并对其提供默认兜底
		const priority = task.taskPriorityName || "低"

		// tag 配色自适应映射
		let tagBg = "var(--el-color-primary-light-9)"
		let tagColor = "var(--el-color-primary)"
		if (task.taskCategoryName === "其他") {
			tagBg = "var(--el-color-success-light-9)"
			tagColor = "var(--el-color-success)"
		}

		return {
			category: task.taskCategoryName || "其他",
			tagBg,
			tagColor,
			status: task.taskStatusName || "待开始",
			title: task.taskTitle || "-",
			date: task.planEndTime?.substring(0, 10) || "-",
			owner: task.assigneeName || "未知",
			isActive: task.taskStatusName === "进行中",
			warn1: task.statusTip || "",
			warn2: "",
			priority
		}
	})
}

const filteredTasks = computed(() => {
	return mapRecentTasks(apiRecentTasks.value)
})

// 提取 CSS 变量以保证图表的主题联动
const getCssVar = (name: string) => {
	return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const normalizeChartValue = (value: unknown) => {
	const parsedValue = Number(value)
	return Number.isFinite(parsedValue) ? parsedValue : 0
}

const taskCategoryColors = ["#2BC0FC", "#BADE38", "#6759FF", "#44D57F", "#FA8319", "#FA4040"]
const taskCategoryColorMap: Record<string, string> = {
	经营管理类: "#2BC0FC",
	项目管理类: "#BADE38",
	安全管理类: "#6759FF",
	采购管理类: "#44D57F",
	采购专项类: "#44D57F",
	综合管理类: "#FA8319",
	其他: "#FA4040"
}

const getTaskCategoryColor = (categoryName: string, index: number) => {
	return taskCategoryColorMap[categoryName] || taskCategoryColors[index % taskCategoryColors.length]
}

// 动态计算折线/柱状趋势图配置
const trendChartOption = computed(() => {
	const textColor = "#8a9ab6"
	const axisTextColor = "#9aa8bd"
	const borderColor = "#edf2f8"

	const chartData = monthlyTrend.value

	const xAxisData = chartData.map((item) => item.month)
	const barData = chartData.map((item) => normalizeChartValue(item.totalCount))
	const lineData = chartData.map((item) => normalizeChartValue(item.completedCount))
	const maxDataValue = Math.max(...barData, ...lineData, 100)
	const yAxisMax = Math.ceil(maxDataValue / 20) * 20

	return {
		color: ["#25c76f", "#ffa115"],
		tooltip: {
			trigger: "axis",
			backgroundColor: "rgba(255, 255, 255, 0.92)",
			borderWidth: 0,
			borderRadius: 8,
			padding: [10, 14],
			textStyle: { color: "#42526e", fontSize: 13 },
			extraCssText: "box-shadow: 0 10px 28px rgba(20, 40, 81, 0.12);",
			axisPointer: {
				type: "line",
				lineStyle: { color: "#ffa115", width: 1 }
			}
		},
		legend: {
			data: ["总任务数", "已完成数"],
			top: 0,
			right: 8,
			itemWidth: 12,
			itemHeight: 6,
			icon: "roundRect",
			textStyle: { color: textColor, fontSize: 13 }
		},
		grid: { left: 6, right: 8, top: 48, bottom: 14, containLabel: true },
		xAxis: {
			type: "category",
			data: xAxisData,
			boundaryGap: true,
			axisTick: { show: false },
			axisLabel: { color: axisTextColor, fontSize: 13 },
			axisLine: { show: false },
			splitLine: { show: true, lineStyle: { color: borderColor, width: 1 } }
		},
		yAxis: {
			type: "value",
			min: 0,
			max: yAxisMax,
			splitNumber: 5,
			axisLabel: { color: axisTextColor, fontSize: 12 },
			axisLine: { show: false },
			axisTick: { show: false },
			splitLine: { lineStyle: { color: borderColor, width: 1 } }
		},
		series: [
			{
				name: "总任务数",
				type: "bar",
				data: barData,
				barWidth: 22,
				itemStyle: {
					borderRadius: [4, 4, 0, 0],
					color: new graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: "#1de194" },
						{ offset: 1, color: "#00b46e" }
					])
				},
				emphasis: {
					itemStyle: {
						color: new graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: "#4aebb0" },
							{ offset: 1, color: "#10c77e" }
						])
					}
				}
			},
			{
				name: "已完成数",
				type: "line",
				data: lineData,
				smooth: true,
				symbol: "circle",
				symbolSize: 6,
				showSymbol: false,
				itemStyle: { color: "#ffa115", borderColor: "#ffffff", borderWidth: 2 },
				lineStyle: {
					width: 3,
					color: new graphic.LinearGradient(0, 0, 1, 0, [
						{ offset: 0, color: "#ff6d6d" },
						{ offset: 1, color: "#ffa115" }
					])
				},
				areaStyle: {
					opacity: 0.18,
					color: new graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: "#ffa115" },
						{ offset: 1, color: "rgba(255, 161, 21, 0)" }
					])
				}
			}
		]
	}
})

// 动态计算饼图类别分布配置
const pieChartOption = computed(() => {
	const bgColor = getCssVar("--el-bg-color") || "#ffffff"
	const chartData = categoryDistribution.value

	const rawPieData = chartData.map((item, index) => {
		const itemColor = getTaskCategoryColor(item.categoryName, index)
		return {
			value: normalizeChartValue(item.count),
			name: item.categoryName,
			itemStyle: {
				color: itemColor
			},
			labelLine: {
				lineStyle: {
					color: itemColor
				}
			}
		}
	})

	const totalCount = rawPieData.reduce((total, item) => total + item.value, 0)

	return {
		title: {
			text: `${totalCount}`,
			subtext: "任务总数",
			left: "49%",
			top: "38%",
			textAlign: "center",
			itemGap: 4,
			textStyle: {
				color: "#44d57f",
				fontSize: 26,
				fontWeight: 700,
				lineHeight: 30
			},
			subtextStyle: {
				color: "#44d57f",
				fontSize: 16,
				fontWeight: 500,
				lineHeight: 22
			}
		},
		color: rawPieData.map((item) => item.itemStyle.color),
		tooltip: { show: false },
		series: [
			{
				type: "pie",
				radius: ["42%", "66%"],
				center: ["50%", "52%"],
				avoidLabelOverlap: true,
				minShowLabelAngle: 3,
				itemStyle: { borderRadius: 4, borderColor: bgColor, borderWidth: 4 },
				label: {
					show: true,
					position: "outside",
					alignTo: "labelLine",
					edgeDistance: 8,
					distanceToLabelLine: 8,
					formatter: "{name|{b}}\n{value|{c}}",
					rich: {
						name: {
							color: "#6b7a99",
							fontSize: 14,
							lineHeight: 22
						},
						value: {
							color: "#142851",
							fontSize: 20,
							fontWeight: 700,
							lineHeight: 28
						}
					}
				},
				emphasis: {
					scale: false,
					label: { show: true }
				},
				labelLine: {
					show: true,
					length: 18,
					length2: 36,
					lineStyle: {
						width: 1
					}
				},
				data: rawPieData
			}
		]
	}
})

// 获取优先级样式类
const getPriorityClass = (priority: string) => {
	switch (priority) {
		case "高":
			return "priority-high"
		case "中":
			return "priority-medium"
		case "低":
			return "priority-low"
		default:
			return ""
	}
}

// 获取状态对应 CSS 类名
const getStatusClass = (status: string) => {
	switch (status) {
		case "未开始":
		case "待开始":
			return "status-pending"
		case "进行中":
			return "status-ongoing"
		case "已完成":
			return "status-completed"
		case "已延期":
		case "已逾期":
		case "延期":
			return "status-delayed"
		default:
			return ""
	}
}

// 获取部门任务/集团重点接口数据并装填
const fetchDashboardData = async () => {
	loading.value = true
	// 清空上一次请求的趋势图、占比图和任务流，防止展示上一 Tab 的遗留数据
	monthlyTrend.value = []
	categoryDistribution.value = []
	apiRecentTasks.value = []

	try {
		const res = activeTab.value === "dept" ? await getDeptTaskStatistics() : await getImportantTaskStatistics()

		if (res.data) {
			const data = res.data
			// 1. 更新统计面板
			const statList: StatItem[] = [
				{ label: "总任务数", value: data.totalCount || 0, type: "primary" },
				{ label: "未开始", value: data.notStartedCount || 0, type: "info", rate: data.notStartedRate },
				{ label: "进行中", value: data.inProgressCount || 0, type: "warning", rate: data.inProgressRate },
				{ label: "已完成", value: data.completedCount || 0, type: "success", rate: data.completedRate },
				{ label: "延期", value: data.exceptionDelayedCount || 0, type: "danger", rate: data.exceptionDelayedRate }
			]

			if (activeTab.value === "dept") {
				deptStat.value = statList
			} else {
				groupStat.value = statList
			}

			// 2. 更新趋势分析
			if (data.monthlyTrend && data.monthlyTrend.length > 0) {
				monthlyTrend.value = data.monthlyTrend
			}
			// 3. 更新任务类别分布
			if (data.categoryDistribution && data.categoryDistribution.length > 0) {
				categoryDistribution.value = data.categoryDistribution
			}
			// 4. 更新近期一周任务列表
			if (data.recentTasks && data.recentTasks.length > 0) {
				apiRecentTasks.value = data.recentTasks
			}
		}
	} catch (err) {
		console.error(`获取${activeTab.value === "dept" ? "部门任务" : "集团重点"}统计数据失败：`, err)
	} finally {
		loading.value = false
	}
}

// 点击任务流卡片跳转至对应列表页
const handleTaskClick = (task: any) => {
	if (activeTab.value === "dept") {
		router.push("/management/dept_tasks")
	} else {
		router.push("/management/group_focus")
	}
}

const handleTabChange = () => {
	// 切换 Tab 时触发对应接口拉取刷新
	fetchDashboardData()
}

onMounted(() => {
	fetchDashboardData()
})
</script>

<style scoped lang="scss">
.dashboard-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	box-sizing: border-box;
	overflow: hidden;

	&.view-list {
		height: 100%;
		overflow: hidden;
	}
}

// 顶部选项卡包容器留白
.tabs-header-row {
	margin-bottom: 16px;
	flex-shrink: 0;
	display: flex;
	justify-content: flex-start;
}

// 主体只负责滚动和模块间距，白底视觉由各模块独立承担。
.dashboard-main-card {
	background: transparent;
	border-radius: 0;
	padding: 0;
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 20px;
	box-sizing: border-box;
	overflow-y: auto; // 允许在大卡片内部垂直滚动以适配多端屏幕
}

.stat-section {
	flex-shrink: 0;

	.stat-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 20px;

		@media (max-width: 1400px) {
			gap: 12px;
		}
	}

	.stat-card {
		--stat-footer-height: 34px;
		--stat-horizontal-padding: 24px;
		--stat-bg-gap: 2px;

		position: relative;
		min-height: 154px;
		border-radius: 16px;
		padding: 24px var(--stat-horizontal-padding) var(--stat-footer-height);
		background-color: var(--el-bg-color, #ffffff);
		border: none;
		box-sizing: border-box;
		overflow: hidden;
		transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 8px 16px rgba(23, 43, 77, 0.08);
		}

		.stat-card-bg {
			position: absolute;
			// 设计稿要求背景图与卡片上、左、右保持 2px 留白。
			top: var(--stat-bg-gap);
			left: var(--stat-bg-gap);
			z-index: 0;
			width: calc(100% - var(--stat-bg-gap) - var(--stat-bg-gap));
			height: calc(100% - var(--stat-footer-height) - var(--stat-bg-gap));
			object-fit: fill;
			pointer-events: none;
			user-select: none;
		}

		.stat-content {
			position: relative;
			z-index: 1;
			display: flex;
			height: 100%;
		}

		.stat-icon {
			position: absolute;
			top: 22px;
			right: 24px;
			width: 48px;
			height: 48px;
			border-radius: 8px;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;

			img {
				display: block;
				width: 100%;
				height: 100%;
				object-fit: contain;
			}
		}

		.stat-info {
			display: flex;
			flex-direction: column;
			flex: 1;
			min-width: 0;
			min-height: 96px;

			.stat-label {
				font-size: 16px;
				color: #6b7a99;
				margin: 0;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.stat-value {
				font-size: 28px;
				font-weight: 700;
				color: #142851;
				margin: 16px 0 0;
				line-height: 1.2;
			}

			.stat-ratio {
				font-size: 12px;
				color: var(--el-text-color-placeholder, #909399);
				margin: 4px 0 0;
				text-align: right;
			}
		}

		.stat-progress {
			position: absolute;
			left: var(--stat-horizontal-padding);
			right: var(--stat-horizontal-padding);
			bottom: calc((var(--stat-footer-height) - 6px) / 2);
			z-index: 1;
			height: 6px;
			margin: 0;

			:deep(.el-progress-bar) {
				padding-right: 42px;
				margin-right: -42px;
			}

			:deep(.el-progress-bar__outer) {
				height: 6px !important;
				background-color: #eef4fb;
				border-radius: 10px;
			}

			:deep(.el-progress-bar__inner) {
				border-radius: 10px;
			}

			:deep(.el-progress__text) {
				min-width: 32px;
				margin-left: 12px;
				color: #6b7a99;
				font-size: 13px !important;
				line-height: 1;
			}
		}
	}
}

.chart-section {
	display: grid;
	grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
	gap: 20px;
	flex-shrink: 0;

	@media (max-width: 992px) {
		grid-template-columns: 1fr;
	}

	.chart-card {
		min-width: 0;
		border-radius: 20px;
		border: none;
		background-color: var(--el-bg-color, #ffffff);
		overflow: hidden;
		transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 8px 16px rgba(23, 43, 77, 0.08);
		}

		.card-header {
			padding: 24px 30px 12px;
			// border-bottom: 1px solid var(--el-border-color-lighter, #e5eaf1);
			font-size: 16px;
			font-weight: 600;
			color: var(--el-text-color-primary, #303133);
		}

		.chart-body {
			padding: 0 30px 24px;
		}
	}
}

.task-section {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-height: 0;
	padding: 24px 30px 30px;
	border-radius: 20px;
	background-color: var(--el-bg-color, #ffffff);
	box-sizing: border-box;

	.task-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;

		.section-subtitle {
			font-size: 12px;
			color: var(--el-text-color-placeholder, #909399);
			margin: 4px 0 0;
			letter-spacing: 0.5px;
		}
	}

	.task-cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;

		@media (max-width: 1200px) {
			grid-template-columns: repeat(2, 1fr);
		}
		@media (max-width: 768px) {
			grid-template-columns: 1fr;
		}
	}

	:deep(.priority-card) {
		.task-top {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 12px;

			.task-tag {
				padding: 3px 10px;
				border-radius: 20px;
				font-size: 12px;
				font-weight: 500;
			}

			.priority-indicator {
				font-size: 14px;
				font-weight: 500;
				width: 24px;
				height: 24px;
				border-radius: 4px;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;

				&.priority-high {
					color: var(--el-color-white, #ffffff);
					background: linear-gradient(180deg, #9450f8 0%, #bfa2fa 100%);
				}
				&.priority-medium {
					background: linear-gradient(180deg, #2d8ffc 0%, #477deb 100%);
					color: var(--el-color-white, #ffffff);
				}
				&.priority-low {
					background: linear-gradient(180deg, #34beff 0%, #68f2fa 100%);
					color: var(--el-color-white, #ffffff);
				}
			}
		}

		.status-tag {
			position: absolute;
			top: 0;
			right: 0;
			z-index: 2;
			width: 100px;
			height: 36.97px;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			padding: 0 0 6px 12px;
			box-sizing: border-box;
			background: url("@/assets/operations/cardTop.png") center / 100% 100% no-repeat;
			font-size: 14px;
			line-height: 1;
			white-space: nowrap;
			pointer-events: none;

			&.status-pending {
				color: #42526e; // 未开始
			}
			&.status-ongoing {
				color: #1678ff; // 进行中
			}
			&.status-completed {
				color: #00b46e; // 已完成
			}
			&.status-delayed {
				color: var(--el-color-danger); // 延期/已延期
			}
		}

		.task-title {
			font-size: 16px;
			font-weight: 600;
			color: var(--el-text-color-primary, #303133);
			margin: 0 0 16px;
			line-height: 1.4;
			transition: color 0.3s;
		}

		&:hover .task-title {
			color: var(--el-color-primary);
		}

		.task-meta {
			display: flex;
			justify-content: space-between;
			margin-bottom: 16px;
			border-top: 1px dashed var(--el-border-color-lighter, #e5eaf1);
			padding-top: 12px;

			.meta-item {
				display: flex;
				align-items: center;
				gap: 6px;
				font-size: 13px;
				color: var(--el-text-color-regular, #606266);

				.el-icon {
					color: var(--el-text-color-placeholder, #909399);
				}
			}
		}

		.task-warnings {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 6px;

			.warning-item {
				display: flex;
				align-items: center;
				gap: 6px;
				width: fit-content;
				max-width: 100%;
				font-size: 12px;
				color: var(--el-color-danger);
				background-color: var(--el-color-danger-light-9);
				padding: 4px 10px;
				border-radius: 6px;
				border: 1px solid var(--el-color-danger-light-8);
			}
		}
	}
}
</style>
