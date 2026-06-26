import { ref } from "vue"

export interface MessageRule {
	id?: number
	msgType: string
	msgTypeName: string
	msgTypeNames: string
	routerPath: string
	msgTemplate: string
	statusName: string
	remark: string
	status?: string
	sort?: number
}

export const columns = [
	{ label: "消息类型", dataIndex: "msgTypeNames" },
	{ label: "消息名称", dataIndex: "msgTypeName" },
	{ label: "消息模板", dataIndex: "msgTemplate" },
	{ label: "跳转路由", dataIndex: "routerPath" },
	{ label: "启用状态", dataIndex: "statusName" },
	{ label: "备注", dataIndex: "remark" },
	{ label: "操作", dataIndex: "operation", slotName: "operation", fixed: "right" }
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
						type: "select",
						prop: "msgType",
						label: "消息类型",
						options: [] // 从字典获取
					}
				]
			},
			{
				span: 24,
				items: [
					{
						type: "input",
						prop: "msgTypeName",
						label: "消息名称",
						placeholder: "请输入消息名称"
					}
				]
			},
			{
				span: 24,
				items: [
					{
						type: "textarea",
						prop: "msgTemplate",
						label: "消息模板",
						placeholder: "请输入消息模板",
						elementAttrs: {
							rows: 6
						}
					}
				]
			},
			{
				span: 24,
				items: [
					{
						type: "input",
						prop: "routerPath",
						label: "跳转路由",
						placeholder: "请输入跳转路由地址"
					}
				]
			},

			{
				span: 24,
				items: [
					{
						type: "switch",
						prop: "status",
						label: "启用状态",
						activeValue: "0",
						inactiveValue: "1"
					}
				]
			},
			{
				span: 24,
				items: [
					{
						type: "textarea",
						prop: "remark",
						label: "备注",
						placeholder: "请输入备注说明"
					}
				]
			}
		]
	}
])

export const formRules = {
	msgType: [{ required: true, message: "请选择消息类型", trigger: "change" }],
	msgTypeName: [{ required: true, message: "请输入消息名称", trigger: "change" }],
	msgTemplate: [{ required: true, message: "请输入消息模板", trigger: "blur" }],
	routerPath: [{ required: true, message: "请输入跳转路由地址", trigger: "blur" }]
}
