export interface PlatformInfoVO extends BaseEntity {
	id: number | string
	platformCode: string
	platformName: string
	platformIntroduce: string
	platformLoginUrl: string
	platformLogoUrl: string
	platformVersion: string
	platformSupport: string
	params?: Record<string, any>
}

export interface PlatformInfoForm {
	id: number | string | undefined
	platformCode: string
	platformName: string
	platformIntroduce: string
	platformLoginUrl: string
	platformLogoUrl: string
	platformVersion: string
	platformSupport: string
	params?: Record<string, any>
}

export interface PlatformInfoListItem {
	id: number | string
	platformCode: string
	platformName: string
	platformIntroduce: string
	platformLoginLogoUrl: string
	platformLogoUrl: string
	platformItSupport: string
	platformVersion: string
}

export interface PlatformInfoListResult {
	total: number
	rows: PlatformInfoListItem[]
}
