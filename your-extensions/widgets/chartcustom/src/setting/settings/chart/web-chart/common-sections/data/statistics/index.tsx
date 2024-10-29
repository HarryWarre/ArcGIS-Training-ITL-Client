import {
  React,
  type ImmutableArray,
  type UseDataSource,
  Immutable,
  type ImmutableObject,
  hooks,
  JimuFieldType,
} from "jimu-core";
import {
  Select,
  defaultMessages as jimuiDefaultMessage,
  NumericInput,
} from "jimu-ui";
import {
  CategoryType,
  type ChartDataSource,
  type WebChartSeries,
} from "../../../../../../../config";
import { SettingRow } from "jimu-ui/advanced/setting-components";
import defaultMessages from "../../../../../../translations/default";
import { getFieldType } from "../../../../../../../utils/common";
import { ByGroupData } from "./by-group";
import { ByFieldData } from "./by-field";
import {
  getCategoryType,
  createDefaultQuery,
  createDefaultSerie,
} from "../../../../../../../utils/common/serial";
import { getSeriesType, type ChartTypes } from "jimu-ui/advanced/chart";
import {
  useLatestDefaultValue,
  usePercentileStatisticsSupport,
} from "../../../../../utils";
import { type SeriesRelatedProps } from "./type";

export * from "./type";

export interface StatisticsDataSettingProps
  extends Omit<React.HtmlHTMLAttributes<HTMLDivElement>, "onChange"> {
  type: ChartTypes;
  series: ImmutableArray<WebChartSeries>;
  chartDataSource: ImmutableObject<ChartDataSource>;
  useDataSources: ImmutableArray<UseDataSource>;
  onChange?: (
    series: ImmutableArray<WebChartSeries>,
    seriesRelatedProps: SeriesRelatedProps
  ) => void;
}

const CategoryTypes = {
  [CategoryType.ByGroup]: "byGroup",
  [CategoryType.ByField]: "byField",
};

const defaultChartDataSource = Immutable(
  {}
) as ImmutableObject<ChartDataSource>;
export const StatisticsDataSetting = (
  props: StatisticsDataSettingProps
): React.ReactElement => {
  const translate = hooks.useTranslation(defaultMessages, jimuiDefaultMessage);
  const {
    type = "barSeries",
    useDataSources,
    chartDataSource: propChartDataSource = defaultChartDataSource,
    series,
    onChange,
    ...others
  } = props;

  const supportPercentile = usePercentileStatisticsSupport(
    useDataSources?.[0]?.dataSourceId
  );
  const query = propChartDataSource.query;
  const categoryType = getCategoryType(query) ?? CategoryType.ByGroup;

  const propPageSize = query?.pageSize;
  const [pageSize, setPageSize] = useLatestDefaultValue(propPageSize);

  const dataSourceId = useDataSources?.[0]?.dataSourceId;
  const categoryField = query?.groupByFieldsForStatistics?.[0] ?? "";
  const categoryFieldType = getFieldType(categoryField, dataSourceId); // Get field type
  const seriesType = getSeriesType(series as any);
  const isTimeBinning =
    categoryFieldType === JimuFieldType.Date && seriesType === "lineSeries";

  const showMaxCategories =
    categoryType !== CategoryType.ByField && !isTimeBinning;

  const handleCategoryTypeChange = (
    evt: React.MouseEvent<HTMLSelectElement>
  ): void => {
    const categoryType = evt?.currentTarget.value as CategoryType;
    const serie = createDefaultSerie(series?.[0]);
    const query = createDefaultQuery(categoryType);
    const chartDataSource = propChartDataSource.set("query", query);

    onChange?.(Immutable([serie]), {
      chartDataSource,
      query: chartDataSource.query,
    });
  };

  const handleAcceptPageSize = (): void => {
    const chartDataSource = propChartDataSource.setIn(
      ["query", "pageSize"],
      pageSize
    );
    onChange?.(series, { chartDataSource });
  };

  const handlePageSizeChange = (value: number): void => {
    const pageSize = value ? Math.floor(+value) : undefined;
    setPageSize(pageSize);
  };

  return (
    <div className='chart-data-setting w-100' {...others}>
      <SettingRow
        label={translate("categoryType")}
        flow='wrap'
        className='mt-2'>
        <Select
          size='sm'
          aria-label={translate("categoryType")}
          value={categoryType}
          onChange={handleCategoryTypeChange}>
          {Object.keys(CategoryType).map((categoryType, i) => (
            <option
              value={CategoryType[categoryType]}
              key={i}
              className='text-truncate'>
              {translate(CategoryTypes[CategoryType[categoryType]])}
            </option>
          ))}
        </Select>
      </SettingRow>

      <>
        {categoryType === CategoryType.ByGroup && (
          <ByGroupData
            type={type}
            series={series}
            supportPercentile={supportPercentile}
            chartDataSource={propChartDataSource}
            useDataSources={useDataSources}
            onChange={onChange}></ByGroupData>
        )}
        {categoryType === CategoryType.ByField && (
          <ByFieldData
            series={series}
            chartDataSource={propChartDataSource}
            supportPercentile={supportPercentile}
            useDataSources={useDataSources}
            onChange={onChange}></ByFieldData>
        )}
      </>

      {showMaxCategories && (
        <SettingRow label={translate("maxCategories")} flow='no-wrap'>
          <NumericInput
            aria-label={translate("maxCategories")}
            style={{ width: "60px" }}
            value={pageSize}
            onChange={handlePageSizeChange}
            onAcceptValue={handleAcceptPageSize}
            min={1}
            step={1}
            size='sm'
            showHandlers={false}
          />
        </SettingRow>
      )}
    </div>
  );
};
