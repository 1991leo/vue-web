<template>
	<DetailPageLayout
		:title="task.taskTitle || ''"
		:status-label="task.taskStatusName"
		:status-class="getStatusClass(task.taskStatus)"
		@back="emit('back')"
	>
		<!-- 副标题插槽 -->
		<template #subline>
			<span class="update-label">创建日期：{{ task.createTime ? task.createTime.slice(0, 10) : "" }}</span>
			<span class="deadline-label">
				距截止还有 <strong class="days-num">{{ daysToDeadline }}</strong> 天
			</span>
		</template>

		<!-- 详情主卡片内容 -->
		<div class="detail-content">
			<!-- 头部操作区与标签 -->
			<div class="content-header">
				<div class="task-tags">
					<span class="tag-badge priority-tag" :class="getPriorityClass(task.priorityName)">
						{{ task.priorityName }}
					</span>
					<span class="tag-badge level-tag" :class="getLevelClass(task.taskLevelName, task.priorityName)">
						{{ task.taskLevelName }}
					</span>
					<span class="tag-badge category-tag" :class="getCategoryClass(task.taskCategoryName)">
						{{ task.taskCategoryName }}
					</span>
				</div>
			</div>

			<!-- 业务信息使用 tabs 承载，进展记录由详情接口返回的 progressList 展示 -->
			<div class="detail-main-layout">
				<div class="detail-left-section">
					<el-tabs v-model="activeTab" class="detail-tabs">
						<!-- 基本信息 -->
						<el-tab-pane label="基本信息" name="basic">
							<div class="basic-info">
								<div class="info-grid">
									<div class="info-item"><span>任务来源：</span>{{ task.taskSourceName || "-" }}</div>
									<div class="info-item"><span>责任人：</span>{{ task.assigneeName || "-" }}</div>
									<div class="info-item"><span>等级：</span>{{ task.taskLevelName || "-" }}</div>
									<div class="info-item"><span>类别：</span>{{ task.taskCategoryName || "-" }}</div>
									<div class="info-item"><span>优先级：</span>{{ task.priorityName || "-" }}</div>
									<div class="info-item"><span>所属专项：</span>{{ task.specialProject || "-" }}</div>
									<div class="info-item">
										<span>截止日期：</span>{{ task.planEndTime ? task.planEndTime.slice(0, 10) : "" }}
									</div>
									<div class="info-item">
										<span>创建时间：</span>{{ task.createTime ? task.createTime.slice(0, 10) : "" }}
									</div>
									<div class="info-item"><span>当前进度：</span>{{ task.progress || 0 }}%</div>
									<div class="info-item info-item-full">
										<span>预期成果：</span>{{ task.expectedResult || "暂无预期成果" }}
									</div>
									<div class="info-item info-item-full">
										<span>任务要求与说明：</span>{{ task.taskRequirement || "暂无任务要求与说明" }}
									</div>
									<div class="info-item info-item-full"><span>主办单位与协办单位：</span>{{ deptNamesDisplay }}</div>
								</div>
							</div>
						</el-tab-pane>

						<!-- 任务进展 -->
						<el-tab-pane label="任务进展" name="progress">
							<div class="task-progress-tab">
								<div class="progress-grid">
									<div v-for="(item, idx) in editableProgressList" :key="idx" class="progress-card">
										<div class="progress-card-header">
											<span class="operator">
												<el-icon><User /></el-icon>
												{{ item.operatorName }}
											</span>
											<span class="time">{{ item.createTime }}</span>
										</div>
										<div class="progress-card-body">
											<div class="progress-slider-wrapper">
												<el-slider
													v-model="item.currentProgress"
													:min="0"
													:max="100"
													:step="1"
													:show-tooltip="false"
													:disabled="!item.matched"
													:class="['progress-card-slider', item.colorClass]"
												/>
												<span class="progress-val">{{ item.currentProgress }}%</span>
											</div>
											<el-input
												v-if="item.matched"
												v-model="item.content"
												type="textarea"
												:rows="3"
												resize="none"
												placeholder="描述当前进展..."
												class="progress-card-textarea"
											/>
											<div v-else class="progress-card-content-text">
												{{ item.content || "暂无进展描述" }}
											</div>
										</div>
									</div>
								</div>
								<div v-if="hasEditableProgress" class="progress-actions">
									<el-button
										type="primary"
										class="submit-progress-btn"
										:loading="progressSubmitLoading"
										@click="handleSubmitProgress"
									>
										<el-icon><Promotion /></el-icon>
										保存
									</el-button>
								</div>
							</div>
						</el-tab-pane>

						<!-- 里程碑管理 -->
						<el-tab-pane label="里程碑管理" name="milestone">
							<div v-loading="milestoneLoading" class="milestone-list">
								<div class="section-header milestone-header">
									<h2>里程碑管理</h2>
									<el-button type="primary" class="soft-button" link @click="handleAddMilestone">
										添加里程碑
									</el-button>
								</div>
								<div class="milestone-grid">
									<div v-for="item in milestoneList" :key="item.id" class="milestone-card">
										<div class="milestone-card-top">
											<strong class="milestone-name" :title="item.milestoneTitle">{{ item.milestoneTitle }}</strong>
											<span class="milestone-status-text" :class="getMilestoneStatusClass(item.status)">
												<img :src="getMilestoneStatusIcon(item.status)" class="state-icon" />
												{{ getMilestoneStatusText(item) }}
											</span>
										</div>
										<div class="milestone-card-middle">
											<span>截止：{{ formatDate(item.deadline) }}</span>
											<span v-if="Number(item.delayDays) > 0" class="delay-text">延期 {{ item.delayDays }} 天</span>
										</div>
										<div class="milestone-card-actions">
											<el-button v-if="item.status !== '2'" type="primary" link @click="handleCompleteMilestone(item)"
												>完成</el-button
											>
											<el-button type="primary" link @click="handleEditMilestone(item)">编辑</el-button>
											<el-button type="danger" link @click="handleDeleteMilestone(item.id)">删除</el-button>
										</div>
									</div>
									<el-empty
										v-if="!milestoneList.length && !milestoneLoading"
										class="empty-milestone"
										description="暂无里程碑"
									/>
								</div>
							</div>
						</el-tab-pane>

						<!-- 协调事项 -->
						<el-tab-pane label="协调事项" name="coordination">
							<div class="coordination-table">
								<div class="tab-action-bar">
									<el-button type="primary" class="add-btn-custom" link @click="handleAddCoordination">
										创建协调事项
									</el-button>
								</div>
								<el-table :data="coordinationList" border class="table-custom">
									<el-table-column prop="id" label="事项ID" width="120" align="center" />
									<el-table-column prop="title" label="事项描述" min-width="200" />
									<el-table-column prop="enterprise" label="提报企业" width="130" align="center" />
									<el-table-column prop="status" label="状态" width="100" align="center">
										<template #default="{ row }">
											<span :class="['status-cell', row.status === '2' ? 'resolved' : 'processing']">{{
												row.statusText
											}}</span>
										</template>
									</el-table-column>
									<el-table-column prop="level" label="预警等级" width="100" align="center">
										<template #default="{ row }">
											<div class="level-cell">
												<el-icon :color="row.levelColor" style="margin-right: 4px">
													<component :is="row.levelIcon" />
												</el-icon>
												<span :style="{ color: row.levelColor, fontWeight: 'bold' }">{{ row.levelText }}</span>
											</div>
										</template>
									</el-table-column>
									<el-table-column prop="createTime" label="创建时间" width="120" align="center" />
								</el-table>
							</div>
						</el-tab-pane>

						<!-- 结项申请与审核 -->
						<el-tab-pane label="结项申请与审核" name="close">
							<div class="close-form">
								<!-- 结项申请 -->
								<div class="form-section">
									<h3 class="section-title">
										<span class="indicator"></span> 结项申请
										<span class="status-tip"
											>（当前状态：{{
												task.closureStatusName || getClosureStatusName(resolveClosureStatus(task))
											}}）</span
										>
									</h3>
									<div v-if="isClosureReadonly" class="closure-readonly">
										<div class="readonly-row">
											<span class="readonly-label">结项证据描述</span>
											<div class="readonly-content">{{ evidenceDescription || "暂无结项证据描述" }}</div>
										</div>
										<div class="readonly-row">
											<span class="readonly-label">结项附件</span>
											<div class="readonly-content">
												<div v-if="closureAttachmentList.length" class="closure-file-list">
													<a
														v-for="(file, index) in closureAttachmentList"
														:key="`${file.url}-${index}`"
														class="closure-file-link"
														@click.prevent="handlePreviewFile(file)"
													>
														<el-icon><Document /></el-icon>
														<span>{{ file.fileName || file.name || "结项附件" }}</span>
													</a>
												</div>
												<span v-else>暂无结项附件</span>
											</div>
										</div>
									</div>
									<el-form v-else label-width="110px">
										<el-form-item label="结项证据描述">
											<el-input
												v-model="evidenceDescription"
												type="textarea"
												:rows="3"
												placeholder="请描述结项依据和完成情况..."
											/>
										</el-form-item>
										<el-form-item label="结项附件">
											<el-upload
												ref="closureUploadRef"
												drag
												action="#"
												class="file-uploader closure-uploader"
												:auto-upload="false"
												:limit="5"
												:show-file-list="false"
												:accept="closureFileAccept"
												:on-change="handleClosureFileChange"
												:on-exceed="handleClosureFileExceed"
											>
												<el-icon class="upload-icon"><UploadFilled /></el-icon>
												<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
												<template #tip>
													<div v-if="closureDisplayFiles.length" class="closure-file-list editable">
														<div v-for="(file, index) in closureDisplayFiles" :key="file.key" class="file-selected">
															<el-icon class="file-selected-icon"><Document /></el-icon>
															<a v-if="file.url" class="file-name" :href="file.url" target="_blank">{{
																file.fileName
															}}</a>
															<span v-else class="file-name">{{ file.fileName }}</span>
															<el-icon class="file-delete-icon" @click.stop="handleDeleteClosureFile(file, index)"
																><CircleClose
															/></el-icon>
														</div>
													</div>
													<div class="upload-tip">支持 PDF、Word(.docx)、Excel、PPT、TXT 格式，最大 10MB</div>
												</template>
											</el-upload>
										</el-form-item>
										<el-form-item>
											<el-button
												type="primary"
												class="submit-close-btn"
												:loading="closeSubmitLoading"
												@click="handleSubmitClose"
												>提交结项申请</el-button
											>
										</el-form-item>
									</el-form>
								</div>

								<!-- 审核评分 -->
								<div v-if="resolveClosureStatus(task) === '0'" class="form-section last-section">
									<h3 class="section-title"><span class="indicator red"></span> 审核评分</h3>
									<div class="audit-actions">
										<el-button type="primary" class="pass-btn" :loading="auditSubmitLoading" @click="handleAudit(true)"
											>通过</el-button
										>
										<el-button
											type="danger"
											class="reject-btn"
											:loading="auditSubmitLoading"
											@click="handleAudit(false)"
											>驳回</el-button
										>
									</div>
								</div>
							</div>
						</el-tab-pane>
					</el-tabs>
				</div>

				<CommonDivider direction="vertical" :vertical-offset="24" :horizontal-margin="0" />

				<div class="detail-right-section">
					<section v-loading="progressLoading" class="detail-section timeline-card-section">
						<div class="section-header">
							<h2>进度管理</h2>
						</div>
						<div class="progress-container">
							<CommonTimeline v-if="timelineData.length" :data="timelineData" />
							<el-empty v-else description="暂无进度日志" :image-size="120" />
						</div>
					</section>
				</div>
			</div>
		</div>
	</DetailPageLayout>
	<AddMilestoneDialog
		v-model="milestoneDialogVisible"
		:stage-options="milestoneStageOptions"
		:milestone-status-options="milestoneStatusOptions"
		:current-stage="defaultMilestoneStage"
		:milestone-data="currentMilestoneDialogData"
		@submit="submitMilestoneForm"
	/>
	<FilePreview v-model:visible="previewVisible" :file-url="previewFileUrl" :file-name="previewFileName" />
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from "vue"
import { useRouter } from "vue-router"
import {
	WarningFilled,
	CircleCheck as CheckIcon,
	Promotion,
	User,
	Document,
	CircleClose,
	UploadFilled
} from "@element-plus/icons-vue"
import type { UploadFile, UploadInstance, UploadRawFile } from "element-plus"
import DetailPageLayout from "@/components/DetailPageLayout/index.vue"
import CommonTimeline from "@/components/CommonTimeline/index.vue"
import CommonDivider from "@/components/CommonDivider/index.vue"
import type { TimelineItem } from "@/components/CommonTimeline/index.vue"
import AddMilestoneDialog from "../tracking/AddMilestoneDialog.vue"
import FilePreview from "@/components/FilePreview/index.vue"
import { useLoading } from "@/hooks/useLoading"
import { useRate } from "@/hooks/useRate"
import modal from "@/plugins/modal"
import { uploadWeeklyBusinessBriefFile } from "@/api/system/weeklyBusinessBrief"

import {
	addKeyTaskMilestone,
	updateKeyTaskMilestone,
	updateKeyTaskMilestoneStatus,
	delKeyTaskMilestone,
	listKeyTaskMilestone,
	updateKeyTaskProgress,
	updateKeyTask
} from "@/api/system/keyTask"
import type { KeyTaskLogVO, KeyTaskMilestoneVO, KeyTaskProgressVO } from "@/api/system/keyTask/types"
import { listCoordination } from "@/api/system/coordination"

// 声明 Props & Emits
const props = defineProps<{
	task: any
}>()

const emit = defineEmits<{
	(e: "back"): void
	(e: "refresh"): void
}>()

const router = useRouter()
const { normalizeProgressValue } = useRate()

// ==================== 样式类映射函数 ====================
const getPriorityClass = (name?: string) => {
	if (!name) return "low"
	if (name.includes("高")) return "high"
	if (name.includes("中")) return "medium"
	if (name.includes("低")) return "low"
	return "low"
}

const getLevelClass = (name?: string, priorityName?: string) => {
	if (!name) return getPriorityClass(priorityName)
	if (name.includes("集团") || name.includes("省级")) return "high"
	if (name.includes("公司")) return "medium"
	if (name.includes("一般")) return "low"
	return getPriorityClass(priorityName)
}

const getCategoryClass = (name?: string) => {
	return name ? "business" : "empty"
}

const getStatusClass = (status?: string) => {
	const map: Record<string, string> = {
		"0": "pending",
		"1": "processing",
		"2": "completed",
		"3": "review",
		"4": "overdue"
	}
	return map[status || ""] || "pending"
}

// ==================== 响应式变量 ====================
const activeTab = ref("basic")
const evidenceDescription = ref("")
const attachments = ref("")
const closureAttachmentList = ref<ClosureAttachment[]>([])
const selectedClosureFiles = ref<UploadRawFile[]>([])
const closureUploadRef = ref<UploadInstance>()
const coordinationList = ref<any[]>([])
const progressList = ref<KeyTaskProgressVO[]>([])
const logList = ref<KeyTaskLogVO[]>([])
const milestoneList = ref<KeyTaskMilestoneVO[]>([])
const progressLoading = ref(false)
const milestoneLoading = ref(false)
const milestoneDialogVisible = ref(false)
const currentMilestone = ref<KeyTaskMilestoneVO | null>(null)
const recommendProgressContentLength = 400
const maxProgressContentLength = 800
const executionProgressColors = ["#3BD398", "#FA9D42", "#FF6161", "#5093F0"]
const closureFileTypes = ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "pdf"]
const closureFileAccept = closureFileTypes.map((type) => `.${type}`).join(",")

const editableProgressList = ref<any[]>([])

const progressForm = reactive({
	currentProgress: 0,
	content: ""
})

const progressContentLength = computed(() => progressForm.content.length)
const hasEditableProgress = computed(() => editableProgressList.value.some((item) => item.matched))

interface ClosureAttachment {
	name?: string
	fileName?: string
	url?: string
	ossId?: string | number
}

interface ClosureDisplayFile {
	key: string
	fileName: string
	url?: string
	source: "uploaded" | "local"
}

const isTaskCompleted = computed(() => String(props.task.taskStatus || "") === "2")

interface SelectOption {
	label: string
	value: string | number
}

interface MilestoneDialogForm {
	id?: string | number
	milestoneName?: string
	deadline?: string
	status?: string | number
	stage?: string | number
}

const milestoneStageOptions: SelectOption[] = [
	{ label: "商机跟踪", value: "1" },
	{ label: "项目立项", value: "2" },
	{ label: "建设实施", value: "3" },
	{ label: "交付验收", value: "4" },
	{ label: "运营维护", value: "5" }
]

const milestoneStatusOptions: SelectOption[] = [
	{ label: "未开始", value: "0" },
	{ label: "进行中", value: "1" },
	{ label: "已完成", value: "2" }
]

const defaultMilestoneStage = computed(() => {
	const taskStage = String(props.task.stage || props.task.currentStage || "")
	const matchedStage = milestoneStageOptions.find((item) => String(item.value) === taskStage)
	// 重点事项没有项目阶段字段时，默认取第一个阶段，避免 el-select 显示无效原值。
	return matchedStage?.value || milestoneStageOptions[0].value
})

const currentMilestoneDialogData = computed(() => {
	if (!currentMilestone.value) return null
	// 复用项目全生命周期弹框，仅将重点事项字段适配为弹框字段。
	return {
		...currentMilestone.value,
		milestoneName: currentMilestone.value.milestoneTitle || ""
	}
})

// 映射详情日志至 CommonTimeline 结构，时间优先使用更新时间。
const timelineData = computed<TimelineItem[]>(() => {
	return logList.value.map((log: any) => ({
		time: log.updateTime || "",
		label: log.updateByName,
		type: "progress",
		user: log.logTitle,
		content: log.content || ""
	}))
})

const deptNamesDisplay = computed(() => {
	const hostDept = props.task.hostDeptName ? `${props.task.hostDeptName}(主办)` : ""
	const coDeptList = String(props.task.coDeptNames || "")
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean)
		.map((item) => `${item}(协办)`)

	return [hostDept, ...coDeptList].filter(Boolean).join("，") || "-"
})

// 里程碑状态
const getMilestoneStatusText = (item: KeyTaskMilestoneVO) => {
	if (item.statusName) return item.statusName
	if (item.status === "2") return "已完成"
	if (item.status === "1") return "进行中"
	if (item.delayDays > 0) return `已逾期${item.delayDays}天`
	return "未开始"
}

const getMilestoneStatusClass = (status?: string | number) => {
	const statusStr = String(status || "")
	if (statusStr === "2") return "resolved"
	if (statusStr === "1") return "processing"
	return "pending"
}

const statusIconMap: Record<string, string> = {
	"0": new URL("@/assets/collaboration/Pending.png", import.meta.url).href,
	"1": new URL("@/assets/collaboration/processing.png", import.meta.url).href,
	"2": new URL("@/assets/collaboration/resolved.png", import.meta.url).href
}

const getMilestoneStatusIcon = (status?: string | number) => statusIconMap[String(status || "")] || statusIconMap["0"]

const formatDate = (value?: string) => (value ? value.slice(0, 10) : "-")

const getLatestProgress = (taskData = props.task) => {
	const taskProgressList = Array.isArray(taskData?.progressList) ? taskData.progressList : []
	return taskProgressList[taskProgressList.length - 1]
}

const resolveCurrentProgress = (taskData = props.task) => {
	const latestProgress = getLatestProgress(taskData)
	return normalizeProgressValue(latestProgress?.currentProgress ?? taskData?.progress)
}

const getClosureStatusName = (status?: string | number) => {
	const map: Record<string, string> = {
		"0": "待审核",
		"1": "已通过",
		"2": "已驳回"
	}
	return map[String(status ?? "")] || "-"
}

const resolveClosureStatus = (taskData = props.task) => {
	return taskData?.closureStatus ?? taskData?.closure?.status ?? ""
}

const isClosureRejected = computed(() => String(resolveClosureStatus(props.task)) === "2")
const isClosureReadonly = computed(() => isTaskCompleted.value && !isClosureRejected.value)

const parseClosureAttachmentList = (value?: string): ClosureAttachment[] => {
	if (!value) return []
	try {
		const parsed = JSON.parse(value)
		if (Array.isArray(parsed)) return parsed
		if (parsed && typeof parsed === "object") return [parsed]
	} catch {
		// 兼容旧数据解析失败的情况，避免附件回显阻断页面渲染。
	}
	return []
}

const closureDisplayFiles = computed<ClosureDisplayFile[]>(() => [
	...closureAttachmentList.value.map((item, index) => ({
		key: `uploaded-${item.url || item.fileName || index}`,
		fileName: item.fileName || item.name || "结项附件",
		url: item.url,
		source: "uploaded" as const
	})),
	...selectedClosureFiles.value.map((item) => ({
		key: `local-${item.uid}`,
		fileName: item.name,
		source: "local" as const
	}))
])

const validateClosureFile = (file: UploadRawFile) => {
	const fileExt = file.name.split(".").pop()?.toLowerCase() || ""
	if (!closureFileTypes.includes(fileExt)) {
		modal.msgError(`文件格式不正确，请上传 ${closureFileTypes.join("/")} 格式文件`)
		return false
	}
	if (file.name.includes(",")) {
		modal.msgError("文件名不能包含英文逗号")
		return false
	}
	if (file.size / 1024 / 1024 > 10) {
		modal.msgError("上传文件大小不能超过 10MB")
		return false
	}
	return true
}

const handleClosureFileChange = (file: UploadFile) => {
	const rawFile = file.raw
	if (!rawFile) return
	if (!validateClosureFile(rawFile)) {
		closureUploadRef.value?.handleRemove(file)
		return
	}
	const totalCount = closureAttachmentList.value.length + selectedClosureFiles.value.length
	if (totalCount >= 5) {
		modal.msgError("上传文件数量不能超过 5 个")
		closureUploadRef.value?.handleRemove(file)
		return
	}
	if (!selectedClosureFiles.value.some((item) => item.uid === rawFile.uid)) {
		selectedClosureFiles.value.push(rawFile)
	}
}

const handleClosureFileExceed = () => {
	modal.msgError("上传文件数量不能超过 5 个")
}

const handleDeleteClosureFile = (file: ClosureDisplayFile, index: number) => {
	if (file.source === "uploaded") {
		closureAttachmentList.value.splice(index, 1)
		return
	}
	const localIndex = index - closureAttachmentList.value.length
	selectedClosureFiles.value.splice(localIndex, 1)
	closureUploadRef.value?.clearFiles()
}

const uploadSelectedClosureFiles = async () => {
	if (!selectedClosureFiles.value.length) return []
	const uploadedFiles: ClosureAttachment[] = []
	for (const file of selectedClosureFiles.value) {
		const uploadFormData = new FormData()
		uploadFormData.append("file", file)
		const uploadRes = await uploadWeeklyBusinessBriefFile(uploadFormData)
		const uploadData = uploadRes.data
		uploadedFiles.push({
			fileName: uploadData.fileName || file.name,
			url: uploadData.url
		})
	}
	selectedClosureFiles.value = []
	closureUploadRef.value?.clearFiles()
	return uploadedFiles
}

const formatClosureAttachments = async () => {
	const uploadedFiles = await uploadSelectedClosureFiles()
	const nextAttachments = [...closureAttachmentList.value, ...uploadedFiles]
		.filter((item) => item.url)
		.map((item) => ({
			fileName: item.fileName || item.name || "",
			url: item.url || ""
		}))
	closureAttachmentList.value = nextAttachments
	return JSON.stringify(nextAttachments)
}

// 计算截止距离天数
const daysToDeadline = computed(() => {
	if (!props.task.planEndTime) return 0
	const today = new Date()
	const deadline = new Date(props.task.planEndTime)
	const diffTime = deadline.getTime() - today.getTime()
	return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
})

// 加载协调事项
const loadCoordinationItems = async () => {
	if (!props.task.taskTitle) {
		coordinationList.value = []
		return
	}
	try {
		const res = await listCoordination({
			pageNum: 1,
			pageSize: 100,
			relatedTaskTitle: props.task.taskTitle
		})
		const rows = res.rows || []

		const getCoordStatusName = (status: string) => {
			const map: Record<string, string> = {
				"0": "待处理",
				"1": "处理中",
				"2": "已解决",
				"3": "未解决"
			}
			return map[status] || "待处理"
		}

		coordinationList.value = rows.map((item: any) => ({
			id: item.id,
			title: item.title,
			enterprise: item.reportingEnterpriseName || "集团本部",
			status: item.status,
			statusText: item.statusName || getCoordStatusName(item.status),
			level: item.priority === "高" || item.priority === "emergency" ? "emergency" : "normal",
			levelText: item.priority || "正常",
			levelIcon: item.priority === "高" || item.priority === "emergency" ? WarningFilled : CheckIcon,
			levelColor: item.priority === "高" || item.priority === "emergency" ? "#f56c6c" : "#67c23a",
			createTime: item.createTime ? item.createTime.split(" ")[0] : ""
		}))
	} catch (error) {
		console.error("加载协调事项失败:", error)
	}
}

const loadMilestoneList = async () => {
	if (!props.task.id) {
		milestoneList.value = []
		return
	}
	milestoneLoading.value = true
	try {
		const res = (await listKeyTaskMilestone(props.task.id)) as any
		milestoneList.value = res.data || []
	} catch (error) {
		console.error("加载里程碑列表失败:", error)
	} finally {
		milestoneLoading.value = false
	}
}

const loadActiveTabData = () => {
	if (activeTab.value === "coordination") {
		loadCoordinationItems()
	}
}

// 监听任务数据变化
watch(
	() => props.task,
	(newTask) => {
		if (newTask && newTask.id) {
			// 初始进度和里程碑均使用详情接口随任务返回的数据，避免进入详情后重复请求。
			progressList.value = newTask.progressList || []
			logList.value = newTask.logList || []
			milestoneList.value = newTask.milestoneList || []

			// 任务进展展示 progressList 全量数据，仅 matched 为 true 的卡片允许编辑。
			editableProgressList.value = progressList.value.map((item, index) => ({
				id: item.id,
				taskId: item.taskId,
				prevProgress: normalizeProgressValue(item.prevProgress),
				currentProgress: normalizeProgressValue(item.currentProgress ?? item.prevProgress),
				content: item.content || "",
				operatorName: item.operatorName || item.coDeptIdName,
				createTime: item.createTime ? item.createTime.slice(0, 10) : "",
				matched: item.matched === true,
				colorClass: `slider-color-${index % executionProgressColors.length}`
			}))

			loadActiveTabData()
			evidenceDescription.value = newTask.evidenceDescription || newTask.closure?.evidenceDescription || ""
			attachments.value = newTask.attachments || newTask.closure?.attachments || ""
			closureAttachmentList.value = parseClosureAttachmentList(attachments.value)
			selectedClosureFiles.value = []
			closureUploadRef.value?.clearFiles()
		}
	},
	{ immediate: true, deep: true }
)

watch(activeTab, () => {
	loadActiveTabData()
})

// ==================== 交互事件处理 ====================

// 完成里程碑后只刷新当前 tab 数据，避免详情页整体跳动。
const handleCompleteMilestone = async (item: KeyTaskMilestoneVO) => {
	if (!item.id) return
	try {
		await updateKeyTaskMilestoneStatus(item.id, "2")
		modal.msgSuccess("更新里程碑状态成功")
		await loadMilestoneList()
	} catch (error) {
		console.error("更新里程碑状态失败:", error)
	}
}

const handleEditMilestone = (item: KeyTaskMilestoneVO) => {
	if (!item.id) return
	currentMilestone.value = item
	milestoneDialogVisible.value = true
}

// 删除里程碑
const handleDeleteMilestone = (milestoneId: any) => {
	if (!milestoneId) return
	modal
		.confirm("确认删除该里程碑吗？")
		.then(async () => {
			await delKeyTaskMilestone(milestoneId)
			modal.msgSuccess("删除成功")
			await loadMilestoneList()
		})
		.catch(() => {})
}

// 新增里程碑
const handleAddMilestone = () => {
	currentMilestone.value = null
	milestoneDialogVisible.value = true
}

const { loading: progressSubmitLoading, run: handleSubmitProgress } = useLoading(async () => {
	if (!props.task.id) {
		modal.msgWarning("当前任务缺少ID，无法提交进展")
		return
	}
	const matchedProgressList = editableProgressList.value.filter((item) => item.matched)
	if (!matchedProgressList.length) {
		modal.msgWarning("暂无可提交的进展记录")
		return
	}

	// 只校验当前登录部门可编辑的进展卡片。
	for (const item of matchedProgressList) {
		if (!item.content.trim()) {
			modal.msgWarning(`请填写【${item.operatorName}】对应的进展描述`)
			return
		}
	}

	try {
		await Promise.all(
			matchedProgressList.map((progressItem) =>
				updateKeyTaskProgress({
					id: progressItem.id,
					taskId: progressItem.taskId || props.task.id,
					content: progressItem.content.trim(),
					prevProgress: progressItem.prevProgress,
					currentProgress: progressItem.currentProgress
				})
			)
		)
		modal.msgSuccess("进展提交成功")
		emit("refresh")
	} catch (error) {
		console.error("更新进展失败:", error)
		modal.msgError("部分进展提交失败，请重试")
	}
})

const submitMilestoneForm = async (form: MilestoneDialogForm) => {
	const payload = {
		id: form.id,
		taskId: props.task.id,
		milestoneTitle: form.milestoneName || "",
		deadline: form.deadline,
		status: String(form.status || "0"),
		stage: String(form.stage || "")
	}

	try {
		if (form.id) {
			await updateKeyTaskMilestone(payload)
			modal.msgSuccess("里程碑更新成功")
		} else {
			await addKeyTaskMilestone(payload)
			modal.msgSuccess("里程碑添加成功")
		}
		milestoneDialogVisible.value = false
		await loadMilestoneList()
	} catch (error) {
		console.error("提交里程碑失败:", error)
	}
}

// 新增协调事项 (跳转到协调事项新增页面，关联任务且不可编辑)
const handleAddCoordination = () => {
	router.push({
		path: "/synergy/coordinate",
		query: {
			action: "create",
			relatedType: "任务",
			projectName: props.task.taskTitle,
			reportCompany: String(props.task.hostDeptId || "")
		}
	})
}

// 提交结项申请
const { loading: closeSubmitLoading, run: handleSubmitClose } = useLoading(async () => {
	if (!props.task.id) {
		modal.msgWarning("当前任务缺少ID，无法提交结项申请")
		return
	}
	if (isClosureReadonly.value) {
		modal.msgWarning("已完成任务仅支持查看结项信息")
		return
	}
	if (!evidenceDescription.value.trim()) {
		modal.msgWarning("请填写结项证据描述")
		return
	}
	const payload = {
		id: props.task.id,
		evidenceDescription: evidenceDescription.value.trim(),
		attachments: await formatClosureAttachments(),
		taskStatus: "2"
	}

	try {
		await updateKeyTask(payload)
		modal.msgSuccess("结项申请提交成功，请等待审核")
		emit("refresh")
	} catch (error) {
		console.error("提交结项申请失败:", error)
	}
})

const handleAudit = async (pass: boolean) => {
	if (!props.task.id) {
		modal.msgWarning("无结项申请需要审核")
		return
	}

	try {
		await modal.confirm(pass ? "确认通过该结项申请吗？" : "确认驳回该结项申请吗？")

		auditSubmitLoading.value = true
		const payload = {
			id: props.task.id,
			closureStatus: pass ? "1" : "2"
		}

		await updateKeyTask(payload)
		modal.msgSuccess(pass ? "审核已通过" : "申请已被驳回")
		emit("refresh")
	} catch (error) {
		if (error === "cancel") {
			return
		}
		console.error("审核评分失败:", error)
	} finally {
		auditSubmitLoading.value = false
	}
}

const auditSubmitLoading = ref(false)

// 文件预览
const previewFileUrl = ref("")
const previewFileName = ref("")
const previewVisible = ref(false)

const handlePreviewFile = (file: ClosureAttachment) => {
	if (!file.url) {
		modal.msgWarning("文件地址无效，无法预览")
		return
	}
	previewFileUrl.value = file.url
	previewFileName.value = file.fileName || file.name || "结项附件"
	previewVisible.value = true
}
</script>

<style scoped lang="scss">
/* 设计变量 */
$text-dark: #8a94a6;
$text-gray: #8a94a6;
$text-light: #8a94a6;
$border-color: rgba(228, 231, 237, 0.7);
$primary-color: var(--el-color-primary, #00b46e);
$success-color: var(--el-color-success, #2ecb73);
$danger-color: var(--el-color-danger, #ff4d4f);
$warning-color: var(--el-color-warning, #ff9f1a);

.detail-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-height: 0;
	padding: 30px;
}

.content-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-shrink: 0;
	margin-bottom: 20px;
}

.task-tags {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;

	.tag-badge {
		font-size: 13px;
		height: 24px;
		line-height: 24px;
		padding: 0 6px;
		border-radius: 4px;
		border: 1px solid transparent;

		/* 优先级 (参照卡片渐变设计，白字无边框) */
		&.priority-tag {
			color: #ffffff;
			border: none;

			&.high {
				background: linear-gradient(180deg, #9450f8 0%, #bfa2fa 100%);
			}
			&.medium {
				background: linear-gradient(180deg, #2d8ffc 0%, #477deb 100%);
			}
			&.low {
				background: linear-gradient(180deg, #34beff 0%, #68f2fa 100%);
			}
		}

		/* 级别跟随优先级高中低主题色 */
		&.level-tag.high {
			background-color: #f0e7ff;
			color: #9450f8;
			border-color: #e0ccff;
		}
		&.level-tag.medium {
			background-color: #e5f1ff;
			color: #2d8ffc;
			border-color: #cbe2ff;
		}
		&.level-tag.low {
			background-color: #e8fbff;
			color: #34beff;
			border-color: #c9f6ff;
		}

		/* 类别统一使用业务绿色标签 */
		&.category-tag.business {
			background-color: rgba(59, 211, 152, 0.12);
			color: #00b46e;
			border-color: transparent;
		}
		&.category-tag.empty {
			background-color: #f5f6fa;
			color: #8a94a6;
			border-color: transparent;
		}
	}
}

.detail-main-layout {
	flex: 1;
	min-height: 560px;
	display: flex;
	gap: 0;
	align-items: stretch;
}

.detail-left-section {
	flex: 1;
	min-width: 0;
	padding-right: 24px;
	display: flex;
	flex-direction: column;
}

.detail-right-section {
	width: 30%;
	padding-left: 24px;
	display: flex;
	flex-direction: column;
}

.detail-section {
	border-radius: 12px;
	background: #ffffff;
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	margin-bottom: 22px;

	h2 {
		margin: 0;
		padding-left: 10px;
		border-left: 4px solid var(--el-color-primary);
		color: #202938;
		font-size: 18px;
		font-weight: 700;
		line-height: 24px;
	}
}

.soft-button {
	height: 32px;
	border-radius: 8px;
}

.timeline-card-section {
	flex: 1;
	min-height: 0;
	padding: 16px 0 0;
	overflow-y: auto;
}

/* Tab 切换区域样式封装 */
.detail-tabs {
	flex: 1;
	min-height: 0;
	display: flex;
	flex-direction: column;

	:deep(.el-tabs__content) {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}

	:deep(.el-tabs__item) {
		font-size: 15px;
		color: $text-light;
		height: 48px;
		line-height: 48px;

		&.is-active {
			color: $primary-color;
			font-weight: 700;
		}
	}

	:deep(.el-tabs__active-bar) {
		background-color: $primary-color;
		height: 3px;
		border-radius: 2px;
	}
}

/* 统一各 tab 内容区高度，避免切换时卡片底部高度跳变。 */
.basic-info,
.task-progress-tab,
.progress-container,
.milestone-list,
.coordination-table,
.close-form {
	box-sizing: border-box;
}

/* 基本信息 */
.basic-info {
	padding: 16px 0 0;

	.info-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 20px 24px;
		margin-bottom: 24px;
	}

	.info-item {
		font-size: 14px;
		color: $text-dark;
		font-weight: 500;
		display: flex;
		align-items: center;

		&.info-item-full {
			grid-column: 1 / -1;
			align-items: flex-start;
			line-height: 1.6;
		}

		span {
			color: $text-light;
			margin-right: 4px;
			flex-shrink: 0;
		}
	}
}

.task-progress-tab {
	padding: 16px 0 0;
	display: flex;
	flex-direction: column;
	height: 100%;
}

.progress-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 20px;
	margin-bottom: 20px;
	flex: 1;
}

.progress-card {
	border: 1px solid #edf0f5;
	border-radius: 12px;
	background-color: #ffffff;
	padding: 18px;
	transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
	display: flex;
	flex-direction: column;
	gap: 14px;
	box-shadow: 0 4px 12px rgba(166, 179, 194, 0.03);

	&:hover {
		border-color: var(--el-color-primary-light-7, #7ab8fd);
		box-shadow: 0 8px 24px rgba(23, 43, 77, 0.06);
		transform: translateY(-2px);
	}
}

.progress-card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px dashed #edf0f5;
	padding-bottom: 10px;

	.operator {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 14px;
		font-weight: 600;
		color: $text-dark;

		.el-icon {
			color: $primary-color;
		}
	}

	.time {
		font-size: 12px;
		color: $text-light;
	}
}

.progress-card-body {
	display: flex;
	flex-direction: column;
	gap: 12px;
	flex: 1;

	.progress-bar-wrapper {
		padding: 2px 0;
	}

	.progress-slider-wrapper {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 8px;

		.progress-card-slider {
			flex: 1;
			--el-slider-height: 6px;
			--el-slider-button-size: 14px;

			:deep(.el-slider__runway) {
				border-radius: 999px;
			}

			:deep(.el-slider__button) {
				box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
			}
		}

		.progress-val {
			font-size: 14px;
			font-weight: 700;
			color: #202938;
			min-width: 36px;
			text-align: right;
		}
	}

	/* 进度滑块主题色，与列表页进度条颜色对应 */
	.slider-color-0 {
		--el-slider-main-bg-color: #3bd398;
		:deep(.el-slider__button) {
			border: 2px solid #3bd398;
		}
		.progress-val {
			color: #3bd398;
		}
	}
	.slider-color-1 {
		--el-slider-main-bg-color: #fa9d42;
		:deep(.el-slider__button) {
			border: 2px solid #fa9d42;
		}
		.progress-val {
			color: #fa9d42;
		}
	}
	.slider-color-2 {
		--el-slider-main-bg-color: #ff6161;
		:deep(.el-slider__button) {
			border: 2px solid #ff6161;
		}
		.progress-val {
			color: #ff6161;
		}
	}
	.slider-color-3 {
		--el-slider-main-bg-color: #5093f0;
		:deep(.el-slider__button) {
			border: 2px solid #5093f0;
		}
		.progress-val {
			color: #5093f0;
		}
	}

	.progress-card-textarea {
		:deep(.el-textarea__inner) {
			border-radius: 8px;
			border-color: #e4e7ed;
			color: $text-dark;
			font-size: 13px;
			line-height: 1.6;
			box-shadow: none;
			background-color: #fcfdfe;

			&:focus {
				border-color: var(--el-color-primary);
				background-color: #ffffff;
			}
		}
	}

	.progress-card-content-text {
		min-height: 76px;
		padding: 10px 12px;
		border-radius: 8px;
		color: $text-dark;
		font-size: 13px;
		line-height: 1.6;
	}

	.progress-desc {
		font-size: 13px;
		color: #5e6b80;
		line-height: 1.6;
		word-break: break-all;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		line-clamp: 3;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		min-height: 60px;
	}
}

.progress-actions {
	display: flex;
	justify-content: flex-end;
	margin-top: auto;
	padding-top: 10px;
}

.progress-card-actions {
	display: flex;
	justify-content: flex-end;
	margin-top: auto;
	padding-top: 10px;
	border-top: 1px dashed #edf0f5;

	:deep(.el-button) {
		font-size: 13px;
		font-weight: 500;

		.el-icon {
			margin-right: 4px;
		}
	}
}

.progress-dialog-custom {
	:deep(.el-dialog__body) {
		padding: 10px 24px 20px;
	}

	.progress-update-row {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 20px;

		.progress-update-label {
			font-weight: 600;
			font-size: 14px;
			color: #202938;
			width: 70px;
			flex-shrink: 0;
		}

		.progress-update-slider {
			flex: 1;
			--el-slider-main-bg-color: #{$primary-color};
			--el-slider-runway-bg-color: #edf0f5;
			--el-slider-button-size: 18px;
			--el-slider-height: 8px;

			:deep(.el-slider__runway) {
				border-radius: 999px;
			}

			:deep(.el-slider__button) {
				border: 2px solid $primary-color;
				box-shadow: 0 2px 8px rgba(0, 180, 110, 0.2);
			}
		}

		.progress-percent-text {
			font-size: 16px;
			font-weight: 700;
			color: $primary-color;
			min-width: 48px;
			text-align: right;
		}
	}

	.progress-update-input {
		:deep(.el-textarea__inner) {
			min-height: 160px !important;
			border-radius: 10px;
			border-color: $border-color;
			color: $text-dark;
			line-height: 1.6;
			box-shadow: none;

			&::placeholder {
				color: $text-light;
			}

			&:focus {
				border-color: $primary-color;
				box-shadow: 0 0 0 1px rgba(0, 180, 110, 0.12);
			}
		}
	}

	.progress-word-count-wrapper {
		margin-top: 8px;
		text-align: right;

		.progress-word-count {
			color: $text-light;
			font-size: 13px;

			&.is-over-recommend {
				color: $warning-color;
			}
		}
	}
}

.submit-progress-btn {
	min-width: 128px;
	height: 38px;
	border-radius: 8px;
	font-weight: 600;

	.el-icon {
		margin-right: 6px;
	}
}

/* 进度管理容器 */
.progress-container {
	padding: 0;
}

/* 里程碑管理 */
.milestone-list {
	padding: 16px 0 0;

	.milestone-header {
		margin-top: 6px;
	}
}

.milestone-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
	gap: 16px;
}

.milestone-card {
	position: relative;
	border: 1px solid #edf0f5;
	border-radius: 10px;
	background-color: var(--el-fill-color-blank, #ffffff);
	padding: 16px;
	transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
	display: flex;
	flex-direction: column;
	min-height: 120px;

	&:hover {
		border-color: var(--el-color-primary-light-7, #7ab8fd);
		box-shadow: 0 6px 18px rgba(23, 43, 77, 0.05);

		.milestone-card-actions {
			opacity: 1;
			transform: translateY(0);
		}
	}
}

.milestone-card-top {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 12px;
	margin-bottom: 14px;

	.milestone-name {
		min-width: 0;
		color: #202938;
		font-size: 15px;
		line-height: 22px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.milestone-status-text {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
		font-size: 13px;
		font-weight: 600;
		white-space: nowrap;

		&.pending {
			color: #8a94a6;
		}

		&.processing {
			color: #1678ff;
		}

		&.resolved {
			color: var(--el-color-success, #00b46e);
		}
	}
}

.state-icon {
	width: 14px;
	height: 14px;
	object-fit: contain;
}

.milestone-card-middle {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	color: #8a94a6;
	font-size: 13px;
	line-height: 20px;
	margin-top: auto;

	.delay-text {
		color: var(--el-color-danger, #ff4d4f);
		font-weight: 600;
	}
}

.milestone-card-actions {
	display: flex;
	justify-content: flex-end;
	gap: 8px;
	margin-top: 14px;
	padding-top: 10px;
	border-top: 1px dashed #edf0f5;
	opacity: 0;
	transform: translateY(4px);
	transition: all 0.2s ease;
}

.empty-milestone {
	grid-column: 1 / -1;
	min-height: 180px;
}

/* 协调事项 */
.coordination-table {
	padding: 16px 0 0;

	.table-custom {
		border-radius: 8px;
		overflow: hidden;

		:deep(.el-table__header-wrapper) th {
			background-color: #f5f7fa;
			color: $text-dark;
			font-weight: 700;
		}

		.status-cell {
			font-size: 12px;
			font-weight: 600;
			padding: 2px 6px;
			border-radius: 4px;

			&.processing {
				background-color: #fff9e6;
				color: $warning-color;
			}
			&.resolved {
				background-color: #eafcf1;
				color: $success-color;
			}
		}

		.level-cell {
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 12px;
		}
	}

	.add-btn-custom {
		border-radius: 8px;
		font-weight: 500;
		height: 38px;
	}
}

.tab-action-bar {
	display: flex;
	justify-content: flex-end;
	margin-bottom: 12px;
}
/* 结项申请与审核 */
.close-form {
	padding: 16px 0 0;

	.status-tip {
		font-size: 13px;
		font-weight: normal;
		color: $warning-color;
	}

	.form-section {
		margin-bottom: 24px;
		border-bottom: 1px solid $border-color;
		padding-bottom: 24px;

		&.last-section {
			border-bottom: none;
			padding-bottom: 0;
		}

		.section-title {
			font-size: 15px;
			font-weight: 700;
			color: $text-dark;
			margin-bottom: 18px;
			display: flex;
			align-items: center;
			gap: 8px;

			.indicator {
				width: 3px;
				height: 14px;
				background-color: $primary-color;
				border-radius: 2px;

				&.red {
					background-color: $danger-color;
				}
			}
		}

		.submit-close-btn {
			border-radius: 8px;
			font-weight: 600;
			padding: 10px 20px;
		}

		.audit-actions {
			display: flex;
			gap: 12px;

			.pass-btn,
			.reject-btn {
				border-radius: 8px;
				font-weight: 600;
				padding: 10px 24px;
			}
		}
	}
}

.closure-readonly {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.readonly-row {
	display: grid;
	grid-template-columns: 110px minmax(0, 1fr);
	gap: 12px;
	align-items: flex-start;
}

.readonly-label {
	color: $text-light;
	font-size: 14px;
	line-height: 24px;
}

.readonly-content {
	min-height: 24px;
	padding: 12px 14px;
	border-radius: 8px;
	background: #f5f6fa;
	color: $text-dark;
	font-size: 14px;
	line-height: 1.6;
	white-space: pre-wrap;
}

.file-uploader {
	width: min(720px, 100%);
	margin-top: 4px;

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

.closure-file-list {
	display: flex;
	flex-direction: column;
	gap: 8px;

	&.editable {
		margin-top: 12px;
	}
}

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
	text-decoration: none;
}

.closure-file-link {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	max-width: 520px;
	color: var(--el-color-primary);
	text-decoration: none;
	cursor: pointer;
	transition: opacity 0.2s;

	&:hover {
		opacity: 0.8;
	}

	span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
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
	font-size: 13px;
	margin-top: 4px;
}

.update-label {
	color: $text-gray;
}

@media (max-width: 1200px) {
	.detail-main-layout {
		flex-direction: column;
	}

	.detail-left-section,
	.detail-right-section {
		width: 100%;
		min-width: 0;
		padding: 0;
	}

	.detail-right-section {
		margin-top: 24px;
	}

	:deep(.common-divider.vertical) {
		display: none;
	}

	.basic-info {
		.info-grid {
			grid-template-columns: 1fr;
			gap: 16px;
		}
	}

	.readonly-row {
		grid-template-columns: 1fr;
		gap: 8px;
	}
}

.deadline-label {
	color: $text-gray;

	.days-num {
		color: $danger-color;
		font-size: 15px;
		font-weight: 700;
	}
}
</style>
