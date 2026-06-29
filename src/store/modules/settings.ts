import { defineStore } from "pinia"
import defaultSettings from "@/settings"
import { useDynamicTitle } from "@/utils/dynamicTitle"
import { useStorage } from "@vueuse/core"
import { ref } from "vue"
import { NavTypeEnum } from "@/enums/NavTypeEnum"

export const useSettingsStore = defineStore("setting", () => {
	const storageKey = `${defaultSettings.storageNamespace || ""}layout-setting`
	const storageSetting = useStorage<LayoutSetting>(storageKey, {
		tagsView: defaultSettings.tagsView,
		tagsIcon: defaultSettings.tagsIcon,
		fixedHeader: defaultSettings.fixedHeader,
		sidebarLogo: defaultSettings.sidebarLogo,
		dynamicTitle: defaultSettings.dynamicTitle,
		sideTheme: defaultSettings.sideTheme,
		theme: defaultSettings.theme,
		navType: defaultSettings.navType
	})

	// 如果本地缓存中的主题色不是新的默认主题色，强行更新为新的默认主题色 #00B46E
	// if (storageSetting.value.theme !== defaultSettings.theme) {
	//   storageSetting.value.theme = defaultSettings.theme;
	// }

	const title = ref<string>(defaultSettings.title)
	// 主题颜色默认采用系统设定的值，不从本地缓存读取，避免被覆盖
	// const theme = ref<string>(storageSetting.value.theme);
	const theme = ref<string>(defaultSettings.theme)
	const sideTheme = ref<string>(storageSetting.value.sideTheme)
	const showSettings = ref<boolean>(defaultSettings.showSettings)
	const tagsView = ref<boolean>(storageSetting.value.tagsView)
	const tagsIcon = ref<boolean>(storageSetting.value.tagsIcon)
	const fixedHeader = ref<boolean>(storageSetting.value.fixedHeader)
	const sidebarLogo = ref<boolean>(storageSetting.value.sidebarLogo)
	const dynamicTitle = ref<boolean>(storageSetting.value.dynamicTitle)
	const animationEnable = ref<boolean>(defaultSettings.animationEnable)
	const dark = ref<boolean>(defaultSettings.dark)
	// 菜单导航配置默认采用系统设定的值 (LEFT)，不从本地缓存读取，避免被覆盖
	// const navType = ref<NavTypeEnum>(storageSetting.value.navType || NavTypeEnum.LEFT);
	const navType = ref<NavTypeEnum>(NavTypeEnum.LEFT)

	const setTitle = (value: string) => {
		title.value = value
		useDynamicTitle()
	}
	return {
		title,
		theme,
		sideTheme,
		showSettings,
		tagsView,
		tagsIcon,
		fixedHeader,
		sidebarLogo,
		dynamicTitle,
		animationEnable,
		dark,
		navType,
		setTitle
	}
})
