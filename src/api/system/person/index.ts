import request from "@/utils/request"
import { AxiosPromise } from "axios"
import { PersonQueryParam } from "./types"

// 获取人员列表
export function getPersonList(query: PersonQueryParam): AxiosPromise<any> {
	return request({
		url: "/base/shopPersonnel/list",
		method: "get",
		params: query
	})
}

// 获取人员详细信息
export function getPersonDetail(id: string | number): AxiosPromise<any> {
	return request({
		url: "/base/shopPersonnel/" + id,
		method: "get"
	})
}
