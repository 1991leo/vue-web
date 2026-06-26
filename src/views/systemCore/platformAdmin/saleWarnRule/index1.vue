<template>
	<div class="app-container mx-5">
		<el-card shadow="never" class="main-card">
			<template #header>
				<div class="card-header">
					<span class="title">零售预警风险等级设置</span>
					<el-button type="primary" @click="handleSave" icon="DocumentAdd">确定</el-button>
				</div>
			</template>

			<div class="rules-container">
				<div v-for="rule in rules" :key="rule.id" class="rule-box">
					<div class="rule-header">
						<span class="header-label">预警风险等级</span>
						<div class="header-level" :style="{ color: rule.color }">
							<span>{{ rule.level }}</span>
							<el-image :src="rule.icon" class="w-14px h-14px" />
						</div>
					</div>
					<div class="rule-body">
						<el-row :gutter="40">
							<el-col :span="12">
								<div class="field-label">推送/下发</div>
								<el-checkbox-group v-model="rule.pushTargets">
									<el-checkbox v-for="opt in rule.options" :key="opt" :label="opt">
										{{ opt }}
									</el-checkbox>
								</el-checkbox-group>
							</el-col>
							<el-col :span="6">
								<div class="field-label">处理时限（分钟）</div>
								<el-input v-model="rule.timeLimit" placeholder="请输入" type="number" class="time-input" />
							</el-col>
							<el-col :span="6">
								<div class="field-label">是否需要督办</div>
								<el-radio-group v-model="rule.needSupervise">
									<el-radio :label="true">是</el-radio>
									<el-radio :label="false">否</el-radio>
								</el-radio-group>
							</el-col>
						</el-row>
					</div>
				</div>
			</div>
		</el-card>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { ElMessage } from "element-plus"
import { Aim } from "@element-plus/icons-vue"
import { defaultRules, WarnRule } from "./config1"

const rules = ref<WarnRule[]>(JSON.parse(JSON.stringify(defaultRules)))

const handleSave = () => {
	console.log("Saved rules:", rules.value)
	ElMessage.success("保存成功")
}
</script>

<style lang="scss" scoped>
.app-container {
	padding: 15px 20px 20px 20px;
	background-color: #f0f2f5;
	height: calc(100vh - 166px);
	width: calc(100% - 40px);
}

.main-card {
	border: none;

	:deep(.el-card__header) {
		padding: 0 !important;
		border-bottom: none;
	}

	:deep(.el-card__body) {
		padding: 0px !important;
	}
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;

	.title {
		font-size: 18px;
		font-weight: 500;
		color: #172b4d;
		position: relative;
		// padding-left: 12px;

		// &::before {
		//   content: '';
		//   position: absolute;
		//   left: 0;
		//   top: 50%;

		//   width: 4px;
		//   height: 16px;

		// }
	}
}

.rules-container {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.rule-box {
	border: 1px solid #ebecf0;
	width: 65%;
	margin: 0 auto;
	overflow: hidden;

	.rule-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 24px;
		background: linear-gradient(180deg, #ffffff00 0%, #f4f5f785 100%);
		// border-bottom: 1px solid #ebeef5;

		.header-label {
			font-size: 18px;
			color: #172b4d;
		}

		.header-level {
			display: flex;
			align-items: center;
			gap: 12px;
			font-size: 18px;
		}
	}

	.rule-body {
		padding: 20px 24px;
		background-color: #fff;

		.field-label {
			font-size: 14px;
			color: #6b778c;
			margin-bottom: 12px;
		}

		.time-input {
			width: 200px;
		}

		:deep(.el-checkbox) {
			margin-right: 32px;
			&:last-child {
				margin-right: 0;
			}
		}

		:deep(.el-radio) {
			margin-right: 32px;
			&:last-child {
				margin-right: 0;
			}
		}
	}
}
</style>
