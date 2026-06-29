<template>
	<div class="online-device">
		<el-empty v-if="!devices.length" description="暂无在线设备" />
		<div v-else class="online-device__list">
			<article v-for="device in devices" :key="device.tokenId" class="online-device-card">
				<div class="online-device-card__header">
					<div class="online-device-card__title">
						{{ getDeviceTypeLabel(device.deviceType) }} / {{ device.ipaddr || "-" }}
					</div>
					<span class="online-device-card__time">{{ formatTime(device.loginTime) }}</span>
					<el-tooltip content="删除设备" placement="top">
						<el-button
							class="online-device-card__delete"
							link
							type="danger"
							icon="Delete"
							@click="handleDelOnline(device)"
						/>
					</el-tooltip>
				</div>

				<div class="online-device-card__meta">
					<span>登录地点</span>
					<div>{{ device.loginLocation || "-" }}</div>
					<span>操作系统</span>
					<div>{{ device.os || "-" }}</div>
					<span>浏览器</span>
					<div>{{ device.browser || "-" }}</div>
				</div>
			</article>
		</div>
	</div>
</template>

<script setup name="Online" lang="ts">
import { delOnline } from "@/api/monitor/online"
import { parseTime, selectDictLabel } from "@/utils/ruoyi"
import type { OnlineVO } from "@/api/monitor/online/types"

const { proxy } = getCurrentInstance() as ComponentInternalInstance
const { sys_device_type } = toRefs(
	(proxy?.useDict("sys_device_type") ?? { sys_device_type: [] }) as {
		sys_device_type: DictDataOption[]
	}
)

type OnlineDeviceVO = OnlineVO & {
	deviceType?: string
}

const props = withDefaults(defineProps<{ devices: OnlineDeviceVO[] }>(), {
	devices: () => []
})
const emit = defineEmits<{
	(e: "refresh"): void
}>()
const devices = computed(() => props.devices)

const getDeviceTypeLabel = (deviceType?: string) => {
	return deviceType ? selectDictLabel(sys_device_type.value, deviceType) || deviceType : "PC"
}

const formatTime = (loginTime?: number) => {
	return loginTime ? parseTime(loginTime) : "-"
}

const handleDelOnline = (row: OnlineDeviceVO) => {
	ElMessageBox.confirm("删除设备后，在该设备登录需要重新进行验证")
		.then(() => {
			return delOnline(row.tokenId)
		})
		.then((res: { code: number; msg: string }) => {
			if (res.code === 200) {
				proxy?.$modal.msgSuccess("删除成功")
				emit("refresh")
			} else {
				proxy?.$modal.msgError(res.msg)
			}
		})
		.catch(() => {})
}
</script>

<style lang="scss" scoped>
.online-device {
	display: flex;
	height: 100%;
	min-height: 0;
	overflow: hidden;
}

.online-device__list {
	display: flex;
	flex-direction: column;
	flex: 1;
	gap: 18px;
	min-height: 0;
	overflow-y: auto;
	padding-right: 8px;
	padding-bottom: 24px;
}

.online-device-card {
	position: relative;
	padding: 20px 26px;
	border: 1px solid #e3e8f0;
	border-radius: 8px;
	background: #ffffff;
	transition:
		border-color 0.18s ease,
		box-shadow 0.18s ease;

	&:hover {
		border-color: #d6dee9;
		box-shadow: 0 6px 18px rgba(38, 58, 93, 0.06);
	}
}

.online-device-card__header {
	display: flex;
	align-items: center;
	gap: 16px;
	padding-right: 36px;
}

.online-device-card__title {
	color: #172b4d;
	font-size: 16px;
	font-weight: 500;
}

.online-device-card__time {
	color: #6b778c;
	font-size: 14px;
}

.online-device-card__delete {
	position: absolute;
	top: 18px;
	right: 22px;
	color: #ff4d4f;
	opacity: 0;
	transition: opacity 0.18s ease;
}

.online-device-card:hover .online-device-card__delete {
	opacity: 1;
}

.online-device-card__meta {
	display: grid;
	grid-template-columns: auto minmax(120px, 1fr) auto minmax(240px, 2fr) auto minmax(90px, 1fr);
	gap: 16px 14px;
	margin-top: 20px;
	color: #6b778c;
	font-size: 14px;

	div {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}

@media (max-width: 992px) {
	.online-device-card__meta {
		grid-template-columns: auto minmax(0, 1fr);
	}
}

@media (max-width: 768px) {
	.online-device-card {
		padding: 18px;
	}

	.online-device-card__header {
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
	}
}
</style>
