<template>
	<el-config-provider :locale="appStore.locale" :size="appStore.size">
		<router-view />
	</el-config-provider>
</template>

<script setup lang="ts">
import { useSettingsStore } from "@/store/modules/settings"
import { handleThemeStyle } from "@/utils/theme"
import { useAppStore } from "@/store/modules/app"

const appStore = useAppStore()
handleThemeStyle(useSettingsStore().theme)
</script>

<style>
/* 隐藏 SSE 通知的默认图标 */
.sse-notification-custom .el-notification__icon {
	display: none !important;
}
.el-dialog__footer {
	padding: 16px 24px !important;
	border-top: 1px solid #f0f2f5 !important;
}
</style>
