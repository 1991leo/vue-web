<template>
	<div class="p-2 page-layout-fill">
		<el-card shadow="hover" class="page-split-table-card pt-5">
			<!-- <div class="mb-[10px]">
        <el-row>
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
          </el-col>
        </el-row>
      </div> -->
			<TableList
				v-loading="loading"
				:columns="columns"
				:tableData="tableData"
				:showIndexColumn="false"
				:showCheckboxColumn="false"
				maxHeight="calc(100vh - 200px)"
			>
				<template #operation="{ row }">
					<el-button link type="primary" size="small" @click="handleEdit(row)">修改</el-button>
					<!-- <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button> -->
				</template>
			</TableList>
			<pagination
				v-show="total > 0"
				v-model:page="queryParams.pageNum"
				v-model:limit="queryParams.pageSize"
				:total="total"
				@pagination="getList"
			/>
		</el-card>

		<el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" append-to-body>
			<ReusableForm
				ref="formRef"
				v-model="formData"
				:form-config="formConfig"
				label-width="130px"
				label-position="right"
				:rules="formRules"
			/>
			<template #footer>
				<div class="dialog-footer">
					<el-button @click="dialogVisible = false">取消</el-button>
					<el-button type="primary" @click="submitForm">确定</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, ComponentInternalInstance, getCurrentInstance, toRefs } from "vue"
import { columns, formConfig, formRules, MessageRule } from "./config"
import { listPushConfigs, deletePushConfig, updatePushConfig, addPushConfig } from "@/api/system/platform/index"

const { proxy } = getCurrentInstance() as ComponentInternalInstance
const { message_type } = toRefs<any>(proxy?.useDict("message_type")) // 假设消息类型复用该字典或有专属字典

defineOptions({
	name: "MesageRule"
})
const tableData = ref<any[]>([])
const total = ref<number>(0)
const loading = ref(false)
const queryParams = ref<any>({
	pageNum: 1,
	pageSize: 10
})
const getList = async () => {
	loading.value = true
	try {
		const res = await listPushConfigs(queryParams.value)
		if (res.code === 200) {
			tableData.value = res.rows || []
			total.value = res.total || 0
		}
	} catch (error) {
		console.error("获取列表失败", error)
	} finally {
		loading.value = false
	}
}
onMounted(() => {
	getList()
})

const dialogVisible = ref(false)
const dialogTitle = ref("")
const formRef = ref()
const formData = ref<Partial<MessageRule>>({})
const isEdit = ref(false)

const msgTypeCol = formConfig.value[0].cols.find((col: any) => {
	return col.items && col.items.some((item: any) => item.prop === "msgType")
})
const msgTypeItem: any = msgTypeCol?.items?.[0]

const dictType = () => {
	msgTypeItem.options = message_type.value
}

// const handleAdd = () => {
//   isEdit.value = false;
//   dictType();
//   dialogTitle.value = '新增消息推送规则';
//   formData.value = {
//     msgType: '',
//     msgTypeName: '',
//     routerPath: '',
//     msgTemplate: '',
//     status: '1',
//     remark: ''
//   };
//   dialogVisible.value = true;
// };

const handleEdit = (row: MessageRule) => {
	isEdit.value = true
	dictType()
	dialogTitle.value = "修改"
	formData.value = {
		...row,
		status: String(row.status) || "0"
	}
	dialogVisible.value = true
}

const handleDelete = async (row: MessageRule) => {
	try {
		await proxy?.$modal.confirm("是否确认删除？")
		loading.value = true
		await deletePushConfig([row.id || ""])
		proxy?.$modal.msgSuccess("操作成功")
		getList()
	} catch (error) {
		console.error("操作失败:", error)
	} finally {
		loading.value = false
	}
}

const submitForm = async () => {
	try {
		await formRef.value?.validate()

		const payload = {
			...formData.value
		}

		if (isEdit.value) {
			await updatePushConfig(payload)
			proxy?.$modal.msgSuccess("操作成功")
		} else {
			await addPushConfig(payload)
			proxy?.$modal.msgSuccess("操作成功")
		}
		dialogVisible.value = false
		getList()
	} catch (error) {
		console.error("保存失败:", error)
	}
}
</script>

<style lang="scss" scoped></style>
