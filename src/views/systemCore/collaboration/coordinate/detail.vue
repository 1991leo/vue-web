<template>
	<div class="detail-page">
		<!-- 详情页头部 -->
		<div class="detail-header">
			<button class="back-square" @click="emit('back')">
				<img src="@/assets/images/back.png" class="back-icon" />
			</button>
			<h1>{{ row.title }}</h1>
			<span class="state-text" :class="statusClass(detailForm.status)">
				<img :src="statusIcon(detailForm.status)" class="state-icon" />
				{{ statusLabel(detailForm.status) }}
			</span>
		</div>

		<!-- 详情副标题信息 -->
		<div class="detail-subline">
			<span>{{ row.projectCode }}</span>
			<b>|</b>
			<span>提报时间: {{ row.reportTime }}</span>
			<b>|</b>
			<span>最后更新: {{ row.lastUpdateTime }}</span>
		</div>

		<!-- 详情与推进时间轴卡片 -->
		<div class="detail-card">
			<div class="detail-left">
				<!-- 事项描述 -->
				<section class="info-section">
					<h2>事项描述</h2>
					<p>{{ row.description }}</p>
				</section>

				<!-- 解决措施展示，仅在非编辑态（只读详情）下展示 -->
				<section v-if="!isEdit" class="info-section">
					<h2>解决措施</h2>
					<p>{{ row.solution }}</p>
				</section>

				<!-- 流程处理操作表单 -->
				<section class="process-section">
					<h2>处理操作</h2>

					<!-- 编辑模式下展示表单输入组件 -->
					<el-form v-if="isEdit" ref="formRef" :model="detailForm" :rules="rules" label-position="top">
						<div class="form-grid">
							<el-form-item label="变更状态" prop="status">
								<el-select v-model="detailForm.status" placeholder="请选择变更状态">
									<el-option
										v-for="dict in statusOptions"
										:key="dict.dictValue"
										:label="dict.dictLabel"
										:value="dict.dictValue"
									/>
								</el-select>
							</el-form-item>
							<el-form-item label="分配处理人" prop="handler">
								<el-select v-model="detailForm.handler" placeholder="请选择分配处理人">
									<el-option
										v-for="user in userOptions"
										:key="user.userId"
										:label="user.nickName || user.userName"
										:value="user.nickName || user.userName"
									/>
								</el-select>
							</el-form-item>
						</div>
						<el-form-item label="填写解决措施">
							<el-input
								v-model="detailForm.solution"
								type="textarea"
								:rows="6"
								resize="none"
								placeholder="请输入内容"
							/>
						</el-form-item>
						<el-form-item label="更新共享范围">
							<el-checkbox-group v-model="detailForm.shareRange" class="checkbox-panel detail-checks">
								<el-checkbox
									v-for="dict in companyOptions"
									:key="dict.dictValue"
									:label="dict.dictLabel"
									:value="dict.dictValue"
								/>
							</el-checkbox-group>
						</el-form-item>
					</el-form>

					<!-- 详情只读模式下换成纯文本展示 -->
					<div v-else class="detail-text-info">
						<div class="form-grid">
							<div class="text-info-item">
								<span class="info-label">变更状态</span>
								<div class="info-value">
									<span class="state-text" :class="statusClass(props.row.status)">
										<img :src="statusIcon(props.row.status)" class="state-icon" />
										{{ statusLabel(props.row.status) }}
									</span>
								</div>
							</div>
							<div class="text-info-item">
								<span class="info-label">分配处理人</span>
								<div class="info-value">{{ props.row.handler || "未指定" }}</div>
							</div>
						</div>
						<div class="text-info-item full-width">
							<span class="info-label">共享范围</span>
							<div class="info-value">
								<template v-if="props.row.shareRange && props.row.shareRange.length">
									<span v-for="company in props.row.shareRange" :key="company" class="share-tag">{{
										companyLabel(company)
									}}</span>
								</template>
								<template v-else>
									<span class="no-data">暂无共享范围</span>
								</template>
							</div>
						</div>
					</div>

					<!-- 仅在编辑模式下展示底部操作按钮 -->
					<div v-if="isEdit" class="form-actions detail-submit">
						<el-button @click="emit('back')">取消</el-button>
						<el-button type="primary" class="submit-button" :loading="loading" @click="saveDetail">提交</el-button>
					</div>
				</section>
			</div>

			<!-- 右侧推进时间线 -->
			<div class="detail-right">
				<h2>推进时间线</h2>
				<CommonTimeline :data="row.timeline" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue"
import CommonTimeline from "@/components/CommonTimeline/index.vue"

// 声明接收 of Props 结构，对应每一行的数据细节
const props = withDefaults(
	defineProps<{
		row: {
			rowKey: string
			id: string
			projectCode: string
			reportCompany: string
			relatedType: "" | "项目" | "任务"
			relatedName: string
			title: string
			status: string
			handler: string
			reportTime: string
			description: string
			solution: string
			shareRange: string[]
			lastUpdateTime: string
			timeline: Array<{
				time: string
				label: string
				type: string
				user: string
				content: string
			}>
		}
		isEdit?: boolean
		statusOptions?: Array<{
			dictValue: string
			dictLabel: string
			[key: string]: any
		}>
		companyOptions?: Array<{
			dictValue: string
			dictLabel: string
			[key: string]: any
		}>
		userOptions?: Array<{
			userId: number | string
			nickName: string
			userName: string
			[key: string]: any
		}>
		loading?: boolean
	}>(),
	{
		isEdit: false,
		statusOptions: () => [],
		companyOptions: () => [],
		userOptions: () => [],
		loading: false
	}
)

// 声明 emits 事件，分别用于返回与提交详情表单
const emit = defineEmits<{
	(e: "back"): void
	(
		e: "submit",
		form: {
			id: string
			status: string
			handler: string
			solution: string
			shareRange: string[]
		}
	): void
}>()

const formRef = ref<any>()

const rules = {
	status: [{ required: true, message: "请选择变更状态", trigger: "change" }],
	handler: [{ required: true, message: "请选择分配处理人", trigger: "change" }]
}

// 创建详情操作表单响应式状态
const detailForm = reactive({
	id: "",
	status: "0",
	handler: "",
	solution: "",
	shareRange: [] as string[]
})

// 根据状态返回对应图标路径
const statusIconMap: Record<string, string> = {
	"0": new URL("@/assets/collaboration/Pending.png", import.meta.url).href,
	"1": new URL("@/assets/collaboration/processing.png", import.meta.url).href,
	"2": new URL("@/assets/collaboration/resolved.png", import.meta.url).href,
	"3": new URL("@/assets/collaboration/unresolved.png", import.meta.url).href,
	已解决: new URL("@/assets/collaboration/resolved.png", import.meta.url).href,
	待处理: new URL("@/assets/collaboration/Pending.png", import.meta.url).href,
	处理中: new URL("@/assets/collaboration/processing.png", import.meta.url).href,
	未解决: new URL("@/assets/collaboration/unresolved.png", import.meta.url).href
}
const statusIcon = (status: string) => statusIconMap[status] || statusIconMap["0"]

// 计算处理状态 of css 类，返回样式映射
const statusClass = (status: string) => {
	const map: Record<string, string> = {
		"0": "pending",
		"1": "processing",
		"2": "resolved",
		"3": "unresolved",
		已解决: "resolved",
		待处理: "pending",
		处理中: "processing",
		未解决: "unresolved"
	}
	return map[status] || "pending"
}

// 根据字典值动态获取对应的中文 Label
const statusLabel = (status: string) => {
	const options = props.statusOptions || []
	const target = options.find((item) => item.dictValue === status)
	if (target) return target.dictLabel
	const map: Record<string, string> = {
		"0": "待处理",
		"1": "处理中",
		"2": "已完成",
		"3": "已关闭"
	}
	return map[status] || status
}

// 将企业代码翻译为企业名称名称
const companyLabel = (companyValue: string) => {
	const options = props.companyOptions || []
	const target = options.find((item) => item.dictValue === companyValue)
	return target ? target.dictLabel : companyValue
}

// 填充及重置详情面板表单
const initForm = () => {
	if (props.row) {
		detailForm.id = props.row.id
		detailForm.status = props.row.status
		detailForm.handler = props.row.handler
		detailForm.solution = ""
		detailForm.shareRange = [...props.row.shareRange]
	}
}

// 监听外界传入的当前选中行，以便同步刷新表单
watch(() => props.row, initForm, { immediate: true })

// 表单保存动作
const saveDetail = () => {
	if (props.loading) return
	if (!formRef.value) return
	formRef.value.validate((valid: boolean) => {
		if (valid) {
			emit("submit", {
				...detailForm
			})
		}
	})
}
</script>

<style scoped lang="scss">
.detail-page {
	display: flex;
	flex-direction: column;
	height: 100%;
	max-width: 1606px;
	margin: 0 auto;
	box-sizing: border-box;
}

.detail-header {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	gap: 14px;

	h1 {
		max-width: 290px;
		margin: 0;
		overflow: hidden;
		color: #0f2748;
		font-size: 22px;
		font-weight: 700;
		line-height: 36px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}

.back-square {
	display: inline-flex;
	width: 36px;
	height: 36px;
	align-items: center;
	justify-content: center;
	border: 0;
	border-radius: 10px;
	background: #fff;
	cursor: pointer;
}

.back-icon {
	width: 20px;
	height: 20px;
	object-fit: contain;
}

.detail-subline {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	gap: 12px;
	margin: 16px 0 24px;
	color: #42526e;
	font-size: 14px;

	b {
		color: #6b7795;
		font-weight: 400;
	}
}

.detail-card {
	/* 主卡片占满剩余高度，仅纵向滚动；横向裁剪避免负 margin 触发横向滚动条 */
	display: grid;
	flex: 1;
	min-height: 0;
	grid-template-columns: minmax(0, 1fr) 427px;
	overflow-x: hidden;
	overflow-y: auto;
	border-radius: 20px;
	background: #fff;
}

.detail-left {
	padding: 30px 32px;
	border-right: 1px solid #edf0f5;
}

.detail-right {
	padding: 30px 30px 26px;

	h2 {
		margin: 0 0 24px;
		color: #0f2748;
		font-size: 16px;
		font-weight: 700;
	}
}

.info-section,
.process-section {
	h2 {
		margin: 0 0 16px;
		color: #0f2748;
		font-size: 16px;
		font-weight: 700;
	}

	p {
		margin: 0 0 28px;
		color: #5f6f8c;
		font-size: 14px;
		line-height: 1.75;
	}
}

.process-section {
	:deep(.el-form-item) {
		margin-bottom: 16px;
	}

	:deep(.el-form-item__label) {
		color: #0f2748;
		font-size: 14px;
	}

	:deep(.el-textarea__inner) {
		height: 138px;
	}
}

.state-text {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	font-size: 14px;

	&.resolved {
		color: var(--el-color-primary);
	}
	&.pending {
		color: #344563;
	}
	&.processing {
		color: #1677ff;
	}
	&.unresolved {
		color: #ff4d4f;
	}
}

.state-icon {
	width: 16px;
	height: 16px;
	object-fit: contain;
}

.form-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 40px;
}

.checkbox-panel {
	width: 100%;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	row-gap: 12px;
	min-height: 74px;
	padding: 12px 12px 10px;
	border-radius: 8px;
	background: #fbfcfe;

	:deep(.el-checkbox) {
		height: 20px;
		margin-right: 0;
	}
}

.detail-checks {
	margin-top: 4px;
}

.form-actions {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
}

.detail-submit {
	padding: 112px 0 0;
}

// 推进时间线相关的原有样式已移至公共组件 CommonTimeline 中

.page-footer {
	position: absolute;
	right: 0;
	bottom: 12px;
	left: 0;
	color: #6b7795;
	font-size: 14px;
	line-height: 20px;
	text-align: center;
}

.submit-button {
	min-width: 86px;
	height: 34px;
	--el-button-bg-color: var(--el-color-primary);
	--el-button-border-color: var(--el-color-primary);
	--el-button-hover-bg-color: var(--el-color-primary-light-3);
	--el-button-hover-border-color: var(--el-color-primary-light-3);
}

.detail-text-info {
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 12px 0 0;
}

.text-info-item {
	display: flex;
	flex-direction: column;
	gap: 8px;

	.info-label {
		color: #42526e;
		font-size: 14px;
		font-weight: 500;
	}

	.info-value {
		color: #0f2748;
		font-size: 14px;
		line-height: 20px;
		min-height: 34px;
		display: flex;
		align-items: center;
	}

	.no-data {
		color: #a5adba;
	}
}

.share-tag {
	display: inline-flex;
	align-items: center;
	height: 28px;
	padding: 0 24px;
	margin-right: 8px;
	margin-bottom: 8px;
	border-radius: 6px;
	background: var(--el-color-primary-light-9);
	color: var(--el-color-primary);
	font-size: 13px;
}

@media (max-width: 1200px) {
	.form-grid {
		grid-template-columns: 1fr;
	}
	.detail-card {
		grid-template-columns: 1fr;
	}

	.detail-left {
		border-right: 0;
		border-bottom: 1px solid #edf0f5;
	}
}
</style>
