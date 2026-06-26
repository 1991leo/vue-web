<template>
	<div class="profile-page page-layout-fill">
		<section class="profile-hero">
			<div class="profile-hero__top">
				<div class="profile-hero__avatar">
					<user-avatar />
				</div>
				<div class="profile-hero__identity">
					<span class="profile-hero__name">{{ state.user.userName || "-" }}</span>
					<span class="profile-hero__separator">/</span>
					<span>{{ state.roleGroup || "-" }}</span>
				</div>
				<div class="profile-hero__date">{{ createDate }}</div>
			</div>

			<div class="profile-hero__meta">
				<div class="profile-meta-item">
					<span>手机号码</span>
					<div>{{ state.user.phonenumber || "-" }}</div>
				</div>
				<div class="profile-meta-item">
					<span>用户邮箱</span>
					<div>{{ state.user.email || "-" }}</div>
				</div>
				<div class="profile-meta-item">
					<span>所属区域</span>
					<div>{{ deptText }}</div>
				</div>
			</div>

			<el-tabs v-model="activeTab" class="profile-tabs">
				<el-tab-pane label="基本信息" name="userinfo" />
				<el-tab-pane label="修改密码" name="resetPwd" />
				<el-tab-pane label="在线设备" name="onlineDevice" />
			</el-tabs>
		</section>

		<section class="profile-content">
			<user-info v-if="activeTab === 'userinfo'" :user="userForm" />
			<reset-pwd v-if="activeTab === 'resetPwd'" />
			<online-device v-if="activeTab === 'onlineDevice'" :devices="state.devices" @refresh="getOnlines" />
		</section>
	</div>
</template>

<script setup name="Profile" lang="ts">
import UserAvatar from "./userAvatar.vue"
import UserInfo from "./userInfo.vue"
import ResetPwd from "./resetPwd.vue"
import OnlineDevice from "./onlineDevice.vue"
import { getAuthList } from "@/api/system/social/auth"
import { getUserProfile } from "@/api/system/user"
import { getOnline } from "@/api/monitor/online"
import type { UserVO } from "@/api/system/user/types"
import type { OnlineVO } from "@/api/monitor/online/types"

const activeTab = ref("userinfo")
interface State {
	user: Partial<UserVO>
	roleGroup: string
	postGroup: string
	auths: unknown[]
	devices: OnlineVO[]
}
const state = ref<State>({
	user: {},
	roleGroup: "",
	postGroup: "",
	auths: [],
	devices: []
})

const userForm = ref<Partial<UserVO>>({})

const createDate = computed(() => {
	return state.value.user.createTime ? String(state.value.user.createTime).slice(0, 10) : "-"
})

const deptText = computed(() => {
	const deptName = state.value.user.deptName
	const postGroup = state.value.postGroup
	return [deptName, postGroup].filter(Boolean).join(" / ") || "-"
})

const getUser = async () => {
	const res = await getUserProfile()
	const user = res.data?.user ?? {}
	state.value.user = user
	userForm.value = { ...user }
	state.value.roleGroup = res.data?.roleGroup ?? ""
	state.value.postGroup = res.data?.postGroup ?? ""
}

const getAuths = async () => {
	const res = await getAuthList()
	state.value.auths = res.data ?? []
}
const getOnlines = async () => {
	const res = await getOnline()
	state.value.devices = res.rows ?? []
}

onMounted(() => {
	getUser()
	getAuths()
	getOnlines()
})
</script>

<style lang="scss" scoped>
.profile-page {
	align-items: center;
	gap: 16px;
	box-sizing: border-box;
	min-height: calc(100vh - 148px);
	overflow: hidden;
}

.profile-hero,
.profile-content {
	width: min(100%, 940px);
	border-radius: 20px;
	background: #ffffff;
}

.profile-hero {
	position: relative;
	box-sizing: border-box;
	height: 229px;
	overflow: visible;
	border: 4px solid #ffffff;
	background: linear-gradient(180deg, #f0f9f6 0%, #e3f6e9 100%);
}

.profile-hero__top {
	position: relative;
	z-index: 2;
	display: flex;
	box-sizing: border-box;
	align-items: flex-end;
	height: 102px;
	padding: 0 62px 12px 158px;
	background: transparent;
}

.profile-hero__avatar {
	position: absolute;
	top: 50px;
	left: 56px;
	z-index: 3;
}

.profile-hero__identity {
	display: flex;
	align-items: center;
	gap: 10px;
	color: var(--el-color-primary);
	font-size: 18px;
	font-weight: 700;
}

.profile-hero__name {
	max-width: 260px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.profile-hero__separator {
	color: var(--el-color-primary);
}

.profile-hero__date {
	margin-left: auto;
	color: var(--el-color-primary);
	font-size: 15px;
}

.profile-hero__meta {
	position: absolute;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 1;
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	align-items: start;
	height: 126px;
	gap: 20px;
	padding: 20px 62px 0 158px;
	border-radius: 20px 20px 0 0;
	background: #ffffff;
}

.profile-meta-item {
	display: flex;
	align-items: center;
	min-width: 0;
	color: #6b778c;
	font-size: 14px;

	span {
		flex: 0 0 auto;
		margin-right: 14px;
	}

	strong {
		min-width: 0;
		overflow: hidden;
		color: #172b4d;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}

.profile-tabs {
	position: absolute;
	bottom: 0;
	left: 58px;
	z-index: 2;
	padding: 0;

	:deep(.el-tabs__header) {
		margin: 0;
	}

	:deep(.el-tabs__nav-wrap::after) {
		display: none;
	}

	:deep(.el-tabs__item) {
		width: 98px;
		height: 58px;
		padding: 0 17px;
		color: #263a5d;
		font-size: 16px;
		font-weight: 600;
		justify-content: center;
	}

	:deep(.el-tabs__item + .el-tabs__item) {
		margin-left: 42px;
	}

	:deep(.el-tabs__item.is-active) {
		color: var(--el-color-primary);
	}

	:deep(.el-tabs__active-bar) {
		height: 2px;
		background-color: #00b46e;
	}

	:deep(.el-tabs__content) {
		display: none;
	}
}

.profile-content {
	flex: 1;
	box-sizing: border-box;
	min-height: 0;
	overflow: hidden;
	padding: 44px 70px 20px;
}

@media (max-width: 1200px) {
	.profile-page {
		align-items: stretch;
	}

	.profile-hero,
	.profile-content {
		width: 100%;
	}
}

@media (max-width: 768px) {
	.profile-page {
		padding: 16px 12px 0;
	}

	.profile-hero__top {
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
		height: 110px;
		padding: 28px 24px 18px 126px;
	}

	.profile-hero__avatar {
		top: 24px;
		left: 24px;
	}

	.profile-hero__date {
		margin-left: 0;
	}

	.profile-hero__meta {
		grid-template-columns: 1fr;
		height: auto;
		padding: 24px;
	}

	.profile-tabs {
		left: 24px;
	}

	.profile-content {
		padding-right: 24px;
		padding-left: 24px;
	}
}
</style>
