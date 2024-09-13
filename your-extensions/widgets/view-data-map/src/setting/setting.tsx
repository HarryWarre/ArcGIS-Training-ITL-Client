import {
  AllDataSourceTypes,
  IMConfig,
  Immutable,
  React,
  UseDataSource,
} from "jimu-core";
import { AllWidgetSettingProps } from "jimu-for-builder";
import { DataSourceSelector } from "jimu-ui/advanced/data-source-selector";

const Setting = (props: AllWidgetSettingProps<IMConfig>) => {
  const onToggleUseDataEnabled = (useDataSourcesEnabled: boolean) => {
    props.onSettingChange({
      id: props.id,
      useDataSourcesEnabled,
    });
  };

  const onDataSourceChange = (useDataSources: UseDataSource[]) => {
    props.onSettingChange({
      id: props.id,
      useDataSources: useDataSources,
    });
  };

  // const updateConfigForOptions = (value: boolean | string) => {
  //   const config = {
  //     id: props.id,
  //     config: value,
  //   };

  //   props.onSettingChange(config);
  // };

  return (
    <div className='use-fearture setting p-1'>
      <DataSourceSelector // Element for select Data Source
        types={Immutable([
          AllDataSourceTypes.FeatureLayer, // Choose Type datasource: Layer and Service
          AllDataSourceTypes.FeatureService,
        ])}
        useDataSources={props.useDataSources}
        useDataSourcesEnabled={props.useDataSourcesEnabled}
        onToggleUseDataEnabled={onToggleUseDataEnabled}
        onChange={onDataSourceChange}
        widgetId={props.id}
        isMultiple={true}
      />
    </div>
  );
};

export default Setting;
