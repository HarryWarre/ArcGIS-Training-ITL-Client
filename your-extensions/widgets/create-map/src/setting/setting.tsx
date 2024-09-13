import { AllDataSourceTypes, Immutable, React, UseDataSource } from "jimu-core";

import { type AllWidgetSettingProps } from "jimu-for-builder";
import { DataSourceSelector } from "jimu-ui/advanced/data-source-selector";

const Setting = (props: AllWidgetSettingProps<any>) => {
  const supportedTypes = Immutable([AllDataSourceTypes.WebMap]);

  const onDataSourceSelected = (useDataSources: UseDataSource[]) => {
    props.onSettingChange({
      id: props.id,
      useDataSources: useDataSources,
    });
  };
  return (
    <div className='widget-setting-demo'>
      <h3>Select a Map</h3>
      <DataSourceSelector
        types={supportedTypes}
        mustUseDataSource
        useDataSources={props.useDataSources}
        onChange={onDataSourceSelected}
        widgetId={props.id}
      />
    </div>
  );
};

export default Setting;
