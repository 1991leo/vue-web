<template>
	<el-form ref="pwdRef" class="profile-form" :model="user" :rules="rules" label-position="top">
		<h3 class="profile-form__title">修改密码</h3>
		<div class="profile-form__grid">
			<el-form-item label="旧密码" prop="oldPassword">
				<el-input v-model="user.oldPassword" placeholder="请输入旧密码" type="password" show-password />
			</el-form-item>
			<el-form-item label="新密码" prop="newPassword">
				<el-input v-model="user.newPassword" placeholder="请输入新密码" type="password" show-password />
			</el-form-item>
			<el-form-item label="确认密码" prop="confirmPassword">
				<el-input v-model="user.confirmPassword" placeholder="请确认新密码" type="password" show-password />
			</el-form-item>
		</div>
		<div class="profile-form__actions">
			<el-button @click="close">取消</el-button>
			<el-button type="primary" @click="submit">提交</el-button>
		</div>
	</el-form>
</template>

<script setup lang="ts">
import { updateUserPwd } from "@/api/system/user"
import type { ResetPwdForm } from "@/api/system/user/types"

const { proxy } = getCurrentInstance() as ComponentInternalInstance
const pwdRef = ref<ElFormInstance>()
const user = ref<ResetPwdForm>({
	oldPassword: "",
	newPassword: "",
	confirmPassword: ""
})

const equalToPassword = (rule: any, value: string, callback: any) => {
	if (user.value.newPassword !== value) {
		callback(new Error("两次输入的密码不一致"))
	} else {
		callback()
	}
}
const rules = ref({
	oldPassword: [{ required: true, message: "旧密码不能为空", trigger: "blur" }],
	newPassword: [
		{ required: true, message: "新密码不能为空", trigger: "blur" },
		{
			min: 6,
			max: 20,
			message: "长度在 6 到 20 个字符",
			trigger: "blur"
		},
		{ pattern: /^[^<>"'|\\]+$/, message: "不能包含非法字符：< > \" ' \\ |", trigger: "blur" }
	],
	confirmPassword: [
		{ required: true, message: "确认密码不能为空", trigger: "blur" },
		{
			required: true,
			validator: equalToPassword,
			trigger: "blur"
		}
	]
})

/** 提交按钮 */
const submit = () => {
	pwdRef.value?.validate(async (valid: boolean) => {
		if (valid) {
			await updateUserPwd(user.value.oldPassword, user.value.newPassword)
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
