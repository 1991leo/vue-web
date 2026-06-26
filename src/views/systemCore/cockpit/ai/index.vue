<template>
	<div class="chat-container">
		<!-- 顶部导航栏 -->
		<header class="header-bar">
			<div class="logo-section">
				<div class="logo-icon">
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<rect width="24" height="24" rx="4" fill="#00B46E" />
						<path d="M7 17V13M12 17V9M17 17V5" stroke="white" stroke-width="2" stroke-linecap="round" />
					</svg>
				</div>
				<div class="title-text">集团经营驾驶舱</div>
			</div>

			<div class="header-actions">
				<!-- 日期选择器 -->
				<el-date-picker
					v-model="currentDate"
					type="month"
					format="YYYY年MM月"
					value-format="YYYY年MM月"
					placeholder="选择月份"
					class="date-picker"
				/>

				<!-- 标签切换 -->
				<!-- <div class="tab-group">
          <el-button class="tab-btn" @click="activeTab = 'board'">
            <el-icon><Grid /></el-icon>
            经营看板
          </el-button>
          <el-button class="tab-btn active" @click="activeTab = 'chat'">
            <el-icon><ChatDotRound /></el-icon>
            智能分析
          </el-button>
        </div> -->

				<!-- 右侧功能按钮 -->
				<!-- <div class="action-icons">
          <el-icon class="icon"><Setting /></el-icon>
          <el-icon class="icon exit-icon"><Switch /></el-icon>
        </div> -->
			</div>
		</header>

		<!-- 聊天主体区域 -->
		<main class="chat-body">
			<div class="chat-messages">
				<!-- 助手初始消息 -->
				<div class="message assistant-message">
					<div class="avatar assistant-avatar">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path
								d="M12 2C8.13 2 5 5.13 5 9v5c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9c0-3.87-3.13-7-7-7zm4 14H8v-1h8v1zm0-4H8V9c0-2.21 1.79-4 4-4s4 1.79 4 4v3z"
								fill="#7b61ff"
							/>
						</svg>
					</div>
					<div class="message-bubble assistant-bubble">
						您好！我是您的智能经营分析助手。您可以问我关于集团或各出资公司的经营情况，例如："XX公司前几个月完成情况如何？"
						或"对XX公司有什么改进建议？"
					</div>
				</div>

				<!-- 消息列表（后续对话可在这里添加） -->
				<div
					v-for="(msg, index) in messageList"
					:key="index"
					class="message"
					:class="msg.role === 'user' ? 'user-message' : 'assistant-message'"
				>
					<div class="avatar" :class="msg.role === 'user' ? 'user-avatar' : 'assistant-avatar'">
						<el-icon v-if="msg.role === 'user'"><User /></el-icon>
						<svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path
								d="M12 2C8.13 2 5 5.13 5 9v5c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9c0-3.87-3.13-7-7-7zm4 14H8v-1h8v1zm0-4H8V9c0-2.21 1.79-4 4-4s4 1.79 4 4v3z"
								fill="#7b61ff"
							/>
						</svg>
					</div>
					<div class="message-bubble" :class="msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'">
						{{ msg.content }}
					</div>
				</div>
			</div>

			<!-- 底部输入区域 -->
			<div class="input-area">
				<div class="input-wrapper">
					<el-input
						v-model="inputValue"
						type="textarea"
						:rows="1"
						placeholder="输入您的问题，例如：分析一下智能科技公司前几个月的完成情况..."
						class="chat-input"
						@keyup.enter="handleSend"
					/>
					<el-button class="send-btn" :disabled="!inputValue.trim()" @click="handleSend">
						<el-icon><Promotion /></el-icon>
						发送
					</el-button>
				</div>
				<div class="disclaimer">AI 可能会产生不准确的信息，请结合实际情况参考。</div>
			</div>
		</main>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { ElMessage } from "element-plus"
import { Grid, ChatDotRound, Setting, Switch, User, Promotion } from "@element-plus/icons-vue"

// 顶部状态
const currentDate = ref("2026年04月")
const activeTab = ref("chat")

// 聊天状态
const inputValue = ref("")
const messageList = ref<Array<{ role: string; content: string }>>([])

// 发送消息
const handleSend = () => {
	if (!inputValue.value.trim()) return

	// 添加用户消息
	messageList.value.push({
		role: "user",
		content: inputValue.value
	})

	// 模拟助手回复
	setTimeout(() => {
		messageList.value.push({
			role: "assistant",
			content:
				"收到您的问题啦！这里是静态页面，我暂时无法进行实际的经营分析。您可以在真实项目中接入后端AI接口来实现对话功能~"
		})
	}, 800)

	// 清空输入框
	inputValue.value = ""
}
</script>

<style scoped lang="scss">
.chat-container {
	display: flex;
	flex-direction: column;
	height: calc(100vh - 166px);
	min-height: calc(100vh - 166px);
	background-color: #ffffff;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
	overflow: hidden;
}

// 顶部导航栏
.header-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 24px;
	padding: 12px 24px;
	border-bottom: 1px solid #ebeef5;
	background: #ffffff;
	flex-wrap: nowrap;

	.logo-section {
		display: flex;
		align-items: center;
		height: 32px;
		gap: 10px;
		flex: 0 0 auto;
		min-width: 0;

		.logo-icon {
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.title-text {
			font-size: 20px;
			height: 28px;
			line-height: 28px;
			font-weight: 600;
			color: #1a1a1a;
			margin-top: 20px;
		}
	}

	.header-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 20px;
		flex: 1;
		min-width: 0;
		flex-wrap: nowrap;

		.date-picker {
			width: 240px;
			flex: 0 0 auto;
		}

		.tab-group {
			display: flex;
			gap: 8px;
			flex: 0 0 auto;
			white-space: nowrap;

			.tab-btn {
				border: none;
				background: transparent;
				font-size: 14px;
				color: #666;
				padding: 8px 16px;
				border-radius: 6px;
				transition: all 0.2s;

				&.active {
					background: rgba(0, 180, 110, 0.1);
					color: #00b46e;
					font-weight: 500;
				}

				&:hover {
					background: #f5f7fa;
				}

				.el-icon {
					margin-right: 4px;
				}
			}
		}

		.action-icons {
			display: flex;
			align-items: center;
			gap: 16px;
			flex: 0 0 auto;

			.icon {
				font-size: 20px;
				color: #666;
				cursor: pointer;
				transition: color 0.2s;

				&:hover {
					color: #00b46e;
				}
			}

			.exit-icon {
				color: #f53f3f;
			}
		}
	}
}

// 聊天主体
.chat-body {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-height: 0;
	overflow: hidden;
	padding: 0 24px;

	.chat-messages {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 20px 0;
		padding-bottom: 20px;
		background-color: #f9fafc;
		border-radius: 0 0 12px 12px;

		.message {
			display: flex;
			gap: 12px;
			margin-bottom: 24px;
			padding: 0 20px;

			&.user-message {
				flex-direction: row-reverse;

				.message-bubble {
					background-color: #00b46e;
					color: white;
					border-radius: 16px 16px 4px 16px;
				}
			}

			&.assistant-message {
				.message-bubble {
					background-color: white;
					color: #333;
					border-radius: 16px 16px 16px 4px;
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
				}
			}

			.avatar {
				width: 36px;
				height: 36px;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;

				&.assistant-avatar {
					background-color: rgba(0, 180, 110, 0.1);
				}

				&.user-avatar {
					background-color: #00b46e;
					color: white;
				}

				.el-icon {
					font-size: 18px;
				}
			}

			.message-bubble {
				max-width: 70%;
				padding: 12px 16px;
				font-size: 14px;
				line-height: 1.6;
			}
		}
	}

	// 底部输入区域
	.input-area {
		padding: 16px 40px 6px;
		background-color: white;
		border-top: 1px solid #ebeef5;
		flex: 0 0 auto;

		.input-wrapper {
			display: flex;
			align-items: center;
			gap: 12px;

			.chat-input {
				flex: 1;

				:deep(.el-textarea__inner) {
					border-radius: 20px;
					padding: 12px 20px;
					font-size: 14px;
					border: 1px solid #ebeef5;
					background-color: #f9fafc;

					&:focus {
						border-color: #00b46e;
						box-shadow: 0 0 0 2px rgba(0, 180, 110, 0.1);
					}
				}
			}

			.send-btn {
				border-radius: 20px;
				padding: 12px 24px;
				font-size: 14px;
				background-color: #e4e7ed;
				color: #666;
				border: none;
				transition: all 0.2s;

				&:not(:disabled) {
					background-color: #00b46e;
					color: white;
					cursor: pointer;

					&:hover {
						background-color: #26c285;
					}
				}

				.el-icon {
					margin-right: 4px;
				}
			}
		}

		.disclaimer {
			margin-top: 12px;
			text-align: center;
			font-size: 12px;
			color: #999;
		}
	}
}
</style>
