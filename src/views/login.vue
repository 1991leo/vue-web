<template>
	<div class="login-wrapper">
		<div class="login-left">
			<div class="logo-container">
				<img :src="LogoImg" alt="logo" class="logo-img" />
			</div>
		</div>

		<div class="login-right">
			<div class="login-form-container">
				<div class="form-header">
					<h2 class="title">欢迎登录</h2>
					<p class="subtitle">统一身份认证中心</p>
				</div>

				<el-form ref="loginRef" :model="loginForm" :rules="loginRules" size="large" class="login-form">
					<el-form-item prop="username" class="custom-form-item">
						<el-input v-model="loginForm.username" :placeholder="t('login.username')" auto-complete="off">
							<template #prefix>
								<img :src="UserIcon" class="input-icon" />
							</template>
						</el-input>
					</el-form-item>

					<el-form-item prop="password" class="custom-form-item">
						<el-input
							v-model="loginForm.password"
							:type="passwordVisible ? 'text' : 'password'"
							:placeholder="t('login.password')"
							auto-complete="off"
							@keyup.enter="handleLogin"
						>
							<template #prefix>
								<img :src="PwdIcon" class="input-icon" />
							</template>
							<template #suffix>
								<img
									:src="passwordVisible ? PwdViewIcon : PwdCloseIcon"
									class="input-icon pwd-icon"
									@click="passwordVisible = !passwordVisible"
								/>
							</template>
						</el-input>
					</el-form-item>

					<el-form-item prop="code" v-if="captchaEnabled" class="custom-form-item code-item">
						<el-input
							v-model="loginForm.code"
							:placeholder="t('login.code')"
							auto-complete="off"
							@keyup.enter="handleLogin"
						>
							<template #prefix>
								<img :src="CodeIcon" class="input-icon" />
							</template>
						</el-input>
						<div class="code-img-wrapper">
							<img :src="codeUrl" class="code-img" @click="getCode" />
						</div>
					</el-form-item>

					<div class="form-actions">
						<!-- <span class="action-link" @click="goRegister">用户注册</span> -->
						<span class="action-link" @click="goForgetPwd">忘记密码？</span>
					</div>

					<el-button :loading="loading" type="primary" class="login-btn" @click.prevent="handleLogin">
						<span v-if="!loading">{{ t("login.login") }}</span>
						<span v-else>{{ t("login.logging") }}</span>
					</el-button>
				</el-form>
			</div>

			<div class="footer-copy">Copyright © 2026 湖北大数据集团有限公司 All Rights Reserved. v1.0</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useRouter, type RouteLocationNormalizedLoaded } from "vue-router"
import { getCodeImg } from "@/api/login"
import { useUserStore } from "@/store/modules/user"
import { LoginData } from "@/api/types"
import { to } from "await-to-js"
import { ElMessage, ElForm, FormRules } from "element-plus"
import { useI18n } from "vue-i18n"

// 导入图片资源
import LogoImg from "@/assets/logo.png"
import UserIcon from "@/assets/images/input_username.png"
import PwdIcon from "@/assets/images/input_passwd.png"
import CodeIcon from "@/assets/images/input_verify_code.png"
import PwdCloseIcon from "@/assets/images/pwd_close.png"
import PwdViewIcon from "@/assets/images/pwd_view.png"

const userStore = useUserStore()
const router = useRouter()
const { t } = useI18n()

// 表单及状态
const loginRef = ref<InstanceType<typeof ElForm>>()

const loginForm = ref<LoginData>({
	username: "",
	password: "",
	rememberMe: false,
	code: "",
	uuid: "",
	tenantId: "000000"
} as LoginData)

const loginRules: FormRules = {
	username: [{ required: true, trigger: "blur", message: t("login.rule.username.required") }],
	password: [{ required: true, trigger: "blur", message: t("login.rule.password.required") }],
	code: [{ required: true, trigger: "change", message: t("login.rule.code.required") }]
}

const codeUrl = ref("")
const loading = ref(false)
const captchaEnabled = ref(false)
const passwordVisible = ref(false)
const redirect = ref<string>("/")

watch(
	() => router.currentRoute.value,
	(newRoute: RouteLocationNormalizedLoaded) => {
		const routeRedirect = newRoute.query?.redirect
		redirect.value = typeof routeRedirect === "string" ? decodeURIComponent(routeRedirect) : "/"
	},
	{ immediate: true }
)

// 获取验证码
const getCode = async () => {
	const res = await getCodeImg()
	const { data } = res
	captchaEnabled.value = data.captchaEnabled === undefined ? true : data.captchaEnabled
	if (captchaEnabled.value) {
		loginForm.value.code = ""
		codeUrl.value = "data:image/gif;base64," + data.img
		loginForm.value.uuid = data.uuid
	}
}

// 处理密码登录
const handleLogin = () => {
	loginRef.value?.validate(async (valid: boolean) => {
		if (valid) {
			loading.value = true
			const [err] = await to(userStore.login(loginForm.value))
			if (!err) {
				const redirectUrl = redirect.value && redirect.value !== "/" ? redirect.value : "/"
				await router.push(redirectUrl)
				loading.value = false
			} else {
				loading.value = false
				if (captchaEnabled.value) {
					await getCode()
				}
			}
		}
	})
}

// 页面跳转和操作
// const goRegister = () => {
//   router.push('/register');
// };

const goForgetPwd = () => {
	ElMessage.info("请联系系统管理员重置密码！")
}

onMounted(() => {
	getCode()
})
</script>

<style lang="scss" scoped>
.login-wrapper {
	display: flex;
	height: 100vh;
	width: 100vw;
	overflow: hidden;
	background: url("@/assets/background.png") center center / cover no-repeat;
}

.login-left {
	width: 52%;
	position: relative;
	background: transparent;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;

	.logo-container {
		position: absolute;
		top: 2.75rem;
		left: 4.25rem;

		.logo-img {
			width: 23rem;
			height: auto;
			object-fit: contain;
		}
	}

	.carousel-container {
		display: none;
	}

	.banner-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		text-align: center;
		color: #fff;

		.banner-title {
			font-size: 1.25rem;
			font-weight: 600;
			margin: 0 0 1rem;
		}

		.banner-desc {
			font-size: 0.875rem;
			color: #8189a0;
			margin: 0 0 2.5rem;
			line-height: 1.5;
		}

		.banner-img {
			max-width: 80%;
			max-height: 60%;
			object-fit: contain;
		}
	}
}

.login-right {
	width: 48%;
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: transparent;

	.login-form-container {
		width: 24.375rem;
		max-width: 90%;
		margin: -3.25rem 12.5rem 0 0;
	}

	.form-header {
		margin-bottom: 2.5rem;
		border: none;

		.title {
			font-size: 1.5rem;
			line-height: 2rem;
			color: #1e3354;
			font-weight: 700;
			margin: 0 0 1rem;
		}

		.subtitle {
			font-size: 1rem;
			line-height: 1.375rem;
			color: #8b95a7;
			margin: 0;
			font-weight: 400;
		}
	}

	.login-form {
		margin-top: 0;
	}

	.custom-form-item {
		margin-bottom: 1.5rem;

		:deep(.el-input__wrapper) {
			background-color: #fff;
			box-shadow: 0 0 0 0.0625rem #e6e9ef inset;
			padding: 0 0.875rem;
			height: 2.75rem;
			border-radius: 0.125rem;

			&:hover,
			&.is-focus {
				box-shadow: 0 0 0 0.0625rem #3b78f2 inset;
			}
		}

		:deep(.el-input__inner) {
			height: 2.75rem;
			font-size: 0.875rem;
			color: #172b4d;

			&::placeholder {
				color: #9aa6ba;
			}

			/* 修复浏览器记住密码自动填充时自带的浅蓝色背景 */
			&:-webkit-autofill,
			&:-webkit-autofill:hover,
			&:-webkit-autofill:focus,
			&:-webkit-autofill:active {
				// -webkit-box-shadow: 0 0 0 1000px #fff inset !important;
				// -webkit-text-fill-color: #172b4d !important;
				transition: background-color 5000s ease-in-out 0s;
			}
		}
	}

	.input-icon {
		width: 1.125rem;
		height: 1.125rem;
		object-fit: contain;
	}

	.pwd-icon {
		cursor: pointer;
	}

	.code-item {
		:deep(.el-form-item__content) {
			display: flex;
			flex-wrap: nowrap;
			gap: 0.75rem;
		}

		.el-input {
			flex: 1;
		}

		.code-img-wrapper {
			width: 5.5rem;
			height: 2.75rem;
			border-radius: 0.125rem;
			overflow: hidden;
			border: 0;
			flex-shrink: 0;

			.code-img {
				width: 100%;
				height: 100%;
				object-fit: fill;
				cursor: pointer;
			}
		}
	}

	.form-actions {
		display: flex;
		justify-content: center;
		margin-top: -0.75rem;
		margin-bottom: 5.25rem;

		.action-link {
			font-size: 0.875rem;
			line-height: 1.25rem;
			color: #9aa6ba;
			cursor: pointer;
			transition: color 0.3s;

			&:hover {
				color: #4c9aff;
			}
		}
	}

	.login-btn {
		width: 100%;
		height: 2.75rem;
		font-size: 0.875rem;
		font-weight: 400;
		border-radius: 0.125rem;
		background-color: #3478f6;
		border-color: #3478f6;

		&:hover {
			background-color: #266eff;
			border-color: #266eff;
		}
	}

	.footer-copy {
		position: fixed;
		bottom: 1.375rem;
		left: 0;
		width: 100vw;
		text-align: center;
		font-size: 0.875rem;
		line-height: 1.25rem;
		color: #8b95a7;
	}
}

@media (max-width: 1200px) {
	.login-left {
		width: 48%;
	}
	.login-right {
		width: 52%;
	}

	.login-right .login-form-container {
		margin-right: 3rem;
	}

	.banner-content {
		.banner-title {
			font-size: 1.125rem;
		}
		.banner-desc {
			font-size: 0.75rem;
		}
	}
}

@media (max-width: 992px) {
	.login-wrapper {
		flex-direction: row;
		background-position: 32% center;
	}
	.login-left {
		width: 36%;

		.logo-container {
			top: 1.75rem;
			left: 1.5rem;

			.logo-img {
				width: 17rem;
			}
		}
	}
	.login-right {
		width: 64%;
		height: 100vh;
	}
	.login-right .login-form-container {
		width: 22.5rem;
		margin: 0 2rem 0 0;
	}
}

@media (max-width: 768px) {
	.login-wrapper {
		background-position: 38% center;
	}

	.login-left {
		position: absolute;
		inset: 0 auto auto 0;
		width: 100%;
		height: 5.5rem;
		z-index: 1;
	}

	.login-right {
		width: 100%;
	}

	.login-right .login-form-container {
		width: 90%;
		margin: 2.5rem auto 0;
		padding: 0 1rem;
		box-sizing: border-box;
	}

	.form-header .title {
		font-size: 1.5rem;
	}

	.form-header .subtitle {
		font-size: 0.875rem;
	}
}

@media (max-height: 600px) {
	.logo-container {
		top: 1rem;
		left: 1rem;
	}

	.carousel-container {
		margin-top: 1rem;
	}

	:deep(.el-carousel__container) {
		height: 20rem !important;
	}

	.form-header {
		margin-bottom: 1rem;
	}

	.login-form {
		margin-top: 1rem;
	}

	.custom-form-item {
		margin-bottom: 1rem;
	}

	.form-actions {
		margin-bottom: 1rem;
	}
}
</style>
