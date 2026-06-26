<template>
	<div class="briefing-page" :class="`view-${currentView}`">
		<template v-if="currentView === 'list'">
			<section v-if="Number(currentDeptId) < 420200 || !currentDeptId" class="submit-overview-card">
				<div class="overview-progress">
					<div class="overview-title-row">
						<div class="overview-title-group">
							<h2 class="overview-title">简报提交概况</h2>
							<span class="overview-type">按时</span>
						</div>
						<div class="overview-main">
							<span class="overview-count">{{ submittedCount }}</span>
							<span class="overview-total">/{{ overviewTotal }}</span>
						</div>
					</div>
					<div class="overview-track">
						<div class="overview-track-inner" :style="{ width: submitRate }"></div>
					</div>
				</div>

				<div class="company-status-list">
					<div v-for="item in companyStatusList" :key="item.key" class="company-status-item">
						<div class="company-name">{{ item.companyName }}</div>
						<div class="company-submit-line" :class="{ pending: !item.isSubmitted }">
							<span>{{ item.submitTime || "-" }}</span>
							<el-icon class="status-icon">
								<CircleCheckFilled v-if="item.isSubmitted" />
								<RemoveFilled v-else />
							</el-icon>
							<span>{{ item.isSubmitted ? "已提交" : "尚未提交" }}</span>
						</div>
					</div>
					<el-popover
						v-if="companyStatusMoreList.length"
						placement="bottom-end"
						trigger="click"
						width="360"
						popper-class="briefing-status-popover"
					>
						<template #reference>
							<el-button type="primary" link class="company-status-more">更多</el-button>
						</template>
						<div class="more-status-panel">
							<CommonTimeline :data="commonTimelineData">
								<template #item="{ item }">
									<div class="more-status-item">
										<div class="more-company-name">{{ item.companyName }}</div>
										<div class="company-submit-line" :class="{ pending: !item.isSubmitted }">
											<span>{{ item.submitTime || "-" }}</span>
											<el-icon class="status-icon">
												<CircleCheckFilled v-if="item.isSubmitted" />
												<RemoveFilled v-else />
											</el-icon>
											<span>{{ item.isSubmitted ? "已提交" : "尚未提交" }}</span>
										</div>
									</div>
								</template>
							</CommonTimeline>
						</div>
					</el-popover>
				</div>
			</section>

			<section v-else class="company-briefing-panel">
				<div class="company-overview-grid">
					<div class="company-status-card">
						<div class="company-card-title">本公司简报状态</div>
						<div class="company-status-main">
							<span class="company-status-tag" :class="{ pending: currentBriefing.status !== '1' }">
								{{ statusMap[currentBriefing.status || "0"] || "草稿" }}
							</span>
							<span class="company-status-name">{{
								currentBriefing.companyName || getCompanyName(currentBriefing.companyId) || "-"
							}}</span>
						</div>
						<div class="company-submit-time">提交时间：{{ currentBriefing.createTime || "-" }}</div>
					</div>

					<div class="company-data-card">
						<div class="company-card-title">本周经营数据概览</div>
						<div class="metric-list">
							<div v-for="item in companyMetricList" :key="item.key" class="metric-item">
								<div class="metric-value" :class="item.className">{{ item.value }}</div>
								<div class="metric-label">{{ item.label }}</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section class="detail-card">
				<div class="detail-header">
					<h2 class="detail-title">简报提交明细</h2>
					<SearchHeader
						:key="searchHeaderKey"
						:form-items="searchFields"
						@form-data-change="handleSearch"
						@form-data-reset="resetQuery"
					/>
				</div>

				<div class="table-toolbar">
					<!-- <template v-if="isRootDept">
            <el-button class="urge-button" @click="handleUrgeAll">一键催报</el-button>
          </template> -->
					<el-button v-hasPermi="['base:weeklyBusinessBrief:export']" @click="handleExport">导出</el-button>
					<el-button v-hasPermi="['base:weeklyBusinessBrief:add']" type="primary" @click="handleCreate"
						>填报简报</el-button
					>
					<el-button v-hasPermi="['base:hqOperationData:list']" type="primary" @click="handleHeadquartersDataEdit">
						集团本部数据编辑
					</el-button>
					<!-- <el-button type="primary" @click="handleCreate">填报简报</el-button> -->
					<el-button type="primary" v-hasPermi="['base:weeklyBusinessBrief:word']" @click="handleGenerateReport"
						>生成汇总报告</el-button
					>
				</div>

				<CommonTable v-loading="loading" :data="tableData" :columns="tableColumns" height="100%" class="briefing-table">
					<template #companyNameSlot="{ row }">
						{{ row.companyName || getCompanyName(row.companyId) || "-" }}
					</template>

					<template #periodSlot="{ row }">
						{{ getPeriodLabel(row) }}
					</template>

					<template #statusSlot="{ row }">
						<span class="status-text" :class="{ pending: row.status !== '1' }">
							<el-icon>
								<CircleCheckFilled v-if="row.status === '1'" />
								<RemoveFilled v-else />
							</el-icon>
							{{ statusMap[row.status || "0"] || "草稿" }}
						</span>
					</template>

					<template #completionRateSlot="{ row }">
						<span>{{ formatPercentValue(row.completionRate) }}</span>
					</template>

					<template #contractSlot="{ row }">
						<span>{{ formatTableValue(row.contractAmountWeekly) }}</span>
					</template>

					<template #revenueSlot="{ row }">
						<span>{{ formatTableValue(row.confirmedRevenueWeekly) }}</span>
					</template>

					<template #investSlot="{ row }">
						<span>{{ formatTableValue(row.investmentWeekly) }}</span>
					</template>

					<template #actionsSlot="{ row }">
						<el-button v-hasPermi="['base:weeklyBusinessBrief:query']" type="primary" link @click="handleView(row)"
							>详情</el-button
						>
						<el-button v-hasPermi="['base:weeklyBusinessBrief:edit']" type="primary" link @click="handleEdit(row)"
							>编辑</el-button
						>
						<el-button v-hasPermi="['base:weeklyBusinessBrief:remove']" type="danger" link @click="handleDelete(row)"
							>删除</el-button
						>
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
			</section>
		</template>

		<HeadquartersDataEdit v-else-if="currentView === 'headquarters'" @back="goBackToList" />

		<CreateBriefing
			v-else-if="currentView === 'create'"
			:row="currentRow"
			:is-edit="isEditMode"
			:company-options="companyOptions"
			:loading="submitLoading"
			@back="goBackToList"
			@submit="submitBriefing"
		/>

		<DetailBriefing v-else :row="currentRow" @back="goBackToList" />

		<el-dialog
			v-model="reportPreviewVisible"
			title="汇总报告预览"
			width="76%"
			append-to-body
			destroy-on-close
			class="report-preview-dialog"
			@closed="handleReportPreviewClosed"
		>
			<div ref="reportPreviewRef" v-loading="reportPreviewLoading" class="report-preview" :style="reportPreviewStyle">
				<VueOfficeDocx
					v-if="reportDocxSrc"
					:key="reportPreviewKey"
					:src="reportDocxSrc"
					class="report-preview__docx"
					@rendered="handleReportRendered"
					@error="handleReportPreviewError"
				/>
				<el-empty v-else description="暂无可预览的汇总报告" class="report-preview__empty" />
			</div>
			<template #footer>
				<el-button type="primary" :loading="reportExportLoading" @click="handleExportReportWord">导出为Word</el-button>
				<el-button type="primary" :loading="reportExportPdfLoading" @click="handleExportReportPdf">导出为PDF</el-button>
				<el-button @click="reportPreviewVisible = false">关闭</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import { CircleCheckFilled, RemoveFilled } from "@element-plus/icons-vue"
import VueOfficeDocx from "@vue-office/docx/lib/v3/index.js"
import "@vue-office/docx/lib/v3/index.css"
import dayjs from "dayjs"
import "dayjs/locale/zh-cn"
import Pagination from "@/components/Pagination/index.vue"
import SearchHeader from "@/components/SearchHeader/index.vue"
import CommonTimeline from "@/components/CommonTimeline/index.vue"
import CommonTable from "@/components/CommonTable/index.vue"
import modal from "@/plugins/modal"
import { usePagination } from "@/hooks/usePagination"
import { useLoading } from "@/hooks/useLoading"
import {
	addWeeklyBusinessBrief,
	delWeeklyBusinessBrief,
	exportWeeklyBusinessBriefWord,
	exportWeeklyBusinessBriefPdf,
	exportWeeklyBusinessBriefExcel,
	getWeeklyBusinessBriefWordBlob,
	getWeeklyBusinessBrief,
	listWeeklyBusinessBrief,
	updateWeeklyBusinessBrief
} from "@/api/system/weeklyBusinessBrief"
import type {
	DeptSubmitStatsVo,
	WeeklyBusinessBriefForm,
	WeeklyBusinessBriefStatsVO,
	WeeklyBusinessBriefVO
} from "@/api/system/weeklyBusinessBrief/types"
import CreateBriefing from "./create.vue"
import DetailBriefing from "./detail.vue"
import HeadquartersDataEdit from "./headquarters.vue"
import { getTaskCompanyDictOptions } from "@/utils/taskCompany"
import { useUserStore } from "@/store/modules/user"

// 设置全局 dayjs 语言包为中文，确保周选择器面板默认将周一作为每周第一天，且选中后返回周一日期
dayjs.locale("zh-cn")

type ViewMode = "list" | "create" | "detail" | "headquarters"

interface DictOption {
	dictValue: string
	dictLabel: string
	[key: string]: any
}

interface CompanyStatusItem {
	key: string
	companyName: string
	submitTime: string
	isSubmitted: boolean
	rawTime?: number
}

const ROOT_DEPT_ID = "420100"
const PERIOD_OPTION_COUNT = 13
const COMPANY_STATUS_PREVIEW_COUNT = 4

const userStore = useUserStore()
const currentView = ref<ViewMode>("list")
const isEditMode = ref(false)
const loading = ref(false)
const tableData = ref<WeeklyBusinessBriefVO[]>([])
const currentRow = ref<WeeklyBusinessBriefVO>({})
const companyOptions = ref<DictOption[]>([])
const deptSubmitStats = ref<DeptSubmitStatsVo | null>(null)
const reportPreviewVisible = ref(false)
const reportPreviewLoading = ref(false)
const reportExportLoading = ref(false)
const reportExportPdfLoading = ref(false)
const reportDocxSrc = ref<ArrayBuffer | Blob | null>(null)
const reportPreviewKey = ref(0)
const reportPreviewRef = ref<HTMLElement | null>(null)
const reportDocxScale = ref(1)
const reportDocxFallbackPadding = ref(false)
let reportPreviewResizeObserver: ResizeObserver | null = null

const statusMap: Record<string, string> = {
	"0": "草稿",
	"1": "已提交"
}

const queryParams = reactive({
	period: getCurrentWeekStart()
})

const searchHeaderKey = ref(0)
const searchFields = computed(() => [
	{
		key: "period",
		label: "选择周期",
		type: "week",
		placeholder: "选择周期",
		width: "300px",
		clearable: false,
		defaultValue: getCurrentWeekStart()
	}
])

const { currentPage, pageSize, total } = usePagination(() => getList(), 10)

const currentDeptId = computed(() => userStore.deptId)
const isAdmin = computed(() => userStore.roles.includes("superadmin")) // 判断是否为超级管理员
const isRootDept = computed(() => String(currentDeptId.value) === ROOT_DEPT_ID || isAdmin.value)

const tableColumns = computed(() => {
	const columns = []
	// if (isRootDept.value || !currentDeptId.value) {
	//   columns.push({ label: '公司名称', minWidth: 140, slotName: 'companyNameSlot' });
	// }
	columns.push(
		{ label: "公司名称", minWidth: 140, slotName: "companyNameSlot" },
		{ label: "周期", minWidth: 220, slotName: "periodSlot" },
		{ label: "状态", minWidth: 120, slotName: "statusSlot" },
		{ label: "提交时间", prop: "createTime", minWidth: 170 },
		{ label: "利润完成率", minWidth: 130, slotName: "completionRateSlot" },
		{ label: "新增合同(万元)", minWidth: 150, slotName: "contractSlot" },
		{ label: "新增收入(万元)", minWidth: 150, slotName: "revenueSlot" },
		{ label: "新增投资(万元)", minWidth: 150, slotName: "investSlot" },
		{ label: "操作", width: 200, fixed: "right" as const, slotName: "actionsSlot" }
	)
	return columns
})

const submittedCount = computed(
	() => deptSubmitStats.value?.submittedCount ?? tableData.value.filter((item) => item.status === "1").length
)
const overviewTotal = computed(
	() => deptSubmitStats.value?.count ?? Math.max(tableData.value.length, submittedCount.value)
)
const submitRate = computed(() => {
	if (!overviewTotal.value) return "0%"
	return `${(submittedCount.value / overviewTotal.value) * 100}%`
})
const currentBriefing = computed<WeeklyBusinessBriefVO>(() => tableData.value[0] || {})
const periodOptions = computed(() => buildPeriodOptions())
const companyMetricList = computed(() => {
	const row = currentBriefing.value
	return [
		{
			key: "completionRate",
			label: "利润完成率",
			value: formatPercentValue(row.completionRate),
			className: "profit"
		},
		{
			key: "contractAmountWeekly",
			label: "新增合同(万元)",
			value: formatMetricValue(row.contractAmountWeekly),
			className: "contract"
		},
		{
			key: "confirmedRevenueWeekly",
			label: "新增收入(万元)",
			value: formatMetricValue(row.confirmedRevenueWeekly),
			className: "revenue"
		},
		{
			key: "investmentWeekly",
			label: "新增投资(万元)",
			value: formatMetricValue(row.investmentWeekly),
			className: "investment"
		}
	]
})
const reportPreviewStyle = computed(() => ({
	"--report-docx-scale": String(reportDocxScale.value),
	"--report-docx-padding-x": reportDocxFallbackPadding.value ? "14%" : "0px",
	"--report-docx-padding-y": reportDocxFallbackPadding.value ? "10%" : "0px"
}))

const allCompanyStatusList = computed<CompanyStatusItem[]>(() => {
	let list: CompanyStatusItem[] = []
	if (deptSubmitStats.value?.deptList?.length) {
		list = deptSubmitStats.value.deptList.map((item, index) => ({
			key: `${item.deptName || "dept"}-${index}`,
			companyName: item.deptName || "-",
			submitTime: formatSubmitTime(item.submitTime),
			isSubmitted: Boolean(item.submitted),
			rawTime: item.submitTime ? new Date(item.submitTime.replace(/-/g, "/")).getTime() : 0
		}))
	} else {
		list = tableData.value.map((item, index) => ({
			key: `${item.companyId || item.companyName || "company"}-${index}`,
			companyName: item.companyName || getCompanyName(item.companyId) || "-",
			submitTime: formatSubmitTime(item.createTime),
			isSubmitted: item.status === "1",
			rawTime: item.createTime ? new Date(item.createTime.replace(/-/g, "/")).getTime() : 0
		}))
	}

	return list.sort((a, b) => {
		if (a.isSubmitted !== b.isSubmitted) {
			return a.isSubmitted ? -1 : 1 // 已提交排前面
		}
		return (b.rawTime || 0) - (a.rawTime || 0) // 按提交时间降序（最新的排前）
	})
})
const companyStatusList = computed(() => allCompanyStatusList.value.slice(0, COMPANY_STATUS_PREVIEW_COUNT))
const companyStatusMoreList = computed(() => allCompanyStatusList.value.slice(COMPANY_STATUS_PREVIEW_COUNT))

const commonTimelineData = computed(() => {
	return companyStatusMoreList.value.map((item) => ({
		...item,
		type: item.isSubmitted ? "assign" : "create", // assign=蓝色，create=灰色
		time: item.submitTime || "",
		label: "",
		user: "",
		content: ""
	}))
})

async function getDictData() {
	try {
		companyOptions.value = await getTaskCompanyDictOptions()
	} catch (error) {
		console.error(error)
	}
}

function getWeekEnd(mondayStr: string) {
	const date = new Date(mondayStr.replace(/-/g, "/"))
	date.setDate(date.getDate() + 6)
	const pad = (value: number) => String(value).padStart(2, "0")
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// 强制将传入的日期字符串标准化为所在周的周一日期，避免不同 locale 下周选组件返回周日而偏离一天
function getMondayStr(dateStr: string) {
	if (!dateStr) return ""
	const date = new Date(dateStr.replace(/-/g, "/"))
	const day = date.getDay() || 7 // 周日转为 7，周一为 1
	const start = new Date(date)
	start.setDate(date.getDate() - day + 1)
	return formatDateValue(start)
}

function buildPeriodOptions() {
	const currentWeekStart = new Date(getCurrentWeekStart().replace(/-/g, "/"))
	return Array.from({ length: PERIOD_OPTION_COUNT }, (_, index) => {
		const startDate = new Date(currentWeekStart)
		startDate.setDate(currentWeekStart.getDate() - index * 7)
		const value = formatDateValue(startDate)
		const endDate = new Date(startDate)
		endDate.setDate(startDate.getDate() + 6)
		const prefix = index === 0 ? "本周" : index === 1 ? "上周" : `${index}周前`
		return {
			label: `${prefix} (${value} 至 ${formatDateValue(endDate)})`,
			value
		}
	})
}

function getRequiredPeriod() {
	if (!queryParams.period) {
		queryParams.period = getCurrentWeekStart()
	}
	return queryParams.period
}

function buildListQuery() {
	const period = getRequiredPeriod()
	const mondayStr = getMondayStr(period) // 对周期取对应的周一
	return {
		pageNum: currentPage.value,
		pageSize: pageSize.value,
		companyId: isRootDept.value ? ROOT_DEPT_ID : currentDeptId.value, // 超级管理员和集团部门均传递集团ID
		startTime: mondayStr,
		endTime: getWeekEnd(mondayStr)
	}
}

function buildReportQuery() {
	const period = getRequiredPeriod()
	const mondayStr = getMondayStr(period) // 对周期取对应的周一
	return {
		companyId: isRootDept.value ? ROOT_DEPT_ID : currentDeptId.value, // Word 汇总接口按接口文档传递公司/部门标识
		startTime: mondayStr,
		endTime: getWeekEnd(mondayStr)
	}
}

function getBriefListResult(response: any) {
	const data = response?.data
	const statsData = data && !Array.isArray(data) ? (data as WeeklyBusinessBriefStatsVO) : undefined
	const briefList = statsData?.weeklyBusinessBriefVos || response?.rows || (Array.isArray(data) ? data : []) || []

	return {
		deptSubmitStatsVo: statsData?.deptSubmitStatsVo ?? null,
		weeklyBusinessBriefVos: briefList,
		total: response?.total ?? briefList.length
	}
}

async function getList() {
	// if (!currentDeptId.value) {
	//   ElMessage.warning('当前用户缺少区域ID，无法查询经营简报');
	//   return;
	// }
	loading.value = true
	try {
		const res = (await listWeeklyBusinessBrief(buildListQuery())) as any
		const result = getBriefListResult(res)
		deptSubmitStats.value = result.deptSubmitStatsVo
		tableData.value = result.weeklyBusinessBriefVos
		total.value = result.total
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}

function reloadFirstPage() {
	if (currentPage.value === 1) {
		getList()
		return
	}
	currentPage.value = 1
}

function handleSearch(data?: any) {
	if (data && data.period) {
		queryParams.period = getMondayStr(data.period) // 强行拉回周一
	}
	reloadFirstPage()
}

// 重置查询条件，将周期重置为当前周并重新加载列表
function resetQuery() {
	queryParams.period = getCurrentWeekStart()
	searchHeaderKey.value += 1
	reloadFirstPage()
}

function handleHeadquartersDataEdit() {
	currentView.value = "headquarters"
}

function handleCreate() {
	// if (isRootDept.value) {
	//   modal.msgWarning('集团部门无需新增经营简报');
	//   return;
	// }
	const currentCompany = getCurrentCompanyOption()
	isEditMode.value = false
	const period = getMondayStr(getRequiredPeriod()) // 标准化为周一
	currentRow.value = {
		deptId: currentDeptId.value,
		companyId: String(currentDeptId.value),
		companyName: currentCompany?.dictLabel,
		startTime: period,
		endTime: getWeekEnd(period),
		status: "0",
		annualTargetProfit: 5000
	}
	currentView.value = "create"
}

async function handleEdit(row: WeeklyBusinessBriefVO) {
	// if (!row.id) {
	//   ElMessage.warning('当前简报缺少ID，无法编辑');
	//   return;
	// }
	loading.value = true
	try {
		const res = await getWeeklyBusinessBrief(row.id)
		isEditMode.value = true
		const detail = (res as any).data || row
		currentRow.value = isRootDept.value
			? {
					...detail,
					companyName: row.companyName || getCompanyName(row.companyId) || detail.companyName
				}
			: {
					...detail,
					deptId: currentDeptId.value,
					companyId: String(currentDeptId.value),
					companyName: getCurrentCompanyOption()?.dictLabel || detail.companyName
				}
		currentView.value = "create"
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}

async function handleView(row: WeeklyBusinessBriefVO) {
	// if (!row.id) {
	//   ElMessage.warning('当前简报缺少ID，无法查看');
	//   return;
	// }
	loading.value = true
	try {
		const res = await getWeeklyBusinessBrief(row.id)
		const detail = (res as any).data || row
		currentRow.value = {
			...detail,
			companyName: row.companyName || getCompanyName(row.companyId) || detail.companyName
		}
		currentView.value = "detail"
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}

// 使用 useLoading 包裹提交逻辑，防重复点击并获取 loading 状态
const { loading: submitLoading, run: submitBriefing } = useLoading(async (payload: WeeklyBusinessBriefForm) => {
	const submitPayload = isRootDept.value
		? payload
		: {
				...payload,
				deptId: currentDeptId.value,
				companyId: String(currentDeptId.value)
			}
	if (isEditMode.value && submitPayload.id) {
		await updateWeeklyBusinessBrief(submitPayload)
		modal.msgSuccess(submitPayload.status === "1" ? "提交成功" : "草稿已保存")
	} else {
		await addWeeklyBusinessBrief(submitPayload)
		modal.msgSuccess(submitPayload.status === "1" ? "创建并提交成功" : "草稿已保存")
	}
	goBackToList()
	getList()
})

const formatTableValue = (value?: number | string) => formatNumberValue(value)
const formatMetricValue = (value?: number | string) => formatNumberValue(value)

function formatNumberValue(value?: number | string) {
	if (value === undefined || value === null || value === "") return "-"
	const numberValue = Number(value)
	if (!Number.isFinite(numberValue)) return String(value)
	// 转回 Number 用于去掉 toFixed 生成的尾随 0，满足后端数值和页面展示一致性。
	return String(Number(numberValue.toFixed(2)))
}

function formatPercentValue(value?: number | string) {
	const text = formatNumberValue(value)
	return text === "-" ? "-" : `${text}%`
}

function getCompanyName(companyId?: string | number) {
	return companyOptions.value.find((item) => String(item.dictValue) === String(companyId))?.dictLabel || ""
}

function getCurrentCompanyOption() {
	return companyOptions.value.find((item) => String(item.dictValue) === String(currentDeptId.value))
}

function getPeriodLabel(row: WeeklyBusinessBriefVO) {
	if (!row.startTime && !row.endTime) return "-"
	return `${formatDate(row.startTime)} 至 ${formatDate(row.endTime)}`
}

function getFileNameByUrl(url?: string) {
	if (!url) return ""
	const cleanUrl = url.split("?")[0] || ""
	const name = cleanUrl.slice(cleanUrl.lastIndexOf("/") + 1)
	try {
		return decodeURIComponent(name)
	} catch {
		return name
	}
}

function formatDate(value?: string) {
	return value ? value.slice(0, 10) : "-"
}

function formatSubmitTime(value?: string) {
	if (!value) return ""
	const date = new Date(value.replace(/-/g, "/"))
	if (Number.isNaN(date.getTime())) return value
	const pad = (num: number) => String(num).padStart(2, "0")
	return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
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

async function handleDelete(row: WeeklyBusinessBriefVO) {
	if (!row.id) return
	try {
		await modal.confirm("确定要删除该经营简报吗？")
		loading.value = true
		await delWeeklyBusinessBrief(row.id)
		modal.msgSuccess("删除成功")
		getList()
	} catch (error) {
		if (error !== "cancel") {
			console.error(error)
		}
	} finally {
		loading.value = false
	}
}

function handleUrgeAll() {
	modal
		.confirm("确定向所有未提交单位发送催报通知吗？")
		.then(() => {
			modal.msgSuccess("催报通知已发送")
		})
		.catch(() => undefined)
}

function handleExport() {
	const period = getRequiredPeriod()
	const mondayStr = getMondayStr(period) // 对周期取对应的周一
	exportWeeklyBusinessBriefExcel({
		deptId: isRootDept.value ? ROOT_DEPT_ID : currentDeptId.value, // 超级管理员和集团部门均传递集团ID
		startTime: mondayStr,
		endTime: getWeekEnd(mondayStr)
	})
}

async function handleGenerateReport() {
	// if (!currentDeptId.value) {
	//   ElMessage.warning('当前用户缺少区域ID，无法生成汇总报告');
	//   return;
	// }

	reportPreviewVisible.value = true
	reportPreviewLoading.value = true
	reportDocxSrc.value = null
	await nextTick()
	ensureReportPreviewObserver()

	try {
		// 预览时直接传递接口返回的二进制流 Blob，无需转换为 ArrayBuffer
		const blob = await getWeeklyBusinessBriefWordBlob(buildReportQuery())
		reportDocxSrc.value = blob
		reportPreviewKey.value += 1
	} catch (error) {
		console.error(error)
		reportPreviewLoading.value = false
		reportPreviewVisible.value = false
	}
}

async function handleExportReportWord() {
	reportExportLoading.value = true
	try {
		// 导出时直接调用接口进行下载，不再复用前端缓存 of Blob
		await exportWeeklyBusinessBriefWord(buildReportQuery())
	} catch (error) {
		console.error(error)
	} finally {
		reportExportLoading.value = false
	}
}

async function handleExportReportPdf() {
	reportExportPdfLoading.value = true
	try {
		// 导出时直接调用接口进行下载
		await exportWeeklyBusinessBriefPdf(buildReportQuery())
	} catch (error) {
		console.error(error)
	} finally {
		reportExportPdfLoading.value = false
	}
}

function handleReportRendered() {
	reportPreviewLoading.value = false
	nextTick(updateReportDocxScale)
}

function handleReportPreviewError(error: unknown) {
	console.error("汇总报告预览失败:", error)
	reportPreviewLoading.value = false
	modal.msgError("汇总报告预览失败，请导出后查看")
}

function handleReportPreviewClosed() {
	reportDocxSrc.value = null
	reportDocxScale.value = 1
	reportDocxFallbackPadding.value = false
}

function updateReportDocxScale() {
	const previewEl = reportPreviewRef.value
	const docxEl = previewEl?.querySelector(".docx-wrapper > section.docx") as HTMLElement | null
	if (!previewEl || !docxEl) {
		reportDocxScale.value = 1
		return
	}

	syncReportDocxFallbackPadding(docxEl)
	const availableWidth = Math.max(previewEl.clientWidth - 32, 320)
	const currentScale = reportDocxScale.value || 1
	const originalWidth = docxEl.getBoundingClientRect().width / currentScale
	reportDocxScale.value = originalWidth > availableWidth ? Number((availableWidth / originalWidth).toFixed(4)) : 1
}

function syncReportDocxFallbackPadding(docxEl: HTMLElement) {
	const style = window.getComputedStyle(docxEl)
	const paddingLeft = Number.parseFloat(style.paddingLeft) || 0
	const paddingRight = Number.parseFloat(style.paddingRight) || 0
	// 部分 Word 文件通过 docx-preview 预览时会丢失页边距，这里只在边距异常小时补齐预览页边距。
	reportDocxFallbackPadding.value = paddingLeft < 40 && paddingRight < 40
}

function ensureReportPreviewObserver() {
	if (!reportPreviewRef.value) return
	reportPreviewResizeObserver?.disconnect()
	reportPreviewResizeObserver = new ResizeObserver(() => updateReportDocxScale())
	reportPreviewResizeObserver.observe(reportPreviewRef.value)
}

function goBackToList() {
	currentView.value = "list"
	currentRow.value = {}
}

onMounted(() => {
	getDictData()
	getList()
})

onBeforeUnmount(() => {
	reportPreviewResizeObserver?.disconnect()
})
</script>

<style scoped lang="scss">
.briefing-page {
	display: flex;
	flex-direction: column;
	gap: 24px;
	height: 100%;
	color: var(--el-text-color-primary);

	&.view-list {
		height: 100%;
		overflow: hidden;
	}

	&.view-create,
	&.view-detail,
	&.view-headquarters {
		overflow-y: auto;
	}
}

.submit-overview-card,
.detail-card {
	background: var(--el-bg-color);
	border-radius: 20px;
	box-shadow: 0 12px 30px rgba(var(--el-color-primary-rgb), 0.04);
}

.submit-overview-card {
	display: grid;
	grid-template-columns: 360px minmax(0, 1fr);
	align-items: stretch;
	min-height: 114px;
	padding: 16px 28px 16px 30px;
}

.overview-progress {
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding-right: 44px;
	border-right: 1px solid var(--el-border-color-lighter);
}

.overview-title-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 14px;
}

.overview-title-group {
	display: flex;
	align-items: baseline;
	gap: 14px;
}

.overview-title,
.detail-title {
	margin: 0;
	font-size: 20px;
	font-weight: 600;
}

.overview-type,
.overview-count,
.overview-total {
	color: var(--el-color-primary);
}

.overview-count {
	font-size: 30px;
	font-weight: 700;
	line-height: 1;
}

.overview-track {
	width: 100%;
	height: 8px;
	margin-top: 26px;
	overflow: hidden;
	background: var(--el-fill-color-lighter);
	border-radius: 999px;
}

.overview-track-inner {
	height: 100%;
	background: var(--el-color-primary);
	border-radius: inherit;
}

.company-status-list {
	display: grid;
	grid-template-columns: repeat(4, minmax(120px, 1fr)) auto;
	align-items: center;
	gap: 24px;
	padding-left: 28px;
}

.company-name {
	margin-bottom: 16px;
	font-size: 15px;
	font-weight: 600;
}

.company-submit-line {
	display: flex;
	align-items: center;
	gap: 5px;
	color: var(--el-color-primary);
	font-size: 13px;

	&.pending {
		color: var(--el-text-color-secondary);
	}
}

.company-status-more {
	justify-self: end;
	white-space: nowrap;
}

.more-status-panel {
	max-height: 360px;
	padding: 10px 20px 10px 0;
	overflow-y: auto;
}

.more-status-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	min-width: 0;
	padding-top: 12px; /* 与 CommonTimeline 中 top: 15px 的圆点垂直居中对齐 */
}

.more-company-name {
	min-width: 0;
	font-size: 14px;
	font-weight: 600;
	color: var(--el-text-color-primary);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.company-briefing-panel {
	display: flex;
	flex-direction: column;
	gap: 24px;
}

.company-overview-grid {
	display: grid;
	grid-template-columns: minmax(320px, 1fr) minmax(420px, 1fr);
	gap: 24px;
}

.company-status-card,
.company-data-card {
	min-height: 136px;
	padding: 26px 30px;
	border-radius: 20px;
	background: var(--el-bg-color);
	box-shadow: 0 12px 30px rgba(var(--el-color-primary-rgb), 0.04);
}

.company-status-card {
	border: 1px solid var(--el-border-color-lighter);
}

.company-data-card {
	border: 1px solid var(--el-border-color-lighter);
}

.company-card-title {
	margin-bottom: 12px;
	font-size: 20px;
	font-weight: 600;
	color: var(--el-text-color-primary);
}

.company-status-main {
	display: flex;
	align-items: center;
	gap: 16px;
	margin-bottom: 12px;
}

.company-status-tag {
	display: inline-flex;
	align-items: center;
	height: 26px;
	padding: 0 12px;
	border-radius: 999px;
	background: #d9fbe8;
	color: #008a4f;
	font-size: 14px;
	font-weight: 700;

	&.pending {
		background: var(--el-fill-color-light);
		color: var(--el-text-color-secondary);
	}
}

.company-status-name {
	font-size: 20px;
	font-weight: 700;
	color: var(--el-text-color-primary);
}

.company-submit-time {
	color: var(--el-text-color-regular);
	font-size: 13px;
}

.metric-list {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	align-items: center;
	gap: 18px;
}

.metric-item {
	text-align: center;
}

.metric-value {
	margin-bottom: 5px;
	font-size: 24px;
	line-height: 1;
	font-weight: 800;

	&.profit {
		color: var(--el-color-primary);
	}

	&.contract {
		color: #1d4eff;
	}

	&.revenue {
		color: #008a4f;
	}

	&.investment {
		color: #b45309;
	}
}

.metric-label {
	font-size: 13px;
	color: var(--el-text-color-secondary);
}

.detail-card {
	flex: 1;
	min-height: 0;
	padding: 0 30px 30px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.detail-header {
	padding: 28px 0 20px;
	border-bottom: 1px solid var(--el-border-color-lighter);
}

.detail-title {
	margin-bottom: 18px;
}

.query-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20px;
}

.period-field,
.query-actions,
.table-toolbar {
	display: flex;
	align-items: center;
	gap: 14px;
}

.table-toolbar {
	padding: 20px 0;
}

.urge-button,
.table-urge-button {
	color: var(--el-color-warning);
}

.briefing-table {
	width: 100%;

	:deep(.briefing-table-header th.el-table__cell) {
		height: 56px;
		background: var(--el-fill-color-light);
		font-weight: 600;
	}

	:deep(.briefing-table-row td.el-table__cell) {
		height: 78px;
		border-bottom-color: var(--el-border-color-lighter);
	}

	:deep(.el-table__inner-wrapper::before) {
		display: none;
	}
}

.status-text {
	display: inline-flex;
	align-items: center;
	gap: 5px;
	color: var(--el-color-primary);

	&.pending {
		color: var(--el-text-color-secondary);
	}
}

.pager-row {
	display: flex;
	justify-content: flex-end;
	padding-top: 16px;
}

.report-preview {
	height: 68vh;
	overflow-x: hidden;
	overflow-y: auto;
	border: 1px solid var(--el-border-color-light);
	border-radius: 4px;
	background: #ffffff;
}

.report-preview__docx {
	min-height: 100%;
}

.report-preview__empty {
	height: 100%;
}

:deep(.report-preview-dialog .el-dialog__body) {
	padding-top: 12px;
}

:deep(.vue-office-docx) {
	min-height: 100%;
	overflow-x: hidden;
}

:deep(.vue-office-docx .docx-wrapper) {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 16px 0 !important;
	box-sizing: border-box;
	overflow-x: hidden;
	zoom: var(--report-docx-scale);
}

:deep(.vue-office-docx .docx-wrapper > section.docx) {
	box-sizing: border-box;
	padding: var(--report-docx-padding-y) var(--report-docx-padding-x) !important;
}

:deep(.el-date-editor.el-input) {
	width: 260px;
}

.period-select {
	width: 300px;
}

:deep(.el-button.is-circle) {
	width: 32px;
	height: 32px;
}

@media (max-width: 1360px) {
	.submit-overview-card {
		grid-template-columns: 1fr;
		gap: 20px;
	}

	.overview-progress {
		padding-right: 0;
		border-right: 0;
	}

	.company-status-list {
		padding-left: 0;
	}

	.company-overview-grid {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 1200px) {
	.company-status-list {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.query-row {
		align-items: flex-start;
		flex-direction: column;
	}

	.metric-list {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}
</style>
