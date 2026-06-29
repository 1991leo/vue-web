import { appThemeTokens, type AppThemeTokens, type ThemeColorSeries } from "@/theme"

type ThemeColorName = keyof ThemeColorSeries

const elementColorNames: ThemeColorName[] = ["primary", "success", "warning", "danger", "error", "info"]

// 处理主题样式：统一写入 Element Plus 和项目级 CSS 变量，避免页面分散维护色值。
export const handleThemeStyle = (theme = appThemeTokens.colors.primary, tokens: AppThemeTokens = appThemeTokens) => {
	const colors: ThemeColorSeries = {
		...tokens.colors,
		primary: theme || tokens.colors.primary
	}

	elementColorNames.forEach((name) => {
		applyElementColor(name, colors[name])
		applyAppColor(name, colors[name])
	})

	applyNeutralTokens(tokens)
	applyRadiusTokens(tokens)
	applyShadowTokens(tokens)
}

const setCssVar = (name: string, value: string) => {
	document.documentElement.style.setProperty(name, value)
}

const applyElementColor = (name: ThemeColorName, color: string) => {
	setCssVar(`--el-color-${name}`, color)

	const rgb = hexToRgb(color)
	if (rgb.length === 3) {
		setCssVar(`--el-color-${name}-rgb`, rgb.join(", "))
	}

	for (let i = 1; i <= 9; i++) {
		setCssVar(`--el-color-${name}-light-${i}`, getLightColor(color, i / 10))
		setCssVar(`--el-color-${name}-dark-${i}`, getDarkColor(color, i / 10))
	}
}

const applyAppColor = (name: ThemeColorName, color: string) => {
	const rgb = hexToRgb(color)
	setCssVar(`--app-color-${name}`, color)

	if (rgb.length === 3) {
		setCssVar(`--app-color-${name}-rgb`, rgb.join(", "))
	}

	setCssVar(`--app-color-${name}-soft`, getLightColor(color, 0.9))
	setCssVar(`--app-color-${name}-muted`, getLightColor(color, 0.8))
	setCssVar(`--app-color-${name}-hover`, getLightColor(color, 0.2))
	setCssVar(`--app-color-${name}-active`, getDarkColor(color, 0.2))
}

const applyNeutralTokens = ({ neutral }: AppThemeTokens) => {
	setCssVar("--app-bg-page", neutral.pageBg)
	setCssVar("--app-surface-bg", neutral.surfaceBg)
	setCssVar("--app-surface-muted", neutral.surfaceMuted)
	setCssVar("--app-surface-border", neutral.surfaceBorder)
	setCssVar("--app-text-primary", neutral.textPrimary)
	setCssVar("--app-text-regular", neutral.textRegular)
	setCssVar("--app-text-secondary", neutral.textSecondary)
	setCssVar("--app-text-placeholder", neutral.textPlaceholder)
	setCssVar("--el-bg-color-page", neutral.pageBg)
	setCssVar("--el-text-color-primary", neutral.textPrimary)
	setCssVar("--el-text-color-regular", neutral.textRegular)
	setCssVar("--el-text-color-secondary", neutral.textSecondary)
	setCssVar("--el-text-color-placeholder", neutral.textPlaceholder)
	setCssVar("--el-border-color-lighter", neutral.surfaceBorder)
}

const applyRadiusTokens = ({ radius }: AppThemeTokens) => {
	setCssVar("--app-radius-sm", radius.sm)
	setCssVar("--app-radius-md", radius.md)
	setCssVar("--app-radius-lg", radius.lg)
	setCssVar("--app-radius-xl", radius.xl)
	setCssVar("--el-border-radius-base", radius.md)
	setCssVar("--el-border-radius-small", radius.sm)
	setCssVar("--el-border-radius-round", radius.round)
}

const applyShadowTokens = ({ shadow }: AppThemeTokens) => {
	setCssVar("--app-shadow-sm", shadow.sm)
	setCssVar("--app-shadow-md", shadow.md)
	setCssVar("--app-shadow-lg", shadow.lg)
	setCssVar("--el-box-shadow-light", shadow.sm)
	setCssVar("--el-box-shadow", shadow.md)
}

// hex颜色转rgb颜色
export const hexToRgb = (str: string): string[] => {
	str = str.replace("#", "")
	const hexs = str.match(/../g)
	for (let i = 0; i < 3; i++) {
		if (hexs) {
			hexs[i] = String(parseInt(hexs[i], 16))
		}
	}
	return hexs ? hexs : []
}

// rgb颜色转Hex颜色
export const rgbToHex = (r: string, g: string, b: string) => {
	const hexs = [Number(r).toString(16), Number(g).toString(16), Number(b).toString(16)]
	for (let i = 0; i < 3; i++) {
		if (hexs[i].length == 1) {
			hexs[i] = `0${hexs[i]}`
		}
	}
	return `#${hexs.join("")}`
}

// 变浅颜色值
export const getLightColor = (color: string, level: number) => {
	const rgb = hexToRgb(color)
	for (let i = 0; i < 3; i++) {
		const s = (255 - Number(rgb[i])) * level + Number(rgb[i])
		rgb[i] = String(Math.floor(s))
	}
	return rgbToHex(rgb[0], rgb[1], rgb[2])
}

// 变深颜色值
export const getDarkColor = (color: string, level: number) => {
	const rgb = hexToRgb(color)
	for (let i = 0; i < 3; i++) {
		rgb[i] = String(Math.floor(Number(rgb[i]) * (1 - level)))
	}
	return rgbToHex(rgb[0], rgb[1], rgb[2])
}
