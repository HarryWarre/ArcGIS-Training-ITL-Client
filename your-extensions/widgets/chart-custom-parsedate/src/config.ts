import { type ImmutableObject } from "seamless-immutable"

// Cập nhật interface Config để bao gồm thuộc tính toggleEnabled
export interface Config {
	optionsChart: {
		typechart: string
		isSplitBy: boolean
		chartHeight: number
		chartTitle: string
		chartSubtitle: string
		parseDate: string
		isParseDates: boolean
		category: {
			label: string
			type: string
			value: string
		}
		splitBy: {
			label: string
			type: string
			value: string
		}
	}
}

// Giữ nguyên IMConfig với thuộc tính mới
export type IMConfig = ImmutableObject<Config>
