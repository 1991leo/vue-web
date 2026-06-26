<template>
	<div :class="classObj" class="app-wrapper" :style="{ '--current-color': theme }">
		<div v-if="device === 'mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
		<side-bar v-if="!sidebar.hide" class="sidebar-container" @set-layout="setLayout" />
		<div :class="{ hasTagsView: needTagsView, sidebarHide: sidebar.hide }" class="main-container">
			<!-- <el-scrollbar>
        <div :class="{ 'fixed-header': fixedHeader }">
          <navbar ref="navbarRef" @setLayout="setLayout" />
          <tags-view v-if="needTagsView" />
        </div>
        <app-main />
        <settings ref="settingRef" />
      </el-scrollbar> -->
			<div :class="{ 'fixed-header': fixedHeader }">
				<navbar ref="navbarRef" @set-layout="setLayout" />
			</div>
			<app-main />
			<Footer class="layout-footer-fixed" />
			<settings ref="settingRef" />

			<div v-if="aiFrameVisible" class="ai-frame-overlay">
				<div class="ai-frame-panel">
					<!-- 悬浮在右上角的关闭按钮，具备精致的微交互 -->
					<div class="ai-frame-close-floating" @click="handleAiFrameClose">
						<el-icon><Close /></el-icon>
					</div>
					<!-- AI 组件嵌套容器 -->
					<div class="ai-component-wrapper">
						<!-- <CollaborationAi v-if="aiType === 'collaboration'" /> -->
						<!-- <CockpitAi v-else-if="aiType === 'cockpit'" /> -->
					</div>
				</div>
			</div>

			<!-- AI机器人 -->
			<!-- <div class="ai-robot-container" @mouseenter="handleAiHover" @mouseleave="handleAiLeave">
        <transition name="popover-fade">
          <div v-show="aiVisible" class="ai-popover-box">
            <div class="ai-close-btn" @click.stop="handleAiClose">
              <el-icon><Close /></el-icon>
            </div>
            <div class="ai-menu-item" @click.stop="handleAiClick('collaboration')">
              <img src="@/assets/images/QA.webp" class="ai-menu-icon" />
              <span>智能问答</span>
            </div>
            <div class="ai-menu-item" @click.stop="handleAiClick('cockpit')">
              <img src="@/assets/images/agent.webp" class="ai-menu-icon" />
              <span>数字人交流</span>
            </div>
          </div>
        </transition>
        <img src="@/assets/images/ai_robot.gif" class="ai-robot-img" alt="AI" />
      </div> -->
		</div>
	</div>
</template>

<script setup lang="ts">
import SideBar from "./components/Sidebar/index.vue"
import { AppMain, Footer, Navbar, Settings, TagsView } from "./components"
import { useAppStore } from "@/store/modules/app"
import { useSettingsStore } from "@/store/modules/settings"
import { NavTypeEnum } from "@/enums/NavTypeEnum"
import { initWebSocket } from "@/utils/websocket"
import { initSSE } from "@/utils/sse"
import { Close } from "@element-plus/icons-vue"
// 导入经营驾驶舱 AI 与 协同 AI 组件
// import CockpitAi from "@/views/manage/cockpit/ai/index.vue"
// import CollaborationAi from "@/views/manage/collaboration/ai/index.vue"

const settingsStore = useSettingsStore()
const theme = computed(() => settingsStore.theme)
const sidebar = computed(() => useAppStore().sidebar)
const device = computed(() => useAppStore().device)
const needTagsView = computed(() => settingsStore.tagsView)
const fixedHeader = computed(() => settingsStore.fixedHeader)
const layout = computed(() => settingsStore.navType)

// 根据布局模式判断是否显示侧边栏
const showSidebar = computed(() => {
	if (sidebar.value.hide) return false
	return layout.value === NavTypeEnum.LEFT || layout.value === NavTypeEnum.MIX
})

const classObj = computed(() => ({
	hideSidebar: !sidebar.value.opened,
	openSidebar: sidebar.value.opened,
	withoutAnimation: sidebar.value.withoutAnimation,
	mobile: device.value === "mobile"
}))

// 禁用窄屏自动切换 mobile，避免页面宽度小于 993px 时强制收起左侧菜单。
// const { width } = useWindowSize();
// const WIDTH = 992; // refer to Bootstrap's responsive design
//
// watchEffect(() => {
//   const appStore = useAppStore();
//   if (device.value === 'mobile') {
//     appStore.closeSideBar({ withoutAnimation: false, isPersist: false });
//   }
//   if (width.value - 1 < WIDTH) {
//     appStore.toggleDevice('mobile');
//     appStore.closeSideBar({ withoutAnimation: true, isPersist: false }); // 移动端自适应关闭不持久化，不污染桌面端默认展开状态
//   } else {
//     appStore.toggleDevice('desktop');
//     // 恢复在桌面端原先的手动折叠/展开状态，默认状态为展开 (即不是 '0')
//     if (localStorage.getItem('sidebarStatus') !== '0') {
//       appStore.sidebar.opened = true;
//     }
//   }
// });

const navbarRef = ref<InstanceType<typeof Navbar>>()
const settingRef = ref<InstanceType<typeof Settings>>()

onMounted(() => {
	const appStore = useAppStore()
	if (appStore.device === "desktop") {
		appStore.sidebar.opened = true // 确保大屏下菜单默认宽度是展开的
		localStorage.setItem("sidebarStatus", "1")
	}
	nextTick(() => {
		navbarRef.value?.initTenantList()
	})
})

onMounted(() => {
	const protocol = window.location.protocol === "https:" ? "wss://" : "ws://"
	initWebSocket(protocol + window.location.host + import.meta.env.VITE_APP_BASE_API + "/resource/websocket")
})

onMounted(() => {
	initSSE(import.meta.env.VITE_APP_BASE_API + "/resource/sse")
})

const handleClickOutside = () => {
	useAppStore().closeSideBar({ withoutAnimation: false })
}

const setLayout = () => {
	settingRef.value?.openSetting()
}

// AI 助手相关状态与方法
const aiVisible = ref(false)
const aiFrameVisible = ref(false)
// 当前选中的 AI 助手类型：collaboration (智能问答) 还是 cockpit (数字人交流)
const aiType = ref<"collaboration" | "cockpit">("collaboration")
let aiCloseTimer: number | null = null // 用于存储关闭定时器

const handleAiHover = () => {
	aiVisible.value = true
	// 鼠标只要重新移入（不管是移入气泡还是机器人），就取消即将关闭的定时器
	if (aiCloseTimer) {
		window.clearTimeout(aiCloseTimer)
		aiCloseTimer = null
	}
}

const handleAiLeave = () => {
	// 鼠标移出整个包裹区域，开始 3 秒倒计时关闭
	aiCloseTimer = window.setTimeout(() => {
		aiVisible.value = false
		aiCloseTimer = null
	}, 1000)
}

const handleAiClose = () => {
	aiVisible.value = false
	if (aiCloseTimer) {
		window.clearTimeout(aiCloseTimer)
		aiCloseTimer = null
	}
}
// 处理 AI 选项点击事件，并保存所选类型
const handleAiClick = (type: "collaboration" | "cockpit") => {
	aiVisible.value = false
	aiType.value = type
	aiFrameVisible.value = true
	if (aiCloseTimer) {
		window.clearTimeout(aiCloseTimer)
		aiCloseTimer = null
	}
}

const handleAiFrameClose = () => {
	aiFrameVisible.value = false
}
</script>

<style lang="scss" scoped>
@use "@/assets/styles/mixin.scss";
@use "@/assets/styles/variables.module.scss" as *;

.app-wrapper {
	@include mixin.clearfix;
	position: relative;
	height: 100%;
	width: 100%;
	background: url("@/assets/layout/contentBack.png") no-repeat center center;
	background-size: cover;
	background-attachment: fixed;
	background-color: #f4f6fb;
	overflow: hidden; /* 保证外层不产生任何滚动条，使背景图完美固定 */

	&.mobile.openSidebar {
		position: fixed;
		top: 0;
	}
}

.drawer-bg {
	background: #000;
	opacity: 0.3;
	width: 100%;
	top: 0;
	height: 100%;
	position: absolute;
	z-index: 999;
}

.fixed-header {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 9;
	width: 100vw;
	transition: none;
	background: $fixed-header-bg;
}

.layout-footer-fixed {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 8;
	width: 100%;
}

.sidebarHide .layout-footer-fixed,
.mobile .layout-footer-fixed {
	width: 100%;
}

.ai-frame-overlay {
	position: fixed;
	inset: 0;
	z-index: 1000;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24px;
	box-sizing: border-box;
	background: rgba(5, 12, 24, 0.55);
}

.ai-frame-panel {
	position: relative; /* 保证悬浮按钮绝对定位基于此容器 */
	display: flex;
	flex-direction: column;
	width: 70%; /* 扩展弹窗宽度，适配内嵌复杂组件的交互展示 */
	height: 85%; /* 扩展弹窗高度，展示更多图表和内容 */
	overflow: visible; /* 允许右上角悬浮关闭按钮稍微溢出 border */
	background: #fff;
	border-radius: 16px; /* 更加圆润、高端的卡片边缘 */
	box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.ai-component-wrapper {
	flex: 1;
	width: 100%;
	height: 100%;
	overflow: hidden;
	border-radius: 16px;

	/* 深度覆盖嵌套组件的主容器高度，自适应填充弹框尺寸 */
	:deep(.chat-container),
	:deep(.ai-data-assistant-container) {
		height: 100% !important;
		min-height: 100% !important;
		border: none !important;
		border-radius: 0 !important;
	}

	/* 隐藏驾驶舱组件右上角齿轮与退出等功能图标 */
	:deep(.action-icons) {
		display: none !important;
	}

	/* 隐藏驾驶舱组件右上角时间月份选择器 */
	:deep(.date-picker) {
		display: none !important;
	}

	/* 隐藏数据分析组件右上角清除记忆按钮 */
	:deep(.header-bar .el-button) {
		display: none !important;
	}
}

/* 浮空悬浮在面板外的关闭按钮，提供舒适的旋转与放大微动画 */
.ai-frame-close-floating {
	position: absolute;
	top: -16px;
	right: -16px;
	width: 36px;
	height: 36px;
	background: #ffffff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	color: #606266;
	font-size: 18px;
	transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
	z-index: 1001;

	&:hover {
		transform: scale(1.1) rotate(90deg); /* hover 时平滑放大并顺时针旋转 90 度 */
		color: #00b46e;
		box-shadow: 0 6px 16px rgba(0, 180, 110, 0.25);
	}
}

/* AI 机器人悬浮样式 */
.ai-robot-container {
	position: fixed;
	right: 25px;
	bottom: 40px;
	z-index: 999;
	display: flex;
	flex-direction: column;
	align-items: center;

	.ai-robot-img {
		width: 100px; /* 根据实际设计图适当调整宽度 */
		height: auto;
		cursor: pointer;
	}

	.ai-popover-box {
		position: absolute;
		bottom: 100%;
		left: 35%;
		transform: translateX(-50%);
		margin-bottom: 2px; /* 与机器人顶部的间距微调 */
		width: 112px;
		height: 85.5px;
		background: url("@/assets/images/ai_popover_bg.webp") no-repeat center center;
		background-size: contain;
		padding: 15px;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 8px; /* 两个选项之间的间距 */
		animation: fadeIn 0.3s ease-in-out;
		// .ai-popover-box:nth-child(.ai-menu-item) {
		//   margin-bottom: 2px;
		// }
		/* 右上角关闭按钮 */
		.ai-close-btn {
			position: absolute;
			top: -8px;
			right: -7px;
			width: 18px;
			height: 18px;
			background: #fff;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
			color: #00b46e;
			font-size: 14px;

			// &:hover {
			//   background: #f0f2f5;
			// }
		}

		.ai-menu-item {
			display: flex;
			align-items: center;
			color: #fff;
			font-size: 12px; /* 调整为设计图的 12px */
			cursor: pointer;
			gap: 8px;
			line-height: 1;
			padding-bottom: 6px;
			.ai-menu-icon {
				width: 14px;
				height: 14px;
				object-fit: contain;
			}
		}

		/* 移除第二个选项多余的 padding 保证居中 */
		.ai-menu-item:last-of-type {
			padding-bottom: 0;
		}
	}
}

/* Vue 过渡动画类 */
.popover-fade-enter-active,
.popover-fade-leave-active {
	transition:
		opacity 0.3s ease,
		transform 0.3s ease;
	transform-origin: bottom center; /* 从底部小三角的位置开始动画 */
}

.popover-fade-enter-from,
.popover-fade-leave-to {
	opacity: 0;
	transform: translateX(-50%) scale(0.9) translateY(10px); /* 消失时稍微缩小并向下移动 */
}

.popover-fade-enter-to,
.popover-fade-leave-from {
	opacity: 1;
	transform: translateX(-50%) scale(1) translateY(0);
}
</style>
