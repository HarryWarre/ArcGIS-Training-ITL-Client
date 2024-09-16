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
  const onToggleUseDataEnable = (useDataSourcesEnabled: boolean) => {
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
        isMultiple={true}></DataSourceSelector>
    </div>
  );
};

export default Setting;
