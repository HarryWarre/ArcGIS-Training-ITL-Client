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
  defaultMessages as jimuiDefaultMessage,
  Select,
  Switch,
} from "jimu-ui";
import {
  type ChartStatisticType,
  type ChartDataSource,
  type WebChartSeries,
} from "../../../../../../../../config";
import { SettingRow } from "jimu-ui/advanced/setting-components";
import { FieldSelector, SorteSetting } from "../../../../components";
import defaultMessages from "../../../../../../../translations/default";
import {
  getFieldType,
  getObjectIdField,
} from "../../../../../../../../utils/common";
import {
  createByGroupQuery,
  createByGroupSeries,
  fetchFieldRange,
  getByGroupOrderFields,
  getAppropriateTimeUnit,
  getParsedOrderByField,
  isSupportSplitBy,
} from "./utils";
import {
  getSeriesType,
  type ChartTypes,
  type WebChartLineChartSeries,
  type WebChartTimeIntervalUnits,
  type WebChartTimeAggregationTypes,
  type WebChartNullPolicyTypes,
  getSplitByField,
} from "jimu-ui/advanced/chart";
import { isSerialSeries } from "../../../../../../../../utils/default";
import {
  getDefaultValueFormat,
  getSplitByFieldValues,
  getStatisticsType,
} from "../../../../../../../../utils/common/serial";
import StatisticsSelector from "../statistics-selector";
import { TimeBinning } from "./time-binning";
import { type SeriesRelatedProps } from "../type";
import { SplitByField } from "./split-by-field";

export interface ByGroupDataProps {
  type: ChartTypes;
  series: ImmutableArray<WebChartSeries>;
  chartDataSource: ImmutableObject<ChartDataSource>;
  useDataSources: ImmutableArray<UseDataSource>;
  supportPercentile?: boolean;
  onChange?: (
    series: ImmutableArray<WebChartSeries>,
    seriesRelatedProps: SeriesRelatedProps,

    // Setting props for Parse Date
    settings?: ImmutableObject<{
      isParseDateEnabled?: boolean;
      parseType?: string;
    }>
  ) => void;
}

const defaultChartDataSource = Immutable(
  {}
) as ImmutableObject<ChartDataSource>;

export const ByGroupData = (props: ByGroupDataProps): React.ReactElement => {
  const translate = hooks.useTranslation(defaultMessages, jimuiDefaultMessage);
  const {
    type = "barSeries",
    chartDataSource: propChartDataSource = defaultChartDataSource,
    useDataSources,
    series: propSeries,
    supportPercentile,
    onChange,
  } = props;

  const [loadingDate, setLoadingDate] = React.useState(false);
  // State for setting
  const [settings, setSettings] = React.useState(
    Immutable({ isParseDateEnabled: false, parseType: "" })
  );
  const dataSourceId = useDataSources?.[0]?.dataSourceId;
  const objectidField = React.useMemo(
    () => getObjectIdField(dataSourceId),
    [dataSourceId]
  );
  const seriesType = getSeriesType(propSeries as any);
  const propQuery = propChartDataSource.query;
  const categoryField = propQuery?.groupByFieldsForStatistics?.[0] ?? "";
  const outStatistics = propQuery?.outStatistics;
  const outFields = propQuery?.outFields;
  const where = propQuery?.where;
  const splitByField = getSplitByField(where);

  const splitByFieldValues = React.useMemo(() => {
    return splitByField ? getSplitByFieldValues(propSeries) : Immutable([]);
  }, [propSeries, splitByField]);

  const categoryFieldType = getFieldType(categoryField, dataSourceId);
  const isTimeBinning =
    categoryFieldType === JimuFieldType.Date && seriesType === "lineSeries";

  const timeIntervalSize = (
    propSeries?.[0] as unknown as WebChartLineChartSeries
  )?.timeIntervalSize;
  const timeIntervalUnits = (
    propSeries?.[0] as unknown as WebChartLineChartSeries
  )?.timeIntervalUnits;
  const timeAggregationType = (
    propSeries?.[0] as unknown as WebChartLineChartSeries
  )?.timeAggregationType;
  const nullPolicy = (propSeries?.[0] as unknown as WebChartLineChartSeries)
    ?.nullPolicy;
  const trimIncompleteTimeInterval = (
    propSeries?.[0] as unknown as WebChartLineChartSeries
  )?.trimIncompleteTimeInterval;

  const categoryFields = React.useMemo(() => {
    return categoryField ? Immutable([categoryField]) : Immutable([]);
  }, [categoryField]);

  const numericFields = React.useMemo(() => {
    let nFields =
      outFields ||
      outStatistics
        ?.map((outStatistic) => outStatistic.onStatisticField)
        ?.filter((field) => !!field);
    if (!nFields?.length && !categoryField) {
      nFields = Immutable([objectidField]);
    }
    return nFields || Immutable([]);
  }, [categoryField, objectidField, outFields, outStatistics]);

  const statisticType = getStatisticsType(propQuery) ?? "count";
  const pageSize = !isTimeBinning ? propQuery?.pageSize : undefined;

  const splitByFieldValue = splitByFieldValues[0];
  const orderFields = React.useMemo(
    () => getByGroupOrderFields(propQuery, splitByFieldValue, translate),
    [propQuery, splitByFieldValue, translate]
  );
  const orderByFields = propQuery?.orderByFields;
  const orderByField = React.useMemo(
    () => getParsedOrderByField(orderByFields?.[0], orderFields),
    [orderByFields, orderFields]
  );

  const hideNumericFields =
    numericFields?.length === 1 && statisticType === "count";
  const isNumericFieldsMultiple = isSerialSeries(type);

  const supportSplitBy = React.useMemo(
    () => isSupportSplitBy(dataSourceId, propQuery, propSeries),
    [dataSourceId, propSeries, propQuery]
  );

  const isDateType = categoryFieldType === JimuFieldType.Date; //  Checking Date type

  /** Handle to Enable or Unenable toggle */
  const handleSettingsChange = (key: string, value: any): void => {
    const newSettings = settings.set(key, value); // Update settings
    setSettings(newSettings); // Set the new settings to state
    onChange?.(
      propSeries,
      { chartDataSource: propChartDataSource },
      newSettings
    );
  };
  /** ------------------------------------*/

  const handleCategoryFieldChange = async (
    fields: ImmutableArray<string>
  ): Promise<void> => {
    const categoryField = fields?.[0];
    const categoryFieldType: JimuFieldType = getFieldType(
      categoryField,
      dataSourceId
    );
    const isDateType = categoryFieldType === JimuFieldType.Date; //  Checking Date type
    const useTimeBinning = isDateType && seriesType === "lineSeries";
    const orderByFields = [`${categoryField} ASC`];
    if (useTimeBinning) {
      try {
        setLoadingDate(true);
        const [startTime, endTime] = await fetchFieldRange(
          categoryField,
          dataSourceId
        );
        setLoadingDate(false);
        const timeIntervalUnits = getAppropriateTimeUnit(startTime, endTime);
        const series = createByGroupSeries(
          {
            splitByField,
            splitByFieldValues,
            categoryField,
            statisticType,
            numericFields,
            propSeries,
            timeIntervalUnits,
          },
          dataSourceId
        );
        const query = createByGroupQuery(
          { categoryField, splitByField, statisticType, numericFields },
          orderByFields,
          pageSize
        );
        if (!series?.length) return;
        const valueFormat = getDefaultValueFormat(categoryFieldType);
        const chartDataSource = propChartDataSource.set("query", query);
        onChange(series, { chartDataSource, query, valueFormat });
      } catch (error) {
        setLoadingDate(false);
        console.error(error);
      }
    } else {
      const series = createByGroupSeries(
        { categoryField, statisticType, numericFields, propSeries },
        dataSourceId
      );
      const query = createByGroupQuery(
        { categoryField, statisticType, numericFields },
        orderByFields,
        pageSize
      );
      const valueFormat = getDefaultValueFormat(categoryFieldType);
      const chartDataSource = propChartDataSource.set("query", query);
      onChange(series, { chartDataSource, query, valueFormat });
    }
  };

  const handleStatisticTypeChange = async (
    statisticType: ChartStatisticType
  ): Promise<void> => {
    let _numericFields = numericFields;
    if (statisticType === "count") {
      _numericFields = Immutable([objectidField]);
    } else {
      if (numericFields?.[0] === objectidField) {
        _numericFields = Immutable([]);
      }
    }
    const orderByFields = [`${categoryField} ASC`];
    const series = createByGroupSeries(
      {
        splitByField,
        splitByFieldValues,
        categoryField,
        statisticType,
        numericFields: _numericFields,
        propSeries,
        timeIntervalUnits,
      },
      dataSourceId
    );
    const query = createByGroupQuery(
      {
        categoryField,
        splitByField,
        statisticType,
        numericFields: _numericFields,
      },
      orderByFields,
      pageSize
    );
    if (!series?.length) return;
    const chartDataSource = propChartDataSource.set("query", query);
    onChange(series, { chartDataSource, query });
  };

  const handleNumericFieldsChange = async (
    numericFields: ImmutableArray<string>
  ): Promise<void> => {
    const orderByFields = [`${categoryField} ASC`];
    const _splitByField = numericFields?.length !== 1 ? "" : splitByField;
    const series = createByGroupSeries(
      {
        splitByField: _splitByField,
        splitByFieldValues,
        categoryField,
        statisticType,
        numericFields,
        propSeries,
        timeIntervalUnits,
      },
      dataSourceId
    );
    const query = createByGroupQuery(
      {
        categoryField,
        splitByField: _splitByField,
        statisticType,
        numericFields,
      },
      orderByFields,
      pageSize
    );
    if (!series?.length) return;
    const chartDataSource = propChartDataSource.set("query", query);
    onChange(series, { chartDataSource, query });
  };

  const handleSplitByFieldChange = (
    splitByField: string,
    values: ImmutableArray<number | string>
  ): Promise<void> => {
    const orderByFields = [`${categoryField} ASC`];
    const series = createByGroupSeries(
      {
        splitByField,
        splitByFieldValues: values,
        categoryField,
        statisticType,
        numericFields,
        propSeries,
        timeIntervalUnits,
      },
      dataSourceId
    );
    const query = createByGroupQuery(
      { categoryField, splitByField, statisticType, numericFields },
      orderByFields,
      pageSize
    );
    if (!series?.length) return;
    const chartDataSource = propChartDataSource.set("query", query);
    onChange(series, { chartDataSource, query });
  };

  const handleTimeIntervalChange = (
    size: number,
    unit: WebChartTimeIntervalUnits
  ) => {
    const series = propSeries.map((serie) => {
      return serie.set("timeIntervalSize", size).set("timeIntervalUnits", unit);
    }) as unknown as ImmutableArray<WebChartSeries>;
    onChange(series, { chartDataSource: propChartDataSource });
  };

  const handleTimeAggregationTypeChange = (
    value: WebChartTimeAggregationTypes
  ) => {
    const series = propSeries.map((serie) => {
      return serie.set("timeAggregationType", value);
    }) as unknown as ImmutableArray<WebChartSeries>;
    onChange(series, { chartDataSource: propChartDataSource });
  };

  const handleNullPolicyChange = (value: WebChartNullPolicyTypes) => {
    const series = propSeries.map((serie) => {
      return serie.set("nullPolicy", value);
    }) as unknown as ImmutableArray<WebChartSeries>;
    onChange(series, { chartDataSource: propChartDataSource });
  };

  const handleTrimIncompleteTimeIntervalChange = (value: boolean) => {
    const series = propSeries.map((serie) => {
      return serie.set("trimIncompleteTimeInterval", value);
    }) as unknown as ImmutableArray<WebChartSeries>;
    onChange(series, { chartDataSource: propChartDataSource });
  };

  const handleOrderChanged = (value: string): void => {
    if (propQuery) {
      const query = propQuery.set("orderByFields", [value]);
      const chartDataSource = propChartDataSource.set("query", query);
      onChange(propSeries, { chartDataSource });
    }
  };

  return (
    <>
      <SettingRow label={translate("categoryField")} flow='wrap'>
        <FieldSelector
          className='category-field-selector'
          type='category'
          hideDateField={seriesType === "pieSeries"}
          aria-label={translate("categoryField")}
          useDataSources={useDataSources}
          isMultiple={false}
          fields={categoryFields}
          onChange={handleCategoryFieldChange}
        />
      </SettingRow>

      {/* Setting Section show Parse Date options */}
      {isDateType && (
        <SettingRow label='Parse dates' flow='wrap'>
          <Switch
            checked={settings.isParseDateEnabled}
            onChange={(e) =>
              handleSettingsChange("isParseDateEnabled", e.target.checked)
            }
            aria-label='Enable Parse Date'
          />
        </SettingRow>
      )}

      {/* Show setting options only if the toggle is enabled */}
      {settings.isParseDateEnabled && isDateType && (
        <SettingRow label='Minimum period' flow='wrap'>
          <Select
            value={settings.parseType}
            onChange={(e) => handleSettingsChange("parseType", e.target.value)}
            placeholder='Select parse type'
            style={{ width: "100%" }}>
            <option value='Day'>Day</option>
            <option value='Month'>Month</option>
            <option value='Year'>Year</option>
          </Select>
        </SettingRow>
      )}

      <SettingRow label={translate("statistics")} flow='wrap'>
        <StatisticsSelector
          hideCount={false}
          disabled={!categoryField}
          hideNoAggregation={seriesType === "pieSeries"}
          hidePercentileCount={!supportPercentile}
          value={statisticType}
          aria-label={translate("statistics")}
          onChange={handleStatisticTypeChange}
        />
      </SettingRow>
      {!hideNumericFields && (
        <>
          <SettingRow
            label={translate("numberFields")}
            flow='no-wrap'></SettingRow>
          <FieldSelector
            hideIdField={true}
            disabled={!categoryField}
            className='numeric-fields-selector mt-2 mb-4'
            type='numeric'
            aria-label={translate("numberFields")}
            isMultiple={isNumericFieldsMultiple}
            useDataSources={useDataSources}
            defaultFields={numericFields}
            debounce={true}
            onChange={handleNumericFieldsChange}
          />
        </>
      )}
      {supportSplitBy && (
        <>
          <SettingRow label={translate("splitByField")} flow='wrap'>
            <SplitByField
              disabled={numericFields?.length !== 1}
              aria-label={translate("splitByField")}
              useDataSources={useDataSources}
              splitByField={splitByField}
              onChange={handleSplitByFieldChange}
            />
          </SettingRow>
        </>
      )}

      {isTimeBinning && (
        <>
          <SettingRow
            label={translate("timeBinningOptions")}
            flow='no-wrap'></SettingRow>
          <TimeBinning
            className='mt-2 mb-4'
            loading={loadingDate}
            timeIntervalSize={timeIntervalSize}
            timeIntervalUnits={timeIntervalUnits}
            timeAggregationType={timeAggregationType}
            nullPolicy={nullPolicy}
            trimIncompleteTimeInterval={trimIncompleteTimeInterval}
            onTimeIntervalChange={handleTimeIntervalChange}
            onTimeAggregationTypeChange={handleTimeAggregationTypeChange}
            onNullPolicyChange={handleNullPolicyChange}
            onTrimIncompleteTimeIntervalChange={
              handleTrimIncompleteTimeIntervalChange
            }
          />
        </>
      )}

      {!isTimeBinning && (
        <SettingRow label={translate("sortBy")} flow='wrap'>
          <SorteSetting
            aria-label={translate("sortBy")}
            value={orderByField}
            fields={orderFields}
            disabled={!categoryField}
            onChange={handleOrderChanged}
          />
        </SettingRow>
      )}
    </>
  );
};
