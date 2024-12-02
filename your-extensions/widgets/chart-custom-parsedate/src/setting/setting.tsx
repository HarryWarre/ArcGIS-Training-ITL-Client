import { AllDataSourceTypes, Immutable, React, UseDataSource } from "jimu-core"
import { AllWidgetSettingProps } from "jimu-for-builder"
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownMenu
} from "jimu-ui"
import { DataSourceSelector } from "jimu-ui/advanced/data-source-selector"
import { SettingRow, SettingSection } from "jimu-ui/advanced/setting-components"
import {
  Switch
} from "../../../../node_plugin/node_modules/@mui/material"
import { type IMConfig } from "../config"
import AppearanceSetting from "./appearanceChart"
import SelectFieldsDs from "./selectFieldsDs"
import { SeriesColorPicker } from "./serriesStyle"

const { useState, useEffect } = React

const Setting = (props: AllWidgetSettingProps<IMConfig>) => {
	const { id, onSettingChange, config: propConfig } = props
	// config chart options
	const [config, setConfig] = useState(
		propConfig.optionsChart || {
			isSplitBy: false,
			typechart: "column",
			chartHeight: 400,
			chartTitle: {},
			chartSubtitle: "",
			parseDate: "date",
			isParseDates: false,
			isShowValueOnTop: false,
			...
		}
	)
	// console.log(config)
	const [datasource, setDatasource] = useState(null);

	// useEffect(() => {
	// 	console.log(props)
	// }, [props])

	const onToggleUseDataEnable = (useDataSourcesEnabled: boolean) => {
		props.onSettingChange({
			id: props.id,
			useDataSourcesEnabled,
		})
	}
	// console.log(props.useDataSourcesEnabled)

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

	const handleConfigChangeWithParent = (parentKey, key, value) => {
    const updatedConfig = {
      ...config,
      [parentKey]: {
        ...(config[parentKey] || {}), // Đảm bảo parentKey luôn là object
        [key]: value,
      },
    };

    // Cập nhật state config
    setConfig(updatedConfig);

    // Gọi callback onSettingChange nếu tồn tại
    onSettingChange?.({
      id,
      config: {
        ...propConfig,
        optionsChart: updatedConfig
      },
    });
  };

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

	const handleDatasourceReady = (ds) => {
    // console.log("Datasource received:", ds);
    setDatasource(ds); // Lưu datasource vào state
  };

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

					<SettingSection>
						{/* Dropdown for typechart */}
						<SettingRow flow='wrap' label='Chart Type'>
							<Dropdown activeIcon>
								<DropdownButton>{config.typechart}</DropdownButton>
								<DropdownMenu>
									{/* {["column"].map((type) => ( */}
									{["column", "bar", "pie"].map((type) => (
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
					</SettingSection>
					<SelectFieldsDs
						typechart = {config.typechart}
						useDataSources={props.useDataSources}
						id={id}
						handleConfigChange={handleConfigChange}
						handleCategoryChange={handleCategoryChange}
						config={config}
						onDataSourceReady={handleDatasourceReady}
					/>

					<SettingSection>
						{config.isParseDates ? (
							<>
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

					{config.isSplitBy ?
					<>
    				<SettingSection>
						<SeriesColorPicker
						datasource = {datasource}
						isSplitBy={config.isSplitBy}
						splitBy = {config.splitBy?.value}
						onSeriesColorsChange={handleConfigChangeWithParent}
						id={id}
						serriesColor = {config?.serries}
						serriesDomain = {config.splitBy?.['domain']?.['codedValues']}
						  />
					</SettingSection>
					</> : null}

					{config.typechart=='pie' ?
						<>
							<SettingSection>
								<SeriesColorPicker
									datasource = {datasource}
									isSplitBy={config.isSplitBy} // không cần
									splitBy = {config.category?.value}// không cần
									onSeriesColorsChange={handleConfigChangeWithParent} //đổi tên
									id={id}
									serriesColor = {config?.category}
									serriesDomain = {config.category?.['domain']?.['codedValues']}
								/>
							</SettingSection>
						</> : null}

          <AppearanceSetting
		  	chartType = {config.typechart}
            config={config}
            onConfigChange={handleConfigChange}
            onConfigParentChange={handleConfigChangeWithParent}
          />
				</>
			) : (
				<></>
			)}
		</div>
	)
}

export default Setting
