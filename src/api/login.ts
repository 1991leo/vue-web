import request from "@/utils/request"
import { AxiosPromise } from "axios"
import { LoginData, LoginResult, VerifyCodeResult, TenantInfo } from "./types"
import { UserInfo } from "@/api/system/user/types"

// pc端固定客户端授权id
const clientId = import.meta.env.VITE_APP_CLIENT_ID

/**
 * @param data {LoginData}
 * @returns
 */
export function login(data: LoginData): AxiosPromise<LoginResult> {
	const params = {
		...data,
		clientId: data.clientId || clientId,
		grantType: data.grantType || "password"
	}
	return request({
		url: "/auth/login",
		headers: {
			isToken: false,
			isEncrypt: true,
			repeatSubmit: false
		},
		method: "post",
		data: params
	})
}

// OA 单点登录 ticket 为一次性凭证，必须通过 query 传给后端校验。
export function oauthLogin(ticket: string): AxiosPromise<LoginResult> {
	return request({
		url: "/oa/sso/login",
		headers: {
			isToken: false,
			repeatSubmit: false
		},
		method: "post",
		params: { ticket }
	})
}

// 注册方法
export function register(data: any) {
	const params = {
		...data,
		clientId: clientId,
		grantType: "password"
	}
	return request({
		url: "/auth/register",
		headers: {
			isToken: false,
			isEncrypt: true,
			repeatSubmit: false
		},
		method: "post",
		data: params
	})
}

/**
 * 注销
 */
export function logout() {
	if (import.meta.env.VITE_APP_SSE === "true") {
		request({
			url: "/resource/sse/close",
			method: "get"
		})
	}
	return request({
		url: "/auth/logout",
		method: "post"
	})
}

/**
 * 获取验证码
 */
export function getCodeImg(): AxiosPromise<VerifyCodeResult> {
	return request({
		url: "/auth/code",
		headers: {
			isToken: false
		},
		method: "get",
		timeout: 20000
	})
}

/**
 * 第三方登录
 */
export function callback(data: LoginData): AxiosPromise<any> {
	const LoginData = {
		...data,
		clientId: clientId,
		grantType: "social"
	}
	return request({
		url: "/auth/social/callback",
		method: "post",
		data: LoginData
	})
}

// 获取用户详细信息
export function getInfo(): AxiosPromise<UserInfo> {
	return request({
		url: "/system/user/getInfo",
		method: "get"
	})
}

// 获取租户列表
export function getTenantList(isToken: boolean): AxiosPromise<TenantInfo> {
	return request({
		url: "/auth/tenant/list",
		headers: {
			isToken: isToken
		},
		method: "get"
	})
}
