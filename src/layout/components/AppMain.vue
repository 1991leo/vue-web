<template>
	<section class="app-main">
		<div v-if="needTagsView" class="layout-sub-header" :class="{ 'with-fixed-header': fixedHeader }">
			<TagsView />
		</div>
		<!-- 内容卡片容器，应用全新的 contentBack 渐变图作为背景 -->
		<div class="main-content-container">
			<!-- <div class="main-breadcrumb-wrap">
        <breadcrumb />
      </div> -->
			<router-view v-slot="{ Component, route }">
				<transition :enter-active-class="animate" mode="out-in">
					<keep-alive :include="tagsViewStore.cachedViews">
						<component :is="Component" v-if="!route.meta.link" :key="route.path" />
					</keep-alive>
				</transition>
			</router-view>
			<iframe-toggle />
		</div>
	</section>
</template>

<script setup name="AppMain" lang="ts">
import { useSettingsStore } from "@/store/modules/settings"
import { useTagsViewStore } from "@/store/modules/tagsView"
import { NavTypeEnum } from "@/enums/NavTypeEnum"

import IframeToggle from "./IframeToggle/index.vue"
import TagsView from "./TagsView/index.vue"
const { proxy } = getCurrentInstance() as ComponentInternalInstance
const route = useRoute()
const tagsViewStore = useTagsViewStore()
const settingsStore = useSettingsStore()
const needTagsView = computed(() => settingsStore.tagsView)
const fixedHeader = computed(() => settingsStore.fixedHeader)
const layout = computed(() => settingsStore.navType)

// 随机动画集合
const animate = ref<string>("")
const animationEnable = ref(useSettingsStore().animationEnable)
watch(
	() => useSettingsStore().animationEnable,
	(val: boolean) => {
		animationEnable.value = val
		if (val) {
			animate.value = proxy?.animate.animateList[
				Math.round(Math.random() * proxy?.animate.animateList.length)
			] as string
		} else {
			animate.value = proxy?.animate.defaultAnimate as string
		}
	},
	{ immediate: true }
)

onMounted(() => {
	addIframe()
})

watchEffect(() => {
	addIframe()
})

function addIframe() {
	if (route.meta.link) {
		useTagsViewStore().addIframeView(route)
	}
}
</script>

<style lang="scss" scoped>
.app-main {
	/* 顶部导航 50px，底部预留系统信息区 50px */
	min-height: calc(100vh - 60px);
	width: 100%;
	position: relative;
	overflow: hidden;
	box-sizing: border-box;
	// padding-bottom: 50px;
	// background-color: #fff;
}

.main-content-container {
	margin: 40px 60px 46px 0; /* 底部 margin 调整为 46px，消除与 46px 高度的 footer 之间的空隙 */
	// padding: 24px;
	// background: #ffffff;
	// box-shadow: 0 4px 16px rgba(0, 21, 41, 0.06);
	// border-radius: 30px;
	height: calc(100vh - 146px); /* 100vh - 60px navbar - 40px top - 46px footer */
	box-sizing: border-box;
	overflow: auto;
}

.main-breadcrumb-wrap {
	margin-bottom: 16px;
	:deep(.app-breadcrumb.el-breadcrumb) {
		line-height: normal;
		margin-left: 0;
	}
}

.fixed-header + .app-main {
	padding-top: 60px;
}

.hasTagsView {
	.app-main {
		/* 84 = navbar + tags-view(50 + 34)，底部预留 50px */
		min-height: calc(100vh - 134px);
	}

	.main-content-container {
		height: calc(100vh - 170px); /* 100vh - 84px navbar&tagsView - 40px top - 46px footer */
	}

	.fixed-header + .app-main {
		padding-top: 84px;
	}
}
</style>
<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
	.fixed-header {
		padding-right: 6px;
	}
}

::-webkit-scrollbar {
	width: 6px;
	height: 6px;
}

::-webkit-scrollbar-track {
	background-color: var(--el-fill-color-lighter);
}

::-webkit-scrollbar-thumb {
	background-color: var(--el-text-color-placeholder);
	border-radius: 999px;
}
</style>
