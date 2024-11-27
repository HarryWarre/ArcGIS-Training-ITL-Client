import { type ImmutableObject } from "seamless-immutable"

// Cập nhật interface Config để bao gồm thuộc tính toggleEnabled
export interface Config {
	optionsChart: {
		typechart: string
		isSplitBy: boolean
		chartHeight: number
		chartTitle: object // Object for chart Title
		chartSubtitle: object // Object for chart Subtitle
		parseDate: string
		isParseDates: boolean
		isShowValueOnTop: boolean
		category: { // Not converted to any type object
			label: string
			type: string
			value: string
			domain: object
		}
		splitBy: { // Not converted to any type object
			label: string
			type: string
			value: string
			domain: {
			 codedValues: any
			}
		}
		serries: object
	}
}

// Giữ nguyên IMConfig với thuộc tính mới
export type IMConfig = ImmutableObject<Config>
