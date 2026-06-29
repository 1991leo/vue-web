<template>
	<div class="search-header" :class="[`search-header--${theme}`]">
		<el-form
			v-if="visibleFormItems.length > 0"
			:inline="true"
			class="search-form"
			:class="{
				'has-border-bottom': showBorderBottom
			}"
			:label-width="labelWidth"
			:label-position="labelPosition"
			@submit.prevent
		>
			<div ref="searchFormContentRef" class="search-form-content" :class="classNames">
				<el-form-item
					v-for="item in visibleFormItems"
					:key="item.key"
					:label="item.label"
					:prop="item.key"
					class="search-item"
				>
					<template v-if="item.type === 'select'">
						<el-select
							v-model="formData[item.key]"
							:placeholder="item.placeholder"
							:style="{ width: item.width }"
							:clearable="item.clearable !== false"
							:disabled="item.disabled || false"
							:filterable="item.filterable"
						>
							<el-option
								v-for="option in item.options"
								:key="option.value"
								:label="option.label"
								:value="option.value"
							/>
						</el-select>
					</template>

					<template v-else-if="item.type === 'input'">
						<el-input
							v-model="formData[item.key]"
							:placeholder="item.placeholder"
							:style="{ width: item.width }"
							:disabled="item.disabled || false"
							@keyup.enter.stop="onSearch"
							clearable
						/>
					</template>

					<template v-else-if="item.type === 'cascader'">
						<el-cascader
							v-model="formData[item.key]"
							:options="item.options"
							:props="item.props || {}"
							:placeholder="item.placeholder"
							:style="{ width: item.width }"
							clearable
							:disabled="item.disabled || false"
							@keyup.enter="onSearch"
						/>
					</template>

					<template v-else-if="item.type === 'treeSelect'">
						<el-tree-select
							v-model="formData[item.key]"
							:data="item.options"
							:props="item.props || {}"
							:current-node-key="getTreeCurrentNodeKey(item.value)"
							:placeholder="item.placeholder"
							:style="{ width: item.width }"
							:default-expand-all="true"
							check-strictly
							:disabled="item.disabled || false"
							filterable
							clearable
							@keyup.enter="onSearch"
						/>
					</template>

					<template v-else-if="item.type === 'date-picker'">
						<el-date-picker
							v-model="formData[item.key]"
							type="date"
							:placeholder="item.placeholder"
							:style="{ width: item.width }"
							:disabled="item.disabled || false"
							:value-format="item.valueFormat"
							clearable
						/>
					</template>

					<template v-else-if="item.type === 'week'">
						<el-date-picker
							v-model="formData[item.key]"
							type="week"
							:placeholder="item.placeholder || '选择周'"
							:style="{ width: item.width }"
							:disabled="item.disabled || false"
							:format="item.elementAttrs?.displayFormat || 'YYYY年第ww周'"
							:value-format="item.valueFormat || 'YYYY-MM-DD'"
							:first-day-of-week="1"
							:clearable="item.clearable !== false"
						/>
					</template>

					<template v-else-if="item.type === 'month'">
						<el-date-picker
							v-model="formData[item.key]"
							type="month"
							:placeholder="item.placeholder"
							:style="{ width: item.width }"
							:disabled="item.disabled || false"
							:format="item.elementAttrs?.displayFormat || item.valueFormat || 'YYYY年M月'"
							:value-format="item.valueFormat || 'YYYY年M月'"
							clearable
						/>
					</template>

					<template v-else-if="item.type === 'datetimerange'">
						<el-date-picker
							v-model="formData[item.key]"
							type="datetimerange"
							start-placeholder="开始时间"
							end-placeholder="结束时间"
							format="YYYY-MM-DD HH:mm:ss"
							date-format="YYYY/MM/DD"
							time-format="hh:mm:ss"
							:style="{ width: item.width }"
							:disabled="item.disabled || false"
							:value-format="item.valueFormat"
							clearable
						/>
					</template>

					<template v-else-if="item.type === 'daterange'">
						<el-date-picker
							v-model="formData[item.key]"
							type="daterange"
							:start-placeholder="item.elementAttrs?.startPlaceholder || '开始时间'"
							:end-placeholder="item.elementAttrs?.endPlaceholder || '结束时间'"
							:format="item.elementAttrs?.displayFormat || item.valueFormat || 'YYYY-MM-DD'"
							date-format="YYYY/MM/DD"
							:value-format="item.valueFormat"
							clearable
							:style="{ width: item.width }"
							:disabled="item.disabled || false"
							:disabled-date="item.elementAttrs?.disabledDate"
						/>
					</template>
				</el-form-item>
			</div>

			<div v-if="showSearchBtn" class="search-actions">
				<el-button type="primary" class="search-submit-btn" :icon="Search" @click="onSearch" />

				<el-button :icon="RefreshRight" class="search-reset-btn" @click="onReset" />

				<el-button v-if="needExpand" class="w-64px search-expand-btn" plain @click="expanded = !expanded">
					{{ expanded ? "折叠" : "展开" }}
				</el-button>
			</div>

			<el-form-item v-if="showBackBtn" style="margin-bottom: 0" class="h-50px search-back">
				<ElButton @click="router.go(-1)" class="mr-3 -mt-5">
					<el-icon>
						<Back />
					</el-icon>
					返回
				</ElButton>
			</el-form-item>
		</el-form>
	</div>
</template>

<script lang="ts" setup name="SearchHeader">
import { ArrowDown, ArrowUp, Back, RefreshRight, Search } from "@element-plus/icons-vue"
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

// 声明 ResizeObserver 实例引用，用于监听搜索栏容器宽度变化
let resizeObserver: ResizeObserver | null = null
interface FormItem {
	key: string
	label: string
	type: string
	placeholder?: string
	width?: string
	options?: { value: string | number; label: string; children?: any[] }[]
	preSelectOptions?: { value: string | number; label: string }[]
	isPosition?: string
	preModel?: string
	value?: string | number | string[] | null
	clearable?: boolean
	disabled?: boolean
	filterable?: boolean
	props?: Record<string, any>
	defaultValue?: any
	elementAttrs?: Record<string, any>
	valueFormat?: string
}
interface FormDataValue {
	[key: string]: any
}

const props = defineProps({
	formItems: {
		type: Array as () => FormItem[],
		default: () => []
	},
	configClass: {
		type: String,
		default: ""
	},
	showExpandConfig: {
		type: Boolean,
		default: false
	},
	showSearchBtn: {
		type: Boolean,
		default: true
	},
	showBackBtn: {
		type: Boolean,
		default: false
	},
	labelWidth: {
		type: String,
		default: ""
	},
	labelPosition: {
		type: String as () => "left" | "right" | "top",
		default: "right"
	},
	startHideIndex: {
		type: Number,
		default: 4
	},
	showBorderBottom: {
		type: Boolean,
		default: false
	},
	theme: {
		type: String as () => "default" | "card",
		default: "default"
	}
	// searchButtonText: {
	//   type: String,
	//   default: '查询'
	// },
	// resetButtonText: {
	//   type: String,
	//   default: '重置'
	// }
})
const emit = defineEmits(["formDataChange", "formDataReset"])
const formData: Record<string, any> = reactive<FormDataValue>({})
const expanded = ref(false)
const preSelectValue: Record<string, any> = reactive({})
const searchFormContentRef = ref<HTMLElement | null>(null)
const visibleFormItems = computed(() => {
	if (expanded.value || !needExpand.value) return props.formItems
	const parent = searchFormContentRef.value
	if (!parent) return props.formItems
	const items = parent.querySelectorAll(".search-item")
	if (!items.length) return props.formItems
	return _visibleFormItems.value
})
const _visibleFormItems = ref<FormItem[]>([])
const needExpand = ref(false)
const firstRowOffsetTop = ref(0)
// 动态更新折叠状态下可见的表单项
const updateVisibleFormItems = () => {
	const parent = searchFormContentRef.value
	const item = parent ? (parent.querySelector(".search-item") as HTMLElement) : null
	let parentWidth = 1200
	let itemWidth = 340
	const itemPadding = 32

	if (parent) {
		// 挂载时若父容器宽度尚未计算好（为 0），则先不进行估算，等待 ResizeObserver 获取到真实宽度后计算
		if (parent.offsetWidth === 0) return
		parentWidth = parent.offsetWidth
	}
	if (item) {
		// 若子项宽度尚未计算好（为 0），也跳过，避免将行大小误算为默认 padding
		if (item.offsetWidth === 0) return
		itemWidth = item.offsetWidth + itemPadding
	}

	let maxCount = Math.floor(parentWidth / itemWidth)
	if (maxCount < 1) maxCount = 1
	if (expanded.value) {
		_visibleFormItems.value = props.formItems
	} else {
		_visibleFormItems.value = props.formItems.slice(0, maxCount)
	}
}

const onSearch = () => {
	visibleFormItems.value.forEach((item: any) => {
		if (item.type === "datetimerange") {
			if (formData.times) {
				formData.startTime = formatDateTime(formData.times[0] as Date, "yyyy-MM-dd HH:mm:ss")
				formData.endTime = formatDateTime(formData.times[1] as Date, "yyyy-MM-dd HH:mm:ss")
			}
		}

		if (item.type === "cascader") {
			if (formData.cascaderData) {
				formData.appId = formData.cascaderData[0]
				formData.moduleName = formData.cascaderData[1]
				formData.operationName = formData.cascaderData[2]
			}
		}
		if (item.preSelectOptions) {
			formData[`${item.key}_preSelect`] = preSelectValue[item.key]
		}
	})
	emit("formDataChange", formData)
}

const onReset = () => {
	Object.keys(formData).forEach((key) => {
		const item = props.formItems.find((it) => it.key === key)
		if (item && item.disabled) return
		formData[key] = null
	})
	emit("formDataReset", formData)
}
const classNames = computed(() => {
	return expanded.value ? "collapse-form" : "expanded-form"
})

const checkNeedExpand = () => {
	const parent = searchFormContentRef.value
	if (!parent) {
		needExpand.value = false
		return
	}
	const items = parent.querySelectorAll(".search-item")
	if (!items.length) {
		needExpand.value = false
		return
	}

	// 如果是折叠状态，直接通过配置项总数与可见项数对比，决定是否展示“展开”按钮，避免因 DOM 节点提前减少导致换行检测失效
	if (!expanded.value) {
		needExpand.value = props.formItems.length > _visibleFormItems.value.length
		return
	}

	firstRowOffsetTop.value = (items[0] as HTMLElement).offsetTop
	needExpand.value = Array.from(items).some(
		(el, idx) => idx > 0 && (el as HTMLElement).offsetTop > firstRowOffsetTop.value
	)
}

const getTreeCurrentNodeKey = (value: FormItem["value"]) => {
	return Array.isArray(value) ? value[0] : value
}

const formatDateTime = (date: Date, pattern: string) => {
	const year = date.getFullYear()
	const month = `${date.getMonth() + 1}`.padStart(2, "0")
	const day = `${date.getDate()}`.padStart(2, "0")
	const hour = `${date.getHours()}`.padStart(2, "0")
	const minute = `${date.getMinutes()}`.padStart(2, "0")
	const second = `${date.getSeconds()}`.padStart(2, "0")

	return pattern
		.replace("yyyy", `${year}`)
		.replace("MM", month)
		.replace("dd", day)
		.replace("HH", hour)
		.replace("mm", minute)
		.replace("ss", second)
}

const handleResize = () => {
	nextTick(() => {
		updateVisibleFormItems()
		checkNeedExpand()
	})
}

onMounted(() => {
	props.formItems.forEach((item: any) => {
		if (item.value !== undefined) {
			formData[item.key] = item.value
		} else if (item.defaultValue !== undefined) {
			formData[item.key] = item.defaultValue
		} else {
			formData[item.key] = null
		}
	})
	handleResize()

	// 使用 ResizeObserver 监听宽度，防止页面或父容器从隐藏/无宽度变到显示时，展开折叠按钮未重新计算导致缺失
	if (window.ResizeObserver && searchFormContentRef.value) {
		resizeObserver = new ResizeObserver(() => {
			handleResize()
		})
		resizeObserver.observe(searchFormContentRef.value)
	}

	window.addEventListener("resize", handleResize)
})

onBeforeUnmount(() => {
	window.removeEventListener("resize", handleResize)
	// 断开监听器，避免内存泄漏
	if (resizeObserver) {
		resizeObserver.disconnect()
		resizeObserver = null
	}
})
watch(
	() => props.formItems,
	() => {
		handleResize()
	},
	{ deep: true }
)

watch(expanded, () => {
	handleResize()
})

defineExpose({
	formData,
	onSearch,
	onReset
})
</script>

<style scoped lang="scss">
.search-header {
	width: 100%;
	flex-shrink: 0; /* 防止在 flex 纵向布局中被压缩，导致内容溢出被遮挡 */
}

.search-form {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 10px;
	// padding-bottom: 20px;
	&.has-border-bottom {
		border-bottom: 1px solid #f4f5f7;
	}
}

.search-form-content {
	flex: 1;
	overflow: hidden;
}

.search-actions {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 10px;
	/* margin-left: auto; */
	padding-top: 2px;
	.el-button {
		margin-left: 0;
		border: none;
	}
	.search-submit-btn,
	.search-reset-btn {
		width: 34px;
	}
	.search-reset-btn,
	.search-expand-btn {
		background: #ebecf0;
	}
}

:deep(.el-form-item__label) {
	font-weight: 400 !important;
	color: #42526e !important;
}

.expanded-form {
	display: flex;
	flex-wrap: nowrap;
	gap: 24px;

	button {
		display: block;
	}
}

.collapse-form {
	display: flex;
	flex-wrap: wrap;
	gap: 24px;

	& > * {
		display: block;
	}

	button {
		display: block;
	}
}

:deep(.el-form-item) {
	display: flex;
	flex-wrap: nowrap;
	margin-right: 0;
	margin-bottom: 0px;
}

:deep(.el-form-item__label) {
	white-space: nowrap;
	align-items: center;
	padding-right: 12px;
}

:deep(.el-form-item__content) {
	white-space: nowrap;
}

:deep(.el-date-editor .el-range-input) {
	width: 41.5% !important;
}
</style>
