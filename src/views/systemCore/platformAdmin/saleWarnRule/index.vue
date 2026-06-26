<template>
	<div class="p-2 page-layout-fill">
		<el-card shadow="hover" class="page-split-table-card pt-5">
			<div class="mb-[10px]">
				<el-row>
					<el-col :span="1.5">
						<el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
					</el-col>
				</el-row>
			</div>

			<TableList
				v-loading="loading"
				:columns="columns"
				:tableData="tableData"
				:showIndexColumn="false"
				:showCheckboxColumn="false"
				maxHeight="calc(100vh - 200px)"
			>
				<template #handleTimeLimit="{ row }">
					{{ row.handleTimeLimit + "分钟" }}
				</template>
				<template #recheckTimeLimit="{ row }">
					{{ row.recheckTimeLimit + "分钟" }}
				</template>

				<template #operation="{ row }">
					<el-button link type="primary" size="small" @click="handleEdit(row)">修改</el-button>
					<el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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
import { columns, formConfig, SaleWarnRule, formRules, WarningRulePayload } from "./config"
import { listWarningRules, addWarningRule, updateWarningRule, deleteWarningRule } from "@/api/system/platform/index"
const { proxy } = getCurrentInstance() as ComponentInternalInstance
const { alarm_level } = toRefs<any>(proxy?.useDict("alarm_level"))
defineOptions({
	name: "SaleWarnRule"
})

const tableData = ref<SaleWarnRule[]>([])
const total = ref(0)
const loading = ref(false)
const queryParams = ref({
	pageNum: 1,
	pageSize: 10
})

const getList = async () => {
	loading.value = true
	try {
		const res = await listWarningRules(queryParams.value)
		const rawData = res.rows || res.data?.rows || res.data || []
		tableData.value = rawData.map((item: any) => {
			const pushScope = []
			if (item.pushProvince === "1") pushScope.push("省")
			if (item.pushCity === "1") pushScope.push("市")
			if (item.pushCounty === "1") pushScope.push("县")
			if (item.pushShop === "1") pushScope.push("零售店（点）")
			return {
				...item,
				pushScope
			}
		})
		total.value = res.total || res.data?.total || 0
	} catch (error) {
		console.error("获取预警规则失败:", error)
	} finally {
		loading.value = false
	}
}
/** 删除按钮操作 */
const handleDelete = async (row: SaleWarnRule) => {
	try {
		await proxy?.$modal.confirm("是否确认删除？")
		loading.value = true

		proxy?.$modal.msgSuccess("操作成功")
		await deleteWarningRule([row.id || ""])
		getList()
	} catch (error) {
		console.error("操作失败:", error)
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
const formData = ref<Partial<WarningRulePayload>>({})
const isEdit = ref(false)
const riskLevelCol = formConfig.value[0].cols.find((col: any) => {
	return (
		col.items &&
		col.items.some((item: any) => {
			return item.prop === "riskLevel"
		})
	)
})
const riskLevelItem: any = riskLevelCol?.items?.[0]
const dictLevel = () => {
	riskLevelItem.options = alarm_level.value
	console.log("🚀 ~ dictLevel ~ alarm_level.value:", alarm_level.value)
}
const handleAdd = () => {
	isEdit.value = false
	dictLevel()
	dialogTitle.value = "新增"
	formData.value = {
		ruleName: "",
		pushScope: [],
		needCountySupervise: "",
		riskLevel: "",
		handleTimeLimit: 10,
		recheckTimeLimit: 0
	}
	dialogVisible.value = true
}

const handleEdit = (row: SaleWarnRule) => {
	isEdit.value = true
	dictLevel()
	dialogTitle.value = "修改"
	formData.value = { ...row, pushScope: [...row.pushScope] }
	dialogVisible.value = true
}

const submitForm = async () => {
	try {
		await formRef.value?.validate()

		const payload = {
			...formData.value,
			pushProvince: formData.value.pushScope.includes("省") ? "1" : "0",
			pushCity: formData.value.pushScope.includes("市") ? "1" : "0",
			pushCounty: formData.value.pushScope.includes("县") ? "1" : "0",
			pushShop: formData.value.pushScope.includes("零售店（点）") ? "1" : "0"
		}

		if (isEdit.value) {
			await updateWarningRule(payload)
			proxy?.$modal.msgSuccess("操作成功")
		} else {
			await addWarningRule(payload)
			proxy?.$modal.msgSuccess("操作成功")
		}
		dialogVisible.value = false
		getList()
	} catch (error) {
		console.error("操作失败:", error)
	}
}
</script>

<style lang="scss" scoped>
:deep(.el-input.is-disabled .el-input__wrapper) {
	background-color: transparent;
	color: var(--el-text-color-regular);
}
:deep(.el-checkbox.is-disabled .el-checkbox__label) {
	color: var(--el-text-color-regular);
}
:deep(.el-radio.is-disabled .el-radio__label) {
	color: var(--el-text-color-regular);
}
</style>
<!-- <template>
  <div class="app-container mx-5">
    <el-card shadow="never" class="main-card">
      <template #header>
        <div class="card-header">
          <span class="title">零售预警风险等级设置</span>
          <el-button type="primary" @click="handleAdd" icon="Plus">新增</el-button>
        </div>
      </template>

      <div class="rules-container" v-loading="loading">
        <div v-for="rule in tableData" :key="rule.id" class="rule-box">
          <div class="rule-header">
            <span class="header-label">预警风险等级</span>
            <div class="header-level" :style="{ color: rule.color }">
              <span>{{ rule.riskLevelName }}</span>
              <el-image :src="rule.icon" class="w-14px h-14px" />
            </div>
          </div>
          <div class="rule-body">
            <el-row :gutter="40">
              <el-col :span="12">
                <div class="field-label">推送/下发</div>
                <div class="push-scope-text">{{ rule.pushScope.join('、') }}</div>
              </el-col>
              <el-col :span="6">
                <div class="field-label">处理时限（分钟）</div>
                <div class="time-limit-text">{{ rule.handleTimeLimit }}</div>
              </el-col>
              <el-col :span="6">
                <div class="field-label">是否需要督办</div>
                <div class="supervise-text">{{ rule.needCountySuperviseName }}</div>
              </el-col>
            </el-row>
            <div class="rule-operation">
              <el-button link type="primary" size="small" @click="handleEdit(rule)">修改</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(rule)">删除</el-button>
            </div>
          </div>
        </div>
        <div v-if="tableData.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无预警风险等级规则" />
        </div>
      </div>
      <div class="pagination-container" v-show="total > 0">
        <pagination v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
      </div>
    </el-card>
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" append-to-body>
      <ReusableForm ref="formRef" v-model="formData" :form-config="formConfig" label-width="130px" label-position="right" :rules="formRules" />
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
import { ref, onMounted, ComponentInternalInstance, getCurrentInstance, toRefs } from 'vue';
import { ElMessage, ElEmpty } from 'element-plus';
// 导入风险等级图标
import level1 from '@/assets/images/level1.webp';
import level2 from '@/assets/images/level2.webp';
import level3 from '@/assets/images/level3.webp';
import level4 from '@/assets/images/level4.webp';
// 导入接口和配置
import { columns, formConfig, SaleWarnRule, formRules, WarningRulePayload } from './config';
import { listWarningRules, addWarningRule, updateWarningRule, deleteWarningRule } from '@/api/system/platform/index';

// 获取组件实例
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { alarm_level } = toRefs<any>(proxy?.useDict('alarm_level'));
defineOptions({ name: 'SaleWarnRule' });

// 分页查询参数
const queryParams = ref({
  pageNum: 1,
  pageSize: 10
});
const tableData = ref<(SaleWarnRule & { color: string; icon: string })[]>([]);
const total = ref(0);
const loading = ref(false);

// 弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formRef = ref();
const formData = ref<Partial<WarningRulePayload>>({});
const isEdit = ref(false);

// 风险等级样式映射（和config1.ts保持一致）
const levelStyleMap = {
  重大: { color: '#F53F3F', icon: level1 },
  较大: { color: '#E6A23C', icon: level2 },
  一般: { color: '#FF7D00', icon: level3 },
  低: { color: '#1678FF', icon: level4 }
};

// 获取风险等级字典并更新表单配置
const dictLevel = () => {
  const riskLevelCol = formConfig.value[0].cols.find((col: any) => col.items && col.items.some((item: any) => item.prop === 'riskLevel'));
  const riskLevelItem = riskLevelCol?.items?.[0];
  if (riskLevelItem) riskLevelItem.options = alarm_level.value;
};

// 获取规则列表
const getList = async () => {
  loading.value = true;
  try {
    const res = await listWarningRules(queryParams.value);
    const rawData = res.rows || res.data?.rows || res.data || [];

    // 数据映射：兼容样式和功能数据结构
    tableData.value = rawData.map((item: any) => {
      // 解析推送范围
      const pushScope = [];
      if (item.pushProvince === '1') pushScope.push('省');
      if (item.pushCity === '1') pushScope.push('市');
      if (item.pushCounty === '1') pushScope.push('县');
      if (item.pushShop === '1') pushScope.push('零售企业');

      // 匹配风险等级样式
      const levelStyle = levelStyleMap[item.riskLevelName] || levelStyleMap['低'];

      return {
        ...item,
        pushScope,
        color: levelStyle.color,
        icon: levelStyle.icon
      };
    });
    total.value = res.total || res.data?.total || 0;
  } catch (error) {
    console.error('获取预警规则失败:', error);
    ElMessage.error('获取预警规则失败');
  } finally {
    loading.value = false;
  }
};

// 新增按钮
const handleAdd = () => {
  isEdit.value = false;
  dictLevel();
  dialogTitle.value = '新增预警风险等级';
  formData.value = {
    ruleName: '',
    pushScope: [],
    needCountySupervise: '',
    riskLevel: '',
    handleTimeLimit: 10,
    ruleStatus: '0' // 默认启用
  };
  dialogVisible.value = true;
};

// 编辑按钮
const handleEdit = (row: SaleWarnRule) => {
  isEdit.value = true;
  dictLevel();
  dialogTitle.value = '修改预警风险等级';
  formData.value = {
    ...row,
    pushScope: [...row.pushScope],
    ruleStatus: row.ruleStatus || '0'
  };
  dialogVisible.value = true;
};

// 删除按钮
const handleDelete = async (row: SaleWarnRule) => {
  try {
    await proxy?.$modal.confirm('是否确认删除该预警风险等级规则？');
    loading.value = true;
    await deleteWarningRule([row.id || '']);
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    console.error('删除失败:', error);
    ElMessage.error('删除失败');
  } finally {
    loading.value = false;
  }
};

// 提交表单（新增/编辑）
const submitForm = async () => {
  try {
    await formRef.value?.validate();

    // 构造提交参数
    const payload = {
      ...formData.value,
      pushProvince: formData.value.pushScope?.includes('省') ? '1' : '0',
      pushCity: formData.value.pushScope?.includes('市') ? '1' : '0',
      pushCounty: formData.value.pushScope?.includes('县') ? '1' : '0',
      pushShop: formData.value.pushScope?.includes('零售企业') ? '1' : '0'
    };

    if (isEdit.value) {
      await updateWarningRule(payload);
      ElMessage.success('修改成功');
    } else {
      await addWarningRule(payload);
      ElMessage.success('新增成功');
    }

    dialogVisible.value = false;
    getList(); // 刷新列表
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败，请重试');
  }
};

// 初始化加载列表
onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.app-container {
  padding: 15px 20px 20px 20px;
  background-color: #f0f2f5;
  height: calc(100vh - 166px); /* 恢复准确的可用高度，消除最外层浏览器滚动条 */
  width: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 彻底切断该容器自身的滚动可能 */
}

.main-card {
  border: none;
  flex: 1;
  display: flex;
  gap: 5px;
  flex-direction: column;
  overflow: hidden;

  :deep(.el-card__header) {
    padding: 0 !important;
    border-bottom: none;
    flex-shrink: 0;
  }

  :deep(.el-card__body) {
    // padding-top: 20px !important;
    flex: 1;
    display: flex;
    gap: 20px;
    flex-direction: column;
    overflow: hidden;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  // padding: 10px 0 20px 0;

  .title {
    font-size: 18px;
    font-weight: 500;
    color: #172b4d;
  }
}

.rules-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  // padding: 0 20px 20px;
  flex: 1;
  height: 0; /* 核心：限制高度基准为0，依靠flex:1撑开，配合overflow-y彻底把滚动锁死在这里 */
  overflow-y: auto;

  /* 滚动条美化 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.rule-box {
  border: 1px solid #ebecf0;
  width: 80%;
  margin: 0 auto;
  border-radius: 4px;
  height: 139px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  .rule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 24px;
    background: linear-gradient(180deg, #ffffff00 0%, #f4f5f785 100%);

    .header-label {
      font-size: 18px;
      color: #172b4d;
    }

    .header-level {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 18px;
      font-weight: 500;
    }
  }

  .rule-body {
    padding: 20px 24px;
    background-color: #fff;
    position: relative;
    flex: 1;

    .field-label {
      font-size: 14px;
      color: #6b778c;
      margin-bottom: 12px;
    }

    .push-scope-text,
    .time-limit-text,
    .supervise-text {
      color: #172b4d;
      font-size: 14px;
    }

    .rule-operation {
      position: absolute;
      right: 24px;
      top: 20px;
      display: flex;
      gap: 16px;
    }
  }
}

// 空状态样式
.empty-state {
  text-align: center;
  padding: 40px 0;
  width: 80%;
  margin: 0 auto;
  background: #fff;
  border-radius: 4px;
}

// 分页样式
.pagination-container {
  // padding: 15px 0;
  text-align: right;
  height: 35px;
  width: 80%;
  margin: 0 auto;
  flex-shrink: 0;
  background-color: #fff;
  // border-top: 1px solid #f0f2f5;
}

// 弹窗样式适配
:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: transparent;
  color: var(--el-text-color-regular);
}
:deep(.el-checkbox.is-disabled .el-checkbox__label) {
  color: var(--el-text-color-regular);
}
:deep(.el-radio.is-disabled .el-radio__label) {
  color: var(--el-text-color-regular);
}

// 图标大小
.w-14px {
  width: 14px;
}
.h-14px {
  height: 14px;
}
</style> -->
