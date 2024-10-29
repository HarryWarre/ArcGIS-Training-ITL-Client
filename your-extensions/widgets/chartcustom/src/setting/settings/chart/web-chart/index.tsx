import {
  React,
  type IMFeatureLayerQueryParams,
  type ImmutableArray,
  type ImmutableObject,
  type UseDataSource,
} from "jimu-core";
import { type ChartTypes } from "jimu-ui/advanced/chart";
import { isSerialSeries } from "../../../../utils/default";
import { type ChartSettingSection } from "../type";
import { type IWebChart } from "../../../../config";
import SerialSetting from "./serial";
import PieSetting from "./pie";
import ScatterPlotSetting from "./scatter";
import HistogramSetting from "./histogram";

interface WebChartSettingProps {
  type: ChartTypes;
  section: ChartSettingSection;
  webChart: ImmutableObject<IWebChart>;
  useDataSources: ImmutableArray<UseDataSource>;
  onSectionChange: (section: ChartSettingSection) => void;
  onWebChartChange: (
    webChart: ImmutableObject<IWebChart>,
    query?: IMFeatureLayerQueryParams
  ) => void;
}

const WebChartSetting = (props: WebChartSettingProps) => {
  const {
    type,
    section,
    webChart,
    onSectionChange,
    useDataSources,
    onWebChartChange,
  } = props;

  return (
    <>
      {isSerialSeries(type) && (
        //(Bar, line, ...)
        <SerialSetting
          type={type}
          section={section}
          webChart={webChart}
          onSectionChange={onSectionChange}
          useDataSources={useDataSources}
          onWebChartChange={onWebChartChange}
        />
      )}
      {type === "pieSeries" && (
        <PieSetting
          type={type}
          section={section}
          webChart={webChart}
          onSectionChange={onSectionChange}
          useDataSources={useDataSources}
          onWebChartChange={onWebChartChange}
        />
      )}
      {type === "scatterSeries" && (
        <ScatterPlotSetting
          section={section}
          webChart={webChart}
          onSectionChange={onSectionChange}
          useDataSources={useDataSources}
          onWebChartChange={onWebChartChange}
        />
      )}
      {type === "histogramSeries" && (
        <HistogramSetting
          section={section}
          webChart={webChart}
          onSectionChange={onSectionChange}
          useDataSources={useDataSources}
          onWebChartChange={onWebChartChange}
        />
      )}
    </>
  );
};

export default WebChartSetting;
