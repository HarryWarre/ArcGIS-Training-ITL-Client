import { FeatureLayerDataSource, MapViewManager } from "jimu-arcgis"
import {
	AllWidgetProps,
	DataSource,
	DataSourceComponent,
	DataSourceManager,
	IMState,
	QueryResult,
	React,
} from "jimu-core"
import { useSelector } from "react-redux"
import { delayTime } from "../../../common/constant"
import "react-toastify/dist/ReactToastify.css"
import Chart from "./chart"
import { IMConfig } from "../config"
import { Loading } from "jimu-ui"

// Declare Hooks
const useState = React.useState
const useEffect = React.useEffect
const useRef = React.useRef

// Widget start here  --------------->

const Widget = (props: AllWidgetProps<IMConfig>) => {
	const { config } = props
	const optionSettingChart = config?.optionsChart

	// console.log(optionSettingChart)

	const appToken = useSelector((state: IMState) => state.token)

	const { current: _viewManager } = useRef(MapViewManager.getInstance())
	let CategoryRef = useRef<DataSource>(null)
	const [isDataSourcesReady, setIsDataSourceReady] = useState(false)
	const [dataCategory, setDataCategory] = useState(null)
	let timeout = null as any
	const [xValue, setXValue] = useState([]) // List of time
	const [yValue, setYValue] = useState([]) // List of counts
	const [serries, setSerries] = useState([])

	const category = optionSettingChart?.category?.value
	const categoryType = optionSettingChart?.category.type
	const splitBy = optionSettingChart?.splitBy.value
	// console.log(optionSettingChart)
	// console.log(splitBy)

	const isParseDates = optionSettingChart?.isParseDates
	const isSplitBy = optionSettingChart?.isSplitBy
	const chartType = optionSettingChart?.typechart || "column"
	const chartHeight = optionSettingChart?.chartHeight || "500px"
	const chartTitle = optionSettingChart?.chartTitle || ""
	const chartSubtitle = optionSettingChart?.chartSubtitle || ""
	const groupBy = optionSettingChart?.parseDate || "date"

	useEffect(() => {
		if (!appToken) return
		clearTimeout(timeout)
		handleGetDatasources()
		return () => {
			clearTimeout(timeout)
		}
	}, [appToken])

	useEffect(() => {
		if (CategoryRef.current) {
			handleGetCategoryData(CategoryRef.current)
			if (isSplitBy) {
				handleGetSerries(CategoryRef.current)
			}
		}
	}, [
		isDataSourcesReady,
		category,
		categoryType,
		splitBy,
		isParseDates,
		chartType,
		chartHeight,
		groupBy,
	])

	useEffect(() => {
		if (dataCategory) {
			const groupedData = groupData(dataCategory, groupBy as any, isSplitBy)
			const dates = Object.keys(groupedData)
			const recordCounts = dates.map((key) => groupedData[key])

			// console.log(groupedData)
			// console.log(recordCounts)

			const { series, categories } = transformToHighchartsSeries(
				groupedData,
				serries
			)
			// console.log(series)
			// console.log(groupedData)

			if (isSplitBy) {
				setXValue(categories)
				setYValue(series)
			} else {
				const seriesData = [
					{
						// name: "Tổng số lượng",
						type: "column",
						color: "#007bff",
						data: recordCounts,
					},
				]
				setXValue(dates)
				setYValue(seriesData)
			}
		}
	}, [dataCategory, groupBy])

	async function handleGetDatasources() {
		const dsArr: DataSource[] = []

		props.useDataSources?.forEach((useDataSource, index) => {
			const ds = DataSourceManager.getInstance().getDataSource(
				useDataSource?.dataSourceId
			)
			dsArr.push(ds)
		})

		if (dsArr.every((e) => e)) {
			setIsDataSourceReady(true)
			CategoryRef.current = dsArr[0]
			clearTimeout(timeout)
		} else {
			setTimeout(() => handleGetDatasources(), delayTime)
		}
	}

	const transformToHighchartsSeries = (groupedData: any, serries: string[]) => {
		const categories = Object.keys(groupedData)
		const result = serries.map((serri) => {
			return {
				name: serri,
				data: categories.map((category) => groupedData[category][serri] || 0),
				marker: {
					symbol: "square",
				},
			}
		})
		return { series: result, categories }
	}

	const groupData = (
		data: QueryResult,
		groupBy: "date" | "month" | "year",
		isSplitBy: boolean
	) => {
		const groupedData = {}

		data.records.forEach((record) => {
			const timestamp = record.getData()[category]
			const dateKey =
				groupBy === "month" && isParseDates
					? formatMonth(timestamp)
					: groupBy === "year" && isParseDates
					? formatYear(timestamp)
					: formatDate(timestamp)
			const dateKeyString = dateKey.toString()

			if (isSplitBy) {
				const serri = record.getData()[splitBy]
				if (!groupedData[dateKeyString]) {
					groupedData[dateKeyString] = {}
				}
				if (!groupedData[dateKeyString][serri]) {
					groupedData[dateKeyString][serri] = 0
				}
				groupedData[dateKey.toString()][serri]++
			} else {
				if (!groupedData[dateKeyString]) {
					groupedData[dateKeyString] = 0
				}
				groupedData[dateKeyString]++
			}
		})

		return groupedData
	}

	const formatYear = (timestamp: string) => {
		const date = new Date(timestamp)
		// return date.getFullYear().toString()
		return date.getFullYear()
	}

	const formatDate = (timestamp: string) => {
		const date = new Date(timestamp)
		// return `${date.getDate()} thg ${date.getMonth() + 1}, ${date.getFullYear()}`
		return date
	}

	const formatMonth = (timestamp: string) => {
		const date = new Date(timestamp)
		const year = date.getFullYear()
		const month = date.getMonth()
		return new Date(year, month, 1)
	}

	const handleGetCategoryData = async (ds: DataSource) => {
		const _ds = ds as FeatureLayerDataSource
		if (_ds) {
			const countTotal = await _ds.query({
				outFields: ["*"],
				where: `${category} is not null AND OBJECTID is not null AND ${splitBy} is not null`,
				returnGeometry: false,
				orderByFields: [`${category} ASC`],
			})
			console.log(countTotal)

			setDataCategory(countTotal)
		}
	}

	const handleGetSerries = async (ds: DataSource) => {
		const _ds = ds as FeatureLayerDataSource
		if (_ds) {
			const serries = await _ds.query({
				outFields: [`${splitBy}`],
				where: `${category} is not null AND OBJECTID is not null AND ${splitBy} is not null`,
				returnGeometry: false,
			})

			const uniqueSerries = serries.records.map((record) => {
				return record.getData()[`${splitBy}`]
			})

			const distinctSerries = [...new Set(uniqueSerries)]
			// console.log(distinctSerries)
			setSerries(distinctSerries)
		}
	}

	return (
		<>
			{props.useDataSources?.map((useDataSource, index) => (
				<DataSourceComponent
					key={`data-source-${index}`}
					useDataSource={useDataSource}
					widgetId={props.id}
				/>
			))}

			{/* Chart */}
			{xValue && yValue ? (
				<Chart
					chartType={chartType as any}
					chartHeight={chartHeight}
					chartTitle={chartTitle}
					chartSubtitle={chartSubtitle}
					xAxisCategories={xValue}
					seriesData={yValue}
					tooltipSuffix=''
					exportingEnabled={true}
					legendEnabled={isSplitBy}
					groupBy={isParseDates ? groupBy : "date"}
					isSplitBy={isSplitBy}
					isDateType={categoryType == "esriFieldTypeDate"}
				/>
			) : (
				<Loading />
			)}
		</>
	)
}

export default Widget
