<template>
	<FormPageLayout
		class="briefing-page-layout"
		:title="isEdit ? '编辑经营简报' : '填报经营简报'"
		:desc="`正在为「${selectedCompanyName || '本公司'}」填报`"
	>
		<el-form
			ref="formRef"
			:model="formData"
			:rules="formRules"
			:validate-on-rule-change="false"
			label-position="top"
			class="briefing-form"
		>
			<div class="form-grid base-grid">
				<el-form-item label="选择周期" prop="period">
					<el-date-picker
						v-model="formData.period"
						type="week"
						placeholder="请选择周期"
						format="YYYY年第ww周"
						value-format="YYYY-MM-DD"
						:first-day-of-week="1"
						:clearable="false"
						class="full-control"
						@change="handlePeriodChange"
					/>
				</el-form-item>
				<!-- <el-form-item v-if="!isCompanyLocked" label="出资公司" prop="companyId">
          <el-select
            v-model="formData.companyId"
            placeholder="请选择出资公司"
            filterable
            clearable
            class="full-control"
            @change="handleCompanyChange"
          >
            <el-option v-for="item in companyOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue" />
          </el-select>
        </el-form-item> -->
				<el-form-item label="周报文件" prop="attachments" class="briefing-upload-item">
					<el-upload
						ref="uploadRef"
						drag
						action="#"
						class="file-uploader"
						:auto-upload="false"
						:limit="1"
						:show-file-list="false"
						:accept="fileAccept"
						:on-change="handleFileChange"
						:on-remove="handleFileRemove"
						:on-exceed="handleFileExceed"
					>
						<el-icon class="upload-icon"><UploadFilled /></el-icon>
						<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
						<template #tip>
							<div v-if="attachmentName" class="file-selected">
								<el-icon class="file-selected-icon"><Document /></el-icon>
								<span class="file-name">{{ attachmentName }}</span>
								<el-icon class="file-delete-icon" @click.stop="handleClearFile"><CircleClose /></el-icon>
							</div>
							<div class="upload-tip">支持 PDF、Word(.docx)、Excel格式，最大 50MB</div>
						</template>
					</el-upload>
				</el-form-item>
				<!-- <el-form-item label="Excel 导入" class="excel-import-item">
          <el-upload
            ref="excelUploadRef"
            drag
            action="#"
            class="file-uploader"
            :auto-upload="false"
            :limit="1"
            :show-file-list="false"
            accept=".xlsx,.xls"
            :on-change="handleExcelImport"
            :on-exceed="handleExcelExceed"
          >
            <el-icon class="upload-icon"><UploadFilled /></el-icon>
            <div class="el-upload__text">上传 Excel <em>自动填充</em>表单</div>
            <template #tip>
              <div class="upload-tip">先点「下载Excel」获取模板，填写后上传（.xlsx/.xls）</div>
            </template>
          </el-upload>
        </el-form-item> -->
			</div>

			<div class="section-title">经营数据 (万元)</div>
			<CommonDivider :offset="0" :vertical-margin="12" />

			<div class="form-grid metric-grid">
				<el-form-item label="年度目标利润（固定值）">
					<el-input v-model="annualTargetProfitText" disabled />
				</el-form-item>
				<el-form-item label="当月预计完成利润" prop="estimatedProfit">
					<el-input-number
						v-model="formData.estimatedProfit"
						:min="0"
						:controls="false"
						class="full-control"
						@input="(value) => handleFormAmountInput('estimatedProfit', value)"
					/>
				</el-form-item>
				<el-form-item v-for="item in metricItems" :key="item.key" :label="item.label" :prop="item.key">
					<el-input-number
						v-model="formData[item.key]"
						:min="0"
						:controls="false"
						:disabled="item.computed"
						class="full-control"
						@input="(value) => handleFormAmountInput(item.key, value)"
					/>
				</el-form-item>
			</div>

			<div class="project-detail-section">
				<div class="section-header">
					<div class="section-title detail-title">本周确收/新签/中标项目明细</div>
					<el-button type="primary" plain :icon="Plus" @click="handleAddBusinessDataRow">新增行</el-button>
				</div>
				<el-table
					:data="formData.projectDetails"
					border
					row-key="rowId"
					class="business-detail-table"
					empty-text="暂无明细"
				>
					<el-table-column label="类型（确收/新签/中标）" min-width="180">
						<template #default="{ row, $index }">
							<el-form-item :prop="`projectDetails.${$index}.projectType`" class="table-form-item">
								<el-select
									v-model="row.projectType"
									placeholder="请选择"
									clearable
									filterable
									class="table-control"
									@change="handleBusinessDataChange"
								>
									<el-option
										v-for="item in projectTypeOptions"
										:key="item.value"
										:label="item.label"
										:value="item.value"
									/>
								</el-select>
							</el-form-item>
						</template>
					</el-table-column>
					<el-table-column label="项目名称" min-width="180">
						<template #default="{ row, $index }">
							<el-form-item :prop="`projectDetails.${$index}.projectName`" class="table-form-item">
								<el-input v-model="row.projectName" placeholder="请输入" clearable class="table-control" />
							</el-form-item>
						</template>
					</el-table-column>
					<el-table-column label="金额（万元）" min-width="150">
						<template #default="{ row, $index }">
							<el-form-item :prop="`projectDetails.${$index}.amount`" class="table-form-item">
								<el-input-number
									v-model="row.amount"
									:min="0"
									:controls="false"
									class="table-number-control"
									@input="(value) => handleProjectAmountInput(row, 'amount', value)"
									@change="handleBusinessDataChange"
									@blur="validateBusinessDataField($index, 'amount')"
								/>
							</el-form-item>
						</template>
					</el-table-column>
					<el-table-column label="客户名称" min-width="180">
						<template #default="{ row, $index }">
							<el-form-item :prop="`projectDetails.${$index}.customerName`" class="table-form-item">
								<el-input v-model="row.customerName" placeholder="请输入" clearable class="table-control" />
							</el-form-item>
						</template>
					</el-table-column>
					<el-table-column label="合同金额（万元）" min-width="160">
						<template #default="{ row, $index }">
							<el-form-item :prop="`projectDetails.${$index}.contractAmount`" class="table-form-item">
								<el-input-number
									v-model="row.contractAmount"
									:min="0"
									:controls="false"
									class="table-number-control"
									@input="(value) => handleProjectAmountInput(row, 'contractAmount', value)"
									@blur="validateBusinessDataField($index, 'contractAmount')"
								/>
							</el-form-item>
						</template>
					</el-table-column>
					<el-table-column label="业务领域" min-width="160">
						<template #default="{ row, $index }">
							<el-form-item :prop="`projectDetails.${$index}.businessDomain`" class="table-form-item">
								<el-select v-model="row.businessDomain" placeholder="请选择" clearable filterable class="table-control">
									<el-option
										v-for="item in businessDomainOptions"
										:key="item.value"
										:label="item.label"
										:value="item.value"
									/>
								</el-select>
							</el-form-item>
						</template>
					</el-table-column>
					<el-table-column label="备注" min-width="220">
						<template #default="{ row }">
							<el-input v-model="row.remark" placeholder="请输入" clearable class="table-control" />
						</template>
					</el-table-column>
					<el-table-column label="操作" width="100" fixed="right" align="center">
						<template #default="{ $index }">
							<el-button type="danger" link :icon="Delete" @click="handleDeleteBusinessDataRow($index)">删除</el-button>
						</template>
					</el-table-column>
				</el-table>
			</div>

			<div class="section-title progress-title">工作进展</div>
			<CommonDivider :offset="0" :vertical-margin="12" />
			<div class="textarea-list">
				<!-- 动态扩展字段 -->
				<el-form-item
					v-for="(field, index) in formData.extraFields"
					:key="`${progressRenderKey}-${field.fieldName}-${index}`"
					:label="field.fieldName"
					:prop="`extraFields.${index}.fieldValue`"
					class="full-width"
				>
					<el-input
						v-model="field.fieldValue"
						type="textarea"
						:rows="4"
						:placeholder="getExtraFieldPlaceholder(field.fieldName)"
					/>
				</el-form-item>
				<!-- 存在问题与下周重点计划 -->
				<el-form-item label="存在问题及需支持事项" prop="issues" class="full-width">
					<el-input v-model="formData.issues" type="textarea" :rows="4" placeholder="请输入存在问题及需支持事项" />
				</el-form-item>
				<el-form-item label="下周重点工作计划" prop="nextWeekPlan" class="full-width">
					<el-input v-model="formData.nextWeekPlan" type="textarea" :rows="4" placeholder="请输入下周重点工作计划" />
				</el-form-item>
			</div>
		</el-form>

		<template #actions>
			<el-button class="cancel-button" @click="emit('back')">取消</el-button>
			<!-- <el-button class="draft-button" :loading="loading || uploading" @click="submitWithStatus('0')">保存草稿</el-button> -->
			<!-- <el-button class="download-button" @click="handleDownloadExcel">下载Excel模版</el-button> -->
			<el-button type="primary" class="submit-button" :loading="loading || uploading" @click="submitWithStatus('1')"
				>提交简报</el-button
			>
		</template>
	</FormPageLayout>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from "vue"
import { CircleClose, Delete, Document, Plus, UploadFilled } from "@element-plus/icons-vue"
import {
	ElInput,
	ElSelect,
	ElOption,
	ElButton,
	ElForm,
	ElFormItem,
	ElDatePicker,
	ElInputNumber,
	ElUpload,
	ElTable,
	ElTableColumn,
	ElMessage
} from "element-plus"
import dayjs from "dayjs"
import "dayjs/locale/zh-cn"

// 设置全局 dayjs 语言包为中文，确保周选择器面板默认将周一作为每周第一天，且选中后返回周一日期
dayjs.locale("zh-cn")
import type { FormInstance, FormItemRule, FormRules, UploadFile, UploadInstance, UploadRawFile } from "element-plus"
import CommonDivider from "@/components/CommonDivider/index.vue"
import FormPageLayout from "@/components/FormPageLayout/index.vue"
import { useUserStore } from "@/store/modules/user"
import { listWeeklyReportConfig, getWeeklyReportConfig } from "@/api/system/weeklyReportConfig"
import { uploadWeeklyBusinessBriefFile } from "@/api/system/weeklyBusinessBrief"
import { getTotalProfit } from "@/api/system/dataReport"
import { useDict } from "@/utils/dict"
import type {
	WeeklyBusinessAttachment,
	WeeklyBusinessBriefForm,
	WeeklyBusinessBriefVO,
	WeeklyBusinessExtraField,
	WeeklyBusinessProjectDetail
} from "@/api/system/weeklyBusinessBrief/types"

type NumericKey =
	| "confirmedRevenueWeekly"
	| "confirmedRevenueCumulative"
	| "contractAmountWeekly"
	| "contractAmountCumulative"
	| "bidAmountWeekly"
	| "bidAmountCumulative"
	| "investmentWeekly"
	| "investmentCumulative"
type ComputedWeeklyMetricKey = "confirmedRevenueWeekly" | "contractAmountWeekly" | "bidAmountWeekly"
type BusinessMetricValue = number | undefined

interface DictOption {
	dictValue: string
	dictLabel: string
	[key: string]: any
}

interface BriefingFormState {
	id?: string | number
	deptId?: string | number
	companyId?: string | number
	startTime: string
	endTime: string
	period: string
	annualTargetProfit: number | string
	estimatedProfit: BusinessMetricValue
	completionRate: number
	confirmedRevenueWeekly: BusinessMetricValue
	confirmedRevenueCumulative: BusinessMetricValue
	contractAmountWeekly: BusinessMetricValue
	contractAmountCumulative: BusinessMetricValue
	bidAmountWeekly: BusinessMetricValue
	bidAmountCumulative: BusinessMetricValue
	investmentWeekly: BusinessMetricValue
	investmentCumulative: BusinessMetricValue
	issues: string
	nextWeekPlan: string
	attachments: string
	reporterId?: string | number
	extraFields: WeeklyBusinessExtraField[]
	projectDetails: ProjectDetailRow[]
}

interface ProjectDetailRow {
	rowId: number
	id?: string | number
	briefId?: string | number
	projectType: string
	projectName: string
	amount: BusinessMetricValue
	customerName: string
	contractAmount: BusinessMetricValue
	businessDomain: string
	remark: string
	sort?: number
}

const props = withDefaults(
	defineProps<{
		row?: WeeklyBusinessBriefVO
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
	(e: "submit", payload: WeeklyBusinessBriefForm): void
}>()

const ROOT_DEPT_ID = "420100"
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const uploadRef = ref<UploadInstance>()
const excelUploadRef = ref<UploadInstance>()
const selectedFile = ref<UploadRawFile>()
const uploading = ref(false)
const progressRenderKey = ref(0)
const formData = reactive<BriefingFormState>(createEmptyForm())
const dictMap = useDict("project_type", "business_domain")
const fileTypes = ["pdf", "doc", "docx", "xls", "xlsx"]
const fileAccept = fileTypes.map((type) => `.${type}`).join(",")
const amountDecimalPrecision = 2
let businessDataRowSeed = 0

const metricItems: Array<{ key: NumericKey; label: string; computed?: boolean }> = [
	{ key: "confirmedRevenueWeekly", label: "已达确收条件收入周新增", computed: true },
	{ key: "confirmedRevenueCumulative", label: "已达确收条件收入累计" },
	{ key: "contractAmountWeekly", label: "已签合同金额周新增", computed: true },
	{ key: "contractAmountCumulative", label: "已签合同金额累计" },
	{ key: "bidAmountWeekly", label: "周中标项目金额周新增", computed: true },
	{ key: "bidAmountCumulative", label: "周中标项目金额累计" },
	{ key: "investmentWeekly", label: "已完成投资金额周新增" },
	{ key: "investmentCumulative", label: "已完成投资金额累计" }
]

const projectTypeOptions = computed<DictDataOption[]>(() => getDictOptions(dictMap.project_type))
const businessDomainOptions = computed<DictDataOption[]>(() => getDictOptions(dictMap.business_domain))

// Excel 导入/导出字段描述符：导出与导入共用同一份，动态字段随 extraFields 实时变化
interface ExcelFieldDescriptor {
	group: "经营数据" | "工作进展"
	label: string // 用于匹配 Excel 行
	type: "number" | "text"
	required: boolean
	get: () => number | string // 读当前表单值（导出）
	set: (value: number | string) => void // 写回表单（导入）
}

const EXCEL_HEADER = ["分类", "字段名称", "填报值"]

const excelFields = computed<ExcelFieldDescriptor[]>(() => {
	const fields: ExcelFieldDescriptor[] = [
		// 经营数据：排除「年度目标利润」固定值与计算值 completionRate
		{
			group: "经营数据",
			label: "当月预计完成利润",
			type: "number",
			required: true,
			get: () => formData.estimatedProfit ?? "",
			set: (value) => (formData.estimatedProfit = toOptionalNumber(value))
		},
		...metricItems
			.filter((item) => !item.computed)
			.map<ExcelFieldDescriptor>((item) => ({
				group: "经营数据",
				label: item.label,
				type: "number",
				required: true,
				get: () => formData[item.key] ?? "",
				set: (value) => (formData[item.key] = toOptionalNumber(value))
			}))
	]
	// 工作进展动态字段：标签取配置字段名，必填随配置项
	formData.extraFields.forEach((field, index) => {
		fields.push({
			group: "工作进展",
			label: field.fieldName,
			type: "text",
			required: field.isRequired === "1",
			get: () => formData.extraFields[index]?.fieldValue || "",
			set: (value) => {
				if (formData.extraFields[index]) formData.extraFields[index].fieldValue = String(value)
			}
		})
	})
	// 固定工作进展字段：存在问题及下周计划，非必填，放置于动态扩展字段之后
	fields.push(
		{
			group: "工作进展",
			label: "存在问题及需支持事项",
			type: "text",
			required: false,
			get: () => formData.issues,
			set: (value) => (formData.issues = String(value))
		},
		{
			group: "工作进展",
			label: "下周重点工作计划",
			type: "text",
			required: false,
			get: () => formData.nextWeekPlan,
			set: (value) => (formData.nextWeekPlan = String(value))
		}
	)
	return fields
})

const formRules = computed<FormRules<BriefingFormState>>(() => {
	const rules: FormRules<BriefingFormState> = {
		companyId: [{ required: true, message: "请选择出资公司", trigger: "change" }],
		period: [{ required: true, message: "请选择周期", trigger: "change" }],
		estimatedProfit: createAmountRules("预计完成利润")
	}
	metricItems.forEach((item) => {
		if (item.computed) return
		rules[item.key] = createAmountRules(item.label)
	})
	formData.projectDetails.forEach((_, index) => {
		rules[`projectDetails.${index}.projectType`] = [{ required: true, message: "请选择类型", trigger: "change" }]
		rules[`projectDetails.${index}.projectName`] = [{ required: true, message: "请输入项目名称", trigger: "blur" }]
		rules[`projectDetails.${index}.amount`] = createAmountRules("金额")
		rules[`projectDetails.${index}.customerName`] = [{ required: true, message: "请输入客户名称", trigger: "blur" }]
		rules[`projectDetails.${index}.contractAmount`] = createAmountRules("合同金额")
		rules[`projectDetails.${index}.businessDomain`] = [{ required: true, message: "请选择业务领域", trigger: "change" }]
	})
	// 工作进展动态字段：仅对配置为必填的字段追加强校验规则。
	formData.extraFields.forEach((field, index) => {
		if (field.isRequired === "1") {
			rules[`extraFields.${index}.fieldValue`] = [
				{ required: true, message: `请输入${field.fieldName}`, trigger: "blur" }
			]
		}
	})
	return rules
})

const selectedCompanyName = computed(() => {
	const target = props.companyOptions.find((item) => String(item.dictValue) === String(formData.companyId))
	return target?.dictLabel || ""
})

const annualTargetProfitText = computed(() => {
	if (
		formData.annualTargetProfit === undefined ||
		formData.annualTargetProfit === null ||
		formData.annualTargetProfit === ""
	) {
		return ""
	}
	return `${formatAmountText(formData.annualTargetProfit)} 万元`
})

const attachmentInfo = computed(() => parseAttachment(formData.attachments))

const attachmentName = computed(() => attachmentInfo.value?.name || "")

const isCompanyLocked = computed(() => String(userStore.deptId) !== ROOT_DEPT_ID)
const lockedCompanyId = computed(() => (isCompanyLocked.value ? String(userStore.deptId) : undefined))

const periodOptions = computed(() => buildPeriodOptions())

function getWeekEnd(mondayStr: string) {
	const date = new Date(mondayStr.replace(/-/g, "/"))
	date.setDate(date.getDate() + 6)
	const pad = (value: number) => String(value).padStart(2, "0")
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// 强制将传入的日期字符串标准化为所在周 of 周一日期，避免不同 locale 下周选组件返回周日而偏离一天
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
	return Array.from({ length: 13 }, (_, index) => {
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

function toOptionalNumber(value: unknown): BusinessMetricValue {
	if (value === undefined || value === null || value === "") return undefined
	const num = Number(value)
	return Number.isFinite(num) ? Number(num.toFixed(amountDecimalPrecision)) : undefined
}

function toPayloadNumber(value: BusinessMetricValue) {
	return value === undefined ? 0 : value
}

function toLimitedAmountValue(value: number | string | null | undefined): BusinessMetricValue {
	if (value === undefined || value === null || value === "") return undefined
	const valueText = String(value)
	const [integerPart, decimalPart = ""] = valueText.split(".")
	const limitedText =
		decimalPart.length > amountDecimalPrecision
			? `${integerPart}.${decimalPart.slice(0, amountDecimalPrecision)}`
			: valueText
	const amount = Number(limitedText)
	return Number.isFinite(amount) ? amount : undefined
}

function formatAmountText(value: number | string) {
	const amount = Number(value)
	if (!Number.isFinite(amount)) return String(value)
	// 转回 Number 用于去掉 toFixed 生成的尾随 0，避免展示 1.00 这类补零格式。
	return String(Number(amount.toFixed(amountDecimalPrecision)))
}

function handleFormAmountInput(key: "estimatedProfit" | NumericKey, value: number | string | null | undefined) {
	const limitedValue = toLimitedAmountValue(value)
	if (formData[key] !== limitedValue) {
		formData[key] = limitedValue
	}
}

function handleProjectAmountInput(
	row: ProjectDetailRow,
	key: "amount" | "contractAmount",
	value: number | string | null | undefined
) {
	const limitedValue = toLimitedAmountValue(value)
	if (row[key] !== limitedValue) {
		row[key] = limitedValue
	}
	if (key === "amount") {
		syncWeeklyMetricsFromDetails()
	}
}

function createAmountRules(label: string): FormItemRule[] {
	return [
		{ required: true, message: `请输入${label}`, trigger: ["blur", "change"] },
		{
			validator: (_, value, callback) => {
				if (value === undefined || value === null || value === "") {
					callback()
					return
				}
				const amount = Number(value)
				if (!Number.isFinite(amount) || amount < 0) {
					callback(new Error(`${label}需为大于等于 0 的数字`))
					return
				}
				if (!isValidAmountPrecision(value)) {
					callback(new Error(`${label}最多支持 ${amountDecimalPrecision} 位小数`))
					return
				}
				callback()
			},
			trigger: ["blur", "change"]
		}
	]
}

function isValidAmountPrecision(value: number | string) {
	const decimalPart = String(value).split(".")[1] || ""
	return decimalPart.length <= amountDecimalPrecision
}

function getDictOptions(options?: DictDataOption[]) {
	return Array.isArray(options) ? options : []
}

function handlePeriodChange(value: string) {
	if (value) {
		const mondayStr = getMondayStr(value)
		formData.period = mondayStr // 强行拉回周一，保证与绑定值一致
		formData.startTime = mondayStr
		formData.endTime = getWeekEnd(mondayStr)
	}
}

function createEmptyForm(): BriefingFormState {
	const defaultPeriod = getCurrentWeekStart()
	return {
		startTime: defaultPeriod,
		endTime: getWeekEnd(defaultPeriod),
		period: defaultPeriod,
		annualTargetProfit: "",
		estimatedProfit: undefined,
		completionRate: 0,
		confirmedRevenueWeekly: 0,
		confirmedRevenueCumulative: undefined,
		contractAmountWeekly: 0,
		contractAmountCumulative: undefined,
		bidAmountWeekly: 0,
		bidAmountCumulative: undefined,
		investmentWeekly: undefined,
		investmentCumulative: undefined,
		issues: "",
		nextWeekPlan: "",
		attachments: "",
		deptId: userStore.deptId,
		companyId: String(userStore.deptId) !== ROOT_DEPT_ID ? String(userStore.deptId) : undefined,
		reporterId: userStore.userId,
		extraFields: [],
		projectDetails: []
	}
}

function fillForm(row?: WeeklyBusinessBriefVO) {
	const source = row || {}
	const nextCompanyId = lockedCompanyId.value || (source.companyId ? String(source.companyId) : undefined)
	const periodVal = source.startTime ? getMondayStr(source.startTime.slice(0, 10)) : getCurrentWeekStart()
	Object.assign(formData, {
		id: source.id,
		deptId: lockedCompanyId.value || source.deptId || userStore.deptId,
		companyId: nextCompanyId,
		startTime: source.startTime ? source.startTime.slice(0, 10) : periodVal,
		endTime: source.endTime ? source.endTime.slice(0, 10) : getWeekEnd(periodVal),
		period: periodVal,
		annualTargetProfit:
			source.annualTargetProfit !== undefined && source.annualTargetProfit !== null
				? Number(source.annualTargetProfit)
				: "",
		estimatedProfit: toOptionalNumber(source.estimatedProfit),
		completionRate: Number(source.completionRate || 0),
		confirmedRevenueWeekly: toOptionalNumber(source.confirmedRevenueWeekly),
		confirmedRevenueCumulative: toOptionalNumber(source.confirmedRevenueCumulative),
		contractAmountWeekly: toOptionalNumber(source.contractAmountWeekly),
		contractAmountCumulative: toOptionalNumber(source.contractAmountCumulative),
		bidAmountWeekly: toOptionalNumber(source.bidAmountWeekly),
		bidAmountCumulative: toOptionalNumber(source.bidAmountCumulative),
		investmentWeekly: toOptionalNumber(source.investmentWeekly),
		investmentCumulative: toOptionalNumber(source.investmentCumulative),
		issues: source.issues || "",
		nextWeekPlan: source.nextWeekPlan || "",
		attachments: source.attachments || "",
		reporterId: source.reporterId || userStore.userId,
		extraFields: parseExtraFields(source.extraFields),
		projectDetails: parseProjectDetails(source.projectDetails)
	})
	selectedFile.value = undefined
	uploadRef.value?.clearFiles()
}

function createBusinessDataRow(detail: Partial<WeeklyBusinessProjectDetail> = {}): ProjectDetailRow {
	businessDataRowSeed += 1
	return {
		rowId: businessDataRowSeed,
		id: detail.id,
		briefId: detail.briefId,
		projectType: detail.projectType !== undefined && detail.projectType !== null ? String(detail.projectType) : "",
		projectName: detail.projectName || "",
		amount: toOptionalNumber(detail.amount),
		customerName: detail.customerName || "",
		contractAmount: toOptionalNumber(detail.contractAmount),
		businessDomain: detail.businessDomain || "",
		remark: detail.remark || "",
		sort: detail.sort
	}
}

function handleAddBusinessDataRow() {
	formData.projectDetails.push(createBusinessDataRow({ sort: formData.projectDetails.length + 1 }))
}

function handleDeleteBusinessDataRow(index: number) {
	const oldBusinessDataProps = getBusinessDataFieldProps()
	formData.projectDetails.splice(index, 1)
	syncWeeklyMetricsFromDetails()
	nextTick(() => formRef.value?.clearValidate(oldBusinessDataProps))
}

async function handleCompanyChange(companyId?: string | number) {
	const oldExtraFieldProps = getExtraFieldProps()
	if (!companyId) {
		formData.extraFields = []
		progressRenderKey.value += 1
		await clearExtraFieldValidate(oldExtraFieldProps)
		return
	}
	await loadConfigFields(companyId, oldExtraFieldProps)
}

async function loadConfigFields(companyId: string | number, oldExtraFieldProps = getExtraFieldProps()) {
	try {
		const res = (await listWeeklyReportConfig({
			enterpriseId: companyId,
			isEnabled: "1",
			pageNum: 1,
			pageSize: 1
		})) as any

		// 获取配置 ID 并在存在时获取详情以获取 fields 子表，因为列表接口可能不返回子表
		const configId = res.rows?.[0]?.id
		let fields = []
		if (configId) {
			const detailRes = (await getWeeklyReportConfig(configId)) as any
			fields = detailRes.data?.fields || []
		}

		const oldValueMap = new Map(formData.extraFields.map((item) => [item.fieldName, item.fieldValue || ""]))
		formData.extraFields = [...fields]
			.sort((prev, next) => Number(prev.sortOrder || 0) - Number(next.sortOrder || 0))
			.map((item) => ({
				fieldName: item.fieldName,
				fieldValue: oldValueMap.get(item.fieldName) || "",
				// 按配置项的必填标识渲染，提交时对必填字段做强校验。
				isRequired: item.isRequired === "1" || item.isRequired === true ? "1" : "0",
				sortOrder: Number(item.sortOrder || 0)
			}))
		progressRenderKey.value += 1
		await clearExtraFieldValidate(oldExtraFieldProps)
	} catch (error) {
		console.error(error)
	}
}

function getConfigCompanyId() {
	return lockedCompanyId.value || formData.companyId
}

async function loadInitialConfigFields() {
	const companyId = getConfigCompanyId()
	if (!companyId) return
	// 进入填报页即按当前 deptId 对应公司加载工作进展配置，并保留同名字段已有内容。
	await loadConfigFields(companyId)
}

function getExtraFieldProps() {
	return formData.extraFields.map((_, index) => `extraFields.${index}.fieldValue`)
}

async function clearExtraFieldValidate(oldExtraFieldProps: string[] = []) {
	await nextTick()
	// 出资公司切换后仅刷新工作进展内容，避免动态规则变化立刻抛出必填校验。
	formRef.value?.clearValidate([...oldExtraFieldProps, ...getExtraFieldProps()])
}

function parseExtraFields(extraFields?: string): WeeklyBusinessExtraField[] {
	if (!extraFields) return []
	try {
		const parsed = JSON.parse(extraFields)
		if (Array.isArray(parsed)) return parsed
		if (parsed && typeof parsed === "object") return [parsed]
		return []
	} catch {
		return []
	}
}

function parseProjectDetails(details?: WeeklyBusinessProjectDetail[] | string): ProjectDetailRow[] {
	if (!details) return []
	try {
		const parsed =
			typeof details === "string"
				? (JSON.parse(details) as WeeklyBusinessProjectDetail | WeeklyBusinessProjectDetail[])
				: details
		const detailList = Array.isArray(parsed) ? parsed : [parsed]
		return detailList.filter(Boolean).map((item) => createBusinessDataRow(item))
	} catch {
		return []
	}
}

function getProjectTypeCategory(projectType?: string): ComputedWeeklyMetricKey | undefined {
	const option = projectTypeOptions.value.find((item) => String(item.value) === String(projectType))
	const normalizedText = `${option?.label || ""}${projectType || ""}`.toLowerCase()
	if (normalizedText.includes("确收") || normalizedText.includes("confirm") || normalizedText.includes("revenue"))
		return "confirmedRevenueWeekly"
	if (normalizedText.includes("新签") || normalizedText.includes("sign") || normalizedText.includes("contract"))
		return "contractAmountWeekly"
	if (normalizedText.includes("中标") || normalizedText.includes("bid") || normalizedText.includes("tender"))
		return "bidAmountWeekly"
	return undefined
}

function normalizeBusinessAmount(value: number) {
	return Number(value.toFixed(amountDecimalPrecision))
}

function syncWeeklyMetricsFromDetails() {
	const sums: Record<ComputedWeeklyMetricKey, number> = {
		confirmedRevenueWeekly: 0,
		contractAmountWeekly: 0,
		bidAmountWeekly: 0
	}
	formData.projectDetails.forEach((row) => {
		const category = getProjectTypeCategory(row.projectType)
		if (!category) return
		sums[category] += toPayloadNumber(row.amount)
	})
	formData.confirmedRevenueWeekly = normalizeBusinessAmount(sums.confirmedRevenueWeekly)
	formData.contractAmountWeekly = normalizeBusinessAmount(sums.contractAmountWeekly)
	formData.bidAmountWeekly = normalizeBusinessAmount(sums.bidAmountWeekly)
}

function handleBusinessDataChange() {
	syncWeeklyMetricsFromDetails()
}

function validateBusinessDataField(index: number, field: "amount" | "contractAmount") {
	nextTick(() => formRef.value?.validateField(`projectDetails.${index}.${field}`).catch(() => undefined))
}

function getBusinessDataFieldProps() {
	return formData.projectDetails.flatMap((_, index) => [
		`projectDetails.${index}.projectType`,
		`projectDetails.${index}.projectName`,
		`projectDetails.${index}.amount`,
		`projectDetails.${index}.customerName`,
		`projectDetails.${index}.contractAmount`,
		`projectDetails.${index}.businessDomain`
	])
}

function isBusinessDataRowEmpty(row: ProjectDetailRow) {
	return (
		!row.projectType &&
		!row.projectName &&
		row.amount === undefined &&
		!row.customerName &&
		row.contractAmount === undefined &&
		!row.businessDomain &&
		!row.remark
	)
}

function toPayloadProjectType(value: string) {
	const num = Number(value)
	return Number.isFinite(num) ? num : undefined
}

function buildProjectDetailPayload() {
	return formData.projectDetails
		.filter((row) => !isBusinessDataRowEmpty(row))
		.map<WeeklyBusinessProjectDetail>((row, index) => ({
			id: row.id,
			briefId: row.briefId,
			projectType: toPayloadProjectType(row.projectType),
			projectName: row.projectName,
			amount: toPayloadNumber(row.amount),
			customerName: row.customerName,
			contractAmount: toPayloadNumber(row.contractAmount),
			businessDomain: row.businessDomain,
			remark: row.remark,
			sort: row.sort || index + 1
		}))
}

function getExtraFieldPlaceholder(fieldName: string) {
	const placeholderMap: Record<string, string> = {
		平台运营情况: "描述本周平台运营情况...",
		经营活动进展: "描述本周主要经营活动进展...",
		市场拓展情况: "描述本周市场拓展情况..."
	}
	return placeholderMap[fieldName] || `描述本周${fieldName}...`
}

function handleFileChange(file: UploadFile) {
	const rawFile = file.raw
	if (!rawFile) return
	if (!validateBriefingFile(rawFile)) {
		uploadRef.value?.clearFiles()
		return
	}
	selectedFile.value = rawFile
	formData.attachments = rawFile.name
	formRef.value?.validateField("attachments")
}

function handleFileRemove() {
	selectedFile.value = undefined
	formData.attachments = ""
	formRef.value?.validateField("attachments")
}

/** 点击删除图标清除已选文件 */
function handleClearFile() {
	uploadRef.value?.clearFiles()
	handleFileRemove()
}

function handleFileExceed(files: File[]) {
	const file = files[0] as UploadRawFile | undefined
	if (!file) return
	uploadRef.value?.clearFiles()
	if (!validateBriefingFile(file)) return
	uploadRef.value?.handleStart(file)
	selectedFile.value = file
	formData.attachments = file.name
	formRef.value?.validateField("attachments")
}

function validateBriefingFile(file: UploadRawFile) {
	const fileExt = file.name.split(".").pop()?.toLowerCase() || ""
	if (!fileTypes.includes(fileExt)) {
		ElMessage.error(`文件格式不正确，请上传 ${fileTypes.join("/")} 格式文件`)
		return false
	}
	if (file.name.includes(",")) {
		ElMessage.error("文件名不能包含英文逗号")
		return false
	}
	if (file.size / 1024 / 1024 > 50) {
		ElMessage.error("上传文件大小不能超过 50MB")
		return false
	}
	return true
}

/** 下载 Excel 模板：前端按当前表单结构动态生成（含动态工作进展字段） */
async function handleDownloadExcel() {
	const XLSX = await import("xlsx")
	const aoa = [EXCEL_HEADER, ...excelFields.value.map((field) => [field.group, field.label, field.get()])]
	const worksheet = XLSX.utils.aoa_to_sheet(aoa)
	worksheet["!cols"] = [{ wch: 12 }, { wch: 28 }, { wch: 24 }]
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, worksheet, "经营简报")
	const fileName = `经营简报数据模板${selectedCompanyName.value ? `_${selectedCompanyName.value}` : ""}.xlsx`
	XLSX.writeFile(workbook, fileName)
}

/** 选择 Excel 后解析并回填表单 */
function handleExcelImport(file: UploadFile) {
	const rawFile = file.raw
	if (!rawFile) return
	const fileExt = rawFile.name.split(".").pop()?.toLowerCase() || ""
	if (!["xlsx", "xls"].includes(fileExt)) {
		ElMessage.error("请上传 .xlsx 或 .xls 格式的 Excel 文件")
		excelUploadRef.value?.clearFiles()
		return
	}
	const reader = new FileReader()
	reader.onload = async (event) => {
		try {
			const buffer = event.target?.result
			if (!buffer || typeof buffer === "string") return
			const XLSX = await import("xlsx")
			const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" })
			const worksheet = workbook.Sheets[workbook.SheetNames[0]]
			const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, blankrows: false })
			applyExcelRows(rows)
		} catch (error) {
			console.error(error)
			ElMessage.error("Excel 解析失败，请确认文件内容格式")
		} finally {
			excelUploadRef.value?.clearFiles()
		}
	}
	reader.readAsArrayBuffer(rawFile)
}

function handleExcelExceed(files: File[]) {
	const file = files[0] as UploadRawFile | undefined
	if (!file) return
	excelUploadRef.value?.clearFiles()
	handleExcelImport({ raw: file, name: file.name } as UploadFile)
}

/** 先整体校验（格式 + 必填），全部合规后再统一赋值，避免半截写入 */
function applyExcelRows(rows: any[][]) {
	// 定位「字段名称」「填报值」列，找不到表头则回退到第 2、3 列
	let labelCol = 1
	let valueCol = 2
	const headerIndex = rows.findIndex((row) => Array.isArray(row) && row.includes("字段名称") && row.includes("填报值"))
	if (headerIndex >= 0) {
		labelCol = rows[headerIndex].indexOf("字段名称")
		valueCol = rows[headerIndex].indexOf("填报值")
	}

	const valueMap = new Map<string, any>()
	rows.forEach((row, index) => {
		if (headerIndex >= 0 && index <= headerIndex) return
		const label = String(row?.[labelCol] ?? "").trim()
		if (label) valueMap.set(label, row?.[valueCol])
	})

	const errors: string[] = []
	const staging: Array<{ field: ExcelFieldDescriptor; value: number | string }> = []
	excelFields.value.forEach((field) => {
		const rawValue = valueMap.get(field.label)
		const text = rawValue === undefined || rawValue === null ? "" : String(rawValue).trim()
		if (field.type === "number") {
			const normalized = text.replace(/,/g, "")
			if (!normalized) {
				if (field.required) errors.push(`「${field.label}」为必填项`)
				else staging.push({ field, value: "" })
				return
			}
			if (isNaN(Number(normalized))) {
				errors.push(`「${field.label}」格式不符，需填写数字`)
				return
			}
			if (Number(normalized) < 0) {
				errors.push(`「${field.label}」格式不符，不能小于 0`)
				return
			}
			// 与页面金额精度保持一致，避免导入数据绕过表单校验。
			if ((normalized.split(".")[1] || "").length > amountDecimalPrecision) {
				errors.push(`「${field.label}」格式不符，最多支持 ${amountDecimalPrecision} 位小数`)
				return
			}
			staging.push({ field, value: Number(normalized) })
		} else {
			if (field.required && !text) {
				errors.push(`「${field.label}」为必填项`)
				return
			}
			staging.push({ field, value: text })
		}
	})

	if (errors.length) {
		ElMessage({ type: "error", message: `导入失败：${errors.join("；")}`, duration: 5000 })
		return
	}

	staging.forEach(({ field, value }) => field.set(value))
	formRef.value?.clearValidate()
	ElMessage.success("Excel 导入成功")
}

async function ensureAttachmentUploaded() {
	if (!selectedFile.value) return
	uploading.value = true
	try {
		// 提交前先上传到系统 OSS，并按后端附件数组结构保存文件名和地址
		const uploadFormData = new FormData()
		uploadFormData.append("file", selectedFile.value)
		const uploadRes = await uploadWeeklyBusinessBriefFile(uploadFormData)
		const uploadData = uploadRes.data
		formData.attachments = JSON.stringify([
			{
				fileName: uploadData.fileName || selectedFile.value.name,
				url: uploadData.url
			}
		])
		selectedFile.value = undefined
	} finally {
		uploading.value = false
	}
}

function getPayload(status: string): WeeklyBusinessBriefForm {
	syncWeeklyMetricsFromDetails()
	const annualTargetProfitNum = formData.annualTargetProfit !== "" ? Number(formData.annualTargetProfit) : 0
	const estimatedProfit = toPayloadNumber(formData.estimatedProfit)
	const completionRate =
		annualTargetProfitNum > 0 ? Number(((estimatedProfit / annualTargetProfitNum) * 100).toFixed(2)) : 0
	return {
		id: formData.id,
		deptId: lockedCompanyId.value || formData.deptId || userStore.deptId,
		companyId: lockedCompanyId.value || formData.companyId,
		startTime: formData.startTime,
		endTime: formData.endTime,
		annualTargetProfit: formData.annualTargetProfit !== "" ? Number(formData.annualTargetProfit) : undefined,
		estimatedProfit,
		completionRate,
		confirmedRevenueWeekly: toPayloadNumber(formData.confirmedRevenueWeekly),
		confirmedRevenueCumulative: toPayloadNumber(formData.confirmedRevenueCumulative),
		contractAmountWeekly: toPayloadNumber(formData.contractAmountWeekly),
		contractAmountCumulative: toPayloadNumber(formData.contractAmountCumulative),
		bidAmountWeekly: toPayloadNumber(formData.bidAmountWeekly),
		bidAmountCumulative: toPayloadNumber(formData.bidAmountCumulative),
		investmentWeekly: toPayloadNumber(formData.investmentWeekly),
		investmentCumulative: toPayloadNumber(formData.investmentCumulative),
		issues: formData.issues,
		nextWeekPlan: formData.nextWeekPlan,
		extraFields: JSON.stringify(formData.extraFields),
		projectDetails: buildProjectDetailPayload(),
		status,
		attachments: formData.attachments,
		reporterId: formData.reporterId || userStore.userId
	}
}

async function submitWithStatus(status: string) {
	if (props.loading || uploading.value) return
	const valid = await formRef.value?.validate().catch(() => false)
	if (!valid) return
	await ensureAttachmentUploaded()
	emit("submit", getPayload(status))
}

function parseAttachment(value?: string): WeeklyBusinessAttachment | undefined {
	if (!value) return undefined
	try {
		const parsed = JSON.parse(value) as WeeklyBusinessAttachment | WeeklyBusinessAttachment[]
		if (Array.isArray(parsed)) {
			const firstAttachment = parsed[0]
			if (!firstAttachment) return undefined
			return {
				name: firstAttachment.name || firstAttachment.fileName || getFileNameByUrl(firstAttachment.url) || "周报文件",
				url: firstAttachment.url || "",
				ossId: firstAttachment.ossId,
				fileName: firstAttachment.fileName
			}
		}
		if (parsed && typeof parsed === "object") {
			return {
				name: parsed.name || parsed.fileName || getFileNameByUrl(parsed.url) || "周报文件",
				url: parsed.url || "",
				ossId: parsed.ossId,
				fileName: parsed.fileName
			}
		}
	} catch {
		// 兼容旧数据：纯 URL 支持预览，纯文件名只展示名称
	}
	const isUrl = /^(https?:\/\/|\/)/.test(value)
	return {
		name: isUrl ? getFileNameByUrl(value) : value,
		url: isUrl ? value : ""
	}
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

watch(
	() => formData.projectDetails,
	() => syncWeeklyMetricsFromDetails(),
	{ deep: true, immediate: true }
)

watch(projectTypeOptions, () => syncWeeklyMetricsFromDetails(), { deep: true })

watch(
	() => [props.row, userStore.deptId] as const,
	async ([row]) => {
		fillForm(row)
		await loadInitialConfigFields()
	},
	{ immediate: true, deep: true }
)

watch(
	() => [getConfigCompanyId(), formData.period] as const,
	async ([deptId, period]) => {
		if (deptId && period) {
			const year = dayjs(period).year()
			try {
				const res = await getTotalProfit({ year, deptId })
				if (res.data !== null && res.data !== undefined && String(res.data) !== "") {
					formData.annualTargetProfit = Number(res.data)
				} else {
					formData.annualTargetProfit = ""
				}
			} catch (error) {
				console.error("获取年度目标利润失败:", error)
				formData.annualTargetProfit = ""
			}
		} else {
			formData.annualTargetProfit = ""
		}
	},
	{ immediate: true }
)
</script>

<style scoped lang="scss">
.briefing-page-layout {
	:deep(.create-card) {
		width: 100%;
		box-sizing: border-box;
	}

	:deep(.prototype-form) {
		min-width: 0;
	}
}

.briefing-form {
	.form-grid {
		display: grid;
		width: 100%;
		max-width: 1120px;
		row-gap: 2px;
	}

	.base-grid {
		/* 左侧 2/3 放选择项，右侧 1/3 放上传区 */
		grid-template-columns: 1fr 1fr 1fr;
		column-gap: 48px;
		align-items: start;
		justify-content: start;
		margin-bottom: 24px;
	}

	.briefing-upload-item {
		/* 固定在右列，跨越两行与左侧选择项并排 */
		grid-column: 2;
		grid-row: 1 / span 2;
	}

	.excel-import-item {
		/* Excel 数据导入，紧跟周报文件右侧一列 */
		grid-column: 3;
		grid-row: 1 / span 2;
	}

	.metric-grid {
		grid-template-columns: repeat(3, minmax(240px, 1fr));
		column-gap: 32px;
	}

	:deep(.el-form-item) {
		min-width: 0;
	}

	.full-width {
		grid-column: 1 / -1;
	}

	:deep(.el-select),
	:deep(.el-input-number),
	:deep(.el-date-editor) {
		width: 100%;
	}

	:deep(.el-input-number .el-input__inner) {
		text-align: left;
	}

	.file-uploader {
		width: min(720px, 100%);
		margin-top: 4px;

		/* 拖拽区内容垂直+水平居中 */
		:deep(.el-upload-dragger) {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}
	}

	.upload-icon {
		font-size: 32px;
		color: var(--el-color-primary);
		margin-bottom: 8px;
	}

	/* 已选文件行：图标 + 文件名 + 删除按钮 */
	.file-selected {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 6px;
		max-width: 100%;
	}

	.file-selected-icon {
		flex-shrink: 0;
		color: var(--el-color-primary);
	}

	.file-name {
		color: var(--el-color-primary);
		font-size: 13px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
		min-width: 0;
	}

	.file-delete-icon {
		flex-shrink: 0;
		color: #c0c4cc;
		cursor: pointer;
		transition: color 0.2s;

		&:hover {
			color: var(--el-color-danger);
		}
	}

	.upload-tip {
		color: #8a94a6;
		font-size: 12px;
		margin-top: 4px;
	}

	.section-title {
		margin: 24px 0 8px;
		color: #0f2748;
		font-size: 16px;
		font-weight: 700;
	}

	.project-detail-section {
		width: min(1120px, 100%);
		margin-top: 24px;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 12px;
	}

	.detail-title {
		margin: 0;
	}

	.business-detail-table {
		width: 100%;

		:deep(.el-table__cell) {
			padding: 8px 0;
		}

		:deep(.el-table__body .el-table__cell) {
			vertical-align: top;
		}

		:deep(.cell) {
			padding: 0 8px;
		}

		:deep(.el-table__row) {
			height: 69px;
		}
	}

	.table-control,
	.table-number-control {
		width: 100%;
	}

	.table-form-item {
		margin-bottom: 0;

		:deep(.el-form-item__content) {
			align-items: stretch;
			flex-direction: column;
			line-height: 1;
		}

		:deep(.el-form-item__error) {
			position: static;
			padding-top: 4px;
			line-height: 16px;
		}
	}

	:deep(.table-number-control .el-input__inner) {
		text-align: left;
	}

	.progress-title {
		margin-top: 24px;
	}

	.textarea-list {
		display: flex;
		flex-direction: column;
		width: min(1120px, 100%);
	}
}

.cancel-button,
.draft-button,
.download-button,
.submit-button {
	min-width: 84px;
	height: 40px;
	border-radius: 8px;
	font-size: 15px;
	font-weight: 700;
}

.cancel-button {
	color: #1f2a44;
	border-color: #d4dae4;
}

.draft-button {
	color: #1f2a44;
	border-color: #d4dae4;
	background: #f4f6f9;
}
.download-button,
.submit-button {
	background: var(--el-color-primary, #00b46e);
	border-color: var(--el-color-primary, #00b46e);
	color: #fff;
}

@media (max-width: 1200px) {
	.briefing-form {
		.base-grid,
		.metric-grid {
			column-gap: 24px;
		}

		.metric-grid {
			grid-template-columns: repeat(2, minmax(240px, 1fr));
		}
	}
}

@media (max-width: 640px) {
	.briefing-page-layout {
		:deep(.create-card-header),
		:deep(.prototype-form),
		:deep(.form-actions) {
			padding-right: 24px;
			padding-left: 24px;
		}
	}

	.briefing-form {
		.base-grid,
		.metric-grid {
			grid-template-columns: 1fr;
		}

		.section-header {
			align-items: flex-start;
			flex-direction: column;
		}

		.briefing-upload-item {
			grid-column: auto;
		}

		.excel-import-item {
			grid-column: auto;
			grid-row: auto;
		}
	}
}
</style>
