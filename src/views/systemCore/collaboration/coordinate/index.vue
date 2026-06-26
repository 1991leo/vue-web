<template>
	<div class="coordination-container" :class="`view-${currentView}`">
		<!-- 列表视图 -->
		<template v-if="currentView === 'list'">
			<div class="list-page">
				<!-- 页面标题组件 -->
				<PageTitle title="协调支持事项" />

				<!-- 页面搜索组件：配置化 SearchHeader 组件 -->
				<SearchHeader :form-items="searchFields" @form-data-change="handleSearch" @form-data-reset="resetQuery" />

				<!-- 通用满宽分割线组件，左右穿透大卡片的 30px padding -->
				<CommonDivider :offset="30" />

				<!-- 按钮区域 -->
				<div class="create-row">
					<el-button type="primary" v-hasPermi="['base:coordination:add']" class="create-button" @click="handleCreate">
						<el-icon><Plus /></el-icon>
						新建
					</el-button>
				</div>

				<!-- 通用表格组件替换原生 el-table，传承 78px 行高风格 -->
				<CommonTable :data="filteredTableData" :columns="tableColumns" :loading="loading" row-key="projectCode">
					<!-- 状态列自定义插槽 -->
					<template #statusSlot="{ row }">
						<span class="state-text" :class="statusClass(row.status || row.statusName)">
							<img :src="statusIcon(row.status || row.statusName)" class="state-icon" />
							{{ row.statusName || row.status }}
						</span>
					</template>

					<!-- 操作列自定义插槽 -->
					<template #actionsSlot="{ row }">
						<button class="text-action view" v-hasPermi="['base:coordination:query']" @click="handleView(row)">
							查看
						</button>
						<button class="text-action edit" v-hasPermi="['base:coordination:edit']" @click="handleEdit(row)">
							编辑
						</button>
						<button class="text-action delete" v-hasPermi="['base:coordination:remove']" @click="handleDelete(row)">
							删除
						</button>
					</template>
				</CommonTable>

				<!-- 分页栏，固定在右下方 -->
				<div class="pager-row">
					<!-- 采用统一的成功主题 success 分页，保持高亮背景色与文字颜色一致 -->
					<Pagination
						v-model:current-page="currentPage"
						v-model:page-size="pageSize"
						:total="total"
						paginationType="success"
					/>
				</div>
			</div>
		</template>

		<!-- 新建视图，引入独立组件，通信事件采用 camelCase 命名 -->
		<template v-else-if="currentView === 'create'">
			<CreateSupport
				:company-options="companyOptions"
				:initial-project-name="initialProjectName"
				:initial-report-company="initialReportCompany"
				:initial-related-type="initialRelatedType"
				:loading="submitLoading"
				@back="goBackToList"
				@submit="submitCreateForm"
			/>
		</template>

		<!-- 详情视图，引入独立组件 -->
		<template v-else>
			<DetailSupport
				:row="currentRow"
				:is-edit="isEditMode"
				:status-options="statusOptions"
				:company-options="companyOptions"
				:user-options="userOptions"
				:loading="detailSubmitLoading"
				@back="goBackToList"
				@submit="saveDetail"
			/>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import modal from "@/plugins/modal"
import { Plus } from "@element-plus/icons-vue"
import {
	listCoordination,
	getCoordination,
	addCoordination,
	updateCoordination,
	delCoordination
} from "@/api/system/coordination"
import { getDicts } from "@/api/system/dict/data"
import { listUser } from "@/api/system/user"
import { getTaskCompanyDictOptions } from "@/utils/taskCompany"
import { ElSelect } from "element-plus"

// 引入拆分后的同级子组件
import CreateSupport from "./create.vue"
import DetailSupport from "./detail.vue"

// 引入封装的公共组件
import PageTitle from "@/components/PageTitle/index.vue"
import SearchHeader from "@/components/SearchHeader/index.vue"
import CommonTable from "@/components/CommonTable/index.vue"
import CommonDivider from "@/components/CommonDivider/index.vue"
import Pagination from "@/components/Pagination/index.vue"
import { usePagination } from "@/hooks/usePagination"
import { useLoading } from "@/hooks/useLoading"
import { useCrudView } from "@/hooks/useCrudView"

// 定义 CommonTable 表格列配置
const tableColumns = [
	{ prop: "projectCode", label: "编号", minWidth: 145 },
	{ prop: "reportingEnterpriseName", label: "提报公司", minWidth: 150 },
	{ prop: "relatedTaskTitle", label: "关联项目/任务", minWidth: 230 },
	{ prop: "title", label: "标题", minWidth: 330, showOverflowTooltip: true },
	{ label: "状态", minWidth: 140, slotName: "statusSlot" },
	{ prop: "createTime", label: "提报时间", minWidth: 160 },
	{ label: "操作", width: 190, fixed: "right" as const, slotName: "actionsSlot" }
]

// 配置式搜索项定义（异步字典数据需使用 computed 确保响应式）
const searchFields = computed(() => [
	{
		key: "reportCompany",
		label: "提报公司",
		type: "select",
		placeholder: "提报公司",
		width: "240px",
		options: companyOptions.value.map((dict: any) => ({
			label: dict.dictLabel,
			value: dict.dictValue
		}))
	},
	{
		key: "status",
		label: "状态",
		type: "select",
		placeholder: "全部",
		width: "240px",
		options: statusOptions.value.map((dict: any) => ({
			label: dict.dictLabel,
			value: dict.dictValue
		}))
	}
])

type ViewMode = "list" | "create" | "detail"
type Status = "待处理" | "处理中" | "已解决" | "未解决"
type TimelineType = "create" | "assign" | "progress" | "problem" | "statusChange"

interface TimelineItem {
	time: string
	label: string
	type: TimelineType
	user: string
	content: string
}

interface SupportItem {
	id: string
	rowKey: string
	projectCode: string
	reportCompany: string
	relatedType: "" | "项目" | "任务"
	relatedName: string
	title: string
	status: string
	handler: string
	reportTime: string
	description: string
	solution: string
	shareRange: string[]
	lastUpdateTime: string
	timeline: TimelineItem[]
}

const emptyItem = (): SupportItem => ({
	id: "",
	rowKey: "",
	reportCompany: "",
	relatedType: "",
	relatedName: "",
	title: "",
	status: "待处理",
	handler: "",
	reportTime: "",
	description: "",
	solution: "",
	shareRange: [],
	lastUpdateTime: "",
	projectCode: "",
	timeline: []
})

const { currentView, isEditMode, currentRow, clearQueryAndPush, handleCreate, goBackToList } =
	useCrudView<SupportItem>(emptyItem)

// 1. 声明底层数据状态
const companyOptions = ref<any[]>([])
const statusOptions = ref<any[]>([])
const userOptions = ref<any[]>([])

const queryParams = reactive({
	reportCompany: "",
	handler: "",
	status: ""
})

// 列表数据状态
const loading = ref(false)
const tableData = ref<any[]>([])

// 2. 声明获取列表数据等核心业务方法，转换为具名 async 函数以提升声明
async function getTableData() {
	loading.value = true
	try {
		const res = (await listCoordination({
			pageNum: currentPage.value,
			pageSize: pageSize.value,
			reportingEnterprise: queryParams.reportCompany,
			handlerName: queryParams.handler,
			status: queryParams.status
		})) as any
		tableData.value = res.rows || []
		total.value = res.total || 0
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}

async function getDictData() {
	try {
		const [statusRes, taskCompanyOptions] = await Promise.all([
			getDicts("coordination_status"),
			getTaskCompanyDictOptions()
		])
		statusOptions.value = statusRes.data || []
		companyOptions.value = taskCompanyOptions
	} catch (error) {
		console.error(error)
	}
}

// 3. 集成分页 Hook，简化状态与事件处理
const { currentPage, pageSize, total } = usePagination(() => getTableData(), 10)

const route = useRoute()
const router = useRouter()
// 从路由 query 中获取传递过来的项目/任务名称和提报企业、关联类型
const initialProjectName = computed(() => (route.query.projectName as string) || "")
const initialReportCompany = computed(() => (route.query.reportCompany as string) || "")
const initialRelatedType = computed(() => (route.query.relatedType as string) || "")

onMounted(() => {
	getDictData()
	getTableData()
	// 如果路由指定了创建动作，则自动切换至新建视图
	if (route.query.action === "create") {
		currentView.value = "create"
	}
})

// 将接口的 rows 直接做响应式计算，不需要前端过滤
const filteredTableData = computed(() => tableData.value)

// 状态图标与样式类的兼容匹配映射
const statusIconMap: Record<string, string> = {
	"0": new URL("@/assets/collaboration/Pending.png", import.meta.url).href,
	"1": new URL("@/assets/collaboration/processing.png", import.meta.url).href,
	"2": new URL("@/assets/collaboration/resolved.png", import.meta.url).href,
	"3": new URL("@/assets/collaboration/unresolved.png", import.meta.url).href,
	待处理: new URL("@/assets/collaboration/Pending.png", import.meta.url).href,
	处理中: new URL("@/assets/collaboration/processing.png", import.meta.url).href,
	已解决: new URL("@/assets/collaboration/resolved.png", import.meta.url).href,
	已完成: new URL("@/assets/collaboration/resolved.png", import.meta.url).href,
	未解决: new URL("@/assets/collaboration/unresolved.png", import.meta.url).href,
	已关闭: new URL("@/assets/collaboration/unresolved.png", import.meta.url).href
}
const statusIcon = (status: string) => statusIconMap[status] || statusIconMap["0"]

const statusClass = (status: Status | string) => {
	const map: Record<string, string> = {
		"0": "pending",
		"1": "processing",
		"2": "resolved",
		"3": "unresolved",
		待处理: "pending",
		处理中: "processing",
		已解决: "resolved",
		已完成: "resolved",
		未解决: "unresolved",
		已关闭: "unresolved"
	}
	return map[status] || "pending"
}

const handleSearch = (data: any) => {
	queryParams.reportCompany = data.reportCompany || ""
	queryParams.status = data.status || ""
	currentPage.value = 1
	getTableData()
}

const resetQuery = (data: any) => {
	queryParams.reportCompany = ""
	queryParams.handler = ""
	queryParams.status = ""
	currentPage.value = 1
	getTableData()
}

// 将日志列表映射到前端 timeline 结构，为各类事件分配对应的状态类型以正确匹配视觉效果
const mapLogsToTimeline = (logs: any[]): TimelineItem[] => {
	if (!logs) return []
	return logs.map((item) => {
		let type: TimelineType = "progress"
		const logTitle = item.logTitle || ""
		const logType = item.logType || ""

		if (logType === "create" || logTitle.includes("创建")) {
			type = "create"
		} else if (logType === "assign" || logTitle.includes("分配")) {
			type = "assign"
		} else if (logType === "status_change" || logType === "change" || logTitle.includes("变更")) {
			type = "statusChange"
		} else if (logType === "problem" || logTitle.includes("问题")) {
			type = "problem"
		}

		return {
			time: item.operationTime ? item.operationTime.replace("T", " ").substring(0, 16) : "",
			label: item.logTitle || "处理",
			type: type,
			user: item.operatorId === 0 ? "系统" : item.operatorDeptName || "操作人",
			content: item.logContent || ""
		}
	})
}

// 数据字段转换适配器，保证子组件渲染不出错
const mapToSupportItem = (row: any, fallbackId?: string | number): SupportItem => {
	const finalId = row && row.id !== undefined && row.id !== null ? row.id : fallbackId || ""
	return {
		rowKey: String(finalId),
		id: String(finalId),
		projectCode: String(row.projectCode),
		reportCompany: row.reportingEnterprise || "",
		relatedType: (row.relationType || "") as "" | "项目" | "任务",
		relatedName: row.relatedTaskTitle || "",
		title: row.title || "",
		status: row.status || "0",
		handler: row.handlerName || "",
		reportTime: row.createTime || "",
		description: row.description || "",
		solution: row.solutionMeasure || "",
		shareRange: row.shareScope ? row.shareScope.split(",") : [],
		lastUpdateTime: row.updateTime || row.createTime || "",
		timeline: mapLogsToTimeline(row.logs)
	}
}

// 使用 useLoading 包裹新建协调事项逻辑，防重复点击并控制 loading
const { loading: submitLoading, run: submitCreateForm } = useLoading(
	async (formData: {
		title: string
		description: string
		reportCompany: string
		relatedType: string
		relatedName: string
		shareRange: string[]
	}) => {
		try {
			const company = companyOptions.value.find((item) => item.dictValue === formData.reportCompany)
			await addCoordination({
				title: formData.title,
				description: formData.description,
				reportingEnterprise: formData.reportCompany,
				reportingEnterpriseName: company ? company.dictLabel : "",
				relationType: formData.relatedType === "不关联" ? "" : formData.relatedType,
				relatedTaskTitle: formData.relatedName === "不选择" ? "" : formData.relatedName,
				shareScope: formData.shareRange.join(",")
			})
			modal.msgSuccess("创建成功")
			goBackToList()
			getTableData()
		} catch (error) {
			console.error(error)
		}
	}
)

const handleView = async (row: any) => {
	isEditMode.value = false // 查看状态，只读展示
	loading.value = true
	try {
		const res = await getCoordination(row.id)
		clearQueryAndPush("detail")
		currentRow.value = mapToSupportItem(res.data, row.id)
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}

const handleEdit = async (row: any) => {
	isEditMode.value = true // 编辑状态，可进行处理操作
	loading.value = true
	try {
		const [res, userRes] = await Promise.all([getCoordination(row.id), listUser({ pageSize: 100, pageNum: 1 })])
		userOptions.value = userRes.rows || []
		clearQueryAndPush("detail")
		currentRow.value = mapToSupportItem(res.data, row.id)
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}

const handleDelete = (row: any) => {
	modal
		.confirm("确定删除该事项吗？")
		.then(async () => {
			try {
				await delCoordination(row.id)
				modal.msgSuccess("删除成功")
				getTableData()
			} catch (error) {
				console.error(error)
			}
		})
		.catch(() => undefined)
}

// 使用 useLoading 包裹保存详情逻辑，防重复点击并控制 loading
const { loading: detailSubmitLoading, run: saveDetail } = useLoading(
	async (formData: { id: string; status: string; handler: string; solution: string; shareRange: string[] }) => {
		try {
			const foundUser = userOptions.value.find(
				(item) => item.nickName === formData.handler || item.userName === formData.handler
			)
			await updateCoordination({
				id: formData.id || currentRow.value.id,
				title: currentRow.value.title,
				description: currentRow.value.description,
				reportingEnterprise: currentRow.value.reportCompany,
				status: formData.status,
				handlerName: formData.handler,
				handlerId: foundUser ? foundUser.userId : undefined,
				solutionMeasure: formData.solution,
				shareScope: formData.shareRange.join(",")
			})
			modal.msgSuccess("提交成功")
			goBackToList()
			getTableData()
		} catch (error) {
			console.error(error)
		}
	}
)
</script>

<style scoped lang="scss">
.coordination-container {
	height: 100%;
	color: #0f2748;
	border-radius: 20px;

	&.view-list {
		background: #f8faff;
		/* 限制容器高度与屏幕尺寸一致，防止产生全局滚动条 */
		height: 100%;
		overflow: hidden;
		box-sizing: border-box;
	}

	&.view-create,
	&.view-detail {
		position: relative;
		background: rgba(244, 245, 247, 0);
	}
}

.list-page {
	/* 列表页高度占满整个父容器，并采用 flex 纵向布局 */
	height: 100%;
	display: flex;
	flex-direction: column;
	padding: 30px; /* 原型卡片内边距：30px */
	background: #fff;
	border-radius: 20px; /* 原型卡片圆角：20px */
	box-sizing: border-box;
	overflow: hidden;
	box-shadow: 0 8px 24px rgba(23, 43, 77, 0.05); /* 原型卡片阴影 */
}

.create-row {
	padding: 0;
	margin-bottom: 19px; /* 原型间距 19px */
}

.create-button {
	min-width: 86px;
	height: 34px;
	border-radius: 8px;
	--el-button-bg-color: var(--el-color-primary);
	--el-button-border-color: var(--el-color-primary);
	--el-button-hover-bg-color: var(--el-color-primary-light-3);
	--el-button-hover-border-color: var(--el-color-primary-light-3);
}

.state-text {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	font-size: 14px;

	&.resolved {
		color: var(--el-color-primary);
	}
	&.pending {
		color: #344563;
	}
	&.processing {
		color: #1677ff;
	}
	&.unresolved {
		color: #ff4d4f;
	}
}

.state-icon {
	width: 16px;
	height: 16px;
	object-fit: contain;
}

.text-action {
	margin-right: 14px;
	padding: 0;
	border: 0;
	background: transparent;
	font-size: 14px;
	cursor: pointer;

	&.view,
	&.edit {
		color: var(--el-color-primary);
	}

	&.delete {
		color: #ff4d4f;
	}
}

/* 分页行固定在最下方，靠右对齐，不可压缩 */
.pager-row {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	margin-top: 0;
	flex-shrink: 0;

	/* 已统一使用 success 主题高亮样式，不再硬编码覆盖激活态背景和文字颜色 */
	// :deep(.el-pagination.is-background .el-pager li.is-active) {
	//   color: #fff !important;
	//   background-color: var(--el-color-primary) !important;
	// }
}

@media (max-width: 1200px) {
	.query-row {
		align-items: flex-start;
		flex-direction: column;
		gap: 16px;
	}

	.query-actions {
		margin-left: 0;
	}
}
</style>
