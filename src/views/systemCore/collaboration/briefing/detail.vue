<template>
	<DetailPageLayout
		:title="`${row.companyName || '公司'} - 经营简报详情`"
		:status-label="statusMap[row.status || '0']"
		:status-class="row.status === '1' ? 'status-completed' : 'status-pending'"
		@back="emit('back')"
	>
		<template #subline>
			<div class="subline-wrapper">
				<span class="meta-item">周期：{{ periodLabel }}</span>
				<span class="sep-line">|</span>
				<span class="meta-item">提交时间：{{ row.createTime || "-" }}</span>
			</div>
		</template>

		<div class="briefing-detail-container">
			<section class="detail-section">
				<div class="section-header">
					<h2>经营数据 (万元)</h2>
				</div>
				<div class="info-grid">
					<div v-for="item in metricItems" :key="item.label" class="info-item">
						<span class="info-label">{{ item.label }}：</span>
						<span class="info-value" :class="{ 'text-danger': item.isDanger }">{{ item.value }}</span>
					</div>
					<div v-if="attachmentInfo" class="info-item full-width">
						<span class="info-label">附件：</span>
						<span class="info-value attachment-value">
							<el-icon class="file-icon"><Document /></el-icon>
							<span class="attachment-name">{{ attachmentInfo.name }}</span>
							<el-button
								v-if="attachmentInfo.url"
								type="primary"
								link
								class="preview-button"
								@click="handlePreviewAttachment"
								>预览</el-button
							>
						</span>
					</div>
				</div>
			</section>

			<CommonDivider :offset="26" :vertical-margin="0" />
			<section class="detail-section project-detail-section">
				<div class="section-header">
					<h2>本周确收/新签/中标项目明细</h2>
				</div>
				<CommonTable :data="projectDetailRows" :columns="projectDetailColumns" row-key="rowId" :max-height="360" />
			</section>

			<template v-for="field in progressFieldList" :key="field.fieldName">
				<CommonDivider :offset="26" :vertical-margin="0" />
				<section class="detail-section">
					<div class="section-header">
						<h2>{{ field.fieldName }}</h2>
					</div>
					<p class="section-text">{{ field.fieldValue || "-" }}</p>
				</section>
			</template>
		</div>
	</DetailPageLayout>

	<FilePreview v-model:visible="previewVisible" :file-url="previewFileUrl" :file-name="previewFileName" />
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { ElButton, ElIcon } from "element-plus"
import { Document } from "@element-plus/icons-vue"
import DetailPageLayout from "@/components/DetailPageLayout/index.vue"
import CommonDivider from "@/components/CommonDivider/index.vue"
import CommonTable from "@/components/CommonTable/index.vue"
import FilePreview from "@/components/FilePreview/index.vue"
import { useDict } from "@/utils/dict"
import type {
	WeeklyBusinessAttachment,
	WeeklyBusinessBriefVO,
	WeeklyBusinessExtraField,
	WeeklyBusinessProjectDetail
} from "@/api/system/weeklyBusinessBrief/types"

interface ProjectDetailDisplayRow {
	rowId: string
	projectTypeLabel: string
	projectName: string
	amountText: string
	customerName: string
	contractAmountText: string
	businessDomainLabel: string
	remark: string
}

interface TableColumn {
	prop?: keyof ProjectDetailDisplayRow
	label: string
	minWidth?: string | number
	showOverflowTooltip?: boolean
}

const props = withDefaults(
	defineProps<{
		row?: WeeklyBusinessBriefVO
	}>(),
	{
		row: () => ({})
	}
)

const emit = defineEmits<{
	(e: "back"): void
}>()

const previewVisible = ref(false)
const previewFileUrl = ref("")
const previewFileName = ref("")
const amountDecimalPrecision = 2
const dictMap = useDict("project_type", "business_domain")

const statusMap: Record<string, string> = {
	"0": "草稿",
	"1": "已提交"
}

const periodLabel = computed(() => {
	if (!props.row.startTime && !props.row.endTime) return "-"
	return `${formatDate(props.row.startTime)} 至 ${formatDate(props.row.endTime)}`
})

const metricItems = computed(() => [
	{ label: "年度目标利润", value: `${formatMoney(props.row.annualTargetProfit)} 万元` },
	{ label: "当月预计完成", value: `${formatMoney(props.row.estimatedProfit)} 万元` },
	{
		label: "利润完成率",
		value: formatPercent(props.row.completionRate),
		isDanger: Number(props.row.completionRate || 0) < 80
	},
	{ label: "已达确收条件收入周新增", value: `${formatMoney(props.row.confirmedRevenueWeekly)} 万元` },
	{ label: "已达确收条件收入累计", value: `${formatMoney(props.row.confirmedRevenueCumulative)} 万元` },
	{ label: "已签合同金额周新增", value: `${formatMoney(props.row.contractAmountWeekly)} 万元` },
	{ label: "已签合同金额累计", value: `${formatMoney(props.row.contractAmountCumulative)} 万元` },
	{ label: "周中标项目金额周新增", value: `${formatMoney(props.row.bidAmountWeekly)} 万元` },
	{ label: "周中标项目金额累计", value: `${formatMoney(props.row.bidAmountCumulative)} 万元` },
	{ label: "已完成投资金额周新增", value: `${formatMoney(props.row.investmentWeekly)} 万元` },
	{ label: "已完成投资金额累计", value: `${formatMoney(props.row.investmentCumulative)} 万元` }
])

const progressFieldList = computed<WeeklyBusinessExtraField[]>(() => [
	// 扩展配置字段从 extraFields JSON 中解析
	...parseExtraFields(props.row.extraFields),
	// 固定工作进展字段，放置于动态扩展字段之后
	{ fieldName: "存在问题及需支持事项", fieldValue: props.row.issues || "" },
	{ fieldName: "下周重点工作计划", fieldValue: props.row.nextWeekPlan || "" }
])

const attachmentInfo = computed(() => parseAttachment(props.row.attachments))

const projectDetailColumns: TableColumn[] = [
	{ prop: "projectTypeLabel", label: "类型（确收/新签/中标）", minWidth: 180 },
	{ prop: "projectName", label: "项目名称", minWidth: 180, showOverflowTooltip: true },
	{ prop: "amountText", label: "金额（万元）", minWidth: 140 },
	{ prop: "customerName", label: "客户名称", minWidth: 180, showOverflowTooltip: true },
	{ prop: "contractAmountText", label: "合同金额（万元）", minWidth: 160 },
	{ prop: "businessDomainLabel", label: "业务领域", minWidth: 160 },
	{ prop: "remark", label: "备注", minWidth: 220, showOverflowTooltip: true }
]

const projectDetailRows = computed<ProjectDetailDisplayRow[]>(() =>
	parseProjectDetails(props.row.projectDetails).map((item, index) => ({
		rowId: `${item.id ?? item.sort ?? "project"}-${index}`,
		projectTypeLabel: getDictLabel(dictMap.project_type, item.projectType),
		projectName: item.projectName || "-",
		amountText: formatMoney(item.amount),
		customerName: item.customerName || "-",
		contractAmountText: formatMoney(item.contractAmount),
		businessDomainLabel: getDictLabel(dictMap.business_domain, item.businessDomain),
		remark: item.remark || "-"
	}))
)

function parseExtraFields(extraFields?: string) {
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

function parseProjectDetails(details?: WeeklyBusinessProjectDetail[] | string) {
	if (!details) return []
	try {
		const parsed =
			typeof details === "string"
				? (JSON.parse(details) as WeeklyBusinessProjectDetail | WeeklyBusinessProjectDetail[])
				: details
		return (Array.isArray(parsed) ? parsed : [parsed]).filter((item): item is WeeklyBusinessProjectDetail =>
			Boolean(item)
		)
	} catch {
		return []
	}
}

function getDictLabel(options: DictDataOption[] | undefined, value?: string | number) {
	if (value === undefined || value === null || value === "") return "-"
	const target = (Array.isArray(options) ? options : []).find((item) => String(item.value) === String(value))
	return target?.label || String(value)
}

function formatDate(value?: string) {
	return value ? value.slice(0, 10) : "-"
}

function formatMoney(value?: string | number) {
	if (value === undefined || value === null || value === "") return "-"
	const amount = Number(value)
	if (!Number.isFinite(amount)) return String(value)
	// 转回 Number 用于去掉 toFixed 生成的尾随 0，符合金额展示“不补 0”的要求。
	return String(Number(amount.toFixed(amountDecimalPrecision)))
}

function formatPercent(value?: string | number) {
	if (value === undefined || value === null || value === "") return "-"
	const percent = Number(value)
	if (!Number.isFinite(percent)) return String(value)
	return `${Number(percent.toFixed(2))}%`
}

function handlePreviewAttachment() {
	if (!attachmentInfo.value?.url) return
	previewFileName.value = attachmentInfo.value.name || "附件预览"
	previewFileUrl.value = attachmentInfo.value.url
	previewVisible.value = true
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
</script>

<style scoped lang="scss">
.subline-wrapper {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 12px;
	color: #5d6678;
	font-size: 14px;

	.sep-line {
		color: #edf0f5;
		margin: 0 4px;
	}
}

.briefing-detail-container {
	display: flex;
	flex-direction: column;
}

.detail-section {
	padding: 24px 26px;

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 22px;

		h2 {
			margin: 0;
			padding-left: 10px;
			border-left: 4px solid var(--el-color-primary, #00b46e);
			color: #202938;
			font-size: 16px;
			line-height: 20px;
		}
	}
}

.info-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 18px 40px;
}

.info-item {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;
	line-height: 20px;

	.info-label {
		color: #8a94a6;
		white-space: nowrap;
	}

	.info-value {
		color: #202938;
		&.text-danger {
			color: #f53f3f;
		}
	}

	&.full-width {
		grid-column: 1 / -1;
		align-items: flex-start;
	}
}

.attachment-value {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	min-width: 0;
	color: var(--el-color-primary, #00b46e) !important;

	.file-icon {
		font-size: 16px;
	}
}

.attachment-name {
	max-width: 420px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.preview-button {
	padding: 0;
}

.section-text {
	margin: 0;
	color: #1a1e2d;
	font-size: 14px;
	line-height: 1.8;
	white-space: pre-wrap;
}

@media (max-width: 1200px) {
	.info-grid {
		grid-template-columns: 1fr;
		gap: 14px;
	}
}
</style>
