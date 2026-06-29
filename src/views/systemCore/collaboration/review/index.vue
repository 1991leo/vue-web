<template>
	<div class="review-page">
		<template v-if="pageMode === 'list'">
			<div class="review-panel">
				<div class="title-and-search-panel">
					<div class="title-row-container">
						<PageTitle title="经营事项评审" />
					</div>
					<SearchHeader
						:formItems="searchFormItems"
						searchButtonText="搜索"
						resetButtonText="重置"
						@form-data-change="applySearchForm"
						@form-data-reset="applySearchForm"
					/>
				</div>

				<CommonDivider :offset="30" />

				<div class="review-toolbar">
					<div class="review-toolbar__left">
						<el-button v-hasPermi="['base:businessMatters:add']" type="primary" :icon="Plus" @click="openCreatePage"
							>新建申请</el-button
						>
						<el-button v-hasPermi="['base:businessMatters:export']" plain :loading="exportLoading" @click="handleExport"
							>导出</el-button
						>
					</div>
				</div>
				<div class="review-table-wrapper">
					<CommonTable
						:columns="reviewTableColumns"
						:data="displayList"
						:showIndexColumn="true"
						:loading="listLoading"
						maxHeight="100%"
					>
						<template #projectName="{ row }">
							<div class="project-cell">
								<div class="project-cell__title">{{ row.projectName }}</div>
								<div class="project-cell__sub">{{ row.applicationNo }}</div>
							</div>
						</template>

						<template #operation="{ row }">
							<div class="table-actions">
								<el-button link type="primary" @click="openDetailPage(row)">详情</el-button>
								<el-button
									v-hasPermi="['base:businessMatters:add']"
									v-if="isDraftRow(row)"
									link
									type="primary"
									@click="openEditPage(row)"
									>编辑</el-button
								>
								<el-button
									v-hasPermi="['base:businessMatters:handle']"
									v-else-if="canHandleRow(row)"
									link
									type="primary"
									@click="openHandlePage(row)"
								>
									处理
								</el-button>
							</div>
						</template>
					</CommonTable>
				</div>

				<div class="review-pagination">
					<Pagination
						v-show="paginationData.total > 0"
						v-model:current-page="currentPage"
						v-model:page-size="pageSize"
						:total="paginationData.total"
						paginationType="success"
						@pagination="handlePagination"
					/>
				</div>
			</div>
		</template>

		<ReviewFormPage
			v-else-if="pageMode === 'create' || pageMode === 'edit'"
			:mode="pageMode"
			:initial-data="editingFormData"
			:detail="currentDetail"
			:loading="submitLoading"
			:show-delete-button="showEditDeleteButton"
			@back="backToList"
			@delete="handleDeleteCurrent"
			@save-draft="handleSaveDraft"
			@submit="handleSubmitApplication"
		/>

		<ReviewDetailPage
			v-else-if="pageMode === 'detail'"
			:detail="currentDetail"
			:show-process-button="showDetailProcessButton"
			@back="backToList"
			@process="handleDetailProcess"
		/>

		<ReviewHandlePage
			v-else-if="pageMode === 'handle'"
			:detail="currentDetail"
			:loading="handleLoading"
			@back="backToList"
			@submit-material="handleSubmitMaterial"
			@submit-opinion="handleSubmitOpinion"
		/>
	</div>
</template>

<script setup lang="ts">
import {
	approveBusinessMatters,
	deleteBusinessMatters,
	exportBusinessMatters,
	getBusinessMattersDetail,
	getBusinessMattersList,
	saveBusinessMatters,
	submitBusinessMatters
} from "@/api/system/review"
import type {
	BizBusinessMattersApproveBo,
	BizBusinessMattersBo,
	BizBusinessMattersVo,
	BusinessMattersListQuery
} from "@/api/system/review/types"
import CommonDivider from "@/components/CommonDivider/index.vue"
import CommonTable from "@/components/CommonTable/index.vue"
import DictTag from "@/components/DictTag/index.vue"
import Pagination from "@/components/Pagination/index.vue"
import PageTitle from "@/components/PageTitle/index.vue"
import SearchHeader from "@/components/SearchHeader/index.vue"
import { useUserStore } from "@/store/modules/user"
import { Plus } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { computed, getCurrentInstance, onMounted, ref, toRefs, watch, type ComponentInternalInstance } from "vue"
import ReviewDetailPage from "./components/ReviewDetailPage.vue"
import ReviewFormPage from "./components/ReviewFormPage.vue"
import ReviewHandlePage from "./components/ReviewHandlePage.vue"
import {
	buildReviewSearchItemOptions,
	buildReviewFormDataFromDetail,
	createReviewFormData,
	createReviewSearchForm,
	createReviewSearchItems,
	getReviewBusinessTypeCode,
	hasReviewHandlePermission,
	isReviewEditableStatus,
	reviewTableColumns,
	type ReviewAttachmentItem,
	type ReviewFormData,
	type ReviewSearchForm
} from "./config.js"

type ReviewPageMode = "list" | "create" | "edit" | "detail" | "handle"
type ReviewRowIdentity = Pick<BizBusinessMattersVo, "id" | "status" | "statusName" | "currentTaskHandlerList">
type ReviewApprovePayload = {
	result: number
	comment?: string
	coSignDeptIdList?: number[]
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance
const { business_matters_status } = toRefs<any>(proxy?.useDict("business_matters_status"))
const userStore = useUserStore()
const currentPage = ref(1)
const pageSize = ref(20)
const searchFormItems = ref(createReviewSearchItems())
const searchFormData = ref<ReviewSearchForm>(createReviewSearchForm())
const pageMode = ref<ReviewPageMode>("list")
const listLoading = ref(false)
const submitLoading = ref(false)
const handleLoading = ref(false)
const exportLoading = ref(false)
const listRows = ref<BizBusinessMattersVo[]>([])
const listTotal = ref(0)
const currentDetail = ref<BizBusinessMattersVo | null>(null)
const editingFormData = ref<ReviewFormData | null>(null)
const currentDetailCanHandle = ref(false)

const currentUserId = computed(() => userStore.userId)
const reviewStatusOptions = computed<DictDataOption[]>(() =>
	Array.isArray(business_matters_status.value) ? business_matters_status.value : []
)
const displayList = computed(() => listRows.value)

const paginationData = computed(() => ({
	pageNum: currentPage.value,
	pageSize: pageSize.value,
	total: listTotal.value
}))

const canHandleRow = (row: BizBusinessMattersVo | null | undefined) =>
	hasReviewHandlePermission(row, currentUserId.value)
const showDetailProcessButton = computed(() => !!currentDetail.value && currentDetailCanHandle.value)
const showEditDeleteButton = computed(
	() => !!currentDetail.value && currentDetailCanHandle.value && isReviewEditableStatus(currentDetail.value)
)

const buildListQuery = (): BusinessMattersListQuery => {
	const dateRange = Array.isArray(searchFormData.value.applicationDateRange)
		? searchFormData.value.applicationDateRange
		: []
	return {
		pageNum: currentPage.value,
		pageSize: pageSize.value,
		projectName: searchFormData.value.projectName || undefined,
		applicantEnterpriseName: searchFormData.value.applicantEnterpriseName || undefined,
		beginApplicationDate: dateRange[0] || undefined,
		endApplicationDate: dateRange[1] || undefined,
		status: searchFormData.value.status ?? undefined
	}
}

const fetchList = async () => {
	listLoading.value = true
	try {
		const res = await getBusinessMattersList(buildListQuery())
		listRows.value = Array.isArray(res.rows) ? res.rows : []
		listTotal.value = res.total || 0
	} finally {
		listLoading.value = false
	}
}

const fetchDetail = async (id?: string | number) => {
	if (id === undefined || id === null) return null
	const res = await getBusinessMattersDetail(id)
	currentDetail.value = res.data || null
	return currentDetail.value
}

const syncSearchItemOptions = () => {
	buildReviewSearchItemOptions(searchFormItems.value, {
		status: reviewStatusOptions.value
	})
}

async function handlePagination(data: { page: number; limit: number }) {
	currentPage.value = data.page
	pageSize.value = data.limit
	await fetchList()
}

async function applySearchForm(value: ReviewSearchForm) {
	searchFormData.value = { ...value }
	currentPage.value = 1
	await fetchList()
}

function openCreatePage() {
	currentDetail.value = null
	pageMode.value = "create"
	editingFormData.value = createReviewFormData()
}

async function openPageWithDetail(row: ReviewRowIdentity, mode: Exclude<ReviewPageMode, "list" | "create">) {
	currentDetailCanHandle.value = canHandleRow(row)
	const detail = await fetchDetail(row.id)
	if (!detail) return
	if (mode === "edit") {
		editingFormData.value = buildReviewFormDataFromDetail(detail)
	}
	pageMode.value = mode
}

async function openEditPage(row: ReviewRowIdentity) {
	await openPageWithDetail(row, "edit")
}

async function openHandlePage(row: ReviewRowIdentity) {
	await openPageWithDetail(row, "handle")
}

async function openProcessPage(row: BizBusinessMattersVo) {
	if (isReviewEditableStatus(row)) {
		await openEditPage(row)
		return
	}
	await openHandlePage(row)
}

async function openDetailPage(row: BizBusinessMattersVo) {
	await openPageWithDetail(row, "detail")
}

const isDraftRow = (row: Pick<BizBusinessMattersVo, "status" | "statusName">) =>
	[0, 2, 4, 6].includes(row.status) ||
	["草稿", "材料确认不通过", "会签驳回", "领导驳回"].includes(String(row.statusName || ""))

async function handleDetailProcess() {
	if (!currentDetail.value) return
	await openProcessPage(currentDetail.value)
}

function backToList() {
	pageMode.value = "list"
	editingFormData.value = null
	currentDetail.value = null
	currentDetailCanHandle.value = false
}

const buildAttachmentPayload = (attachments: ReviewAttachmentItem[]) =>
	attachments.reduce<Record<string, string | undefined>>((result, item) => {
		result[item.key] = item.value || undefined
		return result
	}, {})

const buildReviewPayload = (formData: ReviewFormData, status: number): BizBusinessMattersBo => ({
	id: formData.id || currentDetail.value?.id,
	applicationNo: formData.applicationNo || currentDetail.value?.applicationNo,
	applicantEnterpriseId: formData.applicantEnterpriseId || undefined,
	applicationDate: formData.applicationDate || undefined,
	contractAmount: formData.contractAmount ?? undefined,
	coreContent: formData.coreContent || undefined,
	coSignDeptIds: formData.coSignDeptIds || undefined,
	counterparty: formData.counterparty || undefined,
	fundArrangement: formData.fundArrangement || undefined,
	legalCompliance: formData.legalCompliance || undefined,
	matterType: getReviewBusinessTypeCode(formData.matterType),
	performanceRisk: formData.performanceRisk || undefined,
	profitSituation: formData.profitSituation || undefined,
	projectBackground: formData.projectBackground || undefined,
	projectGoal: formData.projectGoal || undefined,
	projectName: formData.projectName || undefined,
	remark: formData.remark || undefined,
	status,
	techAndSafety: formData.techAndSafety || undefined,
	triggerDescription: formData.triggerDescription || undefined,
	...buildAttachmentPayload(formData.attachments)
})

const refreshAfterSubmit = async () => {
	pageMode.value = "list"
	editingFormData.value = null
	currentDetail.value = null
	currentDetailCanHandle.value = false
	await fetchList()
}

async function handleSaveDraft(formData: ReviewFormData) {
	submitLoading.value = true
	try {
		await saveBusinessMatters(buildReviewPayload(formData, 0))
		ElMessage.success("草稿已保存")
		await refreshAfterSubmit()
	} finally {
		submitLoading.value = false
	}
}

async function handleSubmitApplication(formData: ReviewFormData) {
	submitLoading.value = true
	try {
		await submitBusinessMatters(buildReviewPayload(formData, 1))
		ElMessage.success("保存并提交成功")
		await refreshAfterSubmit()
	} finally {
		submitLoading.value = false
	}
}

async function handleDeleteCurrent() {
	const id = editingFormData.value?.id || currentDetail.value?.id
	if (id === undefined || id === null) {
		ElMessage.warning("未找到可删除的数据")
		return
	}
	await ElMessageBox.confirm("确认删除当前申请吗？删除后无法恢复。", "删除确认", {
		type: "warning",
		confirmButtonText: "删除",
		cancelButtonText: "取消"
	})
	submitLoading.value = true
	try {
		await deleteBusinessMatters(id)
		ElMessage.success("删除成功")
		await refreshAfterSubmit()
	} finally {
		submitLoading.value = false
	}
}

async function handleExport() {
	exportLoading.value = true
	try {
		await exportBusinessMatters(buildListQuery())
	} finally {
		exportLoading.value = false
	}
}

const buildApprovePayload = (payload: ReviewApprovePayload): BizBusinessMattersApproveBo | null => {
	const id = currentDetail.value?.id
	// if (typeof id !== 'number') {
	//   ElMessage.warning('未找到可处理的经营事项');
	//   return null;
	// }
	return {
		id,
		...payload
	}
}

async function submitApprove(payload: ReviewApprovePayload, successMessage: string) {
	const requestData = buildApprovePayload(payload)
	if (!requestData) return
	handleLoading.value = true
	try {
		await approveBusinessMatters(requestData)
		ElMessage.success(successMessage)
		await refreshAfterSubmit()
	} finally {
		handleLoading.value = false
	}
}

async function handleSubmitMaterial(payload: {
	result: "agree" | "reject"
	selectedDepts: Array<string | number>
	reason: string
}) {
	if (payload.result === "reject") {
		if (!payload.reason.trim()) {
			ElMessage.warning("请输入驳回原因")
			return
		}
		await submitApprove(
			{
				result: 0,
				comment: payload.reason.trim()
			},
			"驳回成功"
		)
		return
	}
	const coSignDeptIdList = payload.selectedDepts.map((item) => Number(item)).filter((item) => Number.isFinite(item))
	await submitApprove(
		{
			result: 1,
			coSignDeptIdList
		},
		"材料确认通过"
	)
}

async function handleSubmitOpinion(payload: { result: "agree" | "reject"; opinion: string }) {
	if (!payload.opinion.trim()) {
		ElMessage.warning("请输入处理意见")
		return
	}
	await submitApprove(
		{
			result: payload.result === "agree" ? 1 : 0,
			comment: payload.opinion.trim()
		},
		payload.result === "agree" ? "处理成功" : "驳回成功"
	)
}

onMounted(() => {
	syncSearchItemOptions()
	fetchList()
})

watch(reviewStatusOptions, syncSearchItemOptions, { immediate: true })
</script>

<style scoped lang="scss">
.review-page {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.review-panel {
	display: flex;
	flex: 1;
	min-height: 0;
	flex-direction: column;
	padding: 30px;
	border-radius: 20px;
	background: #fff;
	overflow: hidden;
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

.review-toolbar {
	display: flex;
	align-items: center;
	margin-bottom: 18px;
	gap: 1rem;
	flex-shrink: 0;
}

.review-toolbar__left {
	display: inline-flex;
	align-items: center;
	gap: 0.75rem;
	min-width: 0;
}

.review-table-wrapper {
	flex: 1;
	min-height: 0;
	overflow: hidden;
	margin-bottom: 20px;

	:deep(.el-table) {
		height: 100%;
	}
}

.review-pagination {
	display: flex;
	justify-content: flex-end;
	flex-shrink: 0;
}

.project-cell {
	display: flex;
	flex-direction: column;
}

.project-cell__title {
	color: #172b4d;
	font-size: 0.875rem;
	font-weight: 600;
}

.project-cell__sub {
	margin-top: 0.25rem;
	color: #86909c;
	font-size: 0.75rem;
}

.table-actions {
	display: inline-flex;
	align-items: center;
	gap: 12px;
}
</style>
