<template>
	<footer class="layout-footer">
		<span>{{ footerText }}</span>
	</footer>
</template>

<script setup lang="ts">
import { listPlatformInfo } from "@/api/system/platform"

const year = new Date().getFullYear()
const title = import.meta.env.VITE_APP_TITLE || "系统"
const defaultFooterText = `Copyright © ${year} ${title} All Rights Reserved`
const footerText = ref(import.meta.env.VITE_APP_COPYRIGHT || defaultFooterText)

const loadPlatformFooter = async () => {
	const res = await listPlatformInfo()
	const firstRow = res.rows?.[0]
	if (firstRow?.platformItSupport) {
		footerText.value = firstRow.platformItSupport
	}
}

onMounted(() => {
	loadPlatformFooter()
})
</script>

<style scoped lang="scss">
.layout-footer {
	height: 46px;
	line-height: 46px;
	text-align: center;
	font-size: 12px;
	color: #6b778c;
	background: transparent;
	// border-top: 1px solid var(--el-border-color-lighter);
	box-sizing: border-box;
}
</style>
