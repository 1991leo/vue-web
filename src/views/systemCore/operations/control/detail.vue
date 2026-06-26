<template>
	<DetailPageLayout
		:title="row.title"
		:status-label="row.status"
		:status-class="getStatusClass(row.status)"
		@back="emit('back')"
	>
		<div class="task-detail-container">
			<!-- 左侧：详情接口返回的基础信息 -->
			<div class="task-detail-left">
				<div class="info-grid">
					<div class="info-item">
						<span class="info-label">任务来源：</span>
						<span class="info-value">{{ getTaskSource(row) }}</span>
					</div>
					<div class="info-item">
						<span class="info-label">被投企业：</span>
						<span class="info-value">{{ row.company || "暂无被投企业" }}</span>
					</div>
					<div class="info-item">
						<span class="info-label">任务部门：</span>
						<span class="info-value">{{ row.department || "暂无任务部门" }}</span>
					</div>
					<div class="info-item">
						<span class="info-label">主办部门：</span>
						<span class="info-value">{{ row.hostDept || "暂无主办部门" }}</span>
					</div>
					<div class="info-item">
						<span class="info-label">协办部门：</span>
						<span class="info-value">{{ row.coDept || "-" }}</span>
					</div>
					<div class="info-item">
						<span class="info-label">负责人：</span>
						<span class="info-value">{{ row.leader || "未指定" }}</span>
					</div>
					<div class="info-item">
						<span class="info-label">协同负责人：</span>
						<span class="info-value">{{ row.assistant || "未指定" }}</span>
					</div>
					<div class="info-item">
						<span class="info-label">优先级：</span>
						<span class="info-value">
							<span class="priority-tag" :class="getPriorityClass(row.priority)">
								{{ row.priority }}
							</span>
						</span>
					</div>
					<div class="info-item">
						<span class="info-label">截止日期：</span>
						<span class="info-value">{{ row.deadline || "未指定" }}</span>
					</div>
					<div class="info-item">
						<span class="info-label">创建时间：</span>
						<span class="info-value">{{ row.createTime || "-" }}</span>
					</div>
					<!-- <div class="info-item">
            <span class="info-label">创建人：</span>
            <span class="info-value">{{ row.creator || '-' }}</span>
          </div> -->
				</div>

				<div class="desc-section">
					<div class="desc-label">任务描述：</div>
					<p class="desc-text">{{ row.desc || "暂无描述信息" }}</p>
				</div>
			</div>

			<!-- 右侧：进展时间线，还原图2极简文本设计 -->
			<div class="task-detail-right">
				<h2>进展时间线</h2>
				<div class="timeline-wrapper">
					<CommonTimeline :data="timelineData" />
				</div>
			</div>
		</div>
	</DetailPageLayout>
</template>

<script setup lang="ts">
import { computed } from "vue"
import DetailPageLayout from "@/components/DetailPageLayout/index.vue"
import CommonTimeline from "@/components/CommonTimeline/index.vue"

type TimelineType = "create" | "assign" | "progress" | "problem" | "statusChange"

// 声明接收的 Props 结构
const props = withDefaults(
	defineProps<{
		row: {
			id?: number | string
			title: string
			desc: string
			source?: string
			sourceName?: string
			company: string
			companyValue?: string
			department: string
			hostDept?: string
			coDept?: string
			assigneeId?: number | string
			leader: string
			collaboratorIds?: string
			assistant: string
			deadline: string
			status: string
			statusValue?: string
			priority: string
			priorityValue?: string
			deptId?: number | string
			deptName?: string
			remark?: string
			createTime?: string
			creator?: string
			timeline?: Array<{
				time: string
				label: string
				type: string
				user: string
				content: string
			}>
		}
	}>(),
	{
		row: () => ({
			title: "",
			desc: "",
			source: "",
			sourceName: "",
			company: "",
			companyValue: "",
			department: "",
			hostDept: "",
			coDept: "",
			collaboratorIds: "",
			leader: "",
			assistant: "",
			deadline: "",
			status: "",
			statusValue: "",
			priority: "",
			priorityValue: "",
			remark: ""
		})
	}
)

// 声明 emits 事件
const emit = defineEmits<{
	(e: "back"): void
}>()

// 详情接口返回的日志时间线，缺省时展示空状态
const timelineData = computed(() => {
	return (props.row.timeline || []).map((item) => ({
		time: item.time || "",
		label: item.label || "操作记录",
		type: normalizeTimelineType(item.type, item.label, item.content),
		user: item.user || "操作人",
		content: item.content || item.label || "-"
	}))
})

// 将后端日志类型适配为 CommonTimeline 已封装的视觉状态
const normalizeTimelineType = (type?: string, label?: string, content?: string): TimelineType => {
	const text = `${label || ""}${content || ""}`
	if (type === "create" || text.includes("创建")) return "create"
	if (type === "assign" || type === "delegate" || text.includes("分配") || text.includes("委派")) return "assign"
	if (type === "progress" || type === "progress_update" || text.includes("进度") || text.includes("推进"))
		return "progress"
	if (
		type === "problem" ||
		type === "delete" ||
		text.includes("异常") ||
		text.includes("问题") ||
		text.includes("删除")
	)
		return "problem"
	if (
		type === "statusChange" ||
		type === "status_change" ||
		type === "update" ||
		type === "remark_update" ||
		type === "attachment_upload" ||
		text.includes("变更")
	) {
		return "statusChange"
	}
	return "progress"
}

// 获取任务来源中文适配
const getTaskSource = (task: any) => {
	if (task.sourceName) {
		return task.sourceName
	}
	if (task.source) {
		const map: Record<string, string> = {
			meeting: "会议交办",
			leader: "领导批示",
			special: "专项工作",
			daily: "日常督办"
		}
		return map[task.source] || task.source
	}
	return "-"
}

// 获取状态样式类
const getStatusClass = (status: string) => {
	switch (status) {
		case "未开始":
			return "status-pending"
		case "进行中":
			return "status-ongoing"
		case "已完成":
			return "status-completed"
		case "延期":
		case "已延期":
		case "逾期":
		case "已逾期":
			return "status-delayed"
		case "异常":
			return "status-overdue"
		default:
			return "status-pending"
	}
}

// 获取优先级样式类
const getPriorityClass = (priority: string) => {
	switch (priority) {
		case "高":
			return "priority-high"
		case "中":
			return "priority-medium"
		case "低":
			return "priority-low"
		default:
			return ""
	}
}
</script>

<style scoped lang="scss">
.task-detail-container {
	display: grid;
	grid-template-columns: minmax(0, 1fr) 420px;
	min-height: 770px;
	background-color: #fff;
	overflow: hidden;
}

.task-detail-left {
	padding: 20px 40px 30px;
	border-right: 1px solid #edf0f5;
}

.task-detail-right {
	padding: 30px;
	background-color: #ffffff;

	h2 {
		margin: 0 0 24px;
		color: #0f2748;
		font-size: 16px;
		font-weight: 700;
	}
}

.info-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 16px 40px;
	padding: 24px 0 8px;
}

.info-item {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 4px;
	font-size: 14px;
	line-height: 24px;
	min-height: 24px;

	.info-label {
		color: #8993a4;
		white-space: nowrap;
	}

	.info-value {
		color: #0f2748;
		display: flex;
		align-items: center;
	}
}

.priority-tag {
	font-size: 12px;
	padding: 2px 8px;
	border-radius: 4px;
	color: #fff;

	&.priority-high {
		background: linear-gradient(180deg, #9450f8 0%, #bfa2fa 100%);
	}
	&.priority-medium {
		background: linear-gradient(180deg, #2d8ffc 0%, #477deb 100%);
	}
	&.priority-low {
		background: linear-gradient(180deg, #34beff 0%, #68f2fa 100%);
	}
}

/* 任务描述排版：label 与文字同行，整体占满宽度 */
.desc-section {
	padding-top: 12px;
	display: flex;
	align-items: baseline;
	gap: 4px;
	width: 100%;

	.desc-label {
		font-size: 14px;
		color: #8993a4;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.desc-text {
		margin: 0;
		flex: 1;
		color: #1a1e2d;
		font-size: 14px;
		line-height: 1.8;
		white-space: pre-wrap;
	}
}

.timeline-wrapper {
	padding-top: 8px;
}

@media (max-width: 1200px) {
	.task-detail-container {
		grid-template-columns: 1fr;
	}
	.task-detail-left {
		border-right: none;
		border-bottom: 1px solid #edf0f5;
	}
}
</style>
