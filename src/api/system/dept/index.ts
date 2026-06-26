import request from "@/utils/request"
import { AxiosPromise } from "axios"
import { DeptForm, DeptQuery, DeptTreeVO, DeptVO } from "./types"

// 查询区域列表
export const listDept = (query?: DeptQuery) => {
	return request({
		url: "/base/deptTask/getBydept",
		method: "get",
		params: query
	})
}

/**
 * 通过deptIds查询区域
 * @param deptIds
 */
export const optionSelect = (deptIds: (number | string)[]): AxiosPromise<DeptVO[]> => {
	return request({
		url: "/system/dept/optionselect?deptIds=" + deptIds,
		method: "get"
	})
}

// 查询区域列表（排除节点）
export const listDeptExcludeChild = (deptId: string | number): AxiosPromise<DeptVO[]> => {
	return request({
		url: "/system/dept/list/exclude/" + deptId,
		method: "get"
	})
}

// 查询区域详细
export const getDept = (deptId: string | number): AxiosPromise<DeptVO> => {
	return request({
		url: "/system/dept/" + deptId,
		method: "get"
	})
}

// 新增区域
export const addDept = (data: DeptForm) => {
	return request({
		url: "/system/dept",
		method: "post",
		data: data
	})
}

// 修改区域
export const updateDept = (data: DeptForm) => {
	return request({
		url: "/system/dept",
		method: "put",
		data: data
	})
}

// 删除区域
export const delDept = (deptId: number | string) => {
	return request({
		url: "/system/dept/" + deptId,
		method: "delete"
	})
}
