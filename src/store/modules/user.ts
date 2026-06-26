import { to } from "await-to-js"
import { getToken, removeToken, setToken } from "@/utils/auth"
import {
	login as loginApi,
	logout as logoutApi,
	getInfo as getUserInfo,
	oauthLogin as oauthLoginApi
} from "@/api/login"
import { LoginData } from "@/api/types"
import { defineStore } from "pinia"
import { ref } from "vue"

export const useUserStore = defineStore("user", () => {
	const token = ref(getToken())
	const name = ref("")
	const nickname = ref("")
	const userId = ref<string | number>("")
	const deptId = ref<string | number>("")
	const deptName = ref<string>("")
	const tenantId = ref<string>("")
	const avatar = ref("")
	const roles = ref<Array<string>>([]) // 用户角色编码集合 → 判断路由权限
	const permissions = ref<Array<string>>([]) // 用户权限编码集合 → 判断按钮权限

	/**
	 * 登录
	 * @param userInfo
	 * @returns
	 */
	const login = async (userInfo: LoginData): Promise<void> => {
		const [err, res] = await to(loginApi(userInfo))
		if (res) {
			const data = res.data
			setToken(data.access_token)
			token.value = data.access_token
			return Promise.resolve()
		}
		return Promise.reject(err)
	}

	const oauthLogin = async (ticket: string): Promise<void> => {
		const [err, res] = await to(oauthLoginApi(ticket))
		if (res) {
			const data = res.data
			setToken(data.access_token)
			token.value = data.access_token
			return Promise.resolve()
		}
		return Promise.reject(err)
	}

	// 获取用户信息
	const getInfo = async (): Promise<void> => {
		const [err, res] = await to(getUserInfo())
		if (res) {
			const data = res.data
			const user = data.user

			if (data.roles && data.roles.length > 0) {
				// 验证返回的roles是否是一个非空数组
				roles.value = data.roles
				permissions.value = data.permissions
			} else {
				roles.value = ["ROLE_DEFAULT"]
			}
			name.value = user.userName
			nickname.value = user.nickName
			// 保留原始头像值（无头像时为空），默认占位图由各视图自行决定
			avatar.value = user.avatar ?? ""
			userId.value = user.userId
			// 当前登录用户所属区域ID，供业务页面按区域过滤数据
			deptId.value = user.deptId
			deptName.value = user.deptName
			tenantId.value = user.tenantId
			return Promise.resolve()
		}
		return Promise.reject(err)
	}

	// 注销
	const logout = async (): Promise<void> => {
		await logoutApi()
		token.value = ""
		roles.value = []
		permissions.value = []
		deptId.value = ""
		deptName.value = ""
		removeToken()
	}

	const setAvatar = (value: string) => {
		avatar.value = value
	}

	return {
		userId,
		deptId,
		deptName,
		tenantId,
		token,
		nickname,
		avatar,
		roles,
		permissions,
		login,
		oauthLogin,
		getInfo,
		logout,
		setAvatar
	}
})
