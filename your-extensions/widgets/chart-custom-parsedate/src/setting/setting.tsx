import { AllDataSourceTypes, Immutable, React, UseDataSource } from "jimu-core"
import { AllWidgetSettingProps } from "jimu-for-builder"
import { DataSourceSelector } from "jimu-ui/advanced/data-source-selector"
import { type IMConfig } from "../config"
import {
	Button,
	Switch, // Import Switch
} from "../../../../node_plugin/node_modules/@mui/material"
import { SettingSection } from "jimu-ui/advanced/setting-components"
import AceEditor from "../../../../node_plugin/node_modules/react-ace/lib"

const { useState, useEffect } = React

const Setting = (props: AllWidgetSettingProps<IMConfig>) => {
	const { config } = props
	const [configValue, setConfigValue] = useState<string>(
		JSON.stringify(config, null, 2)
	)

	const onToggleUseDataEnable = (useDataSourcesEnabled: boolean) => {
		props.onSettingChange({
			id: props.id,
			useDataSourcesEnabled,
		})
	}

	const onDataSourceChange = (useDataSources: UseDataSource[]) => {
		props.onSettingChange({
			id: props.id,
			useDataSources: useDataSources,
		})
	}

	// Hàm để cập nhật toggle
	const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = event.target.checked

		// Cập nhật cấu hình widget
		props.onSettingChange({
			id: props.id,
			toggleEnabled: newValue, // Err do chưa override lại
		})
	}

	const _changeConfig = () => {
		if (configValue === JSON.stringify(props.config)) return

		try {
			if (JSON.parse(configValue)) {
				updateConfigForOptions(JSON.parse(configValue))
			}
		} catch (e) {
			throw e
		}
	}

	const updateConfigForOptions = (value: boolean | string) => {
		const config = {
			id: props.id,
			config: value,
		}

		props.onSettingChange(config)
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

			{/* Cài đặt toggle */}
			<SettingSection className='p-0'>
				<p>
					Enable Feature:
					<Switch
						checked={props?.["toggleEnabled"]}
						onChange={handleToggleChange}
					/>
				</p>
			</SettingSection>

			{/* Cài đặt JSON config cho Setting */}
			{/* <SettingSection className='p-0'>
				<p>Config</p>
				<Button onClick={_changeConfig}>Submit</Button>

				<AceEditor
					mode='json'
					theme='github'
					name='detail-widget-config-editor'
					editorProps={{ $blockScrolling: true }}
					value={configValue}
					onChange={(e) => setConfigValue(e)}
					width='300px'
				/>
			</SettingSection> */}
		</div>
	)
}

export default Setting
