<template>
	<div class="create-page">
		<!-- 固定头部：返回 + 标题 + 状态，不随下方卡片滚动 -->
		<div class="create-header">
			<button class="back-square" type="button" @click="emit('back')">
				<img src="@/assets/images/back.png" class="back-icon" />
			</button>
			<h1>{{ isEdit ? "编辑月度经营分析" : "新增月度经营分析" }}</h1>
			<el-tag :type="formData.status === '1' ? 'success' : 'warning'" effect="light">
				{{ statusMap[formData.status || "0"] || "草稿" }}
			</el-tag>
		</div>

		<!-- 下方卡片复用 FormPageLayout（隐藏自带头部），内部滚动 + 底部固定按钮 -->
		<FormPageLayout class="analysis-create-layout" hide-header>
			<el-form
				ref="formRef"
				:model="formData"
				:rules="formRules"
				label-position="top"
				label-width="96px"
				class="report-form"
			>
				<!-- 左右分栏布局 -->
				<div class="create-main-layout">
					<!-- 左侧：基础信息 + 经营分析详情 -->
					<div class="create-left-section">
						<div class="section-title">基础信息</div>
						<div class="base-info-grid">
							<el-form-item label="填报公司" prop="companyId">
								<el-select v-model="formData.companyId" placeholder="请选择填报公司" class="full-control" filterable>
									<el-option
										v-for="dict in companyOptions"
										:key="dict.dictValue"
										:label="dict.dictLabel"
										:value="dict.dictValue"
									/>
								</el-select>
							</el-form-item>
							<el-form-item label="报告月份" prop="monthValue">
								<el-date-picker
									v-model="formData.monthValue"
									type="month"
									format="YYYY年MM月"
									value-format="YYYY年M月"
									placeholder="请选择报告月份"
									style="width: 100%"
								/>
							</el-form-item>
						</div>

						<!-- 左侧内部的水平分割线，不向外穿透 (offset="0") -->
						<CommonDivider :offset="0" :vertical-margin="24" />

						<div class="section-title">经营分析详情</div>
						<div class="textarea-list">
							<el-form-item label="经营工作进展">
								<el-input
									v-model="formData.businessProgress"
									type="textarea"
									:rows="4"
									placeholder="请输入经营工作进展"
								/>
							</el-form-item>
							<el-form-item label="重大专项进展">
								<el-input
									v-model="formData.majorProjectProgress"
									type="textarea"
									:rows="4"
									placeholder="请输入重大专项进展"
								/>
							</el-form-item>
							<el-form-item label="存在的问题及困难">
								<el-input
									v-model="formData.issuesAndMeasures"
									type="textarea"
									:rows="4"
									placeholder="请输入存在的问题及困难"
								/>
							</el-form-item>
							<el-form-item label="下一步工作计划">
								<el-input v-model="formData.nextPlan" type="textarea" :rows="4" placeholder="请输入下一步工作计划" />
							</el-form-item>
							<el-form-item label="需要集团协调支持的事项">
								<el-input
									v-model="formData.coordinationNeeds"
									type="textarea"
									:rows="4"
									placeholder="请输入需要集团协调支持的事项"
								/>
							</el-form-item>
						</div>
					</div>

					<!-- 中间垂直分割线 -->
					<CommonDivider direction="vertical" :vertical-offset="24" :horizontal-margin="0" />

					<!-- 右侧：经营指标填报 -->
					<div class="create-right-section">
						<div class="section-title">经营指标填报</div>
						<div class="metric-list">
							<div v-for="metric in metricConfigs" :key="metric.name" class="metric-card">
								<div class="metric-card-header">
									<span class="metric-name"
										>{{ metric.name }} <span class="unit-text">({{ metric.unit }})</span></span
									>
									<RateCell :rate="getRateValue(formData[metric.actualKey], formData[metric.targetKey])" />
								</div>
								<div class="metric-input-grid">
									<el-form-item label="目标值">
										<el-input-number
											v-model="formData[metric.targetKey]"
											:min="0"
											:precision="metric.precision"
											controls-position="right"
										/>
									</el-form-item>
									<el-form-item label="实际值">
										<el-input-number
											v-model="formData[metric.actualKey]"
											:min="0"
											:precision="metric.precision"
											controls-position="right"
										/>
									</el-form-item>
								</div>
							</div>
						</div>
					</div>
				</div>
			</el-form>

			<!-- 操作按钮移至底部固定区 -->
			<template #actions>
				<el-button class="draft-btn" :loading="loading" @click="handleSaveDraft">保存草稿</el-button>
				<el-button type="primary" class="submit-btn" :loading="loading" @click="handleSubmit">提交报告</el-button>
			</template>
		</FormPageLayout>
	</div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, reactive, ref, watch } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import { ElProgress } from "element-plus"
import CommonDivider from "@/components/CommonDivider/index.vue"
import FormPageLayout from "@/components/FormPageLayout/index.vue"
import { useUserStore } from "@/store/modules/user"
import { useRate } from "@/hooks/useRate"
import type { MonthlyReportForm, MonthlyReportVO } from "@/api/system/monthlyReport/types"

type NumericFormKey =
	| "totalRevenue"
	| "revenueTarget"
	| "profit"
	| "profitTarget"
	| "contractCount"
	| "contractTarget"
	| "investmentAmount"
	| "investmentTarget"
	| "rdInvestment"
	| "rdTarget"

interface DictOption {
	dictValue: string
	dictLabel: string
	[key: string]: any
}

interface ReportFormState {
	id?: string | number
	monthValue: string
	companyId?: string | number
	reporterId?: string | number
	status: string
	totalRevenue: number
	revenueTarget: number
	profit: number
	profitTarget: number
	contractCount: number
	contractTarget: number
	investmentAmount: number
	investmentTarget: number
	rdInvestment: number
	rdTarget: number
	businessProgress: string
	majorProjectProgress: string
	issuesAndMeasures: string
	nextPlan: string
	coordinationNeeds: string
}

const props = withDefaults(
	defineProps<{
		row?: MonthlyReportVO
		isEdit?: boolean
		companyOptions?: DictOption[]
		loading?: boolean
	}>(),
	{
		row: () => ({}),
		isEdit: false,
		companyOptions: () => [],
		loading: false
	}
)

const emit = defineEmits<{
	(e: "back"): void
	(e: "submit", payload: MonthlyReportForm): void
}>()

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const { getRateValue: _getRateValue, formatRateText, normalizeProgress } = useRate()
const getRateValue = (actual?: number, target?: number) => _getRateValue(undefined, actual, target)

const statusMap: Record<string, string> = {
	"0": "草稿",
	"1": "已提交"
}

const metricConfigs: Array<{
	name: string
	unit: string
	actualKey: NumericFormKey
	targetKey: NumericFormKey
	precision: number
}> = [
	{ name: "营收", unit: "万元", actualKey: "totalRevenue", targetKey: "revenueTarget", precision: 2 },
	{ name: "利润", unit: "万元", actualKey: "profit", targetKey: "profitTarget", precision: 2 },
	{ name: "合同数", unit: "个", actualKey: "contractCount", targetKey: "contractTarget", precision: 0 },
	{ name: "投资额", unit: "万元", actualKey: "investmentAmount", targetKey: "investmentTarget", precision: 2 },
	{ name: "研发投入", unit: "万元", actualKey: "rdInvestment", targetKey: "rdTarget", precision: 2 }
]

const formData = reactive<ReportFormState>(createEmptyForm())

const formRules: FormRules<ReportFormState> = {
	monthValue: [{ required: true, message: "请选择报告月份", trigger: "change" }],
	companyId: [{ required: true, message: "请选择填报公司", trigger: "change" }]
}

const selectedCompanyName = computed(() => {
	const target = props.companyOptions.find((item) => item.dictValue === String(formData.companyId))
	return target?.dictLabel || ""
})

const RateCell = defineComponent({
	name: "RateCell",
	props: {
		rate: {
			type: Number,
			default: 0
		}
	},
	setup(rateProps) {
		const { normalizeProgress, formatRateText } = useRate()
		return () =>
			h("div", { class: "rate-cell" }, [
				h(ElProgress, {
					class: "rate-progress",
					percentage: normalizeProgress(rateProps.rate),
					strokeWidth: 4,
					showText: false,
					style: {
						"--rate-progress-color": getProgressColor(rateProps.rate)
					}
				}),
				h("span", { class: "rate-value" }, `${formatRateText(rateProps.rate)}%`)
			])
	}
})

function getCurrentMonthValue() {
	const now = new Date()
	return formatMonthValue(now.getFullYear(), now.getMonth() + 1)
}

function formatMonthValue(year: number, month: number) {
	return `${year}年${month}月`
}

function parseMonthYear(value?: string | number) {
	if (!value) return { year: undefined, month: undefined }
	if (typeof value === "number") {
		return { year: undefined, month: value }
	}
	let match = String(value).match(/(\d{4})年0?(\d{1,2})月/)
	if (match) {
		return { year: Number(match[1]), month: Number(match[2]) }
	}
	match = String(value).match(/(\d{4})-0?(\d{1,2})/)
	if (match) {
		return { year: Number(match[1]), month: Number(match[2]) }
	}
	return { year: undefined, month: undefined }
}

function createEmptyForm(): ReportFormState {
	return {
		monthValue: getCurrentMonthValue(),
		status: "0",
		totalRevenue: 0,
		revenueTarget: 0,
		profit: 0,
		profitTarget: 0,
		contractCount: 0,
		contractTarget: 0,
		investmentAmount: 0,
		investmentTarget: 0,
		rdInvestment: 0,
		rdTarget: 0,
		businessProgress: "",
		majorProjectProgress: "",
		issuesAndMeasures: "",
		nextPlan: "",
		coordinationNeeds: ""
	}
}

function fillForm(row?: MonthlyReportVO) {
	const source = row || {}
	Object.assign(formData, {
		id: source.id,
		monthValue:
			typeof source.month === "string"
				? source.month
				: source.year && source.month
					? formatMonthValue(source.year, Number(source.month))
					: getCurrentMonthValue(),
		companyId: source.companyId ? String(source.companyId) : undefined,
		reporterId: source.reporterId || userStore.userId,
		status: source.status || "0",
		totalRevenue: Number(source.totalRevenue || 0),
		revenueTarget: Number(source.revenueTarget || 0),
		profit: Number(source.profit || 0),
		profitTarget: Number(source.profitTarget || 0),
		contractCount: Number(source.contractCount || 0),
		contractTarget: Number(source.contractTarget || 0),
		investmentAmount: Number(source.investmentAmount || 0),
		investmentTarget: Number(source.investmentTarget || 0),
		rdInvestment: Number(source.rdInvestment || 0),
		rdTarget: Number(source.rdTarget || 0),
		businessProgress: source.businessProgress || "",
		majorProjectProgress: source.majorProjectProgress || "",
		issuesAndMeasures: source.issuesAndMeasures || "",
		nextPlan: source.nextPlan || "",
		coordinationNeeds: source.coordinationNeeds || ""
	})
}

function getPayload(status: string): MonthlyReportForm {
	const { year } = parseMonthYear(formData.monthValue)
	return {
		id: formData.id,
		year,
		month: formData.monthValue,
		totalRevenue: formData.totalRevenue,
		revenueTarget: formData.revenueTarget,
		profit: formData.profit,
		profitTarget: formData.profitTarget,
		contractCount: formData.contractCount,
		contractTarget: formData.contractTarget,
		investmentAmount: formData.investmentAmount,
		investmentTarget: formData.investmentTarget,
		rdInvestment: formData.rdInvestment,
		rdTarget: formData.rdTarget,
		businessProgress: formData.businessProgress,
		majorProjectProgress: formData.majorProjectProgress,
		issuesAndMeasures: formData.issuesAndMeasures,
		nextPlan: formData.nextPlan,
		coordinationNeeds: formData.coordinationNeeds,
		status,
		companyId: formData.companyId,
		companyName: selectedCompanyName.value,
		reporterId: formData.reporterId || userStore.userId,
		reporterName: userStore.nickname
	}
}

async function submitWithStatus(status: string) {
	if (props.loading) return
	const valid = await formRef.value?.validate().catch(() => false)
	if (!valid) return
	emit("submit", getPayload(status))
}

function handleSaveDraft() {
	submitWithStatus("0")
}

function handleSubmit() {
	submitWithStatus("1")
}

function getProgressColor(rate: number) {
	if (rate >= 80) {
		return "linear-gradient(270deg, #15E795 0%, #00B46E 100%)"
	}
	return "linear-gradient(90deg, #FF7D00 0%, #FFB975 100%)"
}

watch(
	() => props.row,
	(row) => {
		fillForm(row)
	},
	{ immediate: true, deep: true }
)
</script>

<style scoped lang="scss">
/* 整页：固定头部 + 占满剩余空间的卡片 */
.create-page {
	display: flex;
	flex-direction: column;
	height: 100%;
	box-sizing: border-box;
}

/* 固定头部：返回 + 标题 + 状态，不随卡片滚动，宽度占满 */
.create-header {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	gap: 14px;
	padding: 12px 0 20px;

	h1 {
		max-width: 600px;
		margin: 0;
		overflow: hidden;
		color: #0f2748;
		font-size: 22px;
		font-weight: 700;
		line-height: 36px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}

/* 头部左侧返回按钮 */
.back-square {
	display: inline-flex;
	width: 40px;
	height: 40px;
	align-items: center;
	justify-content: center;
	border: 0;
	border-radius: 12px;
	background: #fff;
	cursor: pointer;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.back-icon {
	width: 20px;
	height: 20px;
	object-fit: contain;
}

/* 卡片占满剩余高度，宽度占满 */
.analysis-create-layout {
	flex: 1;
	min-height: 0;

	:deep(.create-card) {
		width: 100%;
		max-width: none;
	}
}

/* 底部固定操作按钮 */
.cancel-btn {
	height: 36px;
	border-radius: 10px;
	font-size: 14px;
}

.draft-btn {
	height: 36px;
	border-radius: 10px;
	font-size: 14px;
	color: #42526e;
	border-color: #eaeef2;
}

.submit-btn {
	height: 36px;
	border-radius: 10px;
	font-size: 14px;
}

.report-form {
	:deep(.el-form-item) {
		align-items: flex-start;
		margin-bottom: 0;
	}

	:deep(.el-form-item__label) {
		height: 34px;
		align-items: center;
		justify-content: flex-start;
		color: #42526e;
		font-size: 14px;
		line-height: 34px;
	}

	:deep(.el-form-item__content) {
		min-width: 0;
	}
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

/* 左右分栏布局（外层内边距由 FormPageLayout 提供） */
.create-main-layout {
	display: flex;
	gap: 0;
	align-items: start;
	padding-bottom: 24px;
}

.create-left-section {
	flex: 1;
	min-width: 0;
	padding-right: 24px;
}

.create-right-section {
	width: 360px;
	flex-shrink: 0;
	padding-left: 24px;
}

/* 基础信息网格 */
.base-info-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20px;
	margin-bottom: 24px;
}

.full-control {
	width: 100%;
}

/* 左侧文本输入列表 */
.textarea-list {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

/* 右侧指标列表 */
.metric-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.metric-card {
	padding: 8px 12px 14px;
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

		.unit-text {
			font-size: 12px;
			font-weight: 400;
			color: var(--el-text-color-secondary);
			margin-left: 4px;
		}
	}

	.rate-cell {
		display: flex;
		align-items: center;
		gap: 8px;

		.rate-progress {
			width: 60px;
		}

		:deep(.rate-progress .el-progress-bar__inner) {
			background: var(--rate-progress-color) !important;
		}

		.rate-value {
			font-size: 12px;
			color: var(--el-text-color-secondary);
			white-space: nowrap;
		}
	}

	.metric-input-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		background: var(--el-fill-color-extra-light);
		padding: 8px 12px;
		border-radius: 6px;

		:deep(.el-input-number) {
			width: 100%;
		}
	}
}

@media (max-width: 1200px) {
	.create-main-layout {
		flex-direction: column;
	}

	.common-divider.vertical {
		display: none;
	}

	.create-left-section {
		padding-right: 0;
		padding-bottom: 24px;
	}

	.create-right-section {
		width: 100%;
		padding-left: 0;
	}
}
</style>
