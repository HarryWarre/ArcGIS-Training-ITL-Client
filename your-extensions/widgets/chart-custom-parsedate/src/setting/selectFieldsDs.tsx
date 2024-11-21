import {
	DataSourceComponent,
	DataSourceManager,
	IMState,
	React,
} from "jimu-core"
import { DataSource } from "jimu-core"
import { Select, Switch } from "jimu-ui" // Assuming you are using jimu-ui for UI components
import { SettingRow, SettingSection } from "jimu-ui/advanced/setting-components"
import { useSelector } from "react-redux"

interface SelectFields {
	useDataSources
	id
	handleConfigChange
	handleCategoryChange
	config
}
const { useEffect, useRef, useState } = React
const SelectFieldsDs = (props: SelectFields) => {
	const {
		useDataSources,
		handleConfigChange,
		handleCategoryChange,
		id,
		config,
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
	}, [appToken])

	useEffect(() => {
		if (isDataSourcesReady) {
			const ds = DatasourceRef.current as DataSource
			const schema = ds.getSchema() // Get schema
			const fieldEntries = Object.entries(schema)[0][1] || []
			const toArray = Object.values(fieldEntries).map((item) => {
				const field = item as {
					jimuName: string
					alias: string
					esriType: string
				}
				return {
					jimuName: field.jimuName,
					alias: field.alias,
					esriType: field.esriType,
				}
			})

			setFields(toArray)
		}
	}, [DatasourceRef.current])

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
			clearTimeout(300)
		} else {
			setTimeout(() => handleGetDatasources(), 300)
		}
	}

	const handleSplitByChange = (event) => {
		const selectedOption = options.find(
			(option) => option.value === event.target.value
		)
		handleConfigChange("splitBy", selectedOption)
	}

	const dateFields = fields.filter(
		(field) => field.esriType === "esriFieldTypeDate"
	)

	const categoryOptions = dateFields.map((field) => ({
		value: field.jimuName,
		label: `${field.esriType} - ${field.jimuName}`,
		type: field.esriType,
	}))

	const options = fields.map((field) => ({
		value: field.jimuName,
		label: `${field.esriType} - ${field.jimuName}`,
		type: field.esriType,
	}))
	return (
		<div>
			{isDataSourcesReady ? (
				<div>
					<SettingSection>
						<SettingRow label={"SelectCategory"} flow='wrap'>
							<Select
								value={config.category?.value || ""}
								onChange={(e) => {
									handleCategoryChange(e, categoryOptions)
								}}>
								<option value='' disabled>
									Select a field
								</option>
								{categoryOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</Select>
						</SettingRow>
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
						</SettingRow>
					</SettingSection>

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
				</div>
			) : (
				<p>No data source available</p>
			)}

			{/* Render DataSourceComponent */}
			{useDataSources.map((useDataSource, index) => (
				<DataSourceComponent
					key={`data-source-${index}`}
					useDataSource={useDataSource}
					widgetId={props.id}
				/>
			))}
		</div>
	)
}

export default SelectFieldsDs
