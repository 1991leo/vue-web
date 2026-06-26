/**
 * 区域查询参数
 */
export interface DeptQuery extends PageQuery {
	parentId?: number | string
	deptName?: string
	deptCategory?: string
	status?: number
}

/**
 * 区域类型
 */
export interface DeptVO extends BaseEntity {
	id: number | string
	parentName: string
	parentId: number | string
	children: DeptVO[]
	deptId: number | string
	deptName: string
	deptCategory: string
	orderNum: number
	leader: string
	phone: string
	email: string
	status: string
	delFlag: string
	ancestors: string
	menuId: string | number
}

/**
 * 区域类型
 */
export interface DeptTreeVO extends BaseEntity {
	id: number | string
	label: string
	parentId: number | string
	weight: number
	children: DeptTreeVO[]
	disabled: boolean
}

/**
 * 区域表单类型
 */
export interface DeptForm {
	parentName?: string
	parentId?: number | string
	children?: DeptForm[]
	deptId?: number | string
	deptName?: string
	deptCategory?: string
	orderNum?: number
	leader?: string
	phone?: string
	email?: string
	status?: string
	delFlag?: string
	ancestors?: string
}
