<template>
	<div class="task-panel-title">
		<span class="task-panel-title__text">{{ displayTitle }}</span>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"

const props = defineProps({
	title: {
		type: String,
		default: ""
	}
})

const route = useRoute()

const getRouteTitle = () => {
	const metaTitle = route.meta.title
	if (typeof metaTitle === "string" && metaTitle.trim() !== "") {
		return metaTitle
	}
	if (typeof route.name === "string" && route.name.trim() !== "") {
		return route.name
	}
	return ""
}

const displayTitle = computed(() => {
	if (props.title.trim() !== "") {
		return props.title
	}
	return getRouteTitle()
})
</script>

<style scoped lang="scss">
.task-panel-title {
	display: flex;
	align-items: center;

	min-height: 1.5rem;
}

.task-panel-title__text {
	color: #172b4d;
	font-size: 1rem;
	font-weight: 600;
	line-height: 1.25rem;
}
</style>
