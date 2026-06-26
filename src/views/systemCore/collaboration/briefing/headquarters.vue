<template>
	<FormPageLayout class="headquarters-page-layout" title="集团本部经营数据编辑" desc="运营管理部">
		<SearchHeader
			:key="searchHeaderKey"
			:form-items="searchFields"
			@form-data-change="handleSearch"
			@form-data-reset="resetQuery"
		/>
		<div class="headquarters-toolbar">
			<el-button type="primary" @click="openAddDialog">新增行</el-button>
		</div>

		<CommonTable :data="filteredRows" :columns="columns" :loading="loading" row-key="rowKey" class="headquarters-table">
			<template #yearSlot="{ row }">
				<strong>{{ row.year }}</strong>
			</template>

			<template #weekSlot="{ row }">
				{{ row.week }}
			</template>

			<template #annualTargetProfitSlot="{ row }">
				<div class="table-field">
					<el-input
						v-model="row.annualTargetProfit"
						placeholder="请输入金额"
						class="headquarters-amount-input"
						:class="{ 'is-error': rowErrors[row.rowKey]?.annualTargetProfit }"
						@input="clearRowFieldError(row.rowKey, 'annualTargetProfit')"
						@blur="validateRowField(row, 'annualTargetProfit')"
					/>
					<div class="table-field-error">{{ rowErrors[row.rowKey]?.annualTargetProfit || "" }}</div>
				</div>
			</template>

			<template #estimatedCompletionSlot="{ row }">
				<div class="table-field">
					<el-input
						v-model="row.estimatedCompletion"
						placeholder="请输入金额"
						class="headquarters-amount-input"
						:class="{ 'is-error': rowErrors[row.rowKey]?.estimatedCompletion }"
						@input="clearRowFieldError(row.rowKey, 'estimatedCompletion')"
						@blur="validateRowField(row, 'estimatedCompletion')"
					/>
					<div class="table-field-error">{{ rowErrors[row.rowKey]?.estimatedCompletion || "" }}</div>
				</div>
			</template>

			<template #actionsSlot="{ row }">
				<el-button type="primary" :loading="isRowSaving(row.rowKey)" @click="handleSaveRow(row)">保存</el-button>
			</template>
		</CommonTable>

		<!-- <div class="headquarters-tip">数据按年、第几周排序，修改后请点击对应行的“保存”按钮。</div> -->

		<template #actions>
			<el-button @click="emit('back')">返回</el-button>
		</template>

		<el-dialog v-model="addDialogVisible" title="新增集团本部数据" width="420px" append-to-body destroy-on-close>
			<el-form :model="addForm" label-position="left" class="headquarters-add-form">
				<el-form-item label="选择周期">
					<el-date-picker
						v-model="addForm.period"
						type="week"
						placeholder="请选择周期"
						format="YYYY年第ww周"
						value-format="YYYY-MM-DD"
						:first-day-of-week="1"
						:clearable="false"
						class="full-width"
					/>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="addDialogVisible = false">取消</el-button>
				<el-button type="primary" :loading="addLoading" @click="handleAddRow">确定</el-button>
			</template>
		</el-dialog>
	</FormPageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import FormPageLayout from "@/components/FormPageLayout/index.vue"
import SearchHeader from "@/components/SearchHeader/index.vue"
import CommonTable from "@/components/CommonTable/index.vue"
import modal from "@/plugins/modal"
import { addHqOperationData, listHqOperationData, updateHqOperationData } from "@/api/system/hqOperationData"
import type {
	HqOperationDataForm,
	HqOperationDataListResponse,
	HqOperationDataQuery,
	HqOperationDataVO
} from "@/api/system/hqOperationData/types"

interface HeadquartersDataRow {
	rowKey: string
	id?: string | number
	year: number
	week: number
	startTime: string
	endTime: string
	annualTargetProfit: AmountValue
	estimatedCompletion: AmountValue
}

type AmountValue = string | number | null
type AmountField = "annualTargetProfit" | "estimatedCompletion"

interface RowError {
	annualTargetProfit?: string
	estimatedCompletion?: string
}

const emit = defineEmits<{
	(event: "back"): void
}>()

const defaultPageSize = 500
const currentYear = new Date().getFullYear()
const searchHeaderKey = ref(0)
const addDialogVisible = ref(false)
const loading = ref(false)
const addLoading = ref(false)
const savingKeys = ref<string[]>([])
const rowErrors = ref<Record<string, RowError>>({})
const queryParams = reactive<{
	year: number
	week: number | ""
	period: string | null
}>({
	year: currentYear,
	week: "",
	period: null
})
const addForm = reactive<{
	period: string
}>({
	period: getCurrentWeekStart()
})
const tableData = ref<HeadquartersDataRow[]>([])

const searchFields = computed(() => [
	{
		key: "period",
		label: "选择周期",
		type: "week",
		placeholder: "默认查询全年所有周",
		width: "300px",
		clearable: false,
		defaultValue: null
	}
])

const columns = [
	{ label: "年", width: 110, slotName: "yearSlot" },
	{ label: "周", width: 110, slotName: "weekSlot" },
	{ label: "年度目标利润（万元）", minWidth: 240, slotName: "annualTargetProfitSlot" },
	{ label: "当月预计完成（万元）", minWidth: 240, slotName: "estimatedCompletionSlot" },
	{ label: "操作", width: 170, slotName: "actionsSlot" }
]

const filteredRows = computed(() => {
	return [...tableData.value].sort((a, b) => b.year - a.year || b.week - a.week)
})

async function getList() {
	loading.value = true
	try {
		const res = (await listHqOperationData(buildListQuery())) as unknown as HqOperationDataListResponse
		rowErrors.value = {}
		tableData.value = (res?.rows || []).map((item: HqOperationDataVO) => normalizeRow(item))
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}

function buildListQuery(): HqOperationDataQuery {
	const query: HqOperationDataQuery = {
		year: queryParams.year,
		pageNum: 1,
		pageSize: defaultPageSize
	}

	if (queryParams.period) {
		const periodMeta = getPeriodMeta(queryParams.period)
		query.startTime = periodMeta.startTime
		query.endTime = periodMeta.endTime
	}

	return query
}

async function handleSearch(data?: Record<string, string | null>) {
	const period = data?.period || null
	if (!period) {
		queryParams.year = currentYear
		queryParams.week = ""
		queryParams.period = null
		await getList()
		return
	}

	const periodMeta = getPeriodMeta(period)
	queryParams.year = periodMeta.year
	queryParams.week = periodMeta.week
	queryParams.period = periodMeta.period
	await getList()
}

function resetQuery() {
	queryParams.year = currentYear
	queryParams.week = ""
	queryParams.period = null
	searchHeaderKey.value += 1
	getList()
}

function openAddDialog() {
	addForm.period = queryParams.period || getCurrentWeekStart()
	addDialogVisible.value = true
}

async function handleAddRow() {
	if (!addForm.period) {
		modal.msgWarning("请选择周期")
		return
	}

	const periodMeta = getPeriodMeta(addForm.period)
	addLoading.value = true
	try {
		const yearRows = await getRowsByYear(periodMeta.year)
		const existsInCurrentRows = tableData.value.some(
			(item) => item.year === periodMeta.year && item.week === periodMeta.week
		)
		const existsInSavedRows = yearRows.some((item) =>
			isSamePeriod(item, periodMeta.year, periodMeta.week, periodMeta.startTime)
		)
		if (existsInCurrentRows || existsInSavedRows) {
			modal.msgWarning(`${periodMeta.year}年第${periodMeta.week}周已存在`)
			return
		}

		tableData.value.unshift({
			rowKey: `new-${periodMeta.year}-${periodMeta.week}`,
			year: periodMeta.year,
			week: periodMeta.week,
			startTime: periodMeta.startTime,
			endTime: periodMeta.endTime,
			annualTargetProfit: null,
			estimatedCompletion: null
		})
		queryParams.year = periodMeta.year
		queryParams.week = ""
		queryParams.period = null
		// 新增未保存行时保留现有编辑态，避免接口数据覆盖用户尚未保存的金额。
		searchHeaderKey.value += 1
		addDialogVisible.value = false
	} catch (error) {
		console.error(error)
	} finally {
		addLoading.value = false
	}
}

async function getRowsByYear(year: number) {
	const res = (await listHqOperationData({
		year,
		pageNum: 1,
		pageSize: defaultPageSize
	})) as unknown as HqOperationDataListResponse
	return (res?.rows || []) as HqOperationDataVO[]
}

function normalizeRow(row: HqOperationDataVO): HeadquartersDataRow {
	const periodMeta = getPeriodMeta(row.startTime || `${row.year || currentYear}-01-01`)
	const week = row.week || periodMeta.week
	return {
		rowKey: String(row.id || `new-${periodMeta.year}-${week}`),
		id: row.id,
		year: row.year || periodMeta.year,
		week,
		startTime: row.startTime || periodMeta.startTime,
		endTime: row.endTime || periodMeta.endTime,
		annualTargetProfit: row.annualTargetProfit ?? null,
		estimatedCompletion: row.estimatedCompletion ?? null
	}
}

function isRowSaving(rowKey: string) {
	return savingKeys.value.includes(rowKey)
}

function setRowSaving(rowKey: string, saving: boolean) {
	savingKeys.value = saving ? [...savingKeys.value, rowKey] : savingKeys.value.filter((item) => item !== rowKey)
}

function validateAmount(value: AmountValue, label: string) {
	if (value === null || value === undefined || value === "") {
		return `${label}不能为空`
	}
	const text = String(value).trim()
	if (!/^-?(?:\d+|\d+\.\d{1,2})$/.test(text)) {
		return `${label}请输入数字，最多保留两位小数`
	}
	if (!Number.isFinite(Number(text))) {
		return `${label}请输入有效数字`
	}
	return ""
}

function setRowFieldError(rowKey: string, field: AmountField, message: string) {
	rowErrors.value = {
		...rowErrors.value,
		[rowKey]: {
			...(rowErrors.value[rowKey] || {}),
			[field]: message
		}
	}
}

function clearRowFieldError(rowKey: string, field: AmountField) {
	if (!rowErrors.value[rowKey]?.[field]) return
	rowErrors.value = {
		...rowErrors.value,
		[rowKey]: {
			...(rowErrors.value[rowKey] || {}),
			[field]: ""
		}
	}
}

function clearRowErrors(rowKey: string) {
	if (!rowErrors.value[rowKey]) return
	const nextErrors = { ...rowErrors.value }
	delete nextErrors[rowKey]
	rowErrors.value = nextErrors
}

function validateRowField(row: HeadquartersDataRow, field: AmountField) {
	const labelMap: Record<AmountField, string> = {
		annualTargetProfit: "年度目标利润",
		estimatedCompletion: "当月预计完成"
	}
	const message = validateAmount(row[field], labelMap[field])
	if (message) {
		setRowFieldError(row.rowKey, field, message)
		return false
	}
	clearRowFieldError(row.rowKey, field)
	return true
}

function toAmountNumber(value: AmountValue) {
	return Number(String(value).trim())
}

function isSamePeriod(row: HqOperationDataVO, year: number, week: number, startTime: string) {
	if (row.year === year && row.week === week) return true
	if (row.startTime === startTime) return true
	if (!row.startTime) return false
	const rowPeriodMeta = getPeriodMeta(row.startTime)
	return rowPeriodMeta.year === year && rowPeriodMeta.week === week
}

async function handleSaveRow(row: HeadquartersDataRow) {
	clearRowErrors(row.rowKey)
	const annualTargetProfitError = validateAmount(row.annualTargetProfit, "年度目标利润")
	if (annualTargetProfitError) {
		setRowFieldError(row.rowKey, "annualTargetProfit", annualTargetProfitError)
	}
	const estimatedCompletionError = validateAmount(row.estimatedCompletion, "当月预计完成")
	if (estimatedCompletionError) {
		setRowFieldError(row.rowKey, "estimatedCompletion", estimatedCompletionError)
	}
	if (annualTargetProfitError || estimatedCompletionError) {
		return
	}

	try {
		await modal.confirm(`确定保存${row.year}年第${row.week}周集团本部经营数据吗？`)
	} catch (error) {
		if (error !== "cancel") {
			console.error(error)
		}
		return
	}

	setRowSaving(row.rowKey, true)
	try {
		const payload: HqOperationDataForm = {
			id: row.id,
			year: row.year,
			week: row.week,
			startTime: row.startTime,
			endTime: row.endTime,
			annualTargetProfit: toAmountNumber(row.annualTargetProfit),
			estimatedCompletion: toAmountNumber(row.estimatedCompletion)
		}
		if (row.id) {
			await updateHqOperationData(payload)
		} else {
			await addHqOperationData(payload)
		}
		modal.msgSuccess("保存成功")
		await getList()
	} finally {
		setRowSaving(row.rowKey, false)
	}
}

function getCurrentWeekStart() {
	const now = new Date()
	const day = now.getDay() || 7
	const start = new Date(now)
	start.setDate(now.getDate() - day + 1)
	return formatDateValue(start)
}

function formatDateValue(date: Date) {
	const pad = (value: number) => String(value).padStart(2, "0")
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function getPeriodMeta(period: string) {
	const monday = getMondayDate(period)
	const sunday = new Date(monday)
	sunday.setDate(monday.getDate() + 6)
	return {
		period: formatDateValue(monday),
		startTime: formatDateValue(monday),
		endTime: formatDateValue(sunday),
		year: monday.getFullYear(),
		week: getIsoWeek(monday)
	}
}

// 周选择器在不同 locale 下可能返回周内任意日期，这里统一归一到周一，避免同周重复新增。
function getMondayDate(dateStr: string) {
	const date = new Date(dateStr.replace(/-/g, "/"))
	const day = date.getDay() || 7
	const monday = new Date(date)
	monday.setDate(date.getDate() - day + 1)
	return monday
}

function getIsoWeek(date: Date) {
	const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
	const day = target.getUTCDay() || 7
	target.setUTCDate(target.getUTCDate() + 4 - day)
	const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1))
	return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

onMounted(() => {
	getList()
})
</script>

<style scoped lang="scss">
.headquarters-page-layout {
	:deep(.create-card) {
		width: 100%;
		max-width: 1080px;
	}

	:deep(.prototype-form) {
		display: flex;
		flex-direction: column;
	}
}

.headquarters-toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	padding: 20px 0;
	color: var(--el-text-color-regular);
}

.headquarters-table {
	flex: 1;
	min-height: 0;

	:deep(.el-table__body .el-table__row) {
		height: 72px;
	}

	:deep(.el-table__cell) {
		height: 72px !important;
		padding-top: 0;
		padding-bottom: 0;
		vertical-align: middle;
	}

	:deep(.el-input) {
		width: 100%;
	}

	:deep(.el-input__inner) {
		text-align: right;
	}
}

.table-field {
	display: flex;
	flex-direction: column;
	justify-content: center;
	min-height: 64px;
}

.headquarters-amount-input {
	max-width: 240px;

	&.is-error {
		:deep(.el-input__wrapper) {
			box-shadow: 0 0 0 1px var(--el-color-danger) inset;
		}
	}
}

.table-field-error {
	min-height: 18px;
	padding-top: 4px;
	color: var(--el-color-danger);
	font-size: 12px;
	line-height: 1.2;
}

.headquarters-tip {
	flex-shrink: 0;
	margin-top: 0;
	padding: 16px 0 0;
	border-top: 1px solid var(--el-border-color-lighter);
	text-align: right;
	color: var(--el-text-color-secondary);
	font-size: 13px;
}

.headquarters-add-form {
	.full-width {
		width: 100%;
	}
}
</style>
