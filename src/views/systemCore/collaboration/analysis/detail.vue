<template>
	<DetailPageLayout :title="row.companyName || '月度经营分析详情'" @back="emit('back')">
		<template #subline>
			<el-tag :type="row.status === '1' ? 'success' : 'warning'" effect="light">
				{{ statusMap[row.status || "0"] || "草稿" }}
			</el-tag>
			<span>报告月份：{{ getMonthLabel(row) || "-" }}</span>
		</template>

		<div class="detail-content">
			<!-- 左右分栏布局 -->
			<div class="detail-main-layout">
				<!-- 左侧：经营分析详情 -->
				<div class="detail-left-section">
					<div class="section-title">经营分析详情</div>
					<div class="detail-text-list">
						<div v-for="item in detailTextItems" :key="item.label" class="detail-text-item">
							<span class="text-label">{{ item.label }}</span>
							<p class="text-content">{{ item.value || "-" }}</p>
						</div>
					</div>
				</div>

				<!-- 中间分割线 -->
				<CommonDivider direction="vertical" :vertical-offset="24" :horizontal-margin="0" />

				<!-- 右侧：经营指标 -->
				<div class="detail-right-section">
					<div class="section-title">经营指标</div>
					<div class="detail-metric-list">
						<div v-for="metric in detailMetrics" :key="metric.name" class="detail-metric-card">
							<div class="metric-card-header">
								<span class="metric-name">{{ metric.name }}</span>
								<div class="metric-progress-cell">
									<el-progress
										class="rate-progress"
										:percentage="normalizeProgress(metric.rate)"
										:stroke-width="4"
										:show-text="false"
										:style="{ '--rate-progress-color': metric.color }"
									/>
									<span class="rate-value">{{ formatRateText(metric.rate) }}%</span>
								</div>
							</div>
							<div class="metric-values">
								<div class="value-col">
									<div class="val-label">目标值</div>
									<div class="val-num">{{ metric.target }}</div>
								</div>
								<div class="value-col">
									<div class="val-label">实际值</div>
									<div class="val-num">{{ metric.actual }}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 下部跨整宽表格 -->
			<div v-if="row.businessLineData?.length" class="detail-section table-section">
				<div class="section-title">业务线经营数据</div>
				<CommonTable
					:data="row.businessLineData"
					:columns="businessLineColumns"
					row-key="businessLineName"
					:max-height="320"
				/>
			</div>

			<div v-if="row.keyTasks?.length" class="detail-section table-section">
				<div class="section-title">重点任务完成情况</div>
				<CommonTable :data="row.keyTasks" :columns="keyTaskColumns" row-key="taskName" :max-height="320" />
			</div>
		</div>
	</DetailPageLayout>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { ElProgress } from "element-plus"
import DetailPageLayout from "@/components/DetailPageLayout/index.vue"
import CommonTable from "@/components/CommonTable/index.vue"
import CommonDivider from "@/components/CommonDivider/index.vue"
import { useRate } from "@/hooks/useRate"
import type { MonthlyReportVO } from "@/api/system/monthlyReport/types"

type MetricActualKey = "totalRevenue" | "profit" | "contractCount" | "investmentAmount" | "rdInvestment"
type MetricTargetKey = "revenueTarget" | "profitTarget" | "contractTarget" | "investmentTarget" | "rdTarget"

const props = withDefaults(
	defineProps<{
		row?: MonthlyReportVO
	}>(),
	{
		row: () => ({})
	}
)

const { getRateValue, formatRateText, normalizeProgress } = useRate()

const emit = defineEmits<{
	(e: "back"): void
}>()

const statusMap: Record<string, string> = {
	"0": "草稿",
	"1": "已提交"
}

const metricConfigs: Array<{
	name: string
	unit: string
	actualKey: MetricActualKey
	targetKey: MetricTargetKey
	rateKey: keyof MonthlyReportVO
	color: string
}> = [
	{
		name: "营收",
		unit: "万元",
		actualKey: "totalRevenue",
		targetKey: "revenueTarget",
		rateKey: "revenueCompletionRate",
		color: "linear-gradient(270deg, #15E795 0%, #00B46E 100%)"
	},
	{
		name: "利润",
		unit: "万元",
		actualKey: "profit",
		targetKey: "profitTarget",
		rateKey: "profitCompletionRate",
		color: "linear-gradient(90deg, #FF7D00 0%, #FFB975 100%)"
	},
	{
		name: "合同数",
		unit: "个",
		actualKey: "contractCount",
		targetKey: "contractTarget",
		rateKey: "contractCompletionRate",
		color: "linear-gradient(90deg, #1678FF 0%, #74AFFF 100%)"
	},
	{
		name: "投资额",
		unit: "万元",
		actualKey: "investmentAmount",
		targetKey: "investmentTarget",
		rateKey: "investmentCompletionRate",
		color: "linear-gradient(90deg, #6B778C 0%, #A5B5D1 100%)"
	},
	{
		name: "研发投入",
		unit: "万元",
		actualKey: "rdInvestment",
		targetKey: "rdTarget",
		rateKey: "rdCompletionRate",
		color: "linear-gradient(270deg, #978DFF 0%, #5A4DE8 100%)"
	}
]

const businessLineColumns = [
	{ prop: "businessLineName", label: "业务线", minWidth: 180 },
	{ prop: "revenue", label: "营收", minWidth: 120 },
	{ prop: "cost", label: "成本", minWidth: 120 },
	{ prop: "profit", label: "利润", minWidth: 120 },
	{ prop: "profitMargin", label: "利润率", minWidth: 120 }
]

const keyTaskColumns = [
	{ prop: "taskName", label: "任务名称", minWidth: 220, showOverflowTooltip: true },
	{ prop: "plannedProgress", label: "计划进度", minWidth: 120 },
	{ prop: "actualProgress", label: "实际进度", minWidth: 120 },
	{ prop: "status", label: "状态", minWidth: 120 },
	{ prop: "assigneeName", label: "负责人", minWidth: 140 },
	{ prop: "remark", label: "备注", minWidth: 220, showOverflowTooltip: true }
]

const detailMetrics = computed(() =>
	metricConfigs.map((metric) => {
		const actual = Number(props.row[metric.actualKey] || 0)
		const target = Number(props.row[metric.targetKey] || 0)
		return {
			name: metric.name,
			actual: `${actual}${metric.unit}`,
			target: `${target}${metric.unit}`,
			rate: getRateValue(String(props.row[metric.rateKey] || ""), actual, target),
			color: metric.color
		}
	})
)

const detailTextItems = computed(() => [
	{ label: "经营工作进展", value: props.row.businessProgress },
	{ label: "重大专项进展", value: props.row.majorProjectProgress },
	{ label: "存在的问题及措施", value: props.row.issuesAndMeasures },
	{ label: "下一步工作计划", value: props.row.nextPlan },
	{ label: "需要集团协调支持的事项", value: props.row.coordinationNeeds }
])

function getMonthLabel(row: MonthlyReportVO) {
	if (row.monthName) return row.monthName
	if (typeof row.month === "string") return row.month
	if (row.year && row.month) return `${row.year}年${Number(row.month)}月`
	return ""
}
</script>

<style scoped lang="scss">
.detail-content {
	display: flex;
	flex-direction: column;
	gap: 30px;
}

.detail-section {
	display: flex;
	flex-direction: column;
	gap: 18px;
}

.section-title {
	position: relative;
	padding-left: 12px;
	font-size: 16px;
	font-weight: 600;
	margin-bottom: 16px;

	&::before {
		position: absolute;
		top: 3px;
		left: 0;
		width: 4px;
		height: 16px;
		border-radius: 2px;
		background: var(--el-color-primary);
		content: "";
	}
}

/* 左右分栏布局 */
.detail-main-layout {
	display: flex;
	gap: 0;
	align-items: start;
	background: #fff;
	border-radius: 12px;
	padding: 24px;
}

.detail-left-section {
	flex: 1;
	min-width: 0;
	padding-right: 24px;
}

.detail-right-section {
	width: 360px;
	flex-shrink: 0;
	padding-left: 24px;
}

/* 左侧文本列表 */
.detail-text-list {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.detail-text-item {
	padding: 8px;
	min-height: 104px;
	// background: var(--el-fill-color-extra-light);
	border: 1px solid var(--el-border-color-lighter);
	border-radius: 8px;

	.text-label {
		display: block;
		margin-bottom: 10px;
		font-weight: 600;
		font-size: 14px;
		color: var(--el-text-color-primary);
	}

	.text-content {
		margin: 0;
		color: var(--el-text-color-regular);
		font-size: 14px;
		line-height: 1.8;
		white-space: pre-wrap;
	}
}

/* 右侧指标列表 */
.detail-metric-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.detail-metric-card {
	padding: 8px;
	border: 1px solid var(--el-border-color-lighter);
	border-radius: 8px;
	background: #fff;
	display: flex;
	flex-direction: column;
	gap: 8px;

	.metric-card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.metric-name {
		font-weight: 600;
		font-size: 14px;
		color: var(--el-text-color-primary);
	}

	.metric-progress-cell {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		justify-content: flex-end;
		min-width: 0;

		.rate-progress {
			flex: 1;
			max-width: 72px;
			min-width: 60px;
		}

		:deep(.rate-progress .el-progress-bar__inner) {
			background: var(--rate-progress-color) !important;
		}

		.rate-value {
			font-size: 12px;
			color: var(--el-text-color-regular);
			white-space: nowrap;
		}
	}

	.metric-values {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		background: var(--el-fill-color-extra-light);
		padding: 8px 12px;
		border-radius: 6px;
	}

	.value-col {
		display: flex;
		flex-direction: column;
		gap: 4px;

		.val-label {
			font-size: 12px;
			color: var(--el-text-color-secondary);
		}

		.val-num {
			font-size: 14px;
			font-weight: 600;
			color: var(--el-text-color-primary);
		}
	}
}

.table-section {
	background: #fff;
	border-radius: 12px;
	padding: 24px;
	border: 1px solid var(--el-border-color-lighter);
}

@media (max-width: 1200px) {
	.detail-main-layout {
		flex-direction: column;
	}

	.common-divider.vertical {
		display: none;
	}

	.detail-left-section {
		padding-right: 0;
		padding-bottom: 24px;
	}

	.detail-right-section {
		width: 100%;
		padding-left: 0;
	}
}
</style>
