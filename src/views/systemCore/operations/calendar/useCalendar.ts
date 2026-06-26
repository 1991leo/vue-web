import { computed, ref, type ComputedRef } from "vue"
import dayjs from "dayjs"
import { getDeptTaskList } from "@/api/management"
import {
	DAY_SECTIONS,
	getChineseDayLabel,
	mapDeptTaskRowToCalendarTask,
	type CalendarCategory,
	type CalendarCellItem,
	type CalendarPanelMode,
	type CalendarTask,
	type CalendarViewMode
} from "./config"

const ALL_CATEGORY_VALUE = "all"

const getSectionKeyByStartTime = (planStartTime: string | undefined) => {
	if (!planStartTime) return "evening"
	const start = dayjs(planStartTime)
	if (!start.isValid()) return "evening"
	const hour = start.hour()
	if (hour < 12) return "morning"
	if (hour < 18) return "afternoon"
	return "evening"
}

interface UseCalendarOptions {
	categoryOptions: ComputedRef<CalendarCategory[]>
}

export const useCalendar = ({ categoryOptions }: UseCalendarOptions) => {
	const currentView = ref<CalendarViewMode>("month")
	const panelMode = ref<CalendarPanelMode>("calendar")
	const currentDate = ref(dayjs())
	const selectedDate = ref(dayjs())
	const keyword = ref("")
	const categoryFilter = ref(ALL_CATEGORY_VALUE)
	const taskList = ref<CalendarTask[]>([])
	const currentTaskId = ref<string | number | null>(null)
	const loading = ref(false)
	let fetchRequestSeed = 0

	const buildCalendarStartTime = () => {
		if (currentView.value === "month") {
			return currentDate.value.startOf("month").format("YYYY-MM-DD 00:00:00")
		}
		return selectedDate.value.startOf("day").format("YYYY-MM-DD 00:00:00")
	}

	const getCategoryColor = (category: string) => {
		const matched = categoryOptions.value.find((item) => item.value === category || item.label === category)
		return matched ? matched.color : "#98a2b3"
	}

	const filteredTasks = computed(() =>
		taskList.value.filter((item) =>
			categoryFilter.value !== ALL_CATEGORY_VALUE ? item.taskCategory === categoryFilter.value : true
		)
	)

	const categoryItems = computed(() => {
		return categoryOptions.value.map((item) => ({
			...item,
			count: filteredTasks.value.filter((task) => task.taskCategory === item.value).length
		}))
	})

	const sidebarTasks = computed(() => {
		const baseMonth = currentDate.value.startOf("month")
		const baseMonthEnd = currentDate.value.endOf("month")

		return filteredTasks.value
			.filter((item) => {
				if (currentView.value === "day") {
					const selectedDateText = selectedDate.value.format("YYYY-MM-DD")
					const taskStart = dayjs(item.planStartTime).format("YYYY-MM-DD")
					const taskEnd = dayjs(item.planEndTime).format("YYYY-MM-DD")
					return selectedDateText >= taskStart && selectedDateText <= taskEnd
				}
				const taskStart = dayjs(item.planStartTime)
				const taskEnd = dayjs(item.planEndTime)
				return taskEnd.isAfter(baseMonth.subtract(1, "day")) && taskStart.isBefore(baseMonthEnd.add(1, "day"))
			})
			.sort((left, right) => left.planStartTime.localeCompare(right.planStartTime))
	})

	const calendarTitle = computed(() => {
		if (currentView.value === "month") {
			return currentDate.value.format("YYYY年M月")
		}
		return `${selectedDate.value.format("YYYY年MM月DD日")} ${["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][selectedDate.value.day()]}`
	})

	const monthCells = computed<CalendarCellItem[]>(() => {
		const firstDay = currentDate.value.startOf("month")
		const firstWeekday = firstDay.day()
		const leadingDays = firstWeekday === 0 ? 6 : firstWeekday - 1
		const cells: CalendarCellItem[] = []

		for (let index = leadingDays; index > 0; index -= 1) {
			const date = firstDay.subtract(index, "day")
			cells.push({
				key: date.format("YYYY-MM-DD"),
				date,
				dayNumber: date.date(),
				subLabel: getChineseDayLabel(date.date()),
				isCurrentMonth: false,
				isToday: date.isSame(dayjs(), "day")
			})
		}

		const daysInMonth = firstDay.daysInMonth()
		for (let index = 1; index <= daysInMonth; index += 1) {
			const date = firstDay.date(index)
			cells.push({
				key: date.format("YYYY-MM-DD"),
				date,
				dayNumber: index,
				subLabel: getChineseDayLabel(index),
				isCurrentMonth: true,
				isToday: date.isSame(dayjs(), "day")
			})
		}

		const restCount = 42 - cells.length
		for (let index = 1; index <= restCount; index += 1) {
			const date = firstDay.add(1, "month").date(index)
			cells.push({
				key: date.format("YYYY-MM-DD"),
				date,
				dayNumber: date.date(),
				subLabel: getChineseDayLabel(date.date()),
				isCurrentMonth: false,
				isToday: date.isSame(dayjs(), "day")
			})
		}

		return cells
	})

	const monthTaskMap = computed(() => {
		const map = new Map<string, CalendarTask[]>()
		monthCells.value.forEach((cell) => {
			const dateKey = cell.date.format("YYYY-MM-DD")
			const matchedTasks = filteredTasks.value.filter((item) => {
				const taskStart = dayjs(item.planStartTime).format("YYYY-MM-DD")
				const taskEnd = dayjs(item.planEndTime).format("YYYY-MM-DD")
				return dateKey >= taskStart && dateKey <= taskEnd
			})
			map.set(dateKey, matchedTasks)
		})
		return map
	})

	const daySectionTasks = computed(() =>
		DAY_SECTIONS.map((section) => ({
			...section,
			tasks: filteredTasks.value.filter((item) => {
				const selectedDateText = selectedDate.value.format("YYYY-MM-DD")
				const taskStart = dayjs(item.planStartTime).format("YYYY-MM-DD")
				const taskEnd = dayjs(item.planEndTime).format("YYYY-MM-DD")
				const inDay = selectedDateText >= taskStart && selectedDateText <= taskEnd
				if (!inDay) return false
				return getSectionKeyByStartTime(item.planStartTime) === section.key
			})
		}))
	)

	const currentTask = computed(() => {
		if (currentTaskId.value === null) return null
		return taskList.value.find((item) => item.id === currentTaskId.value) || null
	})

	const fetchCalendarData = async () => {
		const requestId = ++fetchRequestSeed
		loading.value = true
		try {
			const query = {
				pageNum: 1,
				pageSize: 500,
				type: currentView.value,
				startTime: buildCalendarStartTime(),
				taskTitle: keyword.value.trim() || undefined
			}
			const res = await getDeptTaskList(query)
			if (requestId !== fetchRequestSeed) return
			const rows = Array.isArray(res.rows) ? res.rows : []
			taskList.value = rows
				.filter((item) => typeof item.planStartTime === "string" && item.planStartTime !== "")
				.map((item) => mapDeptTaskRowToCalendarTask(item))
		} finally {
			if (requestId === fetchRequestSeed) {
				loading.value = false
			}
		}
	}

	const handleKeywordSearch = async (value: string) => {
		keyword.value = value
		await fetchCalendarData()
	}

	const setView = async (view: CalendarViewMode) => {
		const targetMonth = currentDate.value.startOf("month")
		currentView.value = view
		if (view === "month") {
			currentDate.value = selectedDate.value.startOf("month")
			await fetchCalendarData()
			return
		}

		if (targetMonth.isSame(dayjs(), "month")) {
			await goToday()
			return
		}

		selectedDate.value = targetMonth
		currentDate.value = targetMonth
		await fetchCalendarData()
	}

	const selectDate = (dateValue: string) => {
		selectedDate.value = dayjs(dateValue)
		currentDate.value = selectedDate.value.startOf("month")
	}

	const goToday = async () => {
		const now = dayjs()
		selectedDate.value = now
		currentDate.value = now.startOf("month")
		currentView.value = "day"
		await fetchCalendarData()
	}

	const goPrev = async () => {
		if (currentView.value === "month") {
			currentDate.value = currentDate.value.subtract(1, "month")
		} else {
			selectedDate.value = selectedDate.value.subtract(1, "day")
			currentDate.value = selectedDate.value.startOf("month")
		}
		await fetchCalendarData()
	}

	const goNext = async () => {
		if (currentView.value === "month") {
			currentDate.value = currentDate.value.add(1, "month")
		} else {
			selectedDate.value = selectedDate.value.add(1, "day")
			currentDate.value = selectedDate.value.startOf("month")
		}
		await fetchCalendarData()
	}

	const handleMonthCellClick = async (dateValue: string) => {
		selectDate(dateValue)
		currentView.value = "day"
		await fetchCalendarData()
	}

	const handleTaskClick = (task: CalendarTask) => {
		currentTaskId.value = task.id
		panelMode.value = "detail"
	}

	const handleCreateTask = () => {
		currentTaskId.value = null
		panelMode.value = "create"
	}

	const handleEditTask = (task: CalendarTask) => {
		currentTaskId.value = task.id
		panelMode.value = "edit"
	}

	const closePanel = async () => {
		panelMode.value = "calendar"
		await fetchCalendarData()
	}

	return {
		loading,
		keyword,
		panelMode,
		currentView,
		calendarTitle,
		categoryFilter,
		categoryItems,
		sidebarTasks,
		monthCells,
		monthTaskMap,
		daySectionTasks,
		taskList,
		currentTask,
		getCategoryColor,
		setView,
		selectDate,
		selectedDate,
		goToday,
		goPrev,
		goNext,
		handleMonthCellClick,
		handleKeywordSearch,
		handleTaskClick,
		handleCreateTask,
		handleEditTask,
		closePanel,
		fetchCalendarData
	}
}
