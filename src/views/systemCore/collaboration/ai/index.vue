<template>
	<div class="ai-data-assistant-container">
		<!-- 顶部标题栏 -->
		<div class="header-bar">
			<h2 class="title">智能分析引擎 (AI Data Assistant)</h2>
			<el-button type="default" @click="handleClearMemory"> 清除记忆 (Clear) </el-button>
		</div>

		<!-- 聊天消息区域 -->
		<div class="chat-container" ref="chatContainerRef">
			<div
				v-for="message in messages"
				:key="message.id"
				class="message-row"
				:class="message.role === 'user' ? 'message-row-user' : 'message-row-assistant'"
			>
				<div class="message-bubble" :class="message.role === 'user' ? 'user-message' : 'assistant-message'">
					<p>{{ message.text }}</p>

					<div v-if="message.metrics?.length" class="metric-list">
						<div v-for="metric in message.metrics" :key="metric.label" class="metric-card">
							<span class="metric-label">{{ metric.label }}</span>
							<strong class="metric-value">{{ metric.value }}</strong>
						</div>
					</div>

					<div v-if="message.summary" class="message-summary">
						{{ message.summary }}
					</div>
				</div>
			</div>
		</div>

		<!-- 底部输入区域 -->
		<div class="input-area">
			<el-input
				v-model="inputContent"
				placeholder="例如: 请对比一下光谷数科和楚天云本周的新增合同数据..."
				class="message-input"
				@keyup.enter="handleSend"
			/>
			<el-button type="primary" class="send-btn" :disabled="!inputContent.trim()" @click="handleSend">
				发送 (Send)
			</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { nextTick, ref } from "vue"
import { ElMessage } from "element-plus"

interface ChatMetric {
	label: string
	value: string
}

interface ChatMessage {
	id: number
	role: "assistant" | "user"
	text: string
	summary?: string
	metrics?: ChatMetric[]
}

// 响应式数据
const chatContainerRef = ref<HTMLDivElement | null>(null)
const inputContent = ref<string>("")
const messages = ref<ChatMessage[]>([
	{
		id: 1,
		role: "assistant",
		text: "您好，我是系统专属的经营数据分析助手。我已接入底层数据库，请问有什么可以帮您？"
	}
])

const buildMockReply = (question: string): ChatMessage => {
	if (question.includes("合同")) {
		return {
			id: Date.now() + 1,
			role: "assistant",
			text: "已为您模拟查询本周新增合同数据，对比结果如下：",
			metrics: [
				{ label: "光谷数科", value: "1280 万元" },
				{ label: "楚天云", value: "860 万元" },
				{ label: "差值", value: "420 万元" }
			],
			summary: "光谷数科本周新增合同额高于楚天云，主要增长来自政务云与平台集成类项目。"
		}
	}

	if (question.includes("收入")) {
		return {
			id: Date.now() + 1,
			role: "assistant",
			text: "已生成本周收入分析的模拟结果：",
			metrics: [
				{ label: "新增收入", value: "3560 万元" },
				{ label: "环比变化", value: "+12.4%" },
				{ label: "重点公司", value: "集团本部" }
			],
			summary: "本周收入增长较为明显，主要由重点项目回款和新增验收确认带动。"
		}
	}

	return {
		id: Date.now() + 1,
		role: "assistant",
		text: `已收到您的问题：“${question}”。以下为模拟分析结果：`,
		metrics: [
			{ label: "任务总数", value: "12 项" },
			{ label: "进行中", value: "7 项" },
			{ label: "风险事项", value: "2 项" }
		],
		summary: "当前整体经营态势平稳，建议优先关注延期风险事项和关键节点推进情况。"
	}
}

const scrollToBottom = async () => {
	await nextTick()
	if (chatContainerRef.value) {
		chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
	}
}

// 清除记忆（静态示例，实际需对接后端重置会话接口）
const handleClearMemory = () => {
	ElMessage.success("记忆已清除")
	messages.value = [
		{
			id: 1,
			role: "assistant",
			text: "您好，我是系统专属的经营数据分析助手。我已接入底层数据库，请问有什么可以帮您？"
		}
	]
}

// 发送消息（静态示例，实际需对接AI对话接口）
const handleSend = async () => {
	const content = inputContent.value.trim()
	if (!content) return

	messages.value.push({
		id: Date.now(),
		role: "user",
		text: content
	})

	messages.value.push(buildMockReply(content))
	inputContent.value = ""
	await scrollToBottom()
}
</script>

<style scoped lang="scss">
.ai-data-assistant-container {
	position: relative;
	display: flex;
	flex-direction: column;
	height: calc(100vh - 192px);
	border: 1px solid #ebeef5;
	border-radius: 4px;
	overflow: hidden;

	.header-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		border-bottom: 1px solid #ebeef5;

		.title {
			margin: 0;
			font-size: 18px;
			font-weight: 600;
			color: #303133;
		}
	}

	.chat-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 20px;
		padding-bottom: 96px;
		overflow-y: auto;

		.message-row {
			display: flex;
			margin-bottom: 16px;

			&.message-row-user {
				justify-content: flex-end;
			}

			&.message-row-assistant {
				justify-content: flex-start;
			}
		}

		.message-bubble {
			max-width: 80%;
			padding: 12px 16px;
			border-radius: 8px;
			font-size: 14px;
			line-height: 1.6;

			p {
				margin: 0;
			}

			&.assistant-message {
				background-color: #ffffff;
				border: 1px solid #ebeef5;
				color: #303133;
			}

			&.user-message {
				background-color: #ecf5ff;
				color: #409eff;
			}

			.metric-list {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
				gap: 10px;
				margin-top: 12px;

				.metric-card {
					padding: 10px 12px;
					background: rgba(64, 158, 255, 0.08);
					border-radius: 8px;

					.metric-label {
						display: block;
						margin-bottom: 4px;
						font-size: 12px;
						color: #909399;
					}

					.metric-value {
						font-size: 16px;
						color: #303133;
					}
				}
			}

			.message-summary {
				margin-top: 12px;
				padding-top: 12px;
				border-top: 1px dashed #dcdfe6;
				color: #606266;
			}
		}
	}

	.input-area {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		display: flex;
		align-items: center;
		padding: 16px 40px;
		background-color: #ffffff;
		border-top: 1px solid #ebeef5;
		gap: 12px;

		.message-input {
			flex: 1;
		}

		.send-btn {
			min-width: 120px;
		}
	}
}
</style>
