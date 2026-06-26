export interface SaleWarnRule {
	id?: number
	riskLevel: string
	pushScope: string[]
	handleTimeLimit: number
	recheckTimeLimit: number
	needCountySupervise: string
}

export interface WarningRulePayload {
	id?: number
	riskLevel: string
	ruleName: string
	pushProvince: string
	pushCity: string
	pushCounty: string
	pushShop: string
	handleTimeLimit: number
	recheckTimeLimit: number
	needCountySupervise: string
	ruleStatus: string
	pushScope?: string[] // 用于前端组件回显绑定
}

export const columns = [
	{ label: "预警规则名称", dataIndex: "ruleName" },
	{ label: "预警风险等级", dataIndex: "riskLevelName" },
	{ label: "推送/下发", dataIndex: "pushScope" },
	{ label: "处理时限（分钟）", dataIndex: "handleTimeLimit", slotName: "handleTimeLimit" },
	{ label: "复核时限（分钟）", dataIndex: "recheckTimeLimit", slotName: "recheckTimeLimit" },
	{ label: "是否需要督办", dataIndex: "needCountySuperviseName" },
	{ label: "操作", dataIndex: "operation", slotName: "operation", fixed: "right" }
]

const YES_NO_OPTIONS = [
	{ label: "是", value: "1" },
	{ label: "否", value: "0" }
]
const PUSH_SCOPE_OPTIONS = [
	{ label: "省", value: "省" },
	{ label: "市", value: "市" },
	{ label: "县", value: "县" },
	{ label: "零售店（点））", value: "零售店（点）" }
]
export const formConfig = ref([
	{
		type: "row",
		gutter: 16,
		cols: [
			{
				span: 24,
				items: [
					{
						type: "input",
						prop: "ruleName",
						label: "预警规则名称"
					}
				]
			},
			{
				span: 24,
				items: [
					{
						type: "select",
						prop: "riskLevel",
						label: "预警风险等级",
						options: []
					}
				]
			},
			{
				span: 24,
				items: [
					{
						type: "checkbox-group",
						prop: "pushScope",
						label: "推送/下发",
						options: PUSH_SCOPE_OPTIONS
					}
				]
			},
			{
				span: 24,
				items: [
					{
						type: "input-number",
						prop: "handleTimeLimit",
						label: "处理时限（分钟）"
					}
				]
			},
			{
				span: 24,
				items: [
					{
						type: "input-number",
						prop: "recheckTimeLimit",
						label: "复核时限（分钟）"
					}
				]
			},
			{
				span: 24,
				items: [
					{
						type: "radio-group",
						prop: "needCountySupervise",
						label: "是否需要督办",
						options: YES_NO_OPTIONS
					}
				]
			},
			{
				span: 24,
				items: [
					{
						type: "switch",
						prop: "ruleStatus",
						label: "是否启用",
						activeValue: "0",
						inactiveValue: "1"
					}
				]
			}
		]
	}
])
export const formRules = {
	ruleName: [{ required: true, message: "请输入预警规则名称", trigger: ["change"] }],
	riskLevel: [{ required: true, message: "请选择预警风险等级", trigger: ["change"] }],
	pushScope: [{ required: true, message: "请选择推送/下发", trigger: ["change"] }],
	handleTimeLimit: [{ required: true, message: "请输入处理时限（分钟）", trigger: ["change"] }],
	recheckTimeLimit: [{ required: true, message: "请输入复核时限（分钟）", trigger: ["change"] }],
	needCountySupervise: [{ required: true, message: "请选择是否需要督办", trigger: ["change"] }]
}
