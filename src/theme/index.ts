export interface ThemeColorSeries {
	primary: string
	success: string
	warning: string
	danger: string
	error: string
	info: string
}

export interface ThemeNeutralSeries {
	pageBg: string
	surfaceBg: string
	surfaceMuted: string
	surfaceBorder: string
	textPrimary: string
	textRegular: string
	textSecondary: string
	textPlaceholder: string
}

export interface ThemeRadiusSeries {
	sm: string
	md: string
	lg: string
	xl: string
	round: string
}

export interface ThemeShadowSeries {
	sm: string
	md: string
	lg: string
}

export interface AppThemeTokens {
	colors: ThemeColorSeries
	neutral: ThemeNeutralSeries
	radius: ThemeRadiusSeries
	shadow: ThemeShadowSeries
}

export const appThemeTokens: AppThemeTokens = {
	colors: {
		primary: "#00b46e",
		success: "#00b46e",
		warning: "#f59e0b",
		danger: "#ef4444",
		error: "#ef4444",
		info: "#64748b"
	},
	neutral: {
		pageBg: "#f5f7fb",
		surfaceBg: "#ffffff",
		surfaceMuted: "#f8fafc",
		surfaceBorder: "#e5eaf1",
		textPrimary: "#172b4d",
		textRegular: "#334155",
		textSecondary: "#64748b",
		textPlaceholder: "#94a3b8"
	},
	radius: {
		sm: "2px",
		md: "2px",
		lg: "4px",
		xl: "8px",
		round: "999px"
	},
	shadow: {
		sm: "0 1px 2px rgba(15, 23, 42, 0.08), 0 6px 16px rgba(15, 23, 42, 0.08)",
		md: "0 8px 24px rgba(15, 23, 42, 0.12)",
		lg: "0 12px 32px rgba(15, 23, 42, 0.16)"
	}
}

export const defaultThemeColor = appThemeTokens.colors.primary
