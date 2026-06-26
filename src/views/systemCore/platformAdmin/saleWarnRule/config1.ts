export interface WarnRule {
	id: number
	level: string
	color: string
	icon: string
	options: string[]
	pushTargets: string[]
	timeLimit: number | undefined
	needSupervise: boolean
}
import level1 from "@/assets/images/level1.webp"
import level2 from "@/assets/images/level2.webp"
import level3 from "@/assets/images/level3.webp"
import level4 from "@/assets/images/level4.webp"

export const defaultRules: WarnRule[] = [
	{
		id: 1,
		level: "重大",
		color: "#F53F3F",
		icon: level1,
		options: ["省", "市", "县", "零售店（点）"],
		pushTargets: ["省", "市", "县", "零售店（点）"],
		timeLimit: 10,
		needSupervise: true
	},
	{
		id: 2,
		level: "较大",
		color: "#E6A23C",
		icon: level2,
		options: ["省", "市", "县", "零售店（点）"],
		pushTargets: ["省", "市", "县", "零售店（点）"],
		timeLimit: 30,
		needSupervise: true
	},
	{
		id: 3,
		level: "一般",
		color: "#FF7D00",
		icon: level3,
		options: ["市", "县", "零售店（点）"],
		pushTargets: ["市", "县", "零售店（点）"],
		timeLimit: 120,
		needSupervise: true
	},
	{
		id: 4,
		level: "低",
		color: "#1678FF",
		icon: level4,
		options: ["市", "县", "零售店（点）"],
		pushTargets: ["市", "县", "零售店（点）"],
		timeLimit: 2880,
		needSupervise: true
	}
]
