export interface PersonQueryParam {
	personType: string | number // 1: 主要负责人/法人, 2: 安全管理, 3: 特种作业
	creditCodeOrUnitName?: string
	nameOrContactWayOrIdCard?: string
	pageSize?: number
	pageNum?: number
}
