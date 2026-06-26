<template>
	<DetailPageLayout
		v-if="detail"
		:title="detail.projectName || '-'"
		:status-label="String(detail.statusName || '-')"
		:status-class="statusClass"
		@back="emit('back')"
	>
		<template #subline>
			<div class="detail-subline">
				<div class="detail-subline__meta">
					<span>申请单号: {{ detail.applicationNo }}</span>
					<b>|</b>
					<span>申请单位: {{ detail.applicantEnterpriseIdName || "-" }}</span>
					<b>|</b>
					<span>流程实例ID: {{ detail.processInstanceId || "-" }}</span>
					<b>|</b>
					<span>更新时间: {{ detail.updateTime || "-" }}</span>
				</div>
				<div class="detail-subline__actions">
					<el-button v-hasPermi="['base:businessMatters:add']" v-if="showEditButton" @click="emit('edit')"
						>编辑</el-button
					>
					<el-button
						v-hasPermi="['base:businessMatters:handle']"
						v-if="showProcessButton"
						type="primary"
						@click="emit('process')"
						>处理</el-button
					>
				</div>
			</div>
		</template>

		<div class="detail-layout-body">
			<div class="detail-left">
				<section class="info-section">
					<h2>项目基本情况</h2>
					<div class="info-grid">
						<div class="info-grid__item">
							<span class="info-grid__label">事项类型</span>
							<span class="info-grid__value">{{ detail.matterTypeName || "-" }}</span>
						</div>
						<div class="info-grid__item">
							<span class="info-grid__label">申请日期</span>
							<span class="info-grid__value">{{ detail.applicationDate || "-" }}</span>
						</div>
						<div class="info-grid__item">
							<span class="info-grid__label">申请企业ID</span>
							<span class="info-grid__value">{{ detail.applicantEnterpriseId || "-" }}</span>
						</div>
						<div class="info-grid__item">
							<span class="info-grid__label">当前环节</span>
							<span class="info-grid__value">{{ detail.statusName || "-" }}</span>
						</div>
					</div>
				</section>

				<section class="info-section">
					<h2>项目说明</h2>
					<div class="desc-card-list">
						<div class="desc-card">
							<h3>项目背景</h3>
							<p>{{ detail.projectBackground }}</p>
						</div>
						<div class="desc-card">
							<h3>项目目标</h3>
							<p>{{ detail.projectGoal }}</p>
						</div>
						<div class="desc-card">
							<h3>交易对手方</h3>
							<p>{{ detail.counterparty || "-" }}</p>
						</div>
						<div class="desc-card">
							<h3>核心内容</h3>
							<p>{{ detail.coreContent }}</p>
						</div>
						<div class="desc-card desc-card--full">
							<h3>触发集团审议说明</h3>
							<p>{{ detail.triggerDescription || "-" }}</p>
						</div>
					</div>
				</section>

				<section class="info-section">
					<h2>经营与风险分析</h2>
					<div class="desc-card-list">
						<div class="desc-card">
							<h3>合同金额（万元）</h3>
							<p>{{ detail.contractAmount }}</p>
						</div>
						<div class="desc-card">
							<h3>利润情况</h3>
							<p>{{ detail.profitSituation || "-" }}</p>
						</div>
						<div class="desc-card">
							<h3>资金安排</h3>
							<p>{{ detail.fundArrangement || "-" }}</p>
						</div>
						<div class="desc-card">
							<h3>法律合规</h3>
							<p>{{ detail.legalCompliance }}</p>
						</div>
						<div class="desc-card">
							<h3>技术安全</h3>
							<p>{{ detail.techAndSafety || "-" }}</p>
						</div>
						<div class="desc-card">
							<h3>履约风险</h3>
							<p>{{ detail.performanceRisk }}</p>
						</div>
						<div class="desc-card desc-card--full">
							<h3>备注说明</h3>
							<p>{{ detail.remark || "-" }}</p>
						</div>
					</div>
				</section>

				<section class="info-section">
					<h2>附件材料</h2>
					<div class="attachment-panel">
						<div v-for="item in attachmentList" :key="item.key" class="attachment-card">
							<div>
								<strong>{{ item.label }}</strong>
								<div v-if="getAttachmentFiles(item).length" class="attachment-card__files">
									<p v-for="(file, index) in getAttachmentFiles(item)" :key="`${item.key}-${file.value}-${index}`">
										{{ file.name || "未命名附件" }}
									</p>
								</div>
								<p v-else>暂未上传附件</p>
							</div>
							<div v-if="getAttachmentFiles(item).length" class="attachment-card__files">
								<div
									v-for="(file, index) in getAttachmentFiles(item)"
									:key="`${item.key}-action-${file.value}-${index}`"
									class="attachment-card__actions"
								>
									<!-- <span>{{ file.sizeText || '-' }}</span> -->
									<el-button link type="primary" :disabled="!file.value" @click="openFile(item, file)">预览</el-button>
									<el-button link :disabled="!file.value" @click="downloadFile(file.value, file.name)">下载</el-button>
								</div>
							</div>
							<div v-else class="attachment-card__actions">
								<span>-</span>
								<el-button link type="primary" disabled>预览</el-button>
								<el-button link disabled>下载</el-button>
							</div>
						</div>
					</div>
				</section>
			</div>

			<div class="detail-right">
				<section class="side-section">
					<h2>流程信息</h2>
					<el-table :data="flowInfoTableData" border>
						<el-table-column prop="label" label="字段" min-width="120" />
						<el-table-column prop="value" label="内容" min-width="180" show-overflow-tooltip />
					</el-table>
				</section>

				<section class="side-section">
					<h2>流程记录</h2>
					<CommonTimeline v-if="timelineData.length" :data="timelineData">
						<template #item="{ item }">
							<div class="timeline-box">
								<div class="timeline-title">{{ item.raw.typeName || "-" }}</div>
								<p>{{ item.raw.message || "-" }}</p>
								<div class="timeline-center">
									<el-tooltip :content="`审批人：${item.raw.createByName ?? '-'}`" placement="top">
										<span>审批人：{{ item.raw.createByName ?? "-" }}</span>
									</el-tooltip>
								</div>
								<div class="timeline-bottom">
									<el-tooltip :content="`操作类型：${item.raw.operateName ?? '-'}`" placement="top">
										<span class="timeline-bottom__primary">操作类型：{{ item.raw.operateName ?? "-" }}</span>
									</el-tooltip>
									<el-tooltip
										:content="`创建部门：${item.raw.createDeptName ?? '-'}/${item.raw.createByName ?? '-'}`"
										placement="top"
									>
										<span class="timeline-bottom__secondary">创建部门：{{ item.raw.createDeptName ?? "-" }}</span>
									</el-tooltip>
								</div>
								<div class="timeline-time">{{ item.raw.updateTime || "-" }}</div>
							</div>
						</template>
					</CommonTimeline>
					<div v-else class="timeline-empty">暂无流程记录</div>
				</section>
			</div>
		</div>
	</DetailPageLayout>

	<FilePreview v-model:visible="previewDialogVisible" :file-url="previewUrl" :file-name="previewFileName" />
</template>

<script setup lang="ts">
import type { BizBusinessMattersProcessLogVo, BizBusinessMattersVo } from "@/api/system/review/types"

import CommonTimeline from "@/components/CommonTimeline/index.vue"
import DetailPageLayout from "@/components/DetailPageLayout/index.vue"
import FilePreview from "@/components/FilePreview/index.vue"
import FileSaver from "file-saver"
import { computed, ref } from "vue"
import { getStatusColorFont } from "@/utils/status"
import {
	buildReviewAttachmentListFromDetail,
	buildReviewTimelineData,
	getReviewDetailMetaData,
	getReviewBusinessTypeValue
} from "../config"

const emit = defineEmits<{
	(e: "back"): void
	(e: "process"): void
	(e: "edit"): void
}>()

const props = defineProps({
	detail: {
		type: Object as () => BizBusinessMattersVo | null,
		default: null
	},
	showProcessButton: {
		type: Boolean,
		default: false
	},
	showEditButton: {
		type: Boolean,
		default: false
	}
})

const businessType = computed(() => getReviewBusinessTypeValue(props.detail))
const attachmentList = computed(() => buildReviewAttachmentListFromDetail(props.detail, businessType.value))
const flowInfoTableData = computed(() => getReviewDetailMetaData(props.detail))
const processLogList = computed<BizBusinessMattersProcessLogVo[]>(() =>
	Array.isArray(props.detail?.processLogList) ? props.detail.processLogList : []
)
const timelineData = computed(() => buildReviewTimelineData(processLogList.value))
const statusClass = computed(() => getStatusColorFont(String(props.detail?.statusName || "")))

const previewDialogVisible = ref(false)
const previewUrl = ref("")
const previewFileName = ref("PDF 预览")

const getAttachmentFiles = (item: { files?: Array<{ name?: string; sizeText?: string; value?: string }> }) =>
	Array.isArray(item.files) ? item.files : []

const openFile = (item: { label?: string }, file: { value?: string; sizeText?: string }) => {
	if (!file.value) return
	previewFileName.value = file.sizeText || item.label || "PDF 预览"
	previewUrl.value = file.value
	previewDialogVisible.value = true
}

const downloadFile = (url?: string, fileName?: string) => {
	if (!url) return
	FileSaver.saveAs(url, fileName || "经营事项评审附件.pdf")
}
</script>

<style scoped lang="scss">
.detail-subline {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 1rem;
	color: #42526e;
	font-size: 0.875rem;

	b {
		color: #6b7795;
		font-weight: 400;
	}
}

.detail-subline__meta {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.75rem;
}

.detail-subline__actions {
	display: inline-flex;
	flex-shrink: 0;
	gap: 0.75rem;
}

.detail-layout-body {
	display: grid;
	grid-template-columns: minmax(0, 1fr) 28rem;
	height: 40rem;
	overflow: hidden;
}

.detail-left,
.detail-right {
	overflow-y: auto;
}

.detail-left {
	padding: 1.875rem 2rem;
	border-right: 1px solid #edf0f5;
}

.detail-right {
	padding: 1.875rem 1.875rem 1.625rem;
}

.info-section,
.side-section {
	margin-bottom: 1.5rem;

	h2 {
		margin: 0 0 1rem;
		color: #0f2748;
		font-size: 1rem;
		font-weight: 700;
	}
}

.info-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1rem 2.5rem;
}

.info-grid__item {
	display: flex;
	flex-direction: column;
	gap: 0.375rem;
}

.info-grid__label {
	color: #6b7795;
	font-size: 0.875rem;
}

.info-grid__value {
	color: #172b4d;
	font-size: 0.875rem;
	line-height: 1.6;
}

.desc-card-list {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0.875rem;
}

.desc-card {
	padding: 0.875rem 1rem;
	border-radius: 0.875rem;
	background: #f7f9fc;

	h3 {
		margin: 0 0 0.625rem;
		color: #172b4d;
		font-size: 0.9375rem;
		font-weight: 600;
	}

	p {
		margin: 0;
		color: #344563;
		line-height: 1.75;
	}
}

.desc-card--full {
	grid-column: 1 / -1;
}

.desc-card--warn {
	border: 1px solid rgba(245, 63, 63, 0.22);
	background: rgba(245, 63, 63, 0.04);
}

.attachment-panel {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 0.75rem;
}

.attachment-card {
	display: flex;
	min-width: 0;
	flex-direction: column;
	align-items: flex-start;
	gap: 1rem;
	padding: 0.875rem 1rem;
	border-radius: 0.875rem;
	background: #f7f9fc;

	strong {
		color: #172b4d;
		font-size: 0.9375rem;
	}

	p {
		margin: 0.375rem 0 0;
		color: #6b7795;
		font-size: 0.8125rem;
	}
}

.attachment-card__actions {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 0.625rem;
	color: #6b7795;
	font-size: 0.8125rem;
}

.attachment-card__files {
	display: flex;
	width: 100%;
	min-width: 0;
	flex-direction: column;
	gap: 0.5rem;
}

.timeline-box {
	padding: 0.875rem 1rem 0.75rem;
	border: 1px solid #e1e7f0;
	border-radius: 0.75rem;
	background: #fff;

	p {
		margin: 0.5rem 0 0.75rem;
		color: #344563;
		font-size: 0.875rem;
		line-height: 1.45;
	}
}

.timeline-title {
	color: #0f2748;
	font-size: 1rem;
	font-weight: 700;
}

.timeline-bottom,
.timeline-center {
	display: flex;
	align-items: center;
	gap: 1rem;
	color: #5f6f8c;
	font-size: 0.8125rem;

	:deep(.el-tooltip__trigger) {
		min-width: 0;
	}
}

.timeline-bottom__primary,
.timeline-bottom__secondary {
	overflow: hidden;
	text-overflow: ellipsis;

	white-space: nowrap;
}

.timeline-bottom__primary {
	flex: 0 0 40%;
	min-width: 0;
}

.timeline-bottom__secondary {
	flex: 1;
	min-width: 0;
	text-align: right;
}

.timeline-time {
	margin-top: 0.5rem;
	color: #86909c;
	font-size: 0.75rem;
}

.timeline-empty {
	color: #86909c;
	font-size: 0.875rem;
}

@media (max-width: 1200px) {
	.detail-layout-body {
		grid-template-columns: 1fr;
		height: auto;
	}

	.detail-left {
		border-right: 0;
		border-bottom: 1px solid #edf0f5;
	}

	.detail-subline,
	.attachment-card {
		flex-direction: column;
		align-items: flex-start;
	}

	.info-grid,
	.desc-card-list,
	.attachment-panel {
		grid-template-columns: 1fr;
	}
}
</style>
