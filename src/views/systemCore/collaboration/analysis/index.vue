<template>
	<div class="analysis-container" :class="`view-${currentView}`">
		<template v-if="currentView === 'list'">
			<div class="list-page">
				<PageTitle title="月度经营分析" />

				<SearchHeader
					:key="searchHeaderKey"
					:form-items="searchFields"
					@form-data-change="handleSearch"
					@form-data-reset="resetQuery"
				/>

				<CommonDivider :offset="30" />

				<div class="action-row">
					<div class="left-actions">
						<el-button
							type="primary"
							class="create-button"
							v-hasPermi="['base:monthlyReport:add']"
							@click="handleCreate"
						>
							<el-icon><Plus /></el-icon>
							新建
						</el-button>
						<el-button class="export-button" v-hasPermi="['base:monthlyReport:export']" @click="handleExport">
							导出
						</el-button>
					</div>
					<div class="right-summary">
						<span
							>报告总数 <span class="highlight-num">{{ totalReports }}</span></span
						>
						<span
							>已提交 <span class="highlight-num success">{{ submittedCount }}</span></span
						>
						<span
							>草稿 <span class="highlight-num warning">{{ draftCount }}</span></span
						>
					</div>
				</div>

				<CommonTable :data="tableData" :columns="tableColumns" :loading="loading" row-key="id">
					<template #monthSlot="{ row }">
						{{ getMonthLabel(row) }}
					</template>

					<template #revenueSlot="{ row }">
						<RateCell :rate="getRateValue(row.revenueCompletionRate, row.totalRevenue, row.revenueTarget)" />
					</template>

					<template #profitSlot="{ row }">
						<RateCell :rate="getRateValue(row.profitCompletionRate, row.profit, row.profitTarget)" />
					</template>

					<template #contractSlot="{ row }">
						<RateCell :rate="getRateValue(row.contractCompletionRate, row.contractCount, row.contractTarget)" />
					</template>

					<template #statusSlot="{ row }">
						<el-tag :type="row.status === '1' ? 'success' : 'warning'" effect="light">
							{{ statusMap[row.status] || "草稿" }}
						</el-tag>
					</template>

					<template #actionsSlot="{ row }">
						<button class="text-action view" v-hasPermi="['base:monthlyReport:query']" @click="handleView(row)">
							查看
						</button>
						<button class="text-action view" v-hasPermi="['base:monthlyReport:edit']" @click="handleEdit(row)">
							编辑
						</button>
						<!-- <button class="text-action delete" v-hasPermi="['base:monthlyReport:remove']" @click="handleDelete(row)">删除</button> -->
					</template>
				</CommonTable>

				<div class="pager-row">
					<Pagination
						v-model:current-page="currentPage"
						v-model:page-size="pageSize"
						:total="total"
						paginationType="success"
					/>
				</div>
			</div>
		</template>

		<CreateReport
			v-else-if="currentView === 'create'"
			:is-edit="isEditMode"
			:row="currentRow"
			:company-options="companyOptions"
			:loading="submitLoading"
			@back="goBackToList"
			@submit="submitReport"
		/>

		<div v-else class="detail-view">
			<DetailReport :row="currentRow" @back="goBackToList" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, reactive, ref } from "vue"
import { ElProgress } from "element-plus"
import modal from "@/plugins/modal"
import { Download, Plus } from "@element-plus/icons-vue"
import PageTitle from "@/components/PageTitle/index.vue"
import SearchHeader from "@/components/SearchHeader/index.vue"
import CommonDivider from "@/components/CommonDivider/index.vue"
import CommonTable from "@/components/CommonTable/index.vue"
import Pagination from "@/components/Pagination/index.vue"
import { usePagination } from "@/hooks/usePagination"
import { useLoading } from "@/hooks/useLoading"
import { useRate } from "@/hooks/useRate"
import {
	addMonthlyReport,
	delMonthlyReport,
	exportMonthlyReportExcel,
	getMonthlyReport,
	listMonthlyReport,
	updateMonthlyReport
} from "@/api/system/monthlyReport"
import type { MonthlyReportForm, MonthlyReportQuery, MonthlyReportVO } from "@/api/system/monthlyReport/types"
import CreateReport from "./create.vue"
import DetailReport from "./detail.vue"
import { getTaskCompanyDictOptions } from "@/utils/taskCompany"

type ViewMode = "list" | "create" | "detail"

interface DictOption {
	dictValue: string
	dictLabel: string
	[key: string]: any
}

const currentView = ref<ViewMode>("list")
const { getRateValue, formatRateText, normalizeProgress } = useRate()
const isEditMode = ref(false)
const loading = ref(false)
const searchHeaderKey = ref(0)
const tableData = ref<MonthlyReportVO[]>([])
const currentRow = ref<MonthlyReportVO>({})
const companyOptions = ref<DictOption[]>([])

const statusMap: Record<string, string> = {
	"0": "草稿",
	"1": "已提交"
}

const queryParams = reactive<MonthlyReportQuery>({
	month: getCurrentMonthValue(),
	companyName: "",
	status: ""
})

const searchFields = computed(() => [
	{
		key: "monthValue",
		label: "报告月份",
		type: "month",
		placeholder: "请选择报告月份",
		width: "220px",
		defaultValue: getCurrentMonthValue(),
		valueFormat: "YYYY年M月",
		elementAttrs: {
			displayFormat: "YYYY年M月"
		}
	},
	{
		key: "companyName",
		label: "填报公司",
		type: "select",
		placeholder: "全部",
		width: "220px",
		options: companyOptions.value.map((item) => ({
			label: item.dictLabel,
			value: item.dictLabel
		}))
	},
	{
		key: "status",
		label: "状态",
		type: "select",
		placeholder: "全部",
		width: "180px",
		options: [
			{ label: "草稿", value: "0" },
			{ label: "已提交", value: "1" }
		]
	}
])

const tableColumns = [
	{ prop: "companyName", label: "填报公司", minWidth: 180, showOverflowTooltip: true },
	{ label: "报告月份", minWidth: 130, slotName: "monthSlot" },
	{ label: "营收完成率", minWidth: 180, slotName: "revenueSlot" },
	{ label: "利润完成率", minWidth: 180, slotName: "profitSlot" },
	{ label: "合同完成率", minWidth: 180, slotName: "contractSlot" },
	{ label: "状态", minWidth: 120, slotName: "statusSlot" },
	{ prop: "updateTime", label: "更新时间", minWidth: 170 },
	{ label: "操作", width: 210, fixed: "right" as const, slotName: "actionsSlot" }
]

const { currentPage, pageSize, total } = usePagination(() => getList(), 10)

const totalReports = computed(() => total.value)
const submittedCount = computed(() => {
	return tableData.value.filter((item) => item.status === "1").length
})
const draftCount = computed(() => {
	return tableData.value.filter((item) => item.status !== "1").length
})

// 表格进度条单元格，列表内复用完成率展示逻辑。
const RateCell = defineComponent({
	name: "RateCell",
	props: {
		rate: {
			type: Number,
			default: 0
		}
	},
	setup(props) {
		const { normalizeProgress, formatRateText } = useRate()
		return () =>
			h("div", { class: "rate-cell" }, [
				h(ElProgress, {
					class: "rate-progress",
					percentage: normalizeProgress(props.rate),
					strokeWidth: 8,
					showText: false,
					style: {
						"--rate-progress-color": getProgressColor(props.rate)
					}
				}),
				h("span", { class: "rate-value" }, `${formatRateText(props.rate)}%`)
			])
	}
})

async function getDictData() {
	try {
		companyOptions.value = await getTaskCompanyDictOptions()
	} catch (error) {
		console.error(error)
	}
}

function getCurrentMonthValue() {
	const now = new Date()
	return formatMonthValue(now.getFullYear(), now.getMonth() + 1)
}

function formatMonthValue(year: number, month: number) {
	return `${year}年${month}月`
}

async function getList() {
	loading.value = true
	try {
		const res = (await listMonthlyReport({
			pageNum: currentPage.value,
			pageSize: pageSize.value,
			month: queryParams.month,
			status: queryParams.status,
			companyName: queryParams.companyName
		})) as any
		tableData.value = res.rows || []
		total.value = res.total || 0
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}

function handleSearch(data: Record<string, any>) {
	queryParams.month = data.monthValue || undefined
	queryParams.companyName = data.companyName || ""
	queryParams.status = data.status || ""
	reloadFirstPage()
}

function resetQuery() {
	queryParams.month = undefined
	queryParams.companyName = ""
	queryParams.status = ""
	reloadFirstPage()
}

function reloadFirstPage() {
	if (currentPage.value === 1) {
		getList()
		return
	}
	currentPage.value = 1
}

function handleCreate() {
	isEditMode.value = false
	currentRow.value = {
		month: queryParams.month || getCurrentMonthValue(),
		status: "0"
	}
	currentView.value = "create"
}

async function handleEdit(row: MonthlyReportVO) {
	if (!row.id) {
		modal.msgWarning("当前报告缺少ID，无法编辑")
		return
	}
	loading.value = true
	try {
		const res = await getMonthlyReport(row.id)
		isEditMode.value = true
		currentRow.value = (res as any).data || row
		currentView.value = "create"
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}

async function handleView(row: MonthlyReportVO) {
	if (!row.id) {
		modal.msgWarning("当前报告缺少ID，无法查看")
		return
	}
	loading.value = true
	try {
		const res = await getMonthlyReport(row.id)
		currentRow.value = (res as any).data || row
		currentView.value = "detail"
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}

function handleDelete(row: MonthlyReportVO) {
	if (!row.id) {
		modal.msgWarning("当前报告缺少ID，无法删除")
		return
	}
	modal
		.confirm("确定删除该月度经营分析报告吗？")
		.then(async () => {
			await delMonthlyReport(row.id as string | number)
			modal.msgSuccess("删除成功")
			getList()
		})
		.catch(() => undefined)
}

// 使用 useLoading 包裹提交逻辑，防重复点击并获取 loading 状态
const { loading: submitLoading, run: submitReport } = useLoading(async (payload: MonthlyReportForm) => {
	const company = companyOptions.value.find((item) => item.dictValue === String(payload.companyId))
	const finalPayload = {
		...payload,
		companyName: company?.dictLabel || payload.companyName || ""
	}
	if (isEditMode.value && finalPayload.id) {
		await updateMonthlyReport(finalPayload)
		modal.msgSuccess(finalPayload.status === "1" ? "提交成功" : "草稿已保存")
	} else {
		await addMonthlyReport(finalPayload)
		modal.msgSuccess(finalPayload.status === "1" ? "创建并提交成功" : "草稿已保存")
	}
	goBackToList()
	getList()
})

function handleExport() {
	exportMonthlyReportExcel({
		month: queryParams.month,
		status: queryParams.status,
		companyName: queryParams.companyName
	})
}

function goBackToList() {
	currentView.value = "list"
	currentRow.value = {}
}

function getMonthLabel(row: MonthlyReportVO) {
	if (row.monthName) return row.monthName
	if (typeof row.month === "string") return row.month
	if (row.year && row.month) return formatMonthValue(row.year, Number(row.month))
	return ""
}

function getProgressColor(rate: number) {
	if (rate >= 80) {
		return "linear-gradient(270deg, #15E795 0%, #00B46E 100%)"
	}
	return "linear-gradient(90deg, #FF7D00 0%, #FFB975 100%)"
}

function getThemeColor(variableName: string, fallback: string) {
	if (typeof window === "undefined") return fallback
	return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim() || fallback
}

onMounted(() => {
	getDictData()
	getList()
})
</script>

<style scoped lang="scss">
.analysis-container {
	height: 100%;
	color: var(--el-text-color-primary);

	&.view-list {
		height: 100%;
		overflow: hidden;
	}

	&.view-create,
	&.view-detail {
		overflow-y: auto;
	}
}

.detail-view {
	min-height: 100%;
	box-sizing: border-box;
}

.list-page {
	height: 100%;
	display: flex;
	flex-direction: column;
	padding: 30px;
	background: #fff;
	border-radius: 20px;
	box-sizing: border-box;
	overflow: hidden;
}

.action-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 18px;
}

.left-actions {
	display: flex;
	gap: 12px;
}

.create-button {
	min-width: 80px;
	height: 34px;
	border-radius: 8px;
}

.export-button,
.refresh-button {
	height: 34px;
	border-radius: 8px;
}

.right-summary {
	display: flex;
	align-items: center;
	gap: 16px;
	font-size: 14px;
	color: var(--el-text-color-regular);

	.highlight-num {
		font-weight: 600;
		margin: 0 4px;

		&.success {
			color: var(--el-color-success);
		}
	}

	.separator {
		color: var(--el-border-color-lighter);
		margin: 0 4px;
	}
}

.pager-row {
	display: flex;
	justify-content: flex-end;
	padding-top: 16px;
}

.text-action {
	padding: 0;
	border: 0;
	background: transparent;
	cursor: pointer;
	font-size: 14px;

	& + .text-action {
		margin-left: 14px;
	}

	&.view {
		color: var(--el-color-primary);
	}
	&.delete {
		color: var(--el-color-danger);
	}
}

.rate-cell {
	display: grid;
	grid-template-columns: minmax(88px, 1fr) 58px;
	align-items: center;
	gap: 10px;
	width: 100%;

	:deep(.el-progress) {
		min-width: 88px;
	}

	:deep(.rate-progress .el-progress-bar__inner) {
		background: var(--rate-progress-color) !important;
	}
}

.rate-value {
	text-align: right;
	color: var(--el-text-color-regular);
	font-size: 14px;
}
</style>
