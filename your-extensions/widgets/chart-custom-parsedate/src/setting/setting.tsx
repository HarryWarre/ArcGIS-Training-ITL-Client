import { AllDataSourceTypes, Immutable, React, UseDataSource } from "jimu-core"
import { AllWidgetSettingProps } from "jimu-for-builder"
import { DataSourceSelector } from "jimu-ui/advanced/data-source-selector"
import { type IMConfig } from "../config"
import {
	Button,
	Switch, // Import Switch
} from "../../../../node_plugin/node_modules/@mui/material"
import { SettingRow, SettingSection } from "jimu-ui/advanced/setting-components"
import {
	Dropdown,
	DropdownButton,
	DropdownItem,
	DropdownMenu,
	NumericInput,
	TextInput,
} from "jimu-ui"
import SelectFieldsDs from "./selectFieldsDs"

const { useState, useEffect } = React

const Setting = (props: AllWidgetSettingProps<IMConfig>) => {
	const { id, onSettingChange, config: propConfig } = props
	// config chart options
	const [config, setConfig] = useState(
		propConfig.optionsChart || {
			isSplitBy: false,
			typechart: "column",
			chartHeight: 400,
			chartTitle: "",
			chartSubtitle: "",
			parseDate: "date",
			isParseDates: false,
		}
	)

	// useEffect(() => {
	// 	console.log(config)
	// }, [config])

	const onToggleUseDataEnable = (useDataSourcesEnabled: boolean) => {
		props.onSettingChange({
			id: props.id,
			useDataSourcesEnabled,
		})
	}
	console.log(props.useDataSourcesEnabled)

	const onDataSourceChange = (useDataSources: UseDataSource[]) => {
		props.onSettingChange({
			id: props.id,
			useDataSources: useDataSources,
		})
	}

	const handleConfigChange = (key, value) => {
		const updatedConfig = { ...config, [key]: value }
		setConfig(updatedConfig)

		onSettingChange({
			id,
			config: { ...propConfig, optionsChart: updatedConfig },
		})
	}

	const handleCategoryChange = (event, options) => {
		const selectedOption = options.find(
			(option) => option.value === event.target.value
		)

		const updatedConfig = {
			...config,
			category: selectedOption,
			isParseDates:
				selectedOption.type !== "esriFieldTypeDate"
					? false
					: config.isParseDates,
		}
		setConfig(updatedConfig)
		onSettingChange({
			id,
			config: { ...propConfig, optionsChart: updatedConfig },
		})
	}

	return (
		<div className='use-feature setting p-1'>
			<DataSourceSelector
				types={Immutable([
					AllDataSourceTypes.FeatureLayer,
					AllDataSourceTypes.FeatureService,
				])}
				useDataSources={props.useDataSources}
				useDataSourcesEnabled={props.useDataSourcesEnabled}
				onToggleUseDataEnabled={onToggleUseDataEnable}
				onChange={onDataSourceChange}
				widgetId={props.id}
				isMultiple={true}
			/>
			{props.useDataSourcesEnabled ? (
				<>
					{/* Toggle isSplitBy */}
					<SettingRow label='Split By'>
						<Switch
							checked={config.isSplitBy}
							onChange={(e) =>
								handleConfigChange("isSplitBy", e.target.checked)
							}
						/>
					</SettingRow>

					<SelectFieldsDs
						useDataSources={props.useDataSources}
						id={id}
						handleConfigChange={handleConfigChange}
						handleCategoryChange={handleCategoryChange}
						config={config}
					/>

					<SettingSection>
						{config.isParseDates ? (
							<>
								{/* Dropdown for typechart */}
								<SettingRow flow='wrap' label='Chart Type'>
									<Dropdown activeIcon>
										<DropdownButton>{config.typechart}</DropdownButton>
										<DropdownMenu>
											{/* {["column"].map((type) => ( */}
											{["column", "bar", "line"].map((type) => (
												<DropdownItem
													key={type}
													active={config.typechart === type}
													onClick={() => handleConfigChange("typechart", type)}>
													{type}
												</DropdownItem>
											))}
										</DropdownMenu>
									</Dropdown>
								</SettingRow>

								{/* Type Parse Date */}
								<SettingRow flow='wrap' label='Parse Dates'>
									<Dropdown activeIcon>
										<DropdownButton>{config.parseDate}</DropdownButton>
										<DropdownMenu>
											{["date", "month", "year"].map((type) => (
												<DropdownItem
													key={type}
													active={config.parseDate === type}
													onClick={() => handleConfigChange("parseDate", type)}>
													{type}
												</DropdownItem>
											))}
										</DropdownMenu>
									</Dropdown>
								</SettingRow>
							</>
						) : (
							<></>
						)}
					</SettingSection>
					{/* Style Chart */}
					<SettingSection>
						{/* Numeric Input for chartHeight */}
						<SettingRow flow='wrap' label='Chart Height'>
							<NumericInput
								value={config.chartHeight}
								onChange={(value) => handleConfigChange("chartHeight", value)}
								min={100}
								max={1000}
								step={10}
							/>
						</SettingRow>

						{/* Text Input for chartTitle */}
						<SettingRow flow='wrap' label='Chart Title'>
							<TextInput
								value={config.chartTitle}
								onChange={(e) =>
									handleConfigChange("chartTitle", e.target.value)
								}
								placeholder='Enter Chart Title'
							/>
						</SettingRow>

						{/* Text Input for chartSubtitle */}
						<SettingRow flow='wrap' label='Chart Subtitle'>
							<TextInput
								value={config.chartSubtitle}
								onChange={(e) =>
									handleConfigChange("chartSubtitle", e.target.value)
								}
								placeholder='Enter Chart Subtitle'
							/>
						</SettingRow>
					</SettingSection>
				</>
			) : (
				<></>
			)}
		</div>
	)
}

export default Setting
