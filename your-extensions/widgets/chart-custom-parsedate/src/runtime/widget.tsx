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
import { useSelector, useDispatch } from "react-redux"
import { delayTime } from "../../../common/constant"
import "react-toastify/dist/ReactToastify.css"
import Chart from "./chart"

// Declare Hooks
const useState = React.useState
const useEffect = React.useEffect
const useRef = React.useRef

// Widget start here  --------------->

const Widget = (props: AllWidgetProps<any>) => {
	const dispatch = useDispatch()
	const appToken = useSelector((state: IMState) => state.token)

	const { current: _viewManager } = useRef(MapViewManager.getInstance())
	let CategoryRef = useRef<DataSource>(null)
	const [isDataSourcesReady, setIsDataSourceReady] = useState(false)
	const [dataCategory, setDataCategory] = useState(null)
	let timeout = null as any
	const [xValue, setXValue] = useState([]) // List of time
	const [yValue, setYValue] = useState([]) // List of counts
	const [groupBy, setGroupBy] = useState<"date" | "month" | "year">("date") // Default to group by date
	const [serries, setSerries] = useState([])

	// Options chart
	const [category, setCategory] = useState("NGAYLAPDAT") // commonto oject

	const [splitBy, setSplitBy] = useState("HIEUDONGHO")
	const [isSplitBy, setIsSplitBy] = useState(true)
	const [parseDateType, setParseDateType] = useState("month")
	const [chartType, setChartType] = useState("column")
	const [chartHeight, setChartHeight] = useState("500px")
	const [chartTitle, setChartTitle] = useState(
		"Biểu đồ cột số lượng theo loại bể ngầm, bể nổi"
	)
	const [chartSubtitle, setChartSubtitle] = useState("Loại bể nổi")

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
			handleGetSerries(CategoryRef.current)
		}
	}, [isDataSourcesReady])

	useEffect(() => {
		if (dataCategory) {
			const groupedData = groupData(dataCategory, groupBy, isSplitBy)
			const dates = Object.keys(groupedData)
			const recordCounts = dates.map((key) => groupedData[key])

			// console.log(groupedData)
			// console.log(recordCounts)

			const { series, categories } = transformToHighchartsSeries(
				groupedData,
				serries
			)
			console.log(series)
			console.log(groupedData)

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
				groupBy === "month"
					? formatMonth(timestamp)
					: groupBy === "year"
					? formatYear(timestamp)
					: formatDate(timestamp)
			const dateKeyString = dateKey.toString()

			if (isSplitBy) {
				// const serri = record.getData()[`${splitBy}`]
				const serri = record.getData()[splitBy]
				// console.log(serri)
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
		return new Date(year, month, 1) // Trả về timestamp của ngày đầu tiên trong tháng
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
			// console.log(countTotal)

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
			console.log(distinctSerries) // DSD, 4, 2
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
					chartType='column'
					chartHeight={chartHeight}
					chartTitle={chartTitle}
					chartSubtitle={chartSubtitle}
					xAxisCategories={xValue}
					seriesData={yValue}
					tooltipSuffix=''
					exportingEnabled={true}
					legendEnabled={isSplitBy}
					groupBy={groupBy}
					isSplitBy={isSplitBy}
				/>
			) : (
				<p>No data available</p>
			)}

			{/* Button to toggle grouping (Date/Month) */}
			<select
				id='grouping'
				value={groupBy}
				onChange={(e) =>
					setGroupBy(e.target.value as "date" | "month" | "year")
				}
				style={{ padding: "5px", fontSize: "16px" }}>
				<option value='date'>Date</option>
				<option value='month'>Month</option>
				<option value='year'>Year</option>
			</select>
		</>
	)
}

export default Widget
