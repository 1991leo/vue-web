<template>
	<div class="project-page">
		<template v-if="pageMode === 'list'">
			<div class="project-panel">
				<div class="title-and-search-panel">
					<div class="title-row-container">
						<PageTitle title="合作项目管理" />
					</div>
					<SearchHeader
						labelWidth="100px"
						:formItems="searchHeaderItems"
						searchButtonText="搜索"
						resetButtonText="重置"
						@form-data-change="onSearch"
						@form-data-reset="onReset"
					/>
				</div>

				<CommonDivider :offset="30" />
				<div class="project-toolbar">
					<div class="project-toolbar__left">
						<el-button type="primary" v-hasPermi="['base:coopProject:add']" :icon="Plus" @click="openCreatePage"
							>新建项目</el-button
						>
						<!-- <el-button v-hasPermi="['base:coopProject:import']" @click="openImportPage">导入项目</el-button> -->
						<el-button v-hasPermi="['base:coopProject:export']" @click="handleExport">导出 Excel</el-button>
						<!-- <el-button v-hasPermi="['base:coopProject:addMessage']" @click="handleRemind">一键催报</el-button> -->
					</div>
				</div>
				<div class="project-content-scroll" :class="{ 'project-content-scroll--with-dashboard': isStrategicAdmin }">
					<!-- <div v-if="isStrategicAdmin" class="dashboard-panel">
            <div class="dashboard-cards">
              <div v-for="item in dashboardData.cards" :key="item.key" class="dashboard-card">
                <div class="dashboard-card__label">{{ item.label }}</div>
                <div class="dashboard-card__value">{{ item.value }}</div>
                <div class="dashboard-card__desc">{{ item.desc }}</div>
              </div>
            </div>
            <div class="dashboard-chart-grid">
              <section class="dashboard-chart-card">
                <div class="dashboard-chart-card__title">所属公司分布</div>
                <v-chart class="dashboard-chart" :option="companyPieOption" autoresize />
              </section>
              <section class="dashboard-chart-card">
                <div class="dashboard-chart-card__title">项目类型分布</div>
                <v-chart class="dashboard-chart" :option="typePieOption" autoresize />
              </section>
            </div>
            <CommonDivider :offset="0" />
          </div> -->

					<div class="project-table-wrapper">
						<CommonTable
							:columns="commonProjectTableColumns"
							:data="filteredList"
							:height="projectTableHeight"
							:index-start="(currentPage - 1) * pageSize"
							:loading="listLoading"
							row-key="id"
							show-index-column
						>
							<template #projectStatus="{ row }">
								<el-tag :type="getProjectStatusTagType(row.projectStatusName)">{{ row.projectStatusName }}</el-tag>
							</template>

							<template #weeklyStatus="{ row }">
								<el-tag :type="getWeeklyStatusTagType(row.weeklyStatus)">{{ row.weeklyStatusName }}</el-tag>
							</template>

							<template #operation="{ row }">
								<div class="table-actions">
									<el-button link type="primary" v-hasPermi="['base:coopProject:add']" @click="openEditPage(row)"
										>编辑</el-button
									>
									<template v-if="!row.projectStatusName.includes(projectFollowStatusLabels.draft)">
										<el-button
											v-if="isProjectOngoing(row)"
											link
											type="primary"
											v-hasPermi="['base:coopProject:report']"
											@click="openReportPage(row)"
										>
											填报周报
										</el-button>
										<el-button link v-hasPermi="['base:coopProject:reportHistory']" @click="openHistoryPage(row)"
											>周报历史</el-button
										>
										<el-button link v-hasPermi="['base:coopProject:query']" @click="openDetailPage(row)"
											>详情</el-button
										>

										<el-button
											v-if="row.projectStatusName.includes(projectFollowStatusLabels.ongoing)"
											v-hasPermi="['base:coopProject:stopProject']"
											link
											@click="openArchivePage(row)"
										>
											停止跟进
										</el-button>
										<el-button
											v-else
											v-hasPermi="['base:coopProject:restoreProject']"
											link
											@click="openArchivePage(row)"
											>恢复跟进</el-button
										>
									</template>
								</div>
							</template>
						</CommonTable>
					</div>

					<div class="project-pagination">
						<Pagination
							v-show="filteredList.length > 0"
							v-model:current-page="currentPage"
							v-model:page-size="pageSize"
							:total="total"
							paginationType="success"
							@pagination="handlePagination"
						/>
					</div>
				</div>
			</div>
		</template>

		<ProjectFormPage
			v-else-if="pageMode === 'create' || pageMode === 'edit'"
			:mode="pageMode"
			:initial-data="editingFormData"
			:loading="formLoading"
			:category-options="categoryOptions"
			:direction-options="directionOptions"
			:finish-time-options="finishTimeOptions"
			:company-options="companyOptions"
			:user-options="userOptions"
			:user-loading="userLoading"
			:project-status-options="projectStatusOptions"
			@back="backToList"
			@save-draft="handleSaveDraft"
			@submit="handleSubmitProject"
			@business-unit-change="handleBusinessUnitChange"
		/>

		<ProjectDetailPage v-else-if="pageMode === 'detail'" :detail="currentDetail" @back="backToList" />

		<ProjectReportPage
			v-else-if="pageMode === 'report'"
			:detail="currentDetail"
			:loading="reportLoading"
			:situation-options="situationOptions"
			@back="backToList"
			@submit="handleSubmitReport"
		/>

		<ProjectHistoryPage v-else-if="pageMode === 'history'" :detail="currentDetail" @back="backToList" />

		<ProjectImportPage
			v-else-if="pageMode === 'import'"
			:error-list="importErrorList"
			:template-loading="templateLoading"
			:import-loading="importLoading"
			@back="backToList"
			@download-template="handleDownloadTemplate"
			@submit-import="handleImportSubmit"
		/>

		<ProjectArchivePage
			v-if="pageMode === 'archive'"
			:detail="currentDetail"
			@back="backToList"
			@submit="handleArchiveSubmit"
		/>
	</div>
</template>

<script setup lang="ts">
import CommonDivider from "@/components/CommonDivider/index.vue"
import CommonTable from "@/components/CommonTable/index.vue"
import Pagination from "@/components/Pagination/index.vue"
import PageTitle from "@/components/PageTitle/index.vue"
import SearchHeader from "@/components/SearchHeader/index.vue"
import {
	addCoopProject,
	// downloadCoopProjectTemplate,
	exportCoopProject,
	getCoopProject,
	getCoopProjectStatistics,
	getCoopProjectStatusOverview,
	// importCoopProject,
	listDictDataByTypes,
	listCoopProject,
	listCoopProjectReports,
	// remindCoopProject,
	restoreCoopProject,
	stopCoopProject,
	submitCoopProjectReport,
	updateCoopProject,
	remindCoopProject,
	downloadCoopProjectTemplate,
	importCoopProject
} from "@/api/system/coopProject"
import type {
	BizCoopProjectDetailVO,
	BizCoopProjectForm,
	BizCoopProjectQuery,
	BizCoopProjectReportVO,
	BizCoopProjectStatisticsVO,
	BizCoopProjectStatusOverviewVO,
	BizCoopProjectVO,
	SysDictDataGroupVO,
	SysDictDataVO
} from "@/api/system/coopProject/types"
import { listPublicUsersByDeptId } from "@/api/system/user"
import type { UserVO } from "@/api/system/user/types"
import { useUserStore } from "@/store/modules/user"
import { checkPermi } from "@/utils/permission"
import { getTaskCompanySelectOptions } from "@/utils/taskCompany"
import { Plus } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import VChart from "vue-echarts"
import { use } from "echarts/core"
import { PieChart } from "echarts/charts"
import { CanvasRenderer } from "echarts/renderers"
import { LegendComponent, TooltipComponent } from "echarts/components"
import { computed, onMounted, ref, watch } from "vue"
import ProjectArchivePage from "./components/ProjectArchivePage.vue"
import ProjectDetailPage from "./components/ProjectDetailPage.vue"
import ProjectFormPage from "./components/ProjectFormPage.vue"
import ProjectHistoryPage from "./components/ProjectHistoryPage.vue"
import ProjectImportPage from "./components/ProjectImportPage.vue"
import ProjectReportPage from "./components/ProjectReportPage.vue"
import {
	createProjectFormData,
	createProjectSearchForm,
	createProjectSearchItems,
	formatCompletionText,
	getProjectStatusTagType,
	getWeeklyStatusTagType,
	projectFollowStatusLabels,
	projectDictTypes,
	projectTableColumns,
	type CooperationProjectItem,
	type CompletionModeKey,
	type ProjectFormData,
	type ProjectPageMode,
	type ProjectReportFormData,
	type ProjectSearchForm,
	type ProjectStatusKey,
	type ProjectWeeklyReportItem,
	type ProjectOption,
	type WeeklyStatusKey
} from "./config.js"

use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent])

const userStore = useUserStore()
const isGeneralUser = computed(() => userStore.roles.some((role) => role.includes("FZR_employ")))
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const sourceList = ref<CooperationProjectItem[]>([])
const searchFormItems = ref(createProjectSearchItems({ showBusinessUnitSearch: !isGeneralUser.value }))
const searchFormData = ref<ProjectSearchForm>(createProjectSearchForm())
const pageMode = ref<ProjectPageMode>("list")
const currentDetail = ref<CooperationProjectItem | null>(null)
const editingFormData = ref<ProjectFormData | null>(null)
const importErrorList = ref([])
const categoryOptions = ref<ProjectOption[]>([])
const directionOptions = ref<ProjectOption[]>([])
const finishTimeOptions = ref<ProjectOption[]>([])
const situationOptions = ref<ProjectOption[]>([])
const reportStatusOptions = ref<ProjectOption[]>([])
const projectStatusOptions = ref<ProjectOption[]>([])
const companyOptions = ref<ProjectOption[]>([])
const userOptions = ref<ProjectOption[]>([])
const situationValueMap = ref<Record<string, string>>({})
const situationLabelMap = ref<Record<string, string>>({})
const statisticsData = ref<BizCoopProjectStatisticsVO | null>(null)
const statusOverview = ref<BizCoopProjectStatusOverviewVO | null>(null)
const listLoading = ref(false)
const formLoading = ref(false)
const userLoading = ref(false)
const reportLoading = ref(false)
const templateLoading = ref(false)
const importLoading = ref(false)

const isStrategicAdmin = computed(() => userStore.roles.includes("StrategicAdmin"))
const projectTableHeight = computed(() => (isStrategicAdmin.value ? "100%" : undefined))

const searchHeaderItems = computed(() =>
	searchFormItems.value.map((item) => ({
		...item,
		value: searchFormData.value[item.key as keyof ProjectSearchForm] ?? ""
	}))
)

watch(isGeneralUser, (value) => {
	if (value) searchFormData.value.businessUnitId = null
	refreshProjectSearchItems()
})

const baseRoleList = computed(() => {
	return sourceList.value
})

const baseFilteredList = computed(() => {
	return baseRoleList.value
})

const filteredList = computed(() => {
	return baseFilteredList.value
})

type CommonTableFixed = boolean | "left" | "right"

interface ProjectTableColumn {
	prop?: string
	dataIndex?: string
	label: string
	minWidth?: string | number
	width?: string | number
	slotName?: string
	showOverflowTooltip?: boolean
	fixed?: CommonTableFixed
	className?: string
}

function normalizeTableFixed(fixed?: string | boolean): CommonTableFixed | undefined {
	if (fixed === true || fixed === false || fixed === "left" || fixed === "right") return fixed
	return undefined
}

interface ProjectActionItem {
	label: string
	permission: string
}

function getProjectOperationActions(row: Pick<CooperationProjectItem, "projectStatusName">): ProjectActionItem[] {
	const actions: ProjectActionItem[] = [{ label: "编辑", permission: "base:coopProject:add" }]
	if (row.projectStatusName.includes(projectFollowStatusLabels.draft)) return actions

	if (isProjectOngoing(row)) actions.push({ label: "填报周报", permission: "base:coopProject:report" })
	actions.push({ label: "周报历史", permission: "base:coopProject:reportHistory" })
	actions.push({ label: "详情", permission: "base:coopProject:query" })
	actions.push({
		label: row.projectStatusName.includes(projectFollowStatusLabels.ongoing) ? "停止跟进" : "恢复跟进",
		permission: row.projectStatusName.includes(projectFollowStatusLabels.ongoing)
			? "base:coopProject:stopProject"
			: "base:coopProject:restoreProject"
	})

	return actions
}

function getVisibleProjectOperationActions(row: CooperationProjectItem) {
	return getProjectOperationActions(row).filter((action) => checkPermi([action.permission]))
}

const operationColumnWidth = computed(() => {
	const maxActions = filteredList.value.reduce<ProjectActionItem[]>((result, row) => {
		const actions = getVisibleProjectOperationActions(row)
		return actions.length > result.length ? actions : result
	}, [])
	if (!maxActions.length) return 72

	// 操作列按当前可见按钮估算宽度，避免权限较少时仍占用最大宽度。
	const textWidth = maxActions.reduce((sum, action) => sum + action.label.length * 14, 0)
	const gapWidth = Math.max(maxActions.length - 1, 0) * 12
	return Math.max(72, textWidth + gapWidth + 32)
})

const commonProjectTableColumns = computed<ProjectTableColumn[]>(() => [
	// 兼容旧 TableList 的 dataIndex 配置，避免业务列定义重复维护。
	...projectTableColumns.map((column) => ({
		...column,
		prop: column.dataIndex,
		fixed: normalizeTableFixed(column.fixed),
		...(column.dataIndex === "operation"
			? {
					minWidth: operationColumnWidth.value,
					width: operationColumnWidth.value
				}
			: {})
	}))
])

const dashboardData = computed(() => {
	const ongoingCount = statusOverview.value?.inProgressCount || 0
	const archivedCount = statusOverview.value?.stoppedCount || 0
	const overdueCount = statisticsData.value?.overdueCount || 0
	return {
		cards: [
			{ key: "total", label: "合作项目总数", value: ongoingCount + archivedCount, desc: "覆盖当前全量合作项目台账" },
			{ key: "ongoing", label: "推进中项目", value: ongoingCount, desc: "本周保持活跃跟进的项目数量" },
			{ key: "archived", label: "停止/归档项目", value: archivedCount, desc: "已停止或完成归档的项目数量" },
			{ key: "overdue", label: "周报逾期项目", value: overdueCount, desc: "最新填报时间早于本周一 00:00" }
		],
		companyDistribution: (statisticsData.value?.businessUnitLoad || []).map((item) => ({
			name: item.name || "-",
			value: item.count || 0
		})),
		typeDistribution: (statisticsData.value?.categoryDistribution || []).map((item) => ({
			name: item.name || "-",
			value: item.count || 0
		}))
	}
})

const completionModeByApiValue: Record<number, CompletionModeKey> = {
	1: "date",
	2: "month",
	3: "quarter"
}

const apiValueByCompletionMode: Partial<Record<CompletionModeKey, number>> = {
	date: 1,
	month: 2,
	quarter: 3
}

function getOptionLabel(options: ProjectOption[], value?: string | number, defaultLabel = "-") {
	const matchedOption = options.find((item) => String(item.value) === String(value))
	return matchedOption?.label || defaultLabel
}

function getCompanyNameById(businessUnitId?: string | number | null) {
	if (!businessUnitId) return ""
	return companyOptions.value.find((item) => String(item.value) === String(businessUnitId))?.label || ""
}

function mapDictOptions(
	dictList: SysDictDataVO[] | undefined,
	valueMapper?: (value: string) => string
): ProjectOption[] {
	return (dictList || []).map((item) => {
		const rawValue = item.dictValue || ""
		return {
			label: item.dictLabel || rawValue,
			value: valueMapper ? valueMapper(rawValue) : rawValue
		}
	})
}

function refreshProjectSearchItems() {
	searchFormItems.value = createProjectSearchItems({
		projectTypeOptions: categoryOptions.value,
		cooperationDirectionOptions: directionOptions.value,
		companyOptions: companyOptions.value,
		situationTagOptions: situationOptions.value,
		reportStatusOptions: reportStatusOptions.value,
		projectStatusOptions: projectStatusOptions.value,
		showBusinessUnitSearch: !isGeneralUser.value
	})
}

function getDictList(groups: SysDictDataGroupVO[], dictType: string) {
	return groups.find((item) => item.dictType === dictType)?.dictDataList || []
}

function stringifyProjectRemark(formData: ProjectFormData) {
	return formData.remark
}

function isCurrentWeekMissing(dateText?: string) {
	if (!dateText) return true
	const reportDate = new Date(dateText)
	if (Number.isNaN(reportDate.getTime())) return false
	const today = new Date()
	const day = today.getDay() || 7
	const weekStart = new Date(today)
	weekStart.setDate(today.getDate() - day + 1)
	weekStart.setHours(0, 0, 0, 0)
	return reportDate < weekStart
}

function mapReportToPageItem(item: BizCoopProjectReportVO): ProjectWeeklyReportItem {
	const situationFlag = item.situationFlag ? String(item.situationFlag) : ""
	const situationFlagName = situationLabelMap.value[situationFlag] || "-"
	return {
		id: String(item.id || ""),
		weekLabel: item.reportYear && item.reportWeek ? `${item.reportYear}年第${item.reportWeek}周` : "-",
		reportDate: item.updateTime || "",
		statusTag: situationFlagName,
		progressSummary: item.weeklyProgress || "",
		situationFlag,
		situationFlagName,
		currentStatus: situationFlagName,
		nextPlan: item.nextPlan || "",
		reporter: item.reporterName || "-"
	}
}

function getReportSortValue(item: BizCoopProjectReportVO) {
	if (item.reportYear && item.reportWeek) return item.reportYear * 100 + item.reportWeek
	const reportTime = new Date(item.updateTime || "").getTime()
	return Number.isNaN(reportTime) ? 0 : reportTime
}

function mapProjectToPageItem(item: BizCoopProjectVO | BizCoopProjectDetailVO): CooperationProjectItem {
	const projectType = item.cooperationCategory ? String(item.cooperationCategory) : ""
	const completionMode = completionModeByApiValue[item.finishTimeType || 0] || ""
	const projectStatus: ProjectStatusKey =
		item.followStatus !== undefined && item.followStatus !== null ? String(item.followStatus) : ""
	const projectStatusName = getOptionLabel(projectStatusOptions.value, projectStatus, projectStatus || "-")
	const reports = "reports" in item ? (item.reports || []).map(mapReportToPageItem) : []
	const timeline =
		"logs" in item
			? (item.logs || []).map((logItem) => ({
					id: String(logItem.id || ""),
					step: logItem.logTitle || "项目动态",
					result: logItem.logType ? `类型${logItem.logType}` : "-",
					operator: logItem.operatorName || "-",
					time: logItem.operationTime || "",
					content: logItem.logContent || ""
				}))
			: []
	const isOverdue =
		projectStatusName.includes(projectFollowStatusLabels.ongoing) && isCurrentWeekMissing(item.latestReportDate)
	const weeklyStatus: WeeklyStatusKey = item.latestReportDate ? (isOverdue ? "overdue" : "normal") : "notStarted"

	return {
		id: String(item.id || ""),
		projectNo: item.projectNo || "-",
		projectName: item.projectName || "-",
		companyName: item.businessUnitName || "-",
		businessUnitId: item.businessUnitId ? String(item.businessUnitId) : "",
		partnerName: item.partnerName || "-",
		cooperationDirection: item.cooperationDirection ? String(item.cooperationDirection) : "",
		cooperationDirectionName: getOptionLabel(
			directionOptions.value,
			item.cooperationDirection,
			item.cooperationDirection ? String(item.cooperationDirection) : "-"
		),
		projectType,
		projectTypeName: getOptionLabel(categoryOptions.value, projectType),
		responsiblePersonId: item.bdgLiaisonId ? String(item.bdgLiaisonId) : "",
		responsiblePerson: item.bdgLiaisonName || "-",
		liaisonName: item.enterpriseLiaison || "-",
		completionMode,
		completionModeName: getOptionLabel(finishTimeOptions.value, completionMode),
		completionDate: completionMode === "date" ? item.finishTimeValue || "" : "",
		completionMonth: completionMode === "month" ? item.finishTimeValue || "" : "",
		completionQuarter: completionMode === "quarter" ? item.finishTimeValue || "持续型" : "",
		projectStatus,
		projectStatusName,
		weeklyStatus,
		weeklyStatusName: weeklyStatus === "normal" ? "正常" : weeklyStatus === "overdue" ? "本周未更新" : "未填报",
		latestReportDate: item.latestReportDate || "",
		latestProgress: item.latestWeeklyProgress || "",
		currentSituationTag: situationLabelMap.value[String(item.latestSituationFlag || "")] || "-",
		nextPlan: item.latestNextPlan || "",
		contentGoal: item.contentGoal || "",
		remark: item.remark || "",
		stopReason: item.stopReason || "",
		stopTime: item.stopTime || "",
		isOverdue,
		createdTime: item.createTime || "",
		updatedTime: item.updateTime || "",
		reports,
		timeline
	}
}

function buildListQuery(): BizCoopProjectQuery {
	const businessUnitId = isGeneralUser.value ? null : searchFormData.value.businessUnitId
	const query: BizCoopProjectQuery = {
		deptId: userStore.deptId || undefined,
		pageNum: currentPage.value,
		pageSize: pageSize.value,
		keyword: searchFormData.value.keyword || undefined,
		businessUnitId: businessUnitId || undefined,
		businessUnitName: getCompanyNameById(businessUnitId) || undefined,
		partnerName: searchFormData.value.partnerName || undefined,
		cooperationDirection: searchFormData.value.cooperationDirection
			? Number(searchFormData.value.cooperationDirection)
			: undefined,
		cooperationCategory: searchFormData.value.projectType ? Number(searchFormData.value.projectType) : undefined,
		latestSituationFlag: searchFormData.value.currentSituationTag
			? Number(situationValueMap.value[searchFormData.value.currentSituationTag])
			: undefined,
		reportStatus: searchFormData.value.weeklyStatus ? Number(searchFormData.value.weeklyStatus) : undefined
	}
	// 顶部 tabs 已隐藏，列表查询只保留搜索条件中的跟进状态筛选。
	if (searchFormData.value.projectStatus) query.followStatus = Number(searchFormData.value.projectStatus)
	return query
}

function buildProjectPayload(formData: ProjectFormData): BizCoopProjectForm {
	return {
		id: formData.id,
		projectNo: formData.projectNo,
		projectName: formData.projectName,
		partnerName: formData.partnerName,
		cooperationDirection: formData.cooperationDirection ? Number(formData.cooperationDirection) : undefined,
		cooperationCategory: formData.projectType ? Number(formData.projectType) : undefined,
		finishTimeType: apiValueByCompletionMode[formData.completionMode],
		finishTimeValue: formData.finishTimeValue,
		businessUnitId: formData.businessUnitId,
		businessUnitName: formData.companyName || getCompanyNameById(formData.businessUnitId),
		bdgLiaisonId: formData.responsiblePersonId,
		bdgLiaisonName: formData.responsiblePerson,
		enterpriseLiaison: formData.liaisonName,
		contentGoal: formData.contentGoal,
		followStatus: formData.followStatus ? Number(formData.followStatus) : undefined,
		remark: stringifyProjectRemark(formData)
	}
}

function getCssVar(name: string) {
	return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function createDashboardPieLegendOption() {
	return {
		type: "scroll",
		left: 24,
		right: 24,
		bottom: 0,
		height: 24,
		icon: "roundRect",
		itemWidth: 18,
		itemHeight: 10,
		itemGap: 18,
		textStyle: { color: "#606266" }
	}
}

function createDashboardPieLayoutOption() {
	return {
		top: 4,
		bottom: 52,
		radius: ["42%", "66%"],
		center: ["50%", "48%"],
		avoidLabelOverlap: true,
		labelLine: { length: 14, length2: 24 },
		labelLayout: { hideOverlap: true }
	}
}

const companyPieOption = computed(() => ({
	tooltip: { trigger: "item" },
	legend: createDashboardPieLegendOption(),
	series: [
		{
			type: "pie",
			...createDashboardPieLayoutOption(),
			itemStyle: { borderRadius: 10, borderColor: "#fff", borderWidth: 2 },
			label: { formatter: "{b}\n{c}" },
			data: dashboardData.value.companyDistribution,
			color: [
				getCssVar("--el-color-primary"),
				getCssVar("--el-color-success"),
				getCssVar("--el-color-warning"),
				getCssVar("--el-color-danger")
			]
		}
	]
}))

const typePieOption = computed(() => ({
	tooltip: { trigger: "item" },
	legend: createDashboardPieLegendOption(),
	series: [
		{
			type: "pie",
			...createDashboardPieLayoutOption(),
			itemStyle: { borderRadius: 10, borderColor: "#fff", borderWidth: 2 },
			label: { formatter: "{b}\n{d}%" },
			data: dashboardData.value.typeDistribution,
			color: ["#1677ff", "#00b46e", "#ff9f2e", "#7a5af8"]
		}
	]
}))

function handlePagination(data: { page: number; limit: number }) {
	currentPage.value = data.page
	pageSize.value = data.limit
	fetchProjectList()
}

onMounted(async () => {
	await Promise.all([fetchDictOptions(), fetchCompanyOptions()])
	refreshDashboardData()
	fetchProjectList()
})

function onSearch(value: ProjectSearchForm) {
	searchFormData.value = { ...value }
	currentPage.value = 1
	fetchProjectList()
}

function onReset(value: ProjectSearchForm) {
	searchFormData.value = { ...value }
	currentPage.value = 1
	fetchProjectList()
}

async function fetchProjectList() {
	listLoading.value = true
	try {
		const res = (await listCoopProject(buildListQuery())) as unknown as { rows?: BizCoopProjectVO[]; total?: number }
		sourceList.value = (res.rows || []).map(mapProjectToPageItem)
		total.value = res.total || 0
	} finally {
		listLoading.value = false
	}
}

async function fetchDictOptions() {
	const dictTypes = Object.values(projectDictTypes)
	const res = (await listDictDataByTypes(dictTypes)) as unknown as
		| { data?: SysDictDataGroupVO[] }
		| SysDictDataGroupVO[]
	const groups = Array.isArray(res) ? res : res.data || []
	const nextCategoryOptions = mapDictOptions(getDictList(groups, projectDictTypes.projectCategory))
	const nextFinishTimeOptions = mapDictOptions(
		getDictList(groups, projectDictTypes.finishTimeType),
		(value) => completionModeByApiValue[Number(value)] || value
	)
	const nextDirectionOptions = mapDictOptions(getDictList(groups, projectDictTypes.projectDirection))
	const nextReportStatusOptions = mapDictOptions(getDictList(groups, projectDictTypes.reportStatus))
	const nextProjectStatusOptions = mapDictOptions(getDictList(groups, projectDictTypes.followStatus))
	if (nextCategoryOptions.length) categoryOptions.value = nextCategoryOptions
	if (nextFinishTimeOptions.length) finishTimeOptions.value = nextFinishTimeOptions
	if (nextDirectionOptions.length) directionOptions.value = nextDirectionOptions
	if (nextReportStatusOptions.length) reportStatusOptions.value = nextReportStatusOptions
	if (nextProjectStatusOptions.length) projectStatusOptions.value = nextProjectStatusOptions
	// 现状标识在页面模型里使用 label，提交前再通过字典反查 dictValue。
	const situationDictList = getDictList(groups, projectDictTypes.situationFlag)
	if (situationDictList.length) {
		situationValueMap.value = Object.fromEntries(
			situationDictList.map((item) => [item.dictLabel || "", item.dictValue || ""])
		)
		situationLabelMap.value = Object.fromEntries(
			situationDictList.map((item) => [item.dictValue || "", item.dictLabel || ""])
		)
		situationOptions.value = mapDictOptions(situationDictList, (_value) => "").map((item) => ({
			label: item.label,
			value: item.label
		}))
	}
	refreshProjectSearchItems()
}

async function fetchCompanyOptions() {
	const options = await getTaskCompanySelectOptions()
	companyOptions.value = options.map((item) => ({
		label: item.label,
		value: String(item.value)
	}))
	refreshProjectSearchItems()
}

async function fetchUserOptions(deptId?: string | number) {
	if (!deptId) {
		userOptions.value = []
		return
	}
	userLoading.value = true
	try {
		const res = (await listPublicUsersByDeptId(deptId)) as unknown as { data?: UserVO[] } | UserVO[]
		const list = Array.isArray(res) ? res : res.data || []
		userOptions.value = list.map((item) => ({
			label: item.nickName || item.userName,
			value: String(item.userId)
		}))
	} finally {
		userLoading.value = false
	}
}

async function fetchDashboardData() {
	const [statisticsRes, overviewRes] = await Promise.all([getCoopProjectStatistics(), getCoopProjectStatusOverview()])
	const statisticsPayload = statisticsRes as unknown as {
		data?: BizCoopProjectStatisticsVO
	} & BizCoopProjectStatisticsVO
	const overviewPayload = overviewRes as unknown as {
		data?: BizCoopProjectStatusOverviewVO
	} & BizCoopProjectStatusOverviewVO
	statisticsData.value = statisticsPayload.data || statisticsPayload
	statusOverview.value = overviewPayload.data || overviewPayload
}

async function refreshDashboardData() {
	if (!isStrategicAdmin.value) return
	await fetchDashboardData()
}

async function fetchProjectDetail(id: string | number) {
	const res = (await getCoopProject(id)) as unknown as { data?: BizCoopProjectDetailVO } & BizCoopProjectDetailVO
	const detail = mapProjectToPageItem(res.data || res)
	currentDetail.value = detail
	updateListItem(detail)
	return detail
}

async function fetchProjectReports(row: CooperationProjectItem) {
	const res = (await listCoopProjectReports(row.id)) as unknown as
		| { data?: BizCoopProjectReportVO[] }
		| BizCoopProjectReportVO[]
	const reports = Array.isArray(res) ? res : res.data || []
	const detail = {
		...row,
		reports: [...reports].sort((a, b) => getReportSortValue(b) - getReportSortValue(a)).map(mapReportToPageItem)
	}
	currentDetail.value = detail
	updateListItem(detail)
	return detail
}

function openCreatePage() {
	editingFormData.value = createProjectFormData()
	userOptions.value = []
	pageMode.value = "create"
}

async function openEditPage(row: CooperationProjectItem) {
	const detail = await fetchProjectDetail(row.id)
	editingFormData.value = buildFormDataFromDetail(detail)
	await fetchUserOptions(detail.businessUnitId)
	pageMode.value = "edit"
}

async function openDetailPage(row: CooperationProjectItem) {
	await fetchProjectDetail(row.id)
	pageMode.value = "detail"
}

function isProjectOngoing(row: Pick<CooperationProjectItem, "projectStatusName">) {
	return row.projectStatusName.includes(projectFollowStatusLabels.ongoing)
}

async function openReportPage(row: CooperationProjectItem) {
	if (!isProjectOngoing(row)) {
		ElMessage.warning("只有进行中的项目才能填写周报")
		return
	}
	await fetchProjectReports(row)
	pageMode.value = "report"
}

async function openHistoryPage(row: CooperationProjectItem) {
	await fetchProjectReports(row)
	pageMode.value = "history"
}

function openImportPage() {
	pageMode.value = "import"
}

function openArchivePage(row: CooperationProjectItem) {
	currentDetail.value = row
	pageMode.value = "archive"
}

function backToList() {
	pageMode.value = "list"
}

async function handleBusinessUnitChange(deptId: string) {
	await fetchUserOptions(deptId)
}

function buildFormDataFromDetail(item: CooperationProjectItem): ProjectFormData {
	return {
		id: item.id,
		projectNo: item.projectNo,
		projectName: item.projectName,
		companyName: item.companyName,
		businessUnitId: item.businessUnitId,
		partnerName: item.partnerName,
		cooperationDirection: item.cooperationDirection,
		projectType: item.projectType,
		responsiblePersonId: item.responsiblePersonId,
		responsiblePerson: item.responsiblePerson,
		liaisonName: item.liaisonName,
		completionMode: item.completionMode,
		finishTimeValue: formatCompletionText(item),
		followStatus: item.projectStatus || "",
		contentGoal: item.contentGoal,
		remark: item.remark
	}
}

function updateListItem(nextItem: CooperationProjectItem) {
	const targetIndex = sourceList.value.findIndex((item) => item.id === nextItem.id)
	if (targetIndex === -1) {
		sourceList.value = [nextItem, ...sourceList.value]
		return
	}
	sourceList.value.splice(targetIndex, 1, nextItem)
	sourceList.value = [...sourceList.value]
}

async function handleSaveDraft(formData: ProjectFormData) {
	formLoading.value = true
	try {
		const payload = buildProjectPayload(formData)
		if (formData.id) {
			await updateCoopProject(payload)
		} else {
			await addCoopProject(payload)
		}
		pageMode.value = "list"
		await refreshDashboardData()
		await fetchProjectList()
		ElMessage.success("草稿已保存")
	} finally {
		formLoading.value = false
	}
}

async function handleSubmitProject(formData: ProjectFormData) {
	formLoading.value = true
	try {
		const payload = buildProjectPayload(formData)
		if (formData.id) {
			await updateCoopProject(payload)
		} else {
			await addCoopProject(payload)
		}
		pageMode.value = "list"
		await refreshDashboardData()
		await fetchProjectList()
		ElMessage.success(formData.id ? "项目已更新" : "项目已创建")
	} finally {
		formLoading.value = false
	}
}

async function handleSubmitReport(formData: ProjectReportFormData) {
	if (!currentDetail.value) return
	const situationFlag = situationValueMap.value[formData.currentSituationTag]
	reportLoading.value = true
	try {
		await submitCoopProjectReport(currentDetail.value.id, {
			situationFlag: situationFlag ? Number(situationFlag) : undefined,
			weeklyProgress: formData.progressSummary,
			nextPlan: formData.nextPlan
		})
		await refreshDashboardData()
		await fetchProjectList()
		pageMode.value = "list"
		ElMessage.success("周报已提交")
	} finally {
		reportLoading.value = false
	}
}

async function handleArchiveSubmit(reasonText: string) {
	if (!currentDetail.value) return
	if (!currentDetail.value.projectStatusName.includes(projectFollowStatusLabels.ongoing)) {
		await restoreCoopProject(currentDetail.value.id)
		await refreshDashboardData()
		await fetchProjectList()
		pageMode.value = "list"
		ElMessage.success("项目已恢复跟进")
		return
	}
	if (!reasonText.trim()) {
		ElMessage.warning("请输入停止跟进原因")
		return
	}
	await stopCoopProject(currentDetail.value.id, { stopReason: reasonText })
	await refreshDashboardData()
	await fetchProjectList()
	pageMode.value = "list"
	ElMessage.success("项目已停止跟进")
}

async function handleDownloadTemplate() {
	templateLoading.value = true
	try {
		await downloadCoopProjectTemplate()
	} finally {
		templateLoading.value = false
	}
}

async function handleImportSubmit(file: File) {
	importLoading.value = true
	try {
		const formData = new FormData()
		formData.append("file", file)
		await importCoopProject(formData)
		await refreshDashboardData()
		await fetchProjectList()
		pageMode.value = "list"
		ElMessage.success("项目导入已提交")
	} finally {
		importLoading.value = false
	}
}

async function handleExport() {
	await exportCoopProject(buildListQuery())
}

async function handleRemind() {
	await remindCoopProject()
	ElMessage.success("已触发一键催报")
}
</script>

<style scoped lang="scss">
.project-page {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.tabs-header-row {
	display: flex;
	margin-bottom: 16px;
	flex-shrink: 0;
}

.project-panel {
	display: flex;
	flex: 1;
	min-height: 0;
	flex-direction: column;
	padding: 30px;
	border-radius: 20px;
	background: #fff;
	overflow: hidden;
}

.project-content-scroll {
	display: flex;
	flex: 1;
	min-height: 0;
	flex-direction: column;
	overflow: hidden;
	padding-right: 0.25rem;
}

.project-content-scroll--with-dashboard {
	overflow-y: auto;
}

.title-and-search-panel {
	display: flex;
	flex-direction: column;
	flex-shrink: 0;
}

.title-row-container {
	display: flex;
	align-items: center;
}

.dashboard-panel {
	flex-shrink: 0;
	margin-bottom: 1rem;
}

.dashboard-cards {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 1rem;
	margin-bottom: 1rem;
}

.dashboard-card {
	padding: 1rem 1.125rem;
	border-radius: 1rem;
	background: linear-gradient(135deg, rgba(0, 180, 110, 0.08), rgba(22, 119, 255, 0.05));
}

.dashboard-card__label {
	color: #6b7795;
	font-size: 0.875rem;
}

.dashboard-card__value {
	margin-top: 0.625rem;
	color: #172b4d;
	font-size: 1.75rem;
	font-weight: 700;
}

.dashboard-card__desc {
	margin-top: 0.5rem;
	color: #4e5969;
	font-size: 0.8125rem;
	line-height: 1.6;
}

.dashboard-chart-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1rem;
	margin-bottom: 1rem;
}

.dashboard-chart-card {
	padding: 1rem 1.25rem;
	border-radius: 1rem;
	background: #f8fafc;
}

.dashboard-chart-card__title {
	color: #172b4d;
	font-size: 1rem;
	font-weight: 600;
}

.dashboard-chart {
	height: 16rem;
}

.project-toolbar {
	display: flex;
	align-items: center;
	gap: 1rem;
	margin-bottom: 18px;
	flex-shrink: 0;
}

.project-toolbar__left {
	display: inline-flex;
	align-items: center;
	gap: 0.75rem;
	flex-wrap: wrap;
}

.project-table-wrapper {
	display: flex;
	flex-direction: column;
	flex: 1;
	min-height: 0;
	overflow: hidden;
	margin-bottom: 16px;

	:deep(.el-table__inner-wrapper),
	:deep(.el-table__body-wrapper) {
		min-height: 0;
	}

	:deep(.el-table__body-wrapper) {
		overflow-x: auto !important;
	}
}

.project-content-scroll--with-dashboard .project-table-wrapper {
	position: sticky;
	top: 0;
	z-index: 1;
	flex: 0 0 calc(100% - 64px);
	height: calc(100% - 64px);
	min-height: 320px;
	background: #fff;

	:deep(.el-table) {
		height: 100%;
	}
}

.project-content-scroll--with-dashboard .project-pagination {
	position: sticky;
	bottom: 0;
	z-index: 2;
	background: #fff;
}

.project-pagination {
	display: flex;
	justify-content: flex-end;
	flex-shrink: 0;
	padding-top: 4px;
}

.project-table-wrapper :deep(.project-operation-column .cell) {
	overflow: visible;
	text-overflow: clip;
	white-space: nowrap;
}

.table-actions {
	display: inline-flex;
	align-items: center;
	gap: 0.75rem;
	white-space: nowrap;
}

.table-actions :deep(.el-button + .el-button) {
	margin-left: 0;
}

@media (max-width: 1200px) {
	.dashboard-cards,
	.dashboard-chart-grid {
		grid-template-columns: 1fr;
	}

	.project-toolbar {
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>
