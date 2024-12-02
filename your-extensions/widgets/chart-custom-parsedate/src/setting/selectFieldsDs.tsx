import {
    DataSource,
    DataSourceComponent,
    DataSourceManager,
    IMState,
    React
} from "jimu-core";
import { Select, Switch } from "jimu-ui"; // Assuming you are using jimu-ui for UI components
import { SettingRow, SettingSection } from "jimu-ui/advanced/setting-components";
import { useSelector } from "react-redux";

interface SelectFields {
	useDataSources
	id
	handleConfigChange
	handleCategoryChange
	config,
	onDataSourceReady,
	typechart
}
const { useEffect, useRef, useState } = React
const SelectFieldsDs = (props: SelectFields) => {
	const {
		typechart,
		useDataSources,
		handleConfigChange,
		handleCategoryChange,
		id,
		config,
		onDataSourceReady
	} = props
	const appToken = useSelector((state: IMState) => state.token)

	const DatasourceRef = useRef(null)
	const [isDataSourcesReady, setIsDataSourceReady] = useState(false)
	const [fields, setFields] = useState([])
	useEffect(() => {
		if (!appToken) return
		clearTimeout(300)
		handleGetDatasources()
		return () => {
			clearTimeout(300)
		}
	}, [appToken, props.useDataSources])

	useEffect(() => {
		if (isDataSourcesReady && DatasourceRef.current) {
			const ds = DatasourceRef.current as DataSource
			// console.log(ds) // Pass
			const schema = ds.getSchema() // Get schema
			const fieldEntries = Object.entries(schema)[0][1] || []
			// console.log(fieldEntries)

			let fields = ds["layerDefinition"]?.["fields"] ?? []
			// console.log(fields)
			if(fields.length == 0){
				fields = ds["belongToDataSource"]["layerDefinition"]?.["fields"] ?? []
				// console.log(fields)
			}
			const toArray = Object.values(fields).map((item) => {
				const field = item as {
					name: string
					alias: string
					type: string
          domain: object
				}
				return {
					name: field.name,
					alias: field.alias,
					type: field.type,
					domain: field.domain
				}
			})
			setFields(toArray)
		}
	}, [DatasourceRef.current, isDataSourcesReady, props.useDataSources])

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
			DatasourceRef.current = dsArr[0]
			onDataSourceReady(dsArr[0])
			// console.log(DatasourceRef.current["layerDefinition"]["fields"])

			clearTimeout(300)
		} else {
			setTimeout(() => handleGetDatasources(), 300)
		}
	}

	const handleSplitByChange = (event) => {
		const selectedOption = options.find(
			(option) => option.value === event.target.value
		)
		console.log(selectedOption)
		handleConfigChange("splitBy", selectedOption)
	}

	const dateFields = fields.filter(
		(field) => field.type === "esriFieldTypeDate"
	)

	const categoryOptions = dateFields.map((field) => ({
		value: field.name,
		label: `${field.type} - ${field.name}`,
		type: field.type,
		domain: field.domain
	}))

	const options = fields.map((field) => ({
		value: field.name,
		label: `${field.type} - ${field.name}`,
		type: field.type,
		domain: field.domain
	}))
	return (
		<div>
			{isDataSourcesReady ? (
				<div>
					<SettingSection>
						<SettingRow label={"SelectCategory"} flow='wrap'>
							<Select
								value={config.category?.value || ""}
								onChange={(e) =>
									handleCategoryChange(
										e,
										props.typechart !== "pie" ? categoryOptions : options
									)
								}
							>
								<option value="" disabled>
									Select a field
								</option>
								{(props.typechart !== "pie" ? categoryOptions : options).map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</Select>
						</SettingRow>
						{
							props.typechart !== "pie" ?
							<SettingRow label={"SplitBy"} flow='wrap'>
								<Select
									value={config.splitBy?.value || ""}
									onChange={handleSplitByChange}>
									<option value='' disabled>
										Select a field
									</option>
									{options.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</Select>
							</SettingRow> : null
						}
					</SettingSection>

					{typechart !== "pie" ? <>
						<SettingSection>
							<SettingRow label={"ParseDates"} flow='wrap'>
								<Switch
									checked={config?.isParseDates}
									onChange={(e) => {
										handleConfigChange("isParseDates", e.target.checked)
									}}
									disabled={config.category?.type != "esriFieldTypeDate"}
								/>
							</SettingRow>
						</SettingSection>
					</> : null}

				</div>
			) : (
				<p>No data source available</p>
			)}

			{props.useDataSources ? (
				<>
					{useDataSources.map((useDataSource, index) => (
						<DataSourceComponent
							key={`data-source-${index}`}
							useDataSource={useDataSource}
							widgetId={props.id}
						/>
					))}
				</>
			) : (
				<></>
			)}
		</div>
	)
}

export default SelectFieldsDs
