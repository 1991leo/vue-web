<template>
	<div class="p-2 page-layout-fill">
		<el-card shadow="never">
			<approvalButton
				@submitForm="submitForm"
				@approvalVerifyOpen="approvalVerifyOpen"
				@handleApprovalRecord="handleApprovalRecord"
				:buttonLoading="buttonLoading"
				:id="form.id"
				:status="form.status"
				:pageType="routeParams.type"
				:mode="false"
			/>
		</el-card>
		<el-card shadow="never" style="height: 78vh; overflow-y: auto">
			<el-form
				ref="shopFormRef"
				v-loading="loading"
				:disabled="routeParams.type === 'view'"
				:model="form"
				:rules="rules"
				label-width="120px"
			>
				<el-form-item label="流程定义" v-if="routeParams.type === 'add'">
					<el-select v-model="flowCode" placeholder="选择流程定义" style="width: 100%">
						<el-option v-for="item in flowCodeOptions" :key="item.value" :label="item.label" :value="item.value" />
					</el-select>
				</el-form-item>

				<!-- 这里可以根据需要添加门店业务表单的字段，例如： -->
				<!-- <el-form-item label="门店名称" prop="shopName">
          <el-input v-model="form.shopName" placeholder="请输入门店名称" />
        </el-form-item> -->

				<div v-if="routeParams.type !== 'add'" style="text-align: center; margin-top: 50px; color: #909399">
					门店业务信息可在此处展示（仅供审核查看）
				</div>
			</el-form>
		</el-card>
		<!-- 提交组件 -->
		<submitVerify ref="submitVerifyRef" :task-variables="taskVariables" @submit-callback="submitCallback" />
		<!-- 审批记录 -->
		<approvalRecord ref="approvalRecordRef" />
	</div>
</template>

<script setup name="ShopEdit" lang="ts">
// 注意：以下接口需要后端提供相应的门店审核API（例如：addShopAudit, getShopAudit, submitAndFlowStart等）
// 目前暂时代用原有工作流通用组件和模拟数据结构，请根据实际后端接口进行替换
import { startWorkFlow } from "@/api/workflow/task"
import { listDefinition } from "@/api/workflow/definition"
import { FlowDefinitionVo } from "@/api/workflow/definition/types"
import SubmitVerify from "@/components/Process/submitVerify.vue"
import ApprovalRecord from "@/components/Process/approvalRecord.vue"
import ApprovalButton from "@/components/Process/approvalButton.vue"
import { StartProcessBo } from "@/api/workflow/workflowCommon/types"

const { proxy } = getCurrentInstance() as ComponentInternalInstance

const buttonLoading = ref(false)
const loading = ref(true)

// 路由参数
const routeParams = ref<Record<string, any>>({})
const flowCodeOptions = ref<Array<{ value: string; label: string }>>([])
// 流程定义编码，默认在新增时取接口返回的第一条
const flowCode = ref<string>("")

// 提交组件
const submitVerifyRef = ref<InstanceType<typeof SubmitVerify>>()
// 审批记录组件
const approvalRecordRef = ref<InstanceType<typeof ApprovalRecord>>()

const shopFormRef = ref<ElFormInstance>()

const submitFormData = ref<StartProcessBo>({
	businessId: "",
	flowCode: "",
	variables: {},
	bizExt: {}
})
const taskVariables = ref<Record<string, any>>({})
const bizExt = ref<Record<string, any>>({})

// 初始表单数据
const initFormData = {
	id: undefined,
	status: undefined
	// shopName: undefined,
}

const data = reactive({
	form: { ...initFormData },
	rules: {
		// 根据业务需求配置校验规则
		// shopName: [{ required: true, message: '门店名称不能为空', trigger: 'blur' }]
	}
})

const { form, rules } = toRefs(data)

/** 表单重置 */
const reset = () => {
	form.value = { ...initFormData }
	shopFormRef.value?.resetFields()
}

/** 查询流程定义下拉选项 */
const getFlowCodeOptions = async () => {
	// 仅查询已发布流程定义，避免选择未发布流程导致无法发起
	const resp = await listDefinition({
		pageNum: 1,
		pageSize: 999,
		flowCode: undefined,
		flowName: undefined,
		category: "",
		isPublish: 1
	})
	const rows = (resp?.rows || []) as FlowDefinitionVo[]
	flowCodeOptions.value = rows.map((item) => ({
		value: item.flowCode,
		label: `${item.flowName}（${item.flowCode}）`
	}))
	if (routeParams.value.type === "add" && !flowCode.value && flowCodeOptions.value.length > 0) {
		flowCode.value = flowCodeOptions.value[0].value
	}
}

/** 获取详情 */
const getInfo = () => {
	loading.value = true
	buttonLoading.value = false
	nextTick(async () => {
		// TODO: 调用后端获取详情的接口
		// const res = await getShopAudit(routeParams.value.id);
		// Object.assign(form.value, res.data);
		loading.value = false
	})
}

/** 提交按钮 */
const submitForm = (status: string, mode: boolean) => {
	try {
		shopFormRef.value?.validate(async (valid: boolean) => {
			if (valid) {
				buttonLoading.value = true
				// 设置后端发起和不等于草稿状态 直接走流程发起
				if (mode && status != "draft") {
					// TODO: 调用后端业务+发起流程的接口
					// const res = await submitAndFlowStart(form.value).finally(() => (buttonLoading.value = false));
					// form.value = res.data;

					buttonLoading.value = false
					proxy?.$modal.msgSuccess("操作成功")
					proxy.$tab.closePage(proxy.$route)
					proxy.$router.go(-1)
				} else {
					// TODO: 调用后端保存/更新接口
					// let res;
					// if (form.value.id) {
					//   res = await updateShopAudit(form.value).finally(() => (buttonLoading.value = false));
					// } else {
					//   res = await addShopAudit(form.value).finally(() => (buttonLoading.value = false));
					// }
					// form.value = res.data;

					// 模拟保存成功，生成一个伪造的业务ID用于演示流程
					form.value.id = form.value.id || new Date().getTime().toString()

					if (status === "draft") {
						buttonLoading.value = false
						proxy?.$modal.msgSuccess("暂存成功")
						proxy.$tab.closePage(proxy.$route)
						proxy.$router.go(-1)
					} else {
						await handleStartWorkFlow(form.value)
					}
				}
			}
		})
	} finally {
		buttonLoading.value = false
	}
}

// 提交申请 (发起工作流)
const handleStartWorkFlow = async (data: any) => {
	try {
		submitFormData.value.flowCode = flowCode.value
		submitFormData.value.businessId = data.id
		// 流程变量 (根据您在流程设计器中设置的网关或监听器变量来传递)
		taskVariables.value = {
			// 示例: shopId: data.shopId,
		}
		// 流程实例业务扩展字段
		bizExt.value = {
			businessTitle: "门店信息审核申请",
			businessCode: data.applyCode || "SHOP_AUDIT_" + data.id
		}
		submitFormData.value.variables = taskVariables.value
		submitFormData.value.bizExt = bizExt.value
		const resp = await startWorkFlow(submitFormData.value)
		if (submitVerifyRef.value) {
			buttonLoading.value = false
			submitVerifyRef.value.openDialog(resp.data.taskId)
		}
	} finally {
		buttonLoading.value = false
	}
}

// 审批记录
const handleApprovalRecord = () => {
	approvalRecordRef.value?.init(form.value.id)
}

// 提交回调
const submitCallback = async () => {
	await proxy.$tab.closePage(proxy.$route)
	proxy.$router.go(-1)
}

// 审批
const approvalVerifyOpen = async () => {
	submitVerifyRef.value?.openDialog(routeParams.value.taskId)
}

onMounted(() => {
	nextTick(async () => {
		routeParams.value = proxy.$route.query
		await getFlowCodeOptions()
		reset()
		loading.value = false
		if (
			routeParams.value.type === "update" ||
			routeParams.value.type === "view" ||
			routeParams.value.type === "approval"
		) {
			getInfo()
		}
	})
})
</script>
