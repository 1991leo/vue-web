<template>
	<div class="weekly-config-container" :class="`view-${currentView}`">
		<template v-if="currentView === 'list'">
			<div class="list-page">
				<PageTitle title="每周经营简报配置" />

				<SearchHeader :form-items="searchFields" @form-data-change="handleSearch" @form-data-reset="handleReset" />

				<CommonDivider :offset="30" />

				<div class="action-row">
					<el-button
						v-hasPermi="['base:weeklyReportConfig:add']"
						type="primary"
						class="create-button"
						@click="handleCreate"
					>
						<el-icon><Plus /></el-icon>
						新增配置
					</el-button>
				</div>

				<CommonTable :data="tableData" :columns="tableColumns" :loading="loading" row-key="id">
					<template #indexSlot="{ $index }">
						{{ serialNumber($index) }}
					</template>

					<template #enabledSlot="{ row }">
						<el-tag :type="row.isEnabled === '1' ? 'success' : 'danger'" effect="light" round>
							{{ row.isEnabledName || (row.isEnabled === "1" ? "启用" : "禁用") }}
						</el-tag>
					</template>

					<!-- <template #configItemsSlot="{ row }">
            <div class="config-tags">
              <el-tag v-for="item in row.fields" :key="item.id || item.sortOrder" class="config-tag" type="primary" effect="plain">
                {{ item.fieldName }}
              </el-tag>
            </div>
          </template> -->

					<template #actionsSlot="{ row }">
						<button class="text-action view" v-hasPermi="['base:weeklyReportConfig:query']" @click="handleView(row)">
							查看
						</button>
						<button v-hasPermi="['base:weeklyReportConfig:edit']" class="text-action edit" @click="handleEdit(row)">
							编辑
						</button>
						<button
							v-hasPermi="['base:weeklyReportConfig:remove']"
							class="text-action delete"
							@click="handleDelete(row)"
						>
							删除
						</button>
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

		<template v-else>
			<FormPageLayout
				:title="isEditMode ? '编辑周报工作进展配置' : '新增周报工作进展配置'"
				:desc="isEditMode ? '修改企业周报工作进展字段配置后提交保存' : '配置企业每周经营简报需填报的工作进展字段'"
			>
				<el-form ref="formRef" :model="formModel" :rules="formRules" label-position="top" class="config-form">
					<el-form-item label="企业名称" prop="enterpriseId">
						<el-select
							v-model="formModel.enterpriseId"
							placeholder="请选择企业名称"
							class="full-control"
							filterable
							clearable
						>
							<el-option
								v-for="item in companyOptions"
								:key="item.dictValue"
								:label="item.dictLabel"
								:value="item.dictValue"
							/>
						</el-select>
					</el-form-item>

					<el-form-item label="是否启用">
						<el-switch v-model="formModel.isEnabled" active-text="启用" inactive-text="禁用" />
					</el-form-item>

					<div class="config-section">
						<div class="config-section-header">
							<div>
								<div class="section-title">配置项属性</div>
								<div class="section-subtitle">按顺序配置周报中需要填报的工作进展字段</div>
							</div>
							<el-button type="primary" plain :icon="Plus" @click="addConfigItem">新增</el-button>
						</div>

						<div v-if="formModel.configItems.length" class="config-item-list">
							<div v-for="(item, index) in formModel.configItems" :key="item.clientId" class="config-item">
								<el-input v-model.trim="item.fieldName" class="field-name" placeholder="字段名称" />
								<el-checkbox v-model="item.isRequired">必填</el-checkbox>
								<el-input :model-value="item.sortOrder" class="sort-input" readonly />
								<el-button :icon="ArrowUp" circle :disabled="index === 0" @click="moveConfigItem(index, -1)" />
								<el-button
									:icon="ArrowDown"
									circle
									:disabled="index === formModel.configItems.length - 1"
									@click="moveConfigItem(index, 1)"
								/>
								<el-button type="danger" plain @click="removeConfigItem(index)">删除</el-button>
							</div>
						</div>

						<el-empty v-else description="暂无配置项，请点击新增按钮添加" :image-size="90" />
					</div>
				</el-form>

				<template #actions>
					<el-button @click="goBackToList">取消</el-button>
					<el-button type="primary" :loading="submitLoading" @click="submitForm">保存</el-button>
				</template>
			</FormPageLayout>
		</template>

		<el-dialog v-model="detailVisible" title="配置详情" width="640px" class="weekly-config-dialog">
			<template v-if="detailRow">
				<div class="detail-list">
					<div class="detail-item">
						<span class="detail-label">企业名称</span>
						<span class="detail-value">{{ detailRow.enterpriseName || "-" }}</span>
					</div>
					<div class="detail-item">
						<span class="detail-label">是否启用</span>
						<el-tag :type="detailRow.isEnabled === '1' ? 'success' : 'danger'" effect="light" round>
							{{ detailRow.isEnabledName || (detailRow.isEnabled === "1" ? "启用" : "禁用") }}
						</el-tag>
					</div>
					<div class="detail-item">
						<span class="detail-label">创建时间</span>
						<span class="detail-value">{{ detailRow.createTime || "-" }}</span>
					</div>
				</div>

				<el-table :data="detailRow.fields" class="detail-table" border>
					<el-table-column prop="fieldName" label="字段名称" min-width="220" />
					<el-table-column label="是否必填" width="120" align="center">
						<template #default="{ row }">
							{{ row.isRequired === "1" ? "是" : "否" }}
						</template>
					</el-table-column>
					<el-table-column prop="sortOrder" label="排序序号" width="120" align="center" />
				</el-table>
			</template>

			<template #footer>
				<el-button @click="detailVisible = false">关闭</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import type { FormInstance, FormRules } from "element-plus"
import { ArrowDown, ArrowUp, Plus } from "@element-plus/icons-vue"
import PageTitle from "@/components/PageTitle/index.vue"
import SearchHeader from "@/components/SearchHeader/index.vue"
import CommonDivider from "@/components/CommonDivider/index.vue"
import CommonTable from "@/components/CommonTable/index.vue"
import Pagination from "@/components/Pagination/index.vue"
import FormPageLayout from "@/components/FormPageLayout/index.vue"
import { usePagination } from "@/hooks/usePagination"
import { useLoading } from "@/hooks/useLoading"
import {
	addWeeklyReportConfig,
	delWeeklyReportConfig,
	getWeeklyReportConfig,
	listWeeklyReportConfig,
	updateWeeklyReportConfig
} from "@/api/system/weeklyReportConfig"
import type {
	WeeklyReportConfigField,
	WeeklyReportConfigForm,
	WeeklyReportConfigVO
} from "@/api/system/weeklyReportConfig/types"
import { getTaskCompanyDictOptions } from "@/utils/taskCompany"

type ViewMode = "list" | "form"

interface ConfigItem {
	clientId: string
	id?: string | number
	configId?: string | number
	fieldName: string
	isRequired: boolean
	sortOrder: number
	remark?: string
}

interface DictOption {
	dictValue: string
	dictLabel: string
	[key: string]: any
}

interface ConfigFormModel {
	enterpriseId?: string | number
	isEnabled: boolean
	configItems: ConfigItem[]
}

const tableColumns = [
	{ label: "序号", width: 90, slotName: "indexSlot" },
	{ prop: "enterpriseName", label: "企业名称", showOverflowTooltip: true },
	{ label: "是否启用", slotName: "enabledSlot" },
	// { label: '配置项属性', minWidth: 320, slotName: 'configItemsSlot' },
	{ label: "操作", width: 190, fixed: "right" as const, slotName: "actionsSlot" }
]

const searchFields = computed(() => [
	{
		key: "enterpriseId",
		label: "企业名称",
		type: "select",
		placeholder: "全部",
		width: "240px",
		options: companyOptions.value.map((item) => ({
			label: item.dictLabel,
			value: item.dictValue
		}))
	},
	{
		key: "isEnabled",
		label: "状态",
		type: "select",
		placeholder: "全部",
		width: "180px",
		options: [
			{ label: "启用", value: "1" },
			{ label: "禁用", value: "0" }
		]
	}
])

const currentView = ref<ViewMode>("list")
const isEditMode = ref(false)
const editingId = ref<string | number | null>(null)
const loading = ref(false)
const detailVisible = ref(false)
const detailRow = ref<WeeklyReportConfigVO | null>(null)
const formRef = ref<FormInstance>()
const tableData = ref<WeeklyReportConfigVO[]>([])
const companyOptions = ref<DictOption[]>([])
const queryParams = reactive({
	enterpriseId: "",
	isEnabled: ""
})

const { currentPage, pageSize, total } = usePagination(() => getList(), 10)

const formModel = reactive<ConfigFormModel>({
	enterpriseId: undefined,
	isEnabled: true,
	configItems: []
})

const formRules: FormRules = {
	enterpriseId: [{ required: true, message: "请选择企业名称", trigger: "change" }]
}

function createClientId() {
	return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function syncSortOrder() {
	// 配置项上下移动或删除后统一重算排序，避免表单显示与提交数据不一致。
	formModel.configItems.forEach((item, index) => {
		item.sortOrder = index + 1
	})
}

function resetFormModel(config?: WeeklyReportConfigVO) {
	formModel.enterpriseId = config?.enterpriseId ? String(config.enterpriseId) : undefined
	formModel.isEnabled = config?.isEnabled !== "0"
	formModel.configItems = config ? normalizeFields(config.fields) : []
	if (!config) addConfigItem()
}

function serialNumber(index: number) {
	return (currentPage.value - 1) * pageSize.value + index + 1
}

const companyNameMap = computed(() => {
	return companyOptions.value.reduce<Record<string, string>>((map, item) => {
		map[String(item.dictValue)] = item.dictLabel
		return map
	}, {})
})

function getEnterpriseName(config: WeeklyReportConfigVO) {
	const enterpriseId =
		config.enterpriseId !== undefined && config.enterpriseId !== null ? String(config.enterpriseId) : ""
	return (
		config.enterpriseName ||
		(config as any).companyName ||
		(config as any).deptName ||
		companyNameMap.value[enterpriseId] ||
		""
	)
}

function normalizeConfigRow(config: WeeklyReportConfigVO): WeeklyReportConfigVO {
	return {
		...config,
		// 列表接口可能只返回企业ID，这里统一按企业字典补全名称。
		enterpriseName: getEnterpriseName(config),
		fields: normalizeApiFields(config.fields)
	}
}

async function getDictData() {
	try {
		companyOptions.value = await getTaskCompanyDictOptions()
	} catch (error) {
		console.error(error)
	}
}

async function getList() {
	loading.value = true
	try {
		const res = (await listWeeklyReportConfig({
			pageNum: currentPage.value,
			pageSize: pageSize.value,
			enterpriseId: queryParams.enterpriseId || undefined,
			isEnabled: queryParams.isEnabled || undefined
		})) as any
		tableData.value = (res.rows || []).map((item: WeeklyReportConfigVO) => normalizeConfigRow(item))
		total.value = res.total || 0
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

function handleSearch(data: Record<string, string>) {
	queryParams.enterpriseId = data.enterpriseId || ""
	queryParams.isEnabled = data.isEnabled || ""
	reloadFirstPage()
}

function handleReset() {
	queryParams.enterpriseId = ""
	queryParams.isEnabled = ""
	reloadFirstPage()
}

function handleCreate() {
	isEditMode.value = false
	editingId.value = null
	resetFormModel()
	currentView.value = "form"
}

async function handleEdit(row: WeeklyReportConfigVO) {
	if (!row.id) {
		ElMessage.warning("当前配置缺少ID，无法编辑")
		return
	}
	isEditMode.value = true
	editingId.value = row.id
	loading.value = true
	try {
		const res = await getWeeklyReportConfig(row.id)
		const detail = { ...row, ...((res as any).data || {}) } as WeeklyReportConfigVO
		resetFormModel(normalizeConfigRow(detail))
		currentView.value = "form"
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}

async function handleView(row: WeeklyReportConfigVO) {
	if (!row.id) {
		ElMessage.warning("当前配置缺少ID，无法查看")
		return
	}
	loading.value = true
	try {
		const res = await getWeeklyReportConfig(row.id)
		const detail = { ...row, ...((res as any).data || {}) } as WeeklyReportConfigVO
		detailRow.value = normalizeConfigRow(detail)
		detailVisible.value = true
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}

function handleDelete(row: WeeklyReportConfigVO) {
	if (!row.id) {
		ElMessage.warning("当前配置缺少ID，无法删除")
		return
	}
	ElMessageBox.confirm("确定要删除这条配置吗？此操作不可恢复。", "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning"
	})
		.then(async () => {
			await delWeeklyReportConfig(row.id as string | number)
			ElMessage.success("删除成功")
			getList()
		})
		.catch(() => undefined)
}

function goBackToList() {
	currentView.value = "list"
	editingId.value = null
	isEditMode.value = false
	formRef.value?.clearValidate()
}

function addConfigItem() {
	//最多添加10个配置项，超过后提示用户删除部分配置项后再添加。
	if (formModel.configItems.length >= 10) {
		ElMessage.warning("最多只能添加10个配置项")
		return
	}

	formModel.configItems.push({
		clientId: createClientId(),
		fieldName: "",
		// 默认非必选
		isRequired: false,
		sortOrder: formModel.configItems.length + 1
	})
}

function removeConfigItem(index: number) {
	formModel.configItems.splice(index, 1)
	syncSortOrder()
}

function moveConfigItem(index: number, direction: -1 | 1) {
	const targetIndex = index + direction
	const targetItem = formModel.configItems[targetIndex]
	formModel.configItems[targetIndex] = formModel.configItems[index]
	formModel.configItems[index] = targetItem
	syncSortOrder()
}

function validateConfigItems() {
	if (!formModel.configItems.length) {
		ElMessage.warning("请至少添加一个配置项")
		return false
	}

	const hasEmptyField = formModel.configItems.some((item) => !item.fieldName.trim())
	if (hasEmptyField) {
		ElMessage.warning("请填写所有配置项的字段名称")
		return false
	}

	return true
}

// 使用 useLoading 包裹保存表单的逻辑，防重复点击并控制 loading
const { loading: submitLoading, run: submitForm } = useLoading(async () => {
	const valid = await formRef.value?.validate().catch(() => false)
	if (!valid || !validateConfigItems()) return

	const payload = buildPayload()
	if (isEditMode.value && editingId.value !== null) {
		await updateWeeklyReportConfig(payload)
		ElMessage.success("修改成功")
	} else {
		await addWeeklyReportConfig(payload)
		ElMessage.success("新增成功")
	}

	goBackToList()
	reloadFirstPage()
})

function normalizeApiFields(fields?: WeeklyReportConfigField[]) {
	return [...(fields || [])].sort((prev, next) => Number(prev.sortOrder || 0) - Number(next.sortOrder || 0))
}

function normalizeFields(fields?: WeeklyReportConfigField[]) {
	return normalizeApiFields(fields).map((item, index) => ({
		clientId: createClientId(),
		id: item.id,
		configId: item.configId,
		fieldName: item.fieldName || "",
		isRequired: (item as any).isRequired === "1" || (item as any).isRequired === true,
		sortOrder: Number(item.sortOrder || index + 1),
		remark: item.remark
	}))
}

function buildPayload(): WeeklyReportConfigForm {
	return {
		id: editingId.value || undefined,
		enterpriseId: formModel.enterpriseId,
		isEnabled: formModel.isEnabled ? "1" : "0",
		fields: formModel.configItems.map((item) => ({
			id: item.id,
			configId: item.configId,
			fieldName: item.fieldName.trim(),
			isRequired: item.isRequired ? "1" : "0",
			sortOrder: item.sortOrder,
			remark: item.remark
		}))
	}
}

onMounted(async () => {
	await getDictData()
	getList()
})
</script>

<style scoped lang="scss">
.weekly-config-container {
	height: 100%;
	color: var(--el-text-color-primary);

	&.view-form {
		overflow: auto;
	}
}

.list-page {
	height: 100%;
	display: flex;
	flex-direction: column;
	padding: 30px;
	overflow: hidden;
	background: var(--el-bg-color);
	border-radius: 20px;
	box-shadow: 0 8px 24px rgba(23, 43, 77, 0.05);
	box-sizing: border-box;
}

.action-row {
	margin-bottom: 19px;
}

.create-button {
	min-width: 104px;
	height: 34px;
	border-radius: 8px;
}

.config-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	max-width: 520px;
}

.config-tag {
	max-width: 140px;
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
		color: var(--el-color-danger);
	}
}

.pager-row {
	flex-shrink: 0;
}

.weekly-config-dialog {
	:deep(.el-dialog) {
		border-radius: 12px;
	}

	:deep(.el-dialog__header),
	:deep(.el-dialog__footer) {
		margin: 0;
		padding: 22px 28px;
	}

	:deep(.el-dialog__header) {
		border-bottom: 1px solid var(--el-border-color-lighter);
	}

	:deep(.el-dialog__title) {
		font-size: 16px;
		font-weight: 600;
		color: var(--el-text-color-primary);
	}

	:deep(.el-dialog__body) {
		padding: 24px 28px;
	}

	:deep(.el-dialog__footer) {
		border-top: 1px solid var(--el-border-color-lighter);
	}
}

.config-form {
	width: 600px;
	.full-control {
		width: 100%;
	}

	:deep(.el-form-item) {
		margin-bottom: 20px;
	}

	:deep(.el-input__wrapper),
	:deep(.el-textarea__inner) {
		border-radius: 8px;
	}
}

.config-section {
	padding: 20px;
	border: 1px solid var(--el-border-color-lighter);
	border-radius: 12px;
}

.config-section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	margin-bottom: 16px;
}

.section-title {
	font-size: 16px;
	font-weight: 600;
	color: var(--el-text-color-primary);
}

.section-subtitle {
	margin-top: 4px;
	font-size: 13px;
	color: var(--el-text-color-secondary);
}

.config-item-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.config-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 14px;
	border-radius: 10px;
	background: var(--el-fill-color-lighter);
}

.field-name {
	flex: 1;
}

.sort-input {
	width: 80px;
}

.detail-list {
	display: grid;
	gap: 14px;
	margin-bottom: 18px;
}

.detail-item {
	display: flex;
	align-items: center;
	gap: 18px;
}

.detail-label {
	width: 86px;
	color: var(--el-text-color-secondary);
}

.detail-value {
	color: var(--el-text-color-primary);
}

.detail-table {
	width: 100%;
}

@media (max-width: 1200px) {
	.config-item {
		align-items: flex-start;
		flex-wrap: wrap;
	}

	.field-name {
		flex-basis: 100%;
	}
}
</style>
