<template>
	<div :class="containerClass" class="pagination-container">
		<el-pagination
			v-model:current-page="currentPage"
			v-model:page-size="pageSize"
			:background="background"
			:layout="layout"
			:page-sizes="pageSizes"
			:pager-count="pagerCount"
			:total="total"
			@size-change="handleSizeChange"
			@current-change="handleCurrentChange"
		/>
	</div>
</template>

<script setup name="Pagination" lang="ts">
import { computed } from "vue"
import { scrollTo } from "@/utils/scroll-to"
import { propTypes } from "@/utils/propTypes"

const props = defineProps({
	total: propTypes.number,
	// 兼容老版本
	page: propTypes.number.def(1),
	limit: propTypes.number.def(20),
	// 兼容新版 usePagination
	currentPage: propTypes.number,
	pageSize: propTypes.number,
	pageSizes: { type: Array<number>, default: () => [10, 20, 30, 50] },
	// 移动端页码按钮的数量端默认值5
	pagerCount: propTypes.number.def(document.body.clientWidth < 992 ? 5 : 7),
	layout: propTypes.string.def("total, sizes, prev, pager, next, jumper"),
	background: propTypes.bool.def(true),
	autoScroll: propTypes.bool.def(true),
	hidden: propTypes.bool.def(false),
	float: propTypes.string.def("right"),
	paginationType: {
		type: String as () => "default" | "success",
		default: "default"
	}
})

const emit = defineEmits(["update:page", "update:limit", "update:currentPage", "update:pageSize", "pagination"])

const containerClass = computed(() => ({
	hidden: props.hidden,
	[`pagination-container--${props.paginationType}`]: props.paginationType !== "default"
}))

const currentPage = computed({
	get() {
		return props.currentPage !== undefined ? props.currentPage : props.page
	},
	set(val) {
		emit("update:page", val)
		emit("update:currentPage", val)
	}
})

const pageSize = computed({
	get() {
		return props.pageSize !== undefined ? props.pageSize : props.limit
	},
	set(val) {
		emit("update:limit", val)
		emit("update:pageSize", val)
	}
})

const justifyContent = computed(() => {
	return props.float === "left" ? "flex-start" : "flex-end"
})

function handleSizeChange(val: number) {
	if (currentPage.value * val > props.total) {
		currentPage.value = 1
	}
	emit("pagination", { page: currentPage.value, limit: val })
	if (props.autoScroll) {
		scrollTo(0, 800)
	}
}

function handleCurrentChange(val: number) {
	emit("pagination", { page: val, limit: pageSize.value })
	if (props.autoScroll) {
		scrollTo(0, 800)
	}
}
</script>

<style lang="scss" scoped>
.pagination-container {
	display: flex;
	align-items: center;
	justify-content: v-bind(justifyContent);
	width: 100%;

	.el-pagination {
		float: v-bind(float);
	}
}

.pagination-container.hidden {
	display: none;
}
:deep(.el-select__placeholder) {
	color: #172b4d;
}
.pagination-container--success {
	:deep(.el-pagination) {
		--el-pagination-bg-color: #ffffff;
		--el-pagination-button-color: #172b4d;
		--el-pagination-button-disabled-bg-color: #f5f7f6;
		--el-pagination-button-disabled-color: #b9c7bf;
		--el-pagination-hover-color: var(--el-color-primary, #00b46e) !important;
		--el-fill-color-light: #f5fffb;
		--el-border-color: #dbece3;
	}

	:deep(.el-pagination .btn-prev),
	:deep(.el-pagination .btn-next) {
		min-width: 34px;
		height: 34px;
		border: 1px solid #fff;
		background: #ffffff;
		transition: all 0.2s ease;
	}
	:deep(.el-pagination .el-pager li) {
		min-width: 34px;
		height: 34px;
		border: 1px solid #dbdce2;
		background: #ffffff;
		transition: all 0.2s ease;
	}

	:deep(.el-pagination.is-background .btn-prev:hover),
	:deep(.el-pagination.is-background .btn-next:hover),
	:deep(.el-pagination.is-background .el-pager li:hover) {
		background: #f5fffb !important;
		border-color: #f5fffb !important;
		color: var(--el-color-primary, #00b46e) !important;
	}

	:deep(.el-pagination.is-background .el-pager li.is-active) {
		background: #f5fffb !important;
		border-color: #f5fffb !important;
		color: var(--el-color-primary, #00b46e) !important;
		font-weight: 600;
	}

	:deep(.el-pagination__sizes .el-select .el-input__wrapper),
	:deep(.el-pagination__jump .el-input__wrapper) {
		box-shadow: 0 0 0 1px #dbece3 inset;
		background: #ffffff;
	}

	:deep(.el-pagination__jump),
	:deep(.el-pagination__total) {
		color: #172b4d;
	}
}
</style>
