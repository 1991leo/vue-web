import Components from "unplugin-vue-components/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"

/**
 * 创建组件自动按需引入插件配置
 * 仅自动导入本地公共组件和 Element Plus 组件，去掉了对 @zrd/zrd-ui 的自动导入
 */
export default function createComponents() {
	return Components({
		// 扫描并自动导入本地公共组件目录下的组件
		dirs: ["src/components"],
		// 自动引入 Element Plus 组件
		resolvers: [ElementPlusResolver()],
		// 指定自动生成的类型声明文件路径，与项目已有配置保持一致
		dts: "src/types/components.d.ts"
	})
}
