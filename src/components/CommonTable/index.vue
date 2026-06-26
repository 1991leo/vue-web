<template>
	<!-- 通用表格组件（传承 78px 行高与 56px 表头底色） -->
	<div class="common-table-wrapper" v-loading="loading">
		<el-table
			:data="data"
			class="common-prototype-table"
			:row-key="rowKey"
			:header-cell-style="tableHeaderStyle"
			:height="height"
			:max-height="maxHeight"
		>
			<el-table-column v-if="showIndexColumn" :label="indexLabel" :width="indexWidth">
				<template #default="{ $index }">
					{{ indexStart + $index + 1 }}
				</template>
			</el-table-column>

			<template v-for="col in columns" :key="col.prop || col.slotName || col.label">
				<!-- 默认纯文本列 -->
				<el-table-column
					v-if="!col.slotName"
					:prop="col.prop"
					:label="col.label"
					:min-width="col.minWidth"
					:width="col.width"
					:fixed="col.fixed"
					:class-name="col.className"
					:show-overflow-tooltip="col.showOverflowTooltip"
				/>
				<!-- 作用域插槽自定义列 -->
				<el-table-column
					v-else
					:prop="col.prop"
					:label="col.label"
					:min-width="col.minWidth"
					:width="col.width"
					:fixed="col.fixed"
					:class-name="col.className"
					:show-overflow-tooltip="col.showOverflowTooltip"
				>
					<template #default="scope">
						<slot :name="col.slotName" v-bind="scope"></slot>
					</template>
				</el-table-column>
			</template>
		</el-table>
	</div>
</template>

<script setup lang="ts">
// 列配置类型
interface TableColumn {
	prop?: string
	label: string
	minWidth?: string | number
	width?: string | number
	slotName?: string
	showOverflowTooltip?: boolean
	fixed?: boolean | "left" | "right"
	className?: string
}

// 参数定义
withDefaults(
	defineProps<{
		data: any[]
		columns: TableColumn[]
		loading?: boolean
		rowKey?: string
		height?: string | number // 高度参数 (默认不限制，内容少时自适应)
		maxHeight?: string | number // 最大高度参数 (默认 100% 占满剩余高度)
		showIndexColumn?: boolean
		indexLabel?: string
		indexWidth?: string | number
		indexStart?: number
	}>(),
	{
		loading: false,
		rowKey: "id",
		maxHeight: "100%", // 默认最大占满 100%
		showIndexColumn: false,
		indexLabel: "序号",
		indexWidth: 70,
		indexStart: 0
	}
)

// 表头样式，字体及底色继承全局变量
const tableHeaderStyle = {
	background: "var(--el-fill-color-light, #F4F5F7)",
	color: "var(--el-text-color-primary, #172B4D)",
	fontWeight: 700,
	height: "56px"
}
</script>

<style scoped lang="scss">
.common-table-wrapper {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-height: 0;
	width: 100%;
}

.common-prototype-table {
	width: 100%;
	border: 0;
	color: var(--el-text-color-primary, #0f2748);

	:deep(.el-table__inner-wrapper) {
		max-height: 100%;
	}

	// 覆盖 Element Plus 内部对滚动容器的 max-height 计算偏差限制，消除最小高度时的误滚动
	:deep(.el-table__body-wrapper .el-scrollbar__wrap) {
		max-height: 100% !important;
	}

	:deep(.el-table__cell) {
		height: 78px; // 保持 78px 行高
		padding: 0;
		border-bottom: 1px solid var(--el-border-color-lighter, #e5eaf1);
		font-size: 14px;
	}

	:deep(.el-table__header .el-table__cell) {
		height: 56px;
		background: var(--el-fill-color-light, #f4f5f7) !important;
		color: var(--el-text-color-primary, #172b4d);
	}

	:deep(.el-table__inner-wrapper::before) {
		display: none;
	}
}
</style>
