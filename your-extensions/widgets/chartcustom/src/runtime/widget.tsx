import { React, type AllWidgetProps } from "jimu-core";
import { type IMConfig } from "../config";
import { versionManager } from "../version-manager";
import { ChartRuntimeStateProvider } from "./state";
import Chart from "./chart";

const Widget = (props: AllWidgetProps<IMConfig>): React.ReactElement => {
  const {
    outputDataSources,
    useDataSources,
    config,
    id,
    enableDataAction,
    onInitDragHandler,
  } = props;

  const webChart = config?.webChart;
  const tools = config?.tools;
  const defaultTemplateType = config?._templateType;
  const propsParseDate = [
    config?.["isParseDateEnabled"],
    config?.["parseType"],
  ];
  // console.log(useDataSources?.[0]);
  // console.log(outputDataSources);

  return (
    <div className='jimu-widget widget-chart'>
      <ChartRuntimeStateProvider>
        <Chart
          widgetId={id}
          tools={tools}
          webChart={webChart}
          useDataSource={useDataSources?.[0]}
          enableDataAction={enableDataAction}
          onInitDragHandler={onInitDragHandler}
          defaultTemplateType={defaultTemplateType}
          outputDataSourceId={outputDataSources?.[0]}
          propsParseDate={propsParseDate}
        />
      </ChartRuntimeStateProvider>
    </div>
  );
};

Widget.versionManager = versionManager;

export default Widget;
