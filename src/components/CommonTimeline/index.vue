<template>
	<div class="common-timeline">
		<div
			v-for="(item, index) in timelineData"
			:key="`${item.time}-${item.label}-${index}`"
			class="timeline-item"
			:class="[item.type]"
		>
			<!-- 左侧指示圆点 -->
			<div class="timeline-dot"></div>

			<!-- 右侧内容卡片，支持默认样式与完全自定义插槽 -->
			<slot name="item" :item="item" :index="index">
				<div class="timeline-box">
					<!-- 卡片头部：操作人 -->
					<div class="timeline-title">{{ item.user }}</div>
					<!-- 卡片中部：操作内容描述 -->
					<p>{{ item.content }}</p>
					<!-- 卡片尾部：时间与操作标签 -->
					<div class="timeline-bottom">
						<span>{{ item.time }}</span>
						<em class="timeline-tag">{{ item.label }}</em>
					</div>
				</div>
			</slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue"

// 定义时间轴每一项的数据结构
export interface TimelineItem {
	time: string // 发生时间
	label: string // 状态/动作标签，如"创建"、"分配"
	type: string // 动作类型，决定圆点和标签颜色，如 'create' | 'assign' | 'progress' | 'problem' | 'statusChange'
	user: string // 操作人或部门
	content: string // 具体操作细节
	[key: string]: any // 允许外部在使用自定义插槽时附加额外的业务字段
}

// 声明 Props 并设定默认值
const props = withDefaults(
	defineProps<{
		data: TimelineItem[] // 时间轴数据列表
		reverse?: boolean // 是否逆序排列展示
	}>(),
	{
		data: () => [],
		reverse: false
	}
)

// 依据是否逆序，计算最终渲染的数据
const timelineData = computed(() => {
	const list = [...props.data]
	return props.reverse ? list.reverse() : list
})
</script>

<style scoped lang="scss">
.common-timeline {
	position: relative;
	padding-left: 20px;
}

.timeline-item {
	position: relative;
	padding-bottom: 24px;
	padding-left: 24px;

	&:last-child {
		padding-bottom: 0;
	}

	// 悬停时对应的圆点稍作放大反馈
	&:hover {
		.timeline-dot {
			transform: scale(1.15);
		}
	}

	// 时间轴连接虚线实现
	&::after {
		content: "";
		position: absolute;
		top: 22px; // 从圆点中心点开始
		bottom: -22px; // 刚好连接到下一项圆点中心点 (当前 item padding-bottom 24px - 22px = 差2px，配合下个item的dot-top 15px 与高度14px中心对齐)
		left: 9px; // 对齐圆点中心点 (dot-width/2 + dot-left) -> (14/2 + 2) = 9
		width: 0;
		border-left: 1px dashed #cfd6e4;
	}

	// 最后一项隐藏连接虚线
	&:last-child::after {
		display: none;
	}

	// 基础指示圆点样式
	.timeline-dot {
		position: absolute;
		top: 15px; // 垂直对齐第一行文字的视觉中心
		left: 2px;
		width: 14px;
		height: 14px;
		border-width: 3px;
		border-style: solid;
		border-radius: 50%;
		box-sizing: border-box;
		z-index: 1;
		transition: all 0.3s ease;
	}

	// 默认/创建类型样式配色
	&,
	&.create {
		.timeline-dot {
			border-color: #edf1f7;
			background: #a5adba;
		}
		.timeline-tag {
			color: #6b7795;
			background: #f5f7fa;
		}
	}

	// 分配/变更类型样式配色
	&.assign,
	&.delegate,
	&.statusChange,
	&.status_change,
	&.update,
	&.remark_update,
	&.attachment_upload {
		.timeline-dot {
			border-color: #e6f4ff;
			background: #1677ff;
		}
		.timeline-tag {
			color: #1677ff;
			background: #e6f4ff;
		}
	}

	// 进展/成功类型样式配色
	&.progress,
	&.progress_update {
		.timeline-dot {
			border-color: #f6ffed;
			background: #52c41a;
		}
		.timeline-tag {
			color: #52c41a;
			background: #f6ffed;
		}
	}

	// 问题/阻碍类型样式配色
	&.problem,
	&.delete {
		.timeline-dot {
			border-color: #fff1f0;
			background: #ff4d4f;
		}
		.timeline-tag {
			color: #ff4d4f;
			background: rgba(255, 77, 79, 0.06);
		}
	}
}

// 卡片样式与微动效
.timeline-box {
	padding: 14px 16px 12px;
	border: 1px solid #edf1f7;
	border-radius: 12px;
	background: #fff;
	box-shadow: 0 4px 16px rgba(9, 30, 66, 0.04);
	transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

	&:hover {
		transform: translateY(-2px);
		border-color: #d2daf0;
		box-shadow: 0 8px 24px rgba(9, 30, 66, 0.08);
	}

	p {
		min-height: 20px;
		margin: 8px 0 12px;
		color: #344563;
		font-size: 14px;
		line-height: 1.45;
	}
}

.timeline-title {
	color: #0f2748;
	font-size: 16px;
	font-weight: 700;
}

.timeline-bottom {
	display: flex;
	align-items: center;
	justify-content: space-between;
	color: #8993a4;
	font-size: 14px;

	.timeline-tag {
		padding: 3px 11px;
		border-radius: 8px;
		font-style: normal;
		font-size: 13px;
		font-weight: 500;
	}
}
</style>
