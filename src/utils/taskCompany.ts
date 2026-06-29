import { listDept } from "@/api/system/dept"
import type { DeptQuery, DeptVO } from "@/api/system/dept/types"

export const taskCompanyParentId = 420200

export interface TaskCompanyDictOption {
	dictValue: string
	dictLabel: string
	deptId: string | number
	deptCategory?: string
}

export interface TaskCompanySelectOption {
	label: string
	value: string | number
	deptId: string | number
	deptCategory?: string
}

function getDeptList(response: any): DeptVO[] {
	if (Array.isArray(response)) return response
	return response?.data || response?.rows || []
}

function getTaskCompanyQuery(): DeptQuery {
	// 公司选项统一取指定父级部门下一级部门。
	return { pageNum: 1, pageSize: 9999, parentId: taskCompanyParentId }
}

export async function getTaskCompanyDictOptions(): Promise<TaskCompanyDictOption[]> {
	const response = await listDept(getTaskCompanyQuery())
	return getDeptList(response)
		.filter((item) => item.status !== "1")
		.map((item) => ({
			dictValue: String(item.deptId),
			dictLabel: item.deptName,
			deptId: item.deptId,
			deptCategory: item.deptCategory
		}))
}

export async function getTaskCompanySelectOptions(): Promise<TaskCompanySelectOption[]> {
	const options = await getTaskCompanyDictOptions()
	return options.map((item) => ({
		label: item.dictLabel,
		value: item.dictValue,
		deptId: item.deptId,
		deptCategory: item.deptCategory
	}))
}
