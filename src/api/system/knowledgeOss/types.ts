export interface KnowledgeOssVO extends BaseEntity {
	id?: number | string
	tenantId?: string
	fileTitle?: string
	fileType?: string
	fileName?: string
	originalName?: string
	fileSuffix?: string
	url?: string
	ossId?: number | string
	ext1?: string
	service?: string
}

export interface KnowledgeOssForm {
	id?: number | string
	tenantId?: string
	fileTitle: string
	fileType?: string
	fileName?: string
	originalName?: string
	fileSuffix?: string
	url?: string
	ossId?: number | string
	ext1?: string
	service?: string
}

export interface KnowledgeOssQuery extends Partial<PageQuery> {
	id?: number | string
	tenantId?: string
	fileTitle?: string
	fileType?: string
	fileName?: string
	originalName?: string
	fileSuffix?: string
	url?: string
	ext1?: string
	service?: string
	createBy?: number | string
	createDept?: number | string
	createTime?: string
	updateBy?: number | string
	updateTime?: string
	orderByColumn?: string
	isAsc?: string
	params?: Record<string, any>
}

export interface KnowledgeUploadResult {
	url: string
	urlWx?: string
	fileName: string
	ossId: number | string
}
