<script lang="ts">
export default {
	render: () => null
}
</script>

<script setup lang="ts">
import { to } from "await-to-js"
import { ElMessage } from "element-plus"
import { useRoute, useRouter, type LocationQueryValue } from "vue-router"
import { useUserStore } from "@/store/modules/user"

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const getFirstQueryValue = (value?: LocationQueryValue | LocationQueryValue[]) => {
	if (Array.isArray(value)) {
		return value[0] ?? ""
	}
	return value ?? ""
}

const redirectPath = computed(() => getFirstQueryValue(route.query.redirect) || "/")

const handleOauthLogin = async () => {
	const ticket = getFirstQueryValue(route.query.ticket).trim()
	if (!ticket) {
		ElMessage.error("未获取到 OA 单点登录 ticket，请从 OA 工作台重新进入系统。")
		return
	}
	const [err] = await to(userStore.oauthLogin(ticket))
	if (err) {
		const errorMessage = err instanceof Error ? err.message : "单点登录接口调用失败，请稍后重试。"
		ElMessage.error(errorMessage)
		return
	}

	await router.replace(redirectPath.value)
}

onMounted(() => {
	handleOauthLogin()
})
</script>
