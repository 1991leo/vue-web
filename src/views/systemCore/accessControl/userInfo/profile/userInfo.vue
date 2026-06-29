<template>
	<el-form ref="userRef" class="profile-form" :model="userForm" :rules="rules" label-position="top">
		<h3 class="profile-form__title">基本资料</h3>
		<div class="profile-form__grid">
			<el-form-item label="用户昵称" prop="nickName">
				<el-input v-model="userForm.nickName" maxlength="30" />
			</el-form-item>
			<el-form-item label="手机号码" prop="phonenumber">
				<el-input v-model="userForm.phonenumber" maxlength="11" />
			</el-form-item>
			<el-form-item label="邮箱" prop="email">
				<el-input v-model="userForm.email" maxlength="50" />
			</el-form-item>
			<el-form-item label="性别">
				<el-radio-group v-model="userForm.sex">
					<el-radio value="0">男</el-radio>
					<el-radio value="1">女</el-radio>
				</el-radio-group>
			</el-form-item>
		</div>
		<div class="profile-form__actions">
			<el-button @click="close">取消</el-button>
			<el-button type="primary" @click="submit">提交</el-button>
		</div>
	</el-form>
</template>

<script setup lang="ts">
import { updateUserProfile } from "@/api/system/user"
import type { UserForm, UserVO } from "@/api/system/user/types"

const props = defineProps<{ user: Partial<UserVO> }>()
const userForm = computed<Partial<UserVO>>(() => props.user)
const { proxy } = getCurrentInstance() as ComponentInternalInstance
const userRef = ref<ElFormInstance>()
const rule: ElFormRules = {
	nickName: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
	email: [
		{ required: true, message: "邮箱地址不能为空", trigger: "blur" },
		{
			type: "email",
			message: "请输入正确的邮箱地址",
			trigger: ["blur", "change"]
		}
	],
	phonenumber: [
		{
			required: true,
			message: "手机号码不能为空",
			trigger: "blur"
		},
		{ pattern: /^1[3456789][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }
	]
}
const rules = ref<ElFormRules>(rule)

/** 提交按钮 */
const submit = () => {
	userRef.value?.validate(async (valid: boolean) => {
		if (valid) {
			// 个人资料接口只消费基础字段，避免把缺失 password 的 UserVO 直接传给完整用户表单。
			const submitData: UserForm = {
				userId: props.user.userId as string,
				deptId: props.user.deptId,
				userName: props.user.userName || "",
				nickName: props.user.nickName,
				password: "",
				phonenumber: props.user.phonenumber,
				email: props.user.email,
				sex: props.user.sex,
				status: props.user.status || "0",
				remark: props.user.remark,
				postIds: [],
				roleIds: []
			}
			await updateUserProfile(submitData)
			proxy?.$modal.msgSuccess("修改成功")
		}
	})
}
/** 关闭按钮 */
const close = () => {
	proxy?.$tab.closePage()
}
</script>

<style lang="scss" scoped>
.profile-form {
	display: flex;
	flex-direction: column;
	min-height: 496px;
}

.profile-form__title {
	margin: 0 0 24px;
	color: #263a5d;
	font-size: 18px;
	font-weight: 700;
}

.profile-form__grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	column-gap: 48px;
	row-gap: 10px;
}

.profile-form__actions {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	margin-top: auto;
	padding-top: 32px;
}

:deep(.el-form-item__label) {
	color: #263a5d;
	font-size: 14px;
	font-weight: 500;
}

:deep(.el-input__wrapper) {
	min-height: 34px;
	border-radius: 6px;
	box-shadow: 0 0 0 1px #dfe5ef inset;
}

:deep(.el-radio-group) {
	min-height: 34px;
}

:deep(.el-button) {
	min-width: 76px;
	border-radius: 8px;
}

@media (max-width: 768px) {
	.profile-form__grid {
		grid-template-columns: 1fr;
	}
}
</style>
